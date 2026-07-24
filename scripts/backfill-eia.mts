/**
 * backfill-eia.mts — seed de HISTORICO da(s) serie(s) da EIA. O worker
 * (sync-market-data) so pega os 10 pontos mais recentes por run (length=10),
 * entao o Henry Hub no banco e curto e a faixa de 5 anos do dot plot fica
 * estreita (parece que os EUA nao tiveram pico em 2022 — falso). A API v2 da EIA
 * serve historico longo (RNGWHHD, Henry Hub diario, desde 1997) via start= e um
 * length maior. Aqui puxamos ~6 anos para cobrir a janela rolante de 5 anos com
 * margem. Idempotente (upsert por series_id,ts). Mesma serie/code do worker.
 *
 *   npx tsx --env-file=.env scripts/backfill-eia.mts
 */
import { PostgrestClient } from "@supabase/postgrest-js";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const EIA_KEY = process.env.EIA_API_KEY;
if (!URL || !KEY) { console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY no .env"); process.exit(1); }
if (!EIA_KEY) { console.error("Falta EIA_API_KEY no .env"); process.exit(1); }
const db = new PostgrestClient(`${URL}/rest/v1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});

// ESPELHA o entry do Henry Hub em EIA_SERIES (sync-market-data.mts). Mesma code,
// route, unit — so muda a janela (historico longo em vez dos 10 recentes).
type EiaSeries = { eiaId: string; code: string; labelPt: string; labelEn: string; route: string; unit: string };
const SERIES: EiaSeries[] = [
  { eiaId: "RNGWHHD", code: "GAS_NATURAL_HH", labelPt: "Gás natural (spot Henry Hub)", labelEn: "Natural Gas (Henry Hub spot)", route: "natural-gas/pri/fut", unit: "USD/MMBtu" },
];

async function ensureSeries(s: EiaSeries): Promise<number> {
  const { data: source, error: se } = await db.from("sources").select("id").eq("slug", "eia").single();
  if (se || !source) throw new Error(`source eia: ${se?.message ?? "sem linha"}`);
  const { data: series, error: e } = await db
    .from("series")
    .upsert({
      source_id: (source as any).id, code: s.code, label_pt: s.labelPt, label_en: s.labelEn,
      unit: s.unit, category: "energia", visibility: "public", frequency: "diaria", market: null, active: true,
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
  const start = new Date();
  start.setFullYear(start.getFullYear() - 6);
  const startStr = start.toISOString().slice(0, 10);

  for (const s of SERIES) {
    const url =
      `https://api.eia.gov/v2/${s.route}/data/?api_key=${encodeURIComponent(EIA_KEY!)}` +
      `&frequency=daily&data[0]=value&facets[series][]=${s.eiaId}` +
      `&start=${startStr}&sort[0][column]=period&sort[0][direction]=asc&length=5000`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (AeternumBackfill)" } });
    if (!res.ok) throw new Error(`EIA HTTP ${res.status}`);
    const json: any = await res.json();
    const data: any[] = json?.response?.data ?? [];
    const total: number | undefined = json?.response?.total != null ? Number(json.response.total) : undefined;
    const points = data
      .map((d) => ({ ts: `${d.period}T00:00:00Z`, value: Number(d.value) }))
      .filter((p) => Number.isFinite(p.value));

    const seriesId = await ensureSeries(s);
    const saved = await saveObservations(seriesId, points);
    const vals = points.map((p) => p.value);
    const min = Math.min(...vals), max = Math.max(...vals);
    const maxTs = points.find((p) => p.value === max)?.ts?.slice(0, 7) ?? "-";
    console.log(`${s.code} (${s.unit}): baixados ${data.length}${total != null ? `/${total}` : ""}, gravados ${saved}`);
    console.log(`  periodo ${points[0]?.ts?.slice(0, 10)} .. ${points[points.length - 1]?.ts?.slice(0, 10)}`);
    console.log(`  faixa: min ${min} | max ${max} (pico ${maxTs})`);
    if (total != null && total > data.length) console.log(`  AVISO: total ${total} > baixados ${data.length} — aumentar length ou paginar.`);
  }
}

main().then(() => process.exit(0)).catch((e) => { console.error("ERRO:", e?.message ?? e); process.exit(1); });
