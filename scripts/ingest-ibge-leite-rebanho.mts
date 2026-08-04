/**
 * Ingestao IBGE/SIDRA do par pecuario -> public.ibge_leite_preco + public.ibge_ppm.
 * Roda A MAO (API aberta, sem chave; throttle educado). Via replace_* (atomico).
 *
 *   npx tsx --env-file=.env scripts/ingest-ibge-leite-rebanho.mts
 *
 * LEITE-PRECO (agregado 1086, var 2522 "Preco medio [R$/litro]"): preco ao
 *   produtor pelo leite cru captado. Trimestral, N1+N3. Classif fixas em Total:
 *   12529[118225] (tipo de inspecao=Total) e 12716[115236] (ref. temporal=Total
 *   do trimestre). So o span REAL (valor nao-nulo) e gravado (o preco e recente).
 * PPM (anual, N1+N3, 1974+): efetivo bovino (3939 var 105 classif 79=2670),
 *   vacas ordenhadas (94 var 107), producao e valor de leite (74 vars 106/215
 *   classif 80=2682). Uma tabela, coluna `metric`.
 *
 * CROSS-CHECK: rebanho e QUANTIDADE aditiva -> soma das UF == Brasil (para).
 *   Preco e MEDIA -> as UF NAO somam ao Brasil; check e plausibilidade (~2-2,5
 *   R$/litro em 2024), NUNCA soma. Valor "..."/"-"/"X" -> null (nao grava).
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

/** "..." / "-" / "X" / "" -> null (indisponivel/zero/sigilo NAO e numero). */
function num(v: unknown): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "" || s === "..." || s === "-" || s === "X" || s === "..") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

let last = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
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

type LeiteRow = { locality_level: string; locality_code: string; locality_name: string; year: number; quarter: number; value: number; unit: string; ibge_table: number; ibge_variable: number };
type PpmRow = { locality_level: string; locality_code: string; locality_name: string; year: number; metric: string; value: number; unit: string; ibge_table: number; ibge_variable: number };

/** Itera a resposta v3 (variaveis -> resultados -> series -> serie{periodo:valor}). */
function eachSerie(data: any, cb: (level: string, code: string, name: string, period: string, value: number, variableId: number, unit: string) => void) {
  for (const v of data ?? []) {
    const variableId = Number(v.id);
    const unit = String(v.unidade ?? "");
    for (const res of v.resultados ?? []) {
      for (const s of res.series ?? []) {
        const level = s.localidade?.nivel?.id;
        if (level !== "N1" && level !== "N3") continue;
        const code = String(s.localidade?.id ?? "");
        const name = String(s.localidade?.nome ?? "");
        for (const [period, val] of Object.entries(s.serie ?? {})) {
          const value = num(val);
          if (value == null) continue; // so o span REAL
          cb(level, code, name, String(period), value, variableId, unit);
        }
      }
    }
  }
}

async function ingestLeite(): Promise<LeiteRow[]> {
  const url = `/1086/periodos/all/variaveis/2522?localidades=N1[all]|N3[all]&classificacao=12529[118225]|12716[115236]`;
  const data = await ibge(url);
  const rows: LeiteRow[] = [];
  eachSerie(data, (level, code, name, period, value, _vid, unit) => {
    rows.push({
      locality_level: level, locality_code: code, locality_name: name,
      year: Number(period.slice(0, 4)), quarter: Number(period.slice(4, 6)),
      // a var 2522 volta com unidade vazia no v3; unidade dos metadados = Reais por litro
      value, unit: unit || "Reais por litro", ibge_table: 1086, ibge_variable: 2522,
    });
  });
  return rows;
}

async function ingestPpm(): Promise<PpmRow[]> {
  const rows: PpmRow[] = [];
  const collect = (data: any, table: number, metricByVar: Record<number, string>) =>
    eachSerie(data, (level, code, name, period, value, vid, unit) => {
      const metric = metricByVar[vid];
      if (!metric) return;
      rows.push({ locality_level: level, locality_code: code, locality_name: name, year: Number(period.slice(0, 4)), metric, value, unit, ibge_table: table, ibge_variable: vid });
    });

  collect(await ibge(`/3939/periodos/all/variaveis/105?localidades=N1[all]|N3[all]&classificacao=79[2670]`), 3939, { 105: "efetivo_bovino" });
  collect(await ibge(`/94/periodos/all/variaveis/107?localidades=N1[all]|N3[all]`), 94, { 107: "vacas_ordenhadas" });
  collect(await ibge(`/74/periodos/all/variaveis/106|215?localidades=N1[all]|N3[all]&classificacao=80[2682]`), 74, { 106: "producao_leite", 215: "valor_producao_leite" });

  // valor_producao_leite: a var 215 mistura MOEDAS por periodo (Cruzeiro/Cruzado/
  // ... /Real) numa unica unidade composta. So guardamos a era do REAL (>=1994),
  // com unidade limpa "Mil Reais"; o pre-1994 (moedas extintas) e descartado.
  return rows.filter((r) => !(r.metric === "valor_producao_leite" && r.year < 1994))
    .map((r) => (r.metric === "valor_producao_leite" ? { ...r, unit: "Mil Reais" } : r));
}

// ── relatorio + cross-check ────────────────────────────────────────────────
const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });
const qkey = (r: LeiteRow) => r.year * 10 + r.quarter;

