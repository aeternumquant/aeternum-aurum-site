/**
 * Ingestao USDA PSD (Production, Supply & Distribution) -> public.psd_balances.
 * Roda A MAO (9 commodities x ~36 anos = ~324 chamadas; a API e publica mas
 * throttle educado, ~1 req/s).
 *
 *   # tudo (as 9 commodities, 1990 ate o ano corrente):
 *   npx tsx --env-file=.env scripts/ingest-usda-psd.mts
 *   # subconjunto (validacao):
 *   PSD_COMMODITIES=soja PSD_FROM=2023 PSD_TO=2024 \
 *     npx tsx --env-file=.env scripts/ingest-usda-psd.mts
 *
 * Fonte: api.fas.usda.gov, header X-Api-Key (chave no .env: USDA_FAS_API_KEY).
 * Endpoint: /api/psd/commodity/{code}/country/all/year/{my} -> TODOS os paises
 * e TODOS os atributos de 1 commodity 1 ano numa chamada (barato).
 *
 * Regras (decididas com o Gabriel):
 *  - GUARDAR TUDO: todos os 85 atributos, todos os paises. Filtrar so por
 *    commodity (as 9 do mapa que existem no PSD).
 *  - VALOR CRU + unit_id POR LINHA. Sem converter (algodao=fardos, cafe=sacas,
 *    carne=MT CWE). A conversao e no front.
 *  - marketYear CRU (int do rotulo, "2024" = safra 2024/25). Sem virar ano civil.
 *  - PONTE de pais: countryCode 2-letras USDA + gencCode = ISO alfa-3. O
 *    /countries da a ponte; agregados (gencCode null) entram com iso_a3 null
 *    (o join do mapa os exclui naturalmente, como as zonas francas do Comex).
 *  - Idempotente/ATOMICO: cada (commodity, ano) vira UMA chamada a
 *    replace_psd_balances (delete+insert do escopo na mesma transacao). A USDA
 *    revisa anos anteriores; o delete limpa antes do insert.
 *  - value ausente/"" NAO e zero (vira null).
 */
import { PostgrestClient } from "@supabase/postgrest-js";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const FAS = process.env.USDA_FAS_API_KEY;
if (!URL || !KEY) {
  console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}
if (!FAS) {
  console.error("Falta USDA_FAS_API_KEY no .env");
  process.exit(1);
}
const db = new PostgrestClient(`${URL}/rest/v1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});

const API = "https://api.fas.usda.gov/api/psd";

/** As 9 commodities do mapa que existem no PSD (codigos confirmados no recon). */
type Com = { key: string; code: string; name: string };
const COMMODITIES: Com[] = [
  { key: "soja", code: "2222000", name: "Oilseed, Soybean" },
  { key: "milho", code: "0440000", name: "Corn" },
  { key: "cafe", code: "0711100", name: "Coffee, Green" },
  { key: "acucar", code: "0612000", name: "Sugar, Centrifugal" },
  { key: "algodao", code: "2631000", name: "Cotton" },
  { key: "arroz", code: "0422110", name: "Rice, Milled" },
  { key: "carne", code: "0111000", name: "Meat, Beef and Veal" },
  { key: "frango", code: "0115000", name: "Meat, Chicken" },
  { key: "trigo", code: "0410000", name: "Wheat" },
];

const FROM = Number(process.env.PSD_FROM ?? 1990);
const TO = Number(process.env.PSD_TO ?? new Date().getUTCFullYear());
const ONLY = (process.env.PSD_COMMODITIES ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** string -> number; "" / null / NaN -> null (ausencia NAO e zero). */
function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

let last = 0;
let rateHits = 0;
/** GET com throttle >=1,1s e retry escalonado no 429/5xx. Devolve JSON. */
async function fasGet(path: string, tries = 6): Promise<any> {
  let n429 = 0;
  for (let i = 0; i < tries; i++) {
    const wait = Math.max(1_100 - (Date.now() - last), 0) + n429 * 4_000;
    if (wait > 0) await sleep(wait);
    last = Date.now();
    try {
      const res = await fetch(`${API}${path}`, {
        headers: { "X-Api-Key": FAS!, Accept: "application/json" },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.status === 429 || res.status >= 500) {
        n429++;
        rateHits++;
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: any) {
      if (i === tries - 1) throw e;
      n429++;
    }
  }
  throw new Error(`falhou apos ${tries} tentativas: ${path}`);
}

/** Popula as 3 tabelas de referencia (1x). commodities = so as alvo. */
async function seedRefs(countries: Map<string, string | null>): Promise<void> {
  const attrs = await fasGet("/commodityAttributes");
  await sleep(300);
  const units = await fasGet("/unitsOfMeasure");
  const aRows = attrs.map((a: any) => ({ attribute_id: a.attributeId, name: a.attributeName }));
  const uRows = units.map((u: any) => ({ unit_id: u.unitId, name: String(u.unitDescription).trim() }));
  const cRows = COMMODITIES.map((c) => ({ commodity_code: c.code, name: c.name }));
  for (const [tbl, rows, key] of [
    ["psd_attributes", aRows, "attribute_id"],
    ["psd_units", uRows, "unit_id"],
    ["psd_commodities", cRows, "commodity_code"],
  ] as const) {
    const { error } = await db.from(tbl).upsert(rows, { onConflict: key });
    if (error) throw new Error(`upsert ${tbl}: ${error.message}`);
  }
  console.log(`refs: ${aRows.length} attrs, ${uRows.length} units, ${cRows.length} commodities · countries ${countries.size}`);
}

async function ingest(c: Com, year: number, iso: Map<string, string | null>): Promise<number> {
  const list = await fasGet(`/commodity/${c.code}/country/all/year/${year}`);
  if (!Array.isArray(list) || list.length === 0) return 0;
  const rows = list.map((r: any) => ({
    country_code: r.countryCode,
    iso_a3: iso.get(r.countryCode) ?? null, // ponte gencCode; null nos agregados
    attribute_id: r.attributeId,
    value: num(r.value),
    unit_id: r.unitId,
  }));
  const { data, error } = await db.rpc("replace_psd_balances", {
    p_commodity_code: c.code,
    p_market_year: year,
    p_rows: rows,
  });
  if (error) throw new Error(`rpc ${c.key} ${year}: ${error.message}`);
  return typeof data === "number" ? data : rows.length;
}

async function main() {
  // ponte de pais: countryCode -> gencCode (ISO alfa-3), do /countries
  const paises = await fasGet("/countries");
  const iso = new Map<string, string | null>();
  for (const p of paises) iso.set(p.countryCode, p.gencCode ?? null);

  await seedRefs(iso);

  const alvo = ONLY.length ? COMMODITIES.filter((c) => ONLY.includes(c.key)) : COMMODITIES;
  console.log(`PSD: ${alvo.map((c) => c.key).join(", ")} · ${FROM}..${TO}`);

  let total = 0;
  for (const c of alvo) {
    let cTotal = 0;
    for (let y = FROM; y <= TO; y++) {
      try {
        const n = await ingest(c, y, iso);
        cTotal += n;
        if (n > 0) console.log(`  ${c.key} ${y}: ${n}`);
      } catch (e: any) {
        console.log(`  ${c.key} ${y}: ERRO ${e?.message ?? e}`);
      }
    }
    console.log(`${c.key}: ${cTotal} linhas`);
    total += cTotal;
  }
  console.log(`\nTOTAL inserido: ${total} · rate/5xx hits: ${rateHits}`);
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exit(1);
});
