/**
 * Ingestao Comex Stat (MDIC/Secex) -> public.trade_flows. Roda A MAO (o backfill
 * completo e ~1.500 chamadas x >=10s = ~4h; NAO cabe numa Netlify Function, NAO
 * vira cron nesta etapa).
 *
 *   # tudo, todos os anos (backfill longo):
 *   npx tsx --env-file=.env scripts/ingest-comexstat.mts
 *   # subconjunto (validacao):
 *   COMEX_PRODUCTS=soja_grao COMEX_FROM=2024 COMEX_TO=2024 COMEX_LEVEL=1 \
 *     npx tsx --env-file=.env scripts/ingest-comexstat.mts
 *
 * Respeita as tres armadilhas descobertas na descoberta:
 *  1. TRUNCAGEM SILENCIOSA: 1 ano por chamada (period from=YYYY-01 to=YYYY-12).
 *     Nunca periodo longo (a API trunca e diz success).
 *  2. RATE LIMIT ~1 req/10s: throttle >=11s entre chamadas + retry no 429.
 *  3. NOME LOCALIZADO, nao codigo: casa NOME -> country_code por
 *     trade_countries.name_pt (EXATO, sem normalizar). Nome que nao casa ->
 *     ORFAO: reporta e NAO grava (nunca com country_code null, que colidiria com
 *     o agregado do nivel 2).
 *
 * Dois niveis (mesma chamada janelada por ano, monthDetail:true):
 *  - Nivel 1: details:["country"] -> uma linha por (mes, pais). country_code preenchido.
 *  - Nivel 2: details:[]          -> uma linha por mes, agregado. country_code NULL.
 *
 * Idempotente e ATOMICO: cada (produto, fluxo, nivel, ano) vira UMA chamada a
 * public.replace_trade_flows, que faz delete+insert do escopo na MESMA transacao
 * (insert falha -> delete volta atras). A Secex revisa meses anteriores, entao o
 * delete limpa (upsert deixaria pais-mes removido para sempre); e o on_conflict do
 * PostgREST nao mira o indice de expressao coalesce(country_code,-1), entao a
 * atomicidade vem da funcao, nao de duas chamadas REST. O indice segue como guarda.
 * Valores vem como STRING; "" / ausente NAO e zero (vira null / linha descartada).
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

const API = "https://api-comexstat.mdic.gov.br/general";
const UA = "Mozilla/5.0 (AeternumWorker)";

/**
 * Lista FECHADA pelo Gabriel apos o probe do mapa de migracao. code = subHeading
 * (SH6). Cada SH6 e um product_code proprio em trade_flows; o agrupamento por
 * card (ex.: arroz = casca+branqueado+quebrado) e do front, depois.
 *  - l2only: so a serie longa agregada (nao faz sentido pais-nivel recente).
 *  - maxYear: limita o range (codigo ANTIGO de produto migrado, valido ate ~2011).
 * COSTURA (c): soja/trigo/acucar-bruto/amendoim ganham o codigo antigo (l2only,
 * ate 2011); o front concatena antigo+novo (sao disjuntos por ano). TSP NAO
 * costura (b): o 310310 pre-2017 era TSP+SSP juntos; costurar mudaria o
 * significado da serie em silencio. Prata e paladio saem (exportam ~zero).
 */
