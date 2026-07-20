/**
 * Ingestao IBGE -> public.ibge_pam (producao agricola) + public.ibge_abate.
 * Roda A MAO (API aberta, sem chave; ~12 chamadas, throttle educado).
 *
 *   npx tsx --env-file=.env scripts/ingest-ibge.mts
 *   IBGE_PRODUCTS=soja npx tsx --env-file=.env scripts/ingest-ibge.mts   # validacao
 *
 * PAM agregado 5457: producao/area/rendimento por produto x localidade x ano.
 *   - variaveis: 214 producao [Toneladas PURAS], 216 area colhida [ha],
 *     112 rendimento [kg/ha]. Uma chamada por produto (as 3 variaveis, N1+N3,
 *     todos os anos juntos).
 *   - TONELADAS puras (o USDA era 1000 MT — fator 1000). Guardamos o valor CRU
 *     + a unidade que a API devolve (nunca assumir); a conversao e no front.
 *   - Codigo de produto e proprio do SIDRA (classificacao 782); mapa manual
 *     IBGE_CODE -> nosso slug. Cana = 'cana' (nao 'acucar': e cana, nao acucar).
 * Abate 1092 (bovino) / 1094 (frango): var 285 peso carcaca [kg], trimestral;
 *   somamos os trimestres por ano (quarters = quantos entraram na soma).
 *
 * Idempotente/ATOMICO: PAM via replace_ibge_pam por produto (delete+insert do
 * produto inteiro na mesma transacao). Abate via upsert (56 linhas). Valor
 * "..."/"-"/"X" (indisponivel/zero/sigilo) NAO e numero -> null.
 */
import { PostgrestClient } from "@supabase/postgrest-js";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}
const db = new PostgrestClient(`${URL}/rest/v1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});

const API = "https://servicodados.ibge.gov.br/api/v3/agregados";

/** Mapa manual codigo IBGE (classificacao 782) -> nosso slug. */
const PRODUCTS: { slug: string; code: number }[] = [
  { slug: "soja", code: 40124 },
  { slug: "milho", code: 40122 },
  { slug: "cafe", code: 40139 },
  { slug: "cana", code: 40106 }, // cana-de-acucar (NAO 'acucar')
  { slug: "algodao", code: 40099 }, // herbaceo em caroco
  { slug: "arroz", code: 40102 }, // em casca
  { slug: "trigo", code: 40127 },
  { slug: "cacau", code: 40138 }, // em amendoa — o buraco do USDA
  { slug: "amendoim", code: 40101 },
  { slug: "laranja", code: 40151 },
];

const PAM_VARS = [214, 216, 112]; // producao, area colhida, rendimento
const FROM = Number(process.env.IBGE_FROM ?? 1990);
const TO = Number(process.env.IBGE_TO ?? 2024);
const ONLY = (process.env.IBGE_PRODUCTS ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** "..." / "-" / "X" / "" -> null (indisponivel/zero/sigilo NAO e numero). */
function num(v: unknown): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "" || s === "..." || s === "-" || s === "X" || s === "..") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

let last = 0;
async function ibge(path: string, tries = 5): Promise<any> {
  for (let i = 0; i < tries; i++) {
    const wait = Math.max(800 - (Date.now() - last), 0);
    if (wait > 0) await sleep(wait);
    last = Date.now();
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { Accept: "application/json", "User-Agent": "AeternumWorker" },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status >= 500 || res.status === 429) throw new Error(`HTTP ${res.status}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(2_000 * (i + 1));
    }
  }
}

const years = Array.from({ length: TO - FROM + 1 }, (_, i) => FROM + i).join("|");

type PamRow = {
  ibge_code: number;
  locality_level: string;
  locality_code: string;
  locality_name: string;
  year: number;
  variable_id: number;
  value: number | null;
  unit: string;
};

async function ingestProduct(p: { slug: string; code: number }): Promise<number> {
  const vars = PAM_VARS.join("|");
  const url = `/5457/periodos/${years}/variaveis/${vars}?localidades=N1[all]|N3[all]&classificacao=782[${p.code}]`;
  const data = await ibge(url);
  const rows: PamRow[] = [];
  for (const v of data ?? []) {
    const variableId = Number(v.id);
    const unit = String(v.unidade ?? "");
    for (const res of v.resultados ?? []) {
      for (const s of res.series ?? []) {
        const level = s.localidade?.nivel?.id; // 'N1' | 'N3'
        if (level !== "N1" && level !== "N3") continue;
        const code = String(s.localidade?.id ?? "");
        const name = String(s.localidade?.nome ?? "");
        for (const [yr, val] of Object.entries(s.serie ?? {})) {
          rows.push({
            ibge_code: p.code,
            locality_level: level,
            locality_code: code,
            locality_name: name,
            year: Number(yr),
            variable_id: variableId,
            value: num(val),
            unit,
          });
        }
      }
    }
  }
  const { data: n, error } = await db.rpc("replace_ibge_pam", { p_product_slug: p.slug, p_rows: rows });
  if (error) throw new Error(`rpc ${p.slug}: ${error.message}`);
  return typeof n === "number" ? n : rows.length;
}

async function ingestAbate(): Promise<number> {
  const SPECIES = [
    { species: "bovino", agg: 1092 },
    { species: "frango", agg: 1094 },
  ];
  const rows: { species: string; year: number; carcass_kg: number; quarters: number }[] = [];
  for (const sp of SPECIES) {
    // var 285 = peso total das carcacas [kg]; trimestral; N1 (Brasil).
    const url = `/${sp.agg}/periodos/all/variaveis/285?localidades=N1[all]`;
    const data = await ibge(url);
    const byYear = new Map<number, { kg: number; q: number }>();
    for (const v of data ?? []) {
      for (const res of v.resultados ?? []) {
        for (const s of res.series ?? []) {
          if (s.localidade?.nivel?.id !== "N1") continue;
          for (const [per, val] of Object.entries(s.serie ?? {})) {
            const year = Number(String(per).slice(0, 4));
            if (year < 1997 || year > TO) continue;
            const n = num(val);
            if (n == null) continue;
            const cur = byYear.get(year) ?? { kg: 0, q: 0 };
            cur.kg += n;
            cur.q += 1;
            byYear.set(year, cur);
          }
        }
      }
    }
    for (const [year, { kg, q }] of byYear) rows.push({ species: sp.species, year, carcass_kg: kg, quarters: q });
  }
  const { error } = await db.from("ibge_abate").upsert(rows, { onConflict: "species,year" });
  if (error) throw new Error(`upsert ibge_abate: ${error.message}`);
  return rows.length;
}

async function main() {
  const alvo = ONLY.length ? PRODUCTS.filter((p) => ONLY.includes(p.slug)) : PRODUCTS;
  console.log(`IBGE PAM: ${alvo.map((p) => p.slug).join(", ")} · ${FROM}..${TO} (N1+N3, vars ${PAM_VARS.join("/")})`);
  let total = 0;
  for (const p of alvo) {
    try {
      const n = await ingestProduct(p);
      console.log(`  ${p.slug} (${p.code}): ${n} linhas`);
      total += n;
    } catch (e: any) {
      console.log(`  ${p.slug}: ERRO ${e?.message ?? e}`);
    }
  }
  if (!ONLY.length) {
    try {
      const n = await ingestAbate();
      console.log(`  abate (bovino+frango): ${n} linhas`);
      total += n;
    } catch (e: any) {
      console.log(`  abate: ERRO ${e?.message ?? e}`);
    }
  }
  console.log(`\nTOTAL: ${total} linhas`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exit(1);
});