function reportLeite(rows: LeiteRow[]) {
  const n1 = rows.filter((r) => r.locality_level === "N1").sort((a, b) => qkey(a) - qkey(b));
  const n3 = rows.filter((r) => r.locality_level === "N3");
  const ufs = new Set(n3.map((r) => r.locality_code));
  const span = (rs: LeiteRow[]) => rs.length ? `${rs[0].year}Q${rs[0].quarter}..${rs[rs.length - 1].year}Q${rs[rs.length - 1].quarter}` : "-";
  const n3sorted = [...n3].sort((a, b) => qkey(a) - qkey(b));
  console.log(`\n== LEITE-PRECO (1086/2522) ==`);
  console.log(`  linhas: ${rows.length} | N1 Brasil: ${n1.length} tri (${span(n1)}) | N3: ${ufs.size} UFs, ${n3.length} linhas (${span(n3sorted)})`);
  console.log(`  Brasil, ultimos trimestres (${rows[0]?.unit}):`);
  for (const r of n1.slice(-5)) console.log(`    ${r.year}Q${r.quarter}: R$ ${nf.format(r.value)}/litro`);
  // plausibilidade (NAO soma): Brasil ~2-2,5 em 2024
  const y2024 = n1.filter((r) => r.year === 2024).map((r) => r.value);
  const ok = y2024.length ? y2024.every((v) => v >= 1.0 && v <= 4.0) : null;
  console.log(`  PLAUSIBILIDADE Brasil 2024: ${y2024.length ? `${y2024.map((v) => nf.format(v)).join(", ")} R$/litro -> ${ok ? "OK (~2-2,5)" : "FORA DA FAIXA"}` : "sem 2024"}`);
  // amostra de UFs no ultimo trimestre
  const lastQ = Math.max(...n3.map(qkey));
  const ufLast = n3.filter((r) => qkey(r) === lastQ).sort((a, b) => b.value - a.value);
  console.log(`  UFs no ultimo tri (${Math.floor(lastQ / 10)}Q${lastQ % 10}): ${ufLast.length} UFs, faixa R$ ${nf.format(ufLast[ufLast.length - 1]?.value)}..${nf.format(ufLast[0]?.value)}/litro`);
}

function crossCheckRebanho(rows: PpmRow[]) {
  console.log(`\n== PPM (rebanho) cross-check UF==Brasil (aditivo) ==`);
  const metrics = [...new Set(rows.map((r) => r.metric))];
  let anyDiverge = false;
  for (const m of metrics) {
    const mrows = rows.filter((r) => r.metric === m);
    const years = [...new Set(mrows.filter((r) => r.locality_level === "N1").map((r) => r.year))].sort((a, b) => a - b);
    const yr = years[years.length - 1]; // ultimo ano com Brasil
    const brasil = mrows.find((r) => r.locality_level === "N1" && r.year === yr)?.value ?? null;
    const ufSum = mrows.filter((r) => r.locality_level === "N3" && r.year === yr).reduce((s, r) => s + r.value, 0);
    const ufN = mrows.filter((r) => r.locality_level === "N3" && r.year === yr).length;
    const diff = brasil ? (ufSum - brasil) / brasil : null;
    const unit = mrows[0]?.unit ?? "";
    const verdict = diff != null && Math.abs(diff) <= 0.005 ? "OK" : "DIVERGE";
    if (verdict === "DIVERGE") anyDiverge = true;
    console.log(`  ${m} (${yr}, ${unit}): Brasil=${nf.format(brasil ?? NaN)} | somaUF(${ufN})=${nf.format(ufSum)} | dif=${diff == null ? "-" : (diff * 100).toFixed(3) + "%"} -> ${verdict}`);
  }
  return !anyDiverge;
}

function reportPpm(rows: PpmRow[]) {
  console.log(`\n== PPM (${rows.length} linhas) span por metrica ==`);
  for (const m of [...new Set(rows.map((r) => r.metric))]) {
    const mr = rows.filter((r) => r.metric === m);
    const ys = mr.map((r) => r.year);
    const n1 = mr.filter((r) => r.locality_level === "N1").sort((a, b) => a.year - b.year);
    const latest = n1[n1.length - 1];
    console.log(`  ${m}: ${mr.length} linhas, ${Math.min(...ys)}..${Math.max(...ys)} | Brasil ${latest?.year}: ${nf.format(latest?.value ?? NaN)} ${latest?.unit}`);
  }
}

async function main() {
  console.log("Ingestao IBGE par pecuario (leite-preco + PPM), N1+N3...");
  const leite = await ingestLeite();
  const ppm = await ingestPpm();

  reportLeite(leite);
  reportPpm(ppm);
  const rebanhoOk = crossCheckRebanho(ppm);

  if (!rebanhoOk) {
    console.error("\nPAROU: cross-check do rebanho DIVERGIU (soma das UF != Brasil). NAO gravei nada.");
    process.exit(1);
  }

  console.log(`\nCross-check do rebanho OK. Gravando via replace_* (atomico)...`);
  const { data: nLeite, error: eLeite } = await db.rpc("replace_ibge_leite_preco", { p_rows: leite });
  if (eLeite) throw new Error(`rpc leite: ${eLeite.message}`);
  const { data: nPpm, error: ePpm } = await db.rpc("replace_ibge_ppm", { p_rows: ppm });
  if (ePpm) throw new Error(`rpc ppm: ${ePpm.message}`);
  console.log(`\nGRAVADO: ibge_leite_preco=${nLeite} linhas | ibge_ppm=${nPpm} linhas`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1); });
