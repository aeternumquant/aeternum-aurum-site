/**
 * Ingestao ZARC (Embrapa/MAPA, licenca CC BY) -> public.zarc_aptidao. Roda A MAO.
 *   npx tsx --env-file=.env scripts/ingest-zarc.mts
 *
 * Colapsa o grao cru do ZARC (cultura x ciclo x solo x manejo x clima x municipio,
 * ~3,3M linhas) para (cultura x municipio x manejo), com a janela COMPACTADA num
 * jsonb {"20":[decs],"30":[decs],"40":[decs]} = decendios aptos por NIVEL de risco.
 * REGRA DE COLAPSO: por par, o MELHOR (menor) nivel de risco de cada decendio
 * entre todos os ciclos/solos/climas daquele par (o mais favoravel). risco_min =
 * menor nivel com janela; dec_ini/dec_fim = 1o/ultimo decendio apto (proxy — pode
 * enganar em janela que atravessa o fim do ano, ex. soja dez->jan; a fonte de
 * verdade e o jsonb `janela`).
 *
 * FONTES: a safra corrente COMPLETA (2025/2026; a 2026/2027 ainda esta PARCIAL,
 * sem os cereais de inverno) + o perene/olericola/sem-safra = TODAS as 40+
 * culturas. CSV UTF-8 com BOM, delimitador ';'. Ingestao em LOTES via
 * replace_zarc_aptidao (p_truncate=true no 1o lote, append nos demais).
 */
import { PostgrestClient } from "@supabase/postgrest-js";
import fs from "node:fs";
import readline from "node:readline";
import { Readable } from "node:stream";
import os from "node:os";
import path from "node:path";

const URL = process.env.VITE_SUPABASE_URL, KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) { console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env"); process.exit(1); }
const db = new PostgrestClient(`${URL}/rest/v1`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });

const BASE = "https://dados.agricultura.gov.br/dataset/6d3d141c-885e-41a4-ab7f-dc8ff323b96f/resource";
// CEREAIS DE INVERNO: presentes na 2025/2026, AUSENTES na 2026/2027 (o MAPA ainda
// não publicou o zoneamento de inverno da safra corrente — verificado 18/09/2026).
// Merge (opção B): traz o VERÃO da 2026/27 (soja/milho/algodão/arroz/...) e MANTÉM
// o inverno da 2025/26 até o MAPA publicar. A safra fica GRAVADA por linha (chave
// única inclui safra) -> o front mostra a procedência NA TELA. Promover ao sair a
// 2026/27 de inverno = remover este filtro (o resto se resolve pelo upsert por safra).
const CEREAIS_INVERNO = new Set(["Aveia", "Cevada Cervejeira", "Cevada Grãos", "Trigo", "Trigo - Duplo Propósito"]);
const SOURCES = [
  // 1) VERÃO corrente (trunca): tudo que a 2026/27 já tem (não inclui inverno).
  { safra: "2026/2027", truncate: true,  url: `${BASE}/139e5a60-1f43-4cc8-aeab-a35dbbf816c0/download/dados-abertos-tabua-de-risco-safra-2026-2027.csv` },
  // 2) PERENE (café/citros/...): independe de safra.
  { safra: "perene",    truncate: false, url: `${BASE}/dae65d31-683f-4ac4-ab90-3abd0c1583ba/download/dados-abertos-tabua-de-risco-safra-perene-olericola-sem-safra.csv` },
  // 3) INVERNO da safra PASSADA, SÓ os cereais que a 2026/27 ainda não tem.
  { safra: "2025/2026", truncate: false, url: `${BASE}/f9d597f9-0fee-47eb-9344-8642274ca9da/download/dados-abertos-tabua-de-risco-safra-2025-2026.csv`, onlyCulturas: CEREAIS_INVERNO },
];
const MANEJO: Record<number, string> = { 1: "Sequeiro", 2: "Irrigado", 3: "Irrigado com controle de geada" };
const BATCH = 1500;

async function download(url: string, dest: string): Promise<void> {
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1e6) return; // cache local
  const res = await fetch(url, { headers: { "User-Agent": "AeternumWorker" } });
  if (!res.ok || !res.body) throw new Error(`download HTTP ${res.status}`);
  await new Promise<void>((ok, err) => {
    const w = fs.createWriteStream(dest);
    Readable.fromWeb(res.body as any).pipe(w);
    w.on("finish", () => ok()); w.on("error", err);
  });
}