type Prod = { key: string; code: number; flow: "export" | "import"; l2only?: boolean; maxYear?: number };
const PRODUCTS: Prod[] = [
  // ── Exportacao ──
  { key: "soja_grao", code: 120190, flow: "export" },
  { key: "soja_grao_old", code: 120100, flow: "export", l2only: true, maxYear: 2011 }, // costura pre-2012
  { key: "soja_farelo", code: 230400, flow: "export" },
  { key: "soja_oleo", code: 150710, flow: "export" },
  { key: "soja_oleo_ref", code: 150790, flow: "export" }, // +refinado (22% em 2020)
  { key: "cafe_verde", code: 90111, flow: "export" },
  { key: "milho", code: 100590, flow: "export" },
  { key: "arroz_casca", code: 100610, flow: "export" }, // Brasil exporta arroz em casca
  { key: "arroz_branqueado", code: 100630, flow: "export" },
  { key: "arroz_quebrado", code: 100640, flow: "export" },
  { key: "algodao", code: 520100, flow: "export" },
  { key: "acucar_bruto", code: 170114, flow: "export" },
  { key: "acucar_bruto_old", code: 170111, flow: "export", l2only: true, maxYear: 2011 }, // costura
  { key: "acucar_refinado", code: 170199, flow: "export" }, // estavel, nao migra
  { key: "cacau", code: 180100, flow: "export" }, // exporta ~zero; editorial do Gabriel depois
  { key: "amendoim", code: 120242, flow: "export" },
  { key: "amendoim_old", code: 120220, flow: "export", l2only: true, maxYear: 2011 }, // costura
  { key: "frango_cortes", code: 20714, flow: "export" },
  { key: "frango_inteiro", code: 20712, flow: "export" }, // +inteiro (Oriente Medio)
  { key: "carne_bovina", code: 20230, flow: "export" },
  { key: "suco_fcoj", code: 200911, flow: "export" },
  { key: "suco_nfc_leve", code: 200912, flow: "export" },
  { key: "suco_nfc_forte", code: 200919, flow: "export" }, // +NFC Brix>20 (28% a mais)
  { key: "etanol", code: 220710, flow: "export" },
  { key: "etanol_desnat", code: 220720, flow: "export" },
  { key: "ouro", code: 710812, flow: "export" }, // so bullion; 710813 semimanuf fica fora
  { key: "cobre_conc", code: 260300, flow: "export" }, // serie comeca ~2005 (Sossego), nao migracao
  { key: "niobio_fenb", code: 720293, flow: "export" },
  { key: "bauxita", code: 260600, flow: "export" },
  { key: "alumina", code: 281820, flow: "export" },
  { key: "aluminio", code: 760110, flow: "export" },
  { key: "minerio_finos", code: 260111, flow: "export" },
  { key: "minerio_pelotas", code: 260112, flow: "export" },
  { key: "petroleo", code: 270900, flow: "export" },
  // ── Importacao (Brasil e importador) ──
  { key: "trigo", code: 100199, flow: "import" },
  { key: "trigo_old", code: 100190, flow: "import", l2only: true, maxYear: 2011 }, // costura
  { key: "gas_gnl", code: 271111, flow: "import" },
  { key: "gas_gasoso", code: 271121, flow: "import" },
  { key: "ureia", code: 310210, flow: "import" }, // 310221 (sulfato de amonio) e outro produto
  { key: "kcl", code: 310420, flow: "import" },
  { key: "fosfatado_map", code: 310540, flow: "import" }, // era DAP 310530 (2%); Brasil compra MAP
  { key: "tsp", code: 310311, flow: "import" }, // opcao (b): serie comeca ~2017, sem costura
  { key: "rocha_10", code: 251010, flow: "import" },
  { key: "rocha_20", code: 251020, flow: "import" },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** string -> number; "" / null / NaN -> null (ausencia NAO e zero). */
function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

let lastComex = 0;
/** POST janelado com throttle >=11s e retry no 429. Devolve data.list. */
async function comexList(body: unknown, tries = 6): Promise<any[]> {
  for (let i = 0; i < tries; i++) {
    const wait = 11_000 - (Date.now() - lastComex);
    if (wait > 0) await sleep(wait);
    lastComex = Date.now();
    let j: any = null;
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", "User-Agent": UA },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(90_000),
      });
      j = await res.json().catch(() => null);
      if (j?.error?.code === 429) continue; // throttle e tenta de novo
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (j?.error) throw new Error(`API: ${j.error.message}`);
      return Array.isArray(j?.data?.list) ? j.data.list : [];
    } catch (e: any) {
      if (i === tries - 1) throw e;
      await sleep(3000);
    }
  }
  throw new Error("429 apos retries");
}

async function loadCountryMap(): Promise<Map<string, number>> {
  const { data, error } = await db.from("trade_countries").select("country_code,name_pt");
  if (error) throw new Error(`trade_countries: ${error.message}`);
  const m = new Map<string, number>();
  for (const r of (data ?? []) as any[]) m.set(r.name_pt, r.country_code);
  return m;
}

// Objeto de p_rows (so os campos por-linha; o resto vem do escopo da RPC).
type Row = {
  country_code: number | null; ref_month: string;
  fob_usd: number | null; net_kg: number | null;
  freight_usd: number | null; insurance_usd: number | null; stat_qty: number | null;
};

const orphans = new Set<string>();

