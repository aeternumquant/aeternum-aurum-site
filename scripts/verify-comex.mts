/**
 * verify-comex.mts — checagem pos-backfill dos 8 codigos novos (Frente B):
 *   1. BURACOS: para cada codigo, quais anos tem dado no L1 (2022-2026) e no
 *      L2 (1997-2026). Ano sem linha no L2 = quebra de HS (codigo nao existia)
 *      OU celula faltando; o log do backfill (L2: 0 vs L2: ERRO) desempata.
 *   2. CROSS-CHECK L1xL2: para 2022-2026 (onde os dois niveis existem), soma o
 *      net_kg do L1 (todos os paises) e compara com o agregado L2. Divergencia
 *      > 0,5% = celula L1 faltando.
 * So LE o banco (nao grava). Uma passada paginada por (produto, nivel) traz
 * ref_month+net_kg -> serve para buraco E cross-check de uma vez.
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

type Code = { key: string; code: string; flow: "export" | "import" };
const CODES: Code[] = [
  { key: "celulose", code: "470329", flow: "export" },
  { key: "carne_suina", code: "020329", flow: "export" },
  { key: "fumo", code: "240120", flow: "export" },
  { key: "carvao_metalurgico", code: "270112", flow: "import" },
  { key: "enxofre", code: "250300", flow: "import" },
  { key: "malte", code: "110710", flow: "import" },
  { key: "leite_po", code: "040221", flow: "import" },
  { key: "borracha", code: "400122", flow: "import" },
];

const L1_FROM = 2022, L1_TO = 2026;
const L2_FROM = 1997, L2_TO = 2026;

type YearAgg = { months: number; kg: number };

/** Passada paginada: soma net_kg e conta linhas (meses) por ano, para um nivel. */
async function fetchByYear(c: Code, level: 1 | 2): Promise<Map<number, YearAgg>> {
  const byYear = new Map<number, YearAgg>();
  for (let from = 0; ; from += 1000) {
    let q = db
      .from("trade_flows")
      .select("ref_month,net_kg")
      .eq("product_code", c.code)
      .eq("flow", c.flow)
      .range(from, from + 999);
    q = level === 1 ? q.not("country_code", "is", null) : q.is("country_code", null);
    const { data, error } = await q;
    if (error) throw new Error(`${c.key} L${level}: ${error.message}`);
    for (const r of (data ?? []) as any[]) {
      const y = Number(String(r.ref_month).slice(0, 4));
      const cur = byYear.get(y) ?? { months: 0, kg: 0 };
      cur.months += 1;
      cur.kg += Number(r.net_kg) || 0;
      byYear.set(y, cur);
    }
    if (!data || data.length < 1000) break;
  }
  return byYear;
}

const kgFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

async function main() {
  let holesL1 = 0, holesL2Break: string[] = [], divergences: string[] = [];
  for (const c of CODES) {
    const l1 = await fetchByYear(c, 1);
    const l2 = await fetchByYear(c, 2);
    console.log(`\n=== ${c.key} (${c.code}, ${c.flow}) ===`);

    // L1: espera 2022-2026 (5 anos)
    const l1miss: number[] = [];
    let l1line = "L1 2022-2026: ";
    for (let y = L1_FROM; y <= L1_TO; y++) {
      const a = l1.get(y);
      if (!a) { l1miss.push(y); l1line += `${y}=FALTA `; }
      else l1line += `${y}=${a.months}m `;
    }
    console.log(l1line);
    if (l1miss.length) { holesL1 += l1miss.length; console.log(`  !! L1 buraco: ${l1miss.join(",")}`); }

    // L2: espera 1997-2026; ano ausente = quebra de HS (ou celula faltando)
    const l2empty: number[] = [];
    const l2present: number[] = [];
    for (let y = L2_FROM; y <= L2_TO; y++) {
      if (l2.get(y)) l2present.push(y); else l2empty.push(y);
    }
    console.log(`L2 1997-2026: presentes ${l2present.length}/${L2_TO - L2_FROM + 1}` +
      (l2present.length ? ` [${l2present[0]}..${l2present[l2present.length - 1]}]` : ""));
    if (l2empty.length) {
      console.log(`  vazios (quebra HS? confirmar no log L2:0 vs ERRO): ${l2empty.join(",")}`);
      holesL2Break.push(`${c.key}: ${l2empty.join(",")}`);
    }

    // cross-check L1xL2 em 2022-2026
    let xline = "cross L1xL2: ";
    for (let y = L1_FROM; y <= L1_TO; y++) {
      const a = l1.get(y), b = l2.get(y);
      if (!a || !b) { xline += `${y}=n/a `; continue; }
      const diff = b.kg === 0 ? (a.kg === 0 ? 0 : 1) : Math.abs(a.kg - b.kg) / Math.abs(b.kg);
      xline += `${y}=${(diff * 100).toFixed(3)}% `;
      if (diff > 0.005) divergences.push(`${c.key} ${y}: L1=${kgFmt.format(a.kg)} L2=${kgFmt.format(b.kg)} (${(diff * 100).toFixed(2)}%)`);
    }
    console.log(xline);
  }

  console.log(`\n──────── RESUMO ────────`);
  console.log(holesL1 ? `BURACOS L1 (429/faltando): ${holesL1} celula(s) — REFAZER` : `L1: sem buraco (todos 2022-2026 presentes)`);
  console.log(`L2 anos vazios (quebra HS a confirmar): ${holesL2Break.length ? holesL2Break.join(" | ") : "nenhum"}`);
  console.log(divergences.length ? `DIVERGENCIAS L1xL2 (>0,5%, celula faltando): ${divergences.join(" | ")}` : `CROSS-CHECK L1xL2: OK (todos < 0,5%)`);
}

main().then(() => process.exit(0)).catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1); });