async function flush(rows: any[], truncate: boolean): Promise<void> {
  const { error } = await db.rpc("replace_zarc_aptidao", { p_rows: rows, p_truncate: truncate });
  if (error) throw new Error(`rpc: ${error.message}`);
}

async function ingest(src: (typeof SOURCES)[number]): Promise<number> {
  const onlyCulturas: Set<string> | undefined = (src as any).onlyCulturas;
  // fonte filtrada (inverno) baixa/cacheia com nome próprio p/ não colidir com a fonte cheia da mesma safra
  const tag = onlyCulturas ? `${src.safra.replace(/\W/g, "_")}-inverno` : src.safra.replace(/\W/g, "_");
  const tmp = path.join(os.tmpdir(), `zarc-${tag}.csv`);
  console.log(`\n== ${src.safra}: baixando/lendo ${tmp}`);
  await download(src.url, tmp);

  const groups = new Map<string, { m: any; best: Uint8Array }>();
  const rl = readline.createInterface({ input: fs.createReadStream(tmp, { encoding: "utf8" }), crlfDelay: Infinity });
  let col: Record<string, number> | null = null, base = 0;
  for await (let line of rl) {
    if (!col) { const h = line.replace(/^﻿/, "").split(";"); col = {}; h.forEach((n, i) => (col![n] = i)); base = col["dec1"]; continue; }
    if (!line) continue;
    const p = line.split(";");
    // Dropa a fase "Producao" dos perenes (cafe/banana/citros/... tem Implantacao
    // E Producao): a consulta reversa e sobre QUANDO PLANTAR -> so a Implantacao
    // importa; a Producao e densidade de membro. Anuais nao tem esse split.
    if (/Produção/i.test(p[col["Nome_cultura"]])) continue;
    // fonte de inverno (opção B): fica SÓ com os cereais que a 2026/27 não tem.
    if (onlyCulturas && !onlyCulturas.has(p[col["Nome_cultura"]])) continue;
    const codC = p[col["Cod_Cultura"]], geo = p[col["geocodigo"]], man = Number(p[col["Cod_Outros_Manejos"]]);
    const si = p[col["SafraIni"]], sf = p[col["SafraFin"]];
    const safra = si && /^\d{4}$/.test(si) && sf ? `${si}/${sf}` : "perene";
    const key = `${codC}|${geo}|${man}|${safra}`;
    let g = groups.get(key);
    if (!g) {
      g = { m: { cod_cultura: codC, nome_cultura: p[col["Nome_cultura"]], geocodigo: geo, uf: p[col["UF"]], municipio: p[col["municipio"]], cod_meso: p[col["Cod_Meso"]] || null, cod_micro: p[col["Cod_Micro"]] || null, cod_manejo: man, nome_manejo: MANEJO[man] || p[col["Nome_Outros_Manejos"]] || String(man), safra, portaria: p[col["Portaria"]] || null }, best: new Uint8Array(37) };
      groups.set(key, g);
    }
    for (let d = 1; d <= 36; d++) { const v = p[base + d - 1]; if (v && v !== "0") { const nv = +v; if (nv > 0 && (g.best[d] === 0 || nv < g.best[d])) g.best[d] = nv; } }
  }

  let batch: any[] = [], n = 0, first = true;
  for (const g of groups.values()) {
    const j: Record<string, number[]> = {}; let dec_ini: number | null = null, dec_fim: number | null = null, risco_min: number | null = null;
    for (let d = 1; d <= 36; d++) { const b = g.best[d]; if (b > 0) { (j[b] = j[b] || []).push(d); if (dec_ini === null) dec_ini = d; dec_fim = d; if (risco_min === null || b < risco_min) risco_min = b; } }
    batch.push({ ...g.m, janela: j, janela20_len: j["20"]?.length ?? 0, risco_min, dec_ini, dec_fim });
    if (batch.length >= BATCH) { await flush(batch, src.truncate && first); n += batch.length; first = false; batch = []; }
  }
  if (batch.length) { await flush(batch, src.truncate && first); n += batch.length; }
  console.log(`  ${src.safra}: ${groups.size} grupos (cultura x municipio x manejo) ingeridos`);
  return n;
}

async function main() {
  let total = 0;
  for (const s of SOURCES) total += await ingest(s);
  console.log(`\nTOTAL: ${total} linhas em zarc_aptidao`);
}
main().then(() => process.exit(0)).catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1); });
