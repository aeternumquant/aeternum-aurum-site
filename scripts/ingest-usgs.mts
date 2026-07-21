/**
 * Ingestao USGS MCS 2026 -> public.usgs_minerals. Roda A MAO (1 download + parse).
 *
 *   npx tsx --env-file=.env scripts/ingest-usgs.mts
 *
 * CSV mestre MCS2026_Commodities_Data.csv (8.887 linhas), ENCODING latin-1
 * (o travessao 0x97). Colunas: MCS chapter · Section · Commodity · Country ·
 * Statistics · Statistics_detail · Unit · Year · Value · Notes · Is critical ·
 * Other notes. Guardamos TUDO (127 minerais), 2021-2025; valor CRU + unidade
 * por linha (REO nas terras raras). Ponte nome->iso curada (norm-key robusta a
 * acento/apostrofo); fallback null (nao quebra). Atomico por commodity via RPC.
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

const CSV_URL =
  "https://www.sciencebase.gov/catalog/file/get/696a75d5d4be0228872d3bf8?f=__disk__eb%2F4d%2Fd1%2Feb4dd129d4f08cfba010a8b11cbbd2d88bbefdcb";
const FROM_YEAR = Number(process.env.USGS_FROM ?? 2021);

/** normaliza nome para chave: minusculo, sem acento, so letras. */
function norm(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
}

/** nome USGS (EN) -> iso_a3. Combinados/agregados nao entram (iso null). */
const NAME_ISO: Record<string, string> = Object.fromEntries(
  (
    [
      ["Afghanistan", "AFG"], ["Algeria", "DZA"], ["Angola", "AGO"], ["Argentina", "ARG"], ["Armenia", "ARM"],
      ["Australia", "AUS"], ["Austria", "AUT"], ["Azerbaijan", "AZE"], ["Bahrain", "BHR"], ["Belarus", "BLR"],
      ["Belgium", "BEL"], ["Bhutan", "BTN"], ["Bolivia", "BOL"], ["Botswana", "BWA"], ["Brazil", "BRA"],
      ["Bulgaria", "BGR"], ["Burma", "MMR"], ["Burundi", "BDI"], ["Cameroon", "CMR"], ["Canada", "CAN"],
      ["Chile", "CHL"], ["China", "CHN"], ["Colombia", "COL"], ["Congo (Kinshasa)", "COD"], ["Cuba", "CUB"],
      ["Cyprus", "CYP"], ["Czechia", "CZE"], ["Cote d'Ivoire", "CIV"], ["Denmark", "DNK"], ["Ecuador", "ECU"],
      ["Egypt", "EGY"], ["Estonia", "EST"], ["Ethiopia", "ETH"], ["Finland", "FIN"], ["France", "FRA"],
      ["Gabon", "GAB"], ["Georgia", "GEO"], ["Germany", "DEU"], ["Ghana", "GHA"], ["Greece", "GRC"],
      ["Greenland", "GRL"], ["Guatemala", "GTM"], ["Guinea", "GIN"], ["Guyana", "GUY"], ["Honduras", "HND"],
      ["Hungary", "HUN"], ["Iceland", "ISL"], ["India", "IND"], ["Indonesia", "IDN"], ["Iran", "IRN"],
      ["Iraq", "IRQ"], ["Ireland", "IRL"], ["Israel", "ISR"], ["Italy", "ITA"], ["Jamaica", "JAM"],
      ["Japan", "JPN"], ["Jordan", "JOR"], ["Kazakhstan", "KAZ"], ["Kenya", "KEN"], ["Korea, North", "PRK"],
      ["Korea, Republic of", "KOR"], ["Kuwait", "KWT"], ["Kyrgyzstan", "KGZ"], ["Laos", "LAO"], ["Latvia", "LVA"],
      ["Lesotho", "LSO"], ["Lithuania", "LTU"], ["Madagascar", "MDG"], ["Malaysia", "MYS"], ["Mali", "MLI"],
      ["Mauritania", "MRT"], ["Mexico", "MEX"], ["Mongolia", "MNG"], ["Morocco", "MAR"], ["Mozambique", "MOZ"],
      ["Namibia", "NAM"], ["Netherlands", "NLD"], ["New Caledonia", "NCL"], ["New Zealand", "NZL"], ["Nicaragua", "NIC"],
      ["Nigeria", "NGA"], ["Norway", "NOR"], ["Oman", "OMN"], ["Pakistan", "PAK"], ["Papua New Guinea", "PNG"],
      ["Peru", "PER"], ["Philippines", "PHL"], ["Poland", "POL"], ["Portugal", "PRT"], ["Qatar", "QAT"],
      ["Russia", "RUS"], ["Rwanda", "RWA"], ["Saudi Arabia", "SAU"], ["Senegal", "SEN"], ["Serbia", "SRB"],
      ["Sierra Leone", "SLE"], ["Slovakia", "SVK"], ["South Africa", "ZAF"], ["Spain", "ESP"], ["Sri Lanka", "LKA"],
      ["Sweden", "SWE"], ["Switzerland", "CHE"], ["Syria", "SYR"], ["Taiwan", "TWN"], ["Tajikistan", "TJK"],
      ["Tanzania", "TZA"], ["Thailand", "THA"], ["The Bahamas", "BHS"], ["Togo", "TGO"], ["Trinidad and Tobago", "TTO"],
      ["Tunisia", "TUN"], ["Turkey", "TUR"], ["Turkmenistan", "TKM"], ["Uganda", "UGA"], ["Ukraine", "UKR"],
      ["United Arab Emirates", "ARE"], ["United Kingdom", "GBR"], ["United States", "USA"], ["Uzbekistan", "UZB"],
      ["Venezuela", "VEN"], ["Vietnam", "VNM"], ["Zambia", "ZMB"], ["Zimbabwe", "ZWE"],
    ] as [string, string][]
  ).map(([n, iso]) => [norm(n), iso]),
);