async function ingest(p: Prod, year: number, level: 1 | 2, cmap: Map<string, number>): Promise<number> {
  const isImport = p.flow === "import";
  const metrics = ["metricFOB", "metricKG", ...(isImport ? ["metricFreight", "metricInsurance"] : [])];
  // SH6 como STRING com zero à esquerda (ex.: "090111"): o filtro nao casa
  // codigo de capitulo 01-09 passado como numero (090111 -> 90111 -> vazio).
  const code6 = String(p.code).padStart(6, "0");
  const list = await comexList({
    flow: p.flow,
    monthDetail: true,
    period: { from: `${year}-01`, to: `${year}-12` },
    filters: [{ filter: "subHeading", values: [code6] }],
    details: level === 1 ? ["country"] : [],
    metrics,
  });
  // p_rows leva SO os campos por-linha; flow/product_code/product_level/ano/scope
  // sao parametros da RPC. A funcao ignora chave extra e trata ausente como null.
  const dataRows: Row[] = [];
  for (const r of list) {
    const mm = String(r.monthNumber ?? "").padStart(2, "0");
    if (!/^\d{2}$/.test(mm)) continue;
    let country_code: number | null = null;
    if (level === 1) {
      const name = r.country;
      const cc = cmap.get(name);
      if (cc == null) { orphans.add(name); continue; } // orfao: reporta, NAO grava
      country_code = cc;
    }
    dataRows.push({
      country_code, ref_month: `${year}-${mm}-01`,
      fob_usd: num(r.metricFOB), net_kg: num(r.metricKG),
      freight_usd: isImport ? num(r.metricFreight) : null,
      insurance_usd: isImport ? num(r.metricInsurance) : null,
      stat_qty: null,
    });
  }

  // UMA chamada: delete+insert na MESMA transacao (replace_trade_flows). Escopo
  // do delete: (flow, product_code, product_level, ano, scope); scope='country'
  // apaga so country_code not null, 'aggregate' so is null. Insert falha -> delete
  // volta atras. Devolve a contagem inserida.
  const { data, error } = await db.rpc("replace_trade_flows", {
    p_flow: p.flow,
    p_product_code: code6,
    p_product_level: "sh6",
    p_year: year,
    p_scope: level === 1 ? "country" : "aggregate",
    p_rows: dataRows,
  });
  if (error) throw new Error(`rpc ${p.key} ${year} L${level}: ${error.message}`);
  return typeof data === "number" ? data : dataRows.length;
}

async function main() {
  const cmap = await loadCountryMap();
  console.log(`bridge: ${cmap.size} paises carregados`);

  const only = (process.env.COMEX_PRODUCTS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const products = only.length ? PRODUCTS.filter((p) => only.includes(p.key)) : PRODUCTS;

  const now = new Date().getUTCFullYear();
  const to = Number(process.env.COMEX_TO ?? now);
  // JANELA DUPLA (default = backfill):
  //  - L1 (pais-nivel): ULTIMOS ~60 meses (5 anos). NUNCA desde 1997, senao o
  //    pais-nivel sozinho da ~200-300 MB (metade do Free).
  //  - L2 (agregado):   1997 -> hoje (a linha longa de tendencia, barata).
  // COMEX_FROM (se setado) forca AMBOS os niveis nesse ano -> modo validacao.
  const forced = process.env.COMEX_FROM ? Number(process.env.COMEX_FROM) : null;
  const l1From = forced ?? Number(process.env.COMEX_L1_FROM ?? to - 4);
  const l2From = forced ?? Number(process.env.COMEX_L2_FROM ?? 1997);
  const levelEnv = process.env.COMEX_LEVEL ?? "both";
  const doL1 = levelEnv === "1" || levelEnv === "both";
  const doL2 = levelEnv === "2" || levelEnv === "both";

  console.log(
    `produtos=${products.length} | L1(pais)=${doL1 ? `${l1From}..${to}` : "off"}` +
      ` | L2(agregado)=${doL2 ? `${l2From}..${to}` : "off"}`,
  );

  // Janela rolante do L1: no backfill (forced==null), apaga pais-nivel mais
  // velho que l1From, mantendo o L1 em ~60 meses. No modo targeted nao mexe.
  if (doL1 && forced == null) {
    const { error } = await db
      .from("trade_flows")
      .delete()
      .not("country_code", "is", null)
      .lt("ref_month", `${l1From}-01-01`);
    console.log(error ? `aviso: trim L1 falhou: ${error.message}` : `trim L1: pais-nivel < ${l1From} removido`);
  }

  let total = 0, l1rows = 0, l2rows = 0;
  for (const p of products) {
    const pTo = Math.min(to, p.maxYear ?? to); // codigo antigo (migrado) para em 2011
    if (doL1 && !p.l2only)
      for (let y = l1From; y <= pTo; y++) {
        try {
          const n = await ingest(p, y, 1, cmap);
          total += n; l1rows += n;
          console.log(`  ${p.key} ${y} L1: ${n}`);
        } catch (e: any) {
          console.log(`  ${p.key} ${y} L1: ERRO ${e?.message ?? e}`);
        }
      }
    if (doL2)
      for (let y = l2From; y <= pTo; y++) {
        try {
          const n = await ingest(p, y, 2, cmap);
          total += n; l2rows += n;
          console.log(`  ${p.key} ${y} L2: ${n}`);
        } catch (e: any) {
          console.log(`  ${p.key} ${y} L2: ERRO ${e?.message ?? e}`);
        }
      }
  }
  console.log(`\nTOTAL inserido: ${total} (L1=${l1rows} L2=${l2rows})`);
  console.log(orphans.size ? `ORFAOS (NAO gravados): ${[...orphans].join(" | ")}` : "ORFAOS: nenhum");
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("ERRO FATAL:", e?.message ?? e);
  process.exit(1);
});
