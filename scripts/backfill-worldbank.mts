/**
 * backfill-worldbank.mts — seed de HISTORICO COMPLETO das series novas do Pink
 * Sheet (World Bank). O worker (sync-market-data) so reprocessa os ultimos 6
 * meses (cron); series recem-mapeadas precisam da historia inteira uma vez.
 * Mesma fonte/licenca (CC BY 4.0), mesma aba "Monthly Prices" — so lemos todos
 * os meses em vez dos ultimos 6. Idempotente (upsert por series_id,ts).
 *
 *   COMEX_WB_CODES=BORRACHA_WB,FUMO_WB npx tsx --env-file=.env scripts/backfill-worldbank.mts
 *   (sem env: backfilla as 4 novas)
 */
import { PostgrestClient } from "@supabase/postgrest-js";
import * as XLSX from "xlsx";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env");
  process.exit(1);
}
const db = new PostgrestClient(`${URL}/rest/v1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const UA = { "User-Agent": "Mozilla/5.0 (AeternumWorker)" };

// ESPELHA os 4 novos entries de WORLDBANK_SERIES (sync-market-data.mts). Se
// mudar la, mudar aqui. name = nome EXATO da linha 4 do XLSX (** e espaco tolerados).
type WbSeries = { name: string; code: string; labelPt: string; labelEn: string; unit: string; category: string; market: string | null };
const NEW_SERIES: WbSeries[] = [
  { name: "Rubber, TSR20", code: "BORRACHA_WB", labelPt: "Borracha natural (TSR20, SGX/SICOM)", labelEn: "Natural rubber (TSR20, SGX/SICOM)", unit: "USD/kg", category: "agro", market: "SGX/SICOM" },
  { name: "Liquefied natural gas, Japan", code: "GAS_LNG_JAPAN_WB", labelPt: "GNL Japão (importação, referência Ásia ~JKM)", labelEn: "LNG Japan (import, Asia ref ~JKM)", unit: "USD/MMBtu", category: "energia", market: null },
  { name: "Natural gas, Europe", code: "GAS_EUROPE_WB", labelPt: "Gás natural Europa (hub, referência ~TTF)", labelEn: "Natural gas Europe (hub, ~TTF)", unit: "USD/MMBtu", category: "energia", market: null },
  { name: "Tobacco, US import u.v.", code: "FUMO_WB", labelPt: "Fumo (unit value de importação EUA, referência)", labelEn: "Tobacco (US import unit value, reference)", unit: "USD/t", category: "agro", market: null },
];

const norm = (s: unknown) => String(s).replace(/\s*\*+\s*$/, "").trim().replace(/\s+/g, " ");
const wbMonthToIso = (raw: unknown): string | null => {
  const m = /^(\d{4})M(\d{2})$/.exec(String(raw).trim());
  return m ? `${m[1]}-${m[2]}-01T00:00:00Z` : null;
};

async function ensureSeries(s: WbSeries): Promise<number> {
  const { data: source, error: se } = await db.from("sources").select("id").eq("slug", "worldbank").single();
  if (se || !source) throw new Error(`source worldbank: ${se?.message ?? "sem linha"}`);
  const { data: series, error: e } = await db
    .from("series")
    .upsert({
      source_id: (source as any).id, code: s.code, label_pt: s.labelPt, label_en: s.labelEn,
      unit: s.unit, category: s.category, visibility: "public", frequency: "mensal", market: s.market, active: true,
    }, { onConflict: "source_id,code" })
    .select("id").single();
  if (e || !series) throw new Error(`series ${s.code}: ${e?.message ?? "sem linha"}`);
  return (series as any).id;
}

async function saveObservations(seriesId: number, points: { ts: string; value: number }[]): Promise<number> {
  const ingestedAt = new Date().toISOString();
  const rows = points.map((p) => ({ series_id: seriesId, ts: p.ts, value: p.value, ingested_at: ingestedAt, contract: null }));
  let saved = 0;
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    const { error } = await db.from("observations").upsert(chunk, { onConflict: "series_id,ts", ignoreDuplicates: false });
    if (error) throw new Error(`observations ${seriesId}: ${error.message}`);
    saved += chunk.length;
  }
  return saved;
}

async function main() {
  const only = (process.env.COMEX_WB_CODES ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const targets = only.length ? NEW_SERIES.filter((s) => only.includes(s.code)) : NEW_SERIES;

  const html = await (await fetch("https://www.worldbank.org/en/research/commodity-markets", { headers: UA })).text();
  const m = /href="([^"]*CMO-Historical-Data-Monthly\.xlsx)"/i.exec(html);
  if (!m) throw new Error("link do XLSX nao encontrado na pagina do WB");
  const buf = Buffer.from(await (await fetch(m[1], { headers: UA })).arrayBuffer());
  const wb = XLSX.read(buf, { type: "buffer" });
  const grid = XLSX.utils.sheet_to_json<any[]>(wb.Sheets["Monthly Prices"], { header: 1, raw: true, blankrows: true });

  const headerNames: any[] = grid[4] ?? [];
  const colByName = new Map<string, number>();
  headerNames.forEach((n, i) => { if (i > 0 && n != null && String(n).trim() !== "") colByName.set(norm(n), i); });
  const dataRows = grid.slice(6).filter((r) => r && /^\d{4}M\d{2}$/.test(String(r[0] ?? "")));

  console.log(`XLSX: ${dataRows.length} meses (${dataRows[0]?.[0]} .. ${dataRows[dataRows.length - 1]?.[0]})\n`);
  for (const s of targets) {
    const col = colByName.get(norm(s.name));
    if (col == null) { console.log(`  ${s.code}: COLUNA '${s.name}' NAO ENCONTRADA`); continue; }
    const points: { ts: string; value: number }[] = [];
    for (const row of dataRows) {
      const ts = wbMonthToIso(row[0]);
      const v = typeof row[col] === "number" ? row[col] : Number(row[col]);
      if (ts && Number.isFinite(v)) points.push({ ts, value: v });
    }
    const seriesId = await ensureSeries(s);
    const saved = await saveObservations(seriesId, points);
    const first = points[0]?.ts?.slice(0, 7) ?? "-";
    const last = points[points.length - 1]?.ts?.slice(0, 7) ?? "-";
    console.log(`  ${s.code} (${s.unit}): ${saved} pontos | ${first} .. ${last}`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1); });