/** parser CSV RFC4180 (aspas, virgulas e quebras dentro de aspas). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\r") { /* skip */ }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else field += c;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  return rows;
}

/** "10,000" -> 10000 ; "NA"/"W"/"—"/"" -> null (ausencia/sigilo nao e zero). */
function num(v: string): number | null {
  const s = (v ?? "").replace(/,/g, "").trim();
  if (s === "" || /^(NA|W|XX|—|--|\(1\))$/i.test(s)) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

type Row = {
  country: string; country_iso: string | null; statistic: string; statistic_detail: string;
  value: number | null; unit: string; year: number; is_critical: boolean | null;
};

async function main() {
  const res = await fetch(CSV_URL, { headers: { "User-Agent": "AeternumWorker" }, signal: AbortSignal.timeout(90_000) });
  if (!res.ok) throw new Error(`CSV HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const text = buf.toString("latin1"); // <- o 0x97
  const rows = parseCsv(text);
  const hdr = rows[0].map((h) => h.trim().toLowerCase());
  const ix = (k: string) => hdr.findIndex((h) => h.includes(k));
  const iSec = hdr.indexOf("section"),
    iC = ix("commodity"), iCo = ix("country"), iS = hdr.indexOf("statistics"),
    iSd = ix("statistics_detail"), iU = ix("unit"), iY = ix("year"), iV = ix("value"),
    iCr = ix("critical");

  const byCommodity = new Map<string, Row[]>();
  let skipped = 0;
  for (const r of rows.slice(1)) {
    if (r.length <= iV) { skipped++; continue; }
    const year = Number((r[iY] ?? "").trim());
    if (!Number.isFinite(year) || year < FROM_YEAR) continue;
    // So a secao "World ... Production and Reserves" (dado POR PAIS). As secoes
    // "Salient Statistics-United States" e "Import Sources" sao apendice so-EUA
    // (sem dado por pais) e duplicam a linha do US -> colisao de chave.
    const section = (r[iSec] ?? "").trim();
    if (!section.startsWith("World")) continue;
    const commodity = (r[iC] ?? "").trim();
    const country = (r[iCo] ?? "").trim();
    if (!commodity || !country) continue;
    const iso = NAME_ISO[norm(country)] ?? null; // agregados/World -> null
    const crRaw = (r[iCr] ?? "").trim().toLowerCase();
    (byCommodity.get(commodity) ?? byCommodity.set(commodity, []).get(commodity)!).push({
      country,
      country_iso: iso,
      statistic: (r[iS] ?? "").trim(),
      statistic_detail: (r[iSd] ?? "").trim(), // '' (nao null) p/ a unique
      value: num(r[iV] ?? ""),
      unit: (r[iU] ?? "").trim(),
      year,
      is_critical: crRaw === "yes" ? true : crRaw === "no" ? false : null,
    });
  }

  let total = 0;
  const isoMiss = new Set<string>();
  for (const [commodity, rs] of byCommodity) {
    for (const r of rs) if (r.country_iso == null && !/world|other|europe|and /i.test(r.country)) isoMiss.add(r.country);
    const { data, error } = await db.rpc("replace_usgs_minerals", { p_commodity: commodity, p_rows: rs });
    if (error) { console.log(`  ${commodity}: ERRO ${error.message}`); continue; }
    total += typeof data === "number" ? data : rs.length;
  }
  console.log(`\nTOTAL: ${total} linhas em ${byCommodity.size} minerais (>= ${FROM_YEAR}), ${skipped} descartadas`);
  if (isoMiss.size) console.log(`paises sem iso (ficam country_iso null):`, [...isoMiss].join(", "));
}

main().then(() => process.exit(0)).catch((e) => {
  console.error("ERRO:", e?.message ?? e);
  process.exit(1);
});
