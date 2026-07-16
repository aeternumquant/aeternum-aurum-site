/**
 * Backfill curto de historico (roda UMA vez, manual):
 *   npx tsx --env-file=.env scripts/backfill-history.mts
 *
 * - grãos + etanol: ~10 pregoes do contrato ATUAL (front) via /futures/historical
 *   (future.history), gravando observations.contract.
 * - ouro (PAXG): ~1 ano (366 pontos) via /crypto range=1y&interval=1d.
 *
 * Idempotente (upsert onConflict series_id,ts) e retry-safe: a brapi teve 503
 * transitorio no historico; se cair no meio, roda de novo sem duplicar.
 *
 * NAO monta front-month continuo: costurar contratos (back/ratio-adjusted) e
 * decisao quant do GJO, etapa propria. Aqui e so o contrato atual.
 *
 * Precisa da SUPABASE_SERVICE_ROLE_KEY (grava ignorando RLS) e do BRAPI_TOKEN.
 * As series ja devem existir (rode o worker antes): buscamos o id por code.
 */
import { PostgrestClient } from "@supabase/postgrest-js";

const URL = process.env.VITE_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BRAPI = process.env.BRAPI_TOKEN;
if (!URL || !KEY || !BRAPI) {
  console.error("Faltam env vars: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BRAPI_TOKEN");
  process.exit(1);
}

const db = new PostgrestClient(`${URL}/rest/v1`, {
  headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
});
const brapiHeaders = { Authorization: `Bearer ${BRAPI}` };

const HIST_DAYS = 12; // ~10 pregoes uteis + margem

type Row = { ts: string; value: number; contract: string | null };

/** fetch JSON com retry no 503 da brapi (upstream instavel). */
async function getJson(url: string, headers?: Record<string, string>, tries = 5): Promise<any> {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers, signal: AbortSignal.timeout(30000) });
      const j = await r.json().catch(() => null);
      if (r.status === 503 || (j && j.code === "EXTERNAL_API_ERROR")) {
        await new Promise((s) => setTimeout(s, 3000));
        continue;
      }
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return j;
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((s) => setTimeout(s, 2500));
    }
  }
  throw new Error("503 apos retries");
}

/** date Unix (segundos) -> meia-noite UTC do dia. Alinha a serie diaria. */
function unixToUtcMidnight(dateUnix: number): string {
  return `${new Date(dateUnix * 1000).toISOString().slice(0, 10)}T00:00:00Z`;
}

async function seriesIdByCode(code: string): Promise<number> {
  const { data, error } = await db.from("series").select("id").eq("code", code).single();
  if (error || !data) {
    throw new Error(`serie '${code}' nao encontrada (rode o worker antes): ${error?.message ?? "sem linha"}`);
  }
  return (data as { id: number }).id;
}

async function upsertObs(seriesId: number, rows: Row[]): Promise<number> {
  const ingestedAt = new Date().toISOString();
  const payload = rows
    .filter((p) => p && p.ts && Number.isFinite(p.value))
    .map((p) => ({ series_id: seriesId, ts: p.ts, value: p.value, ingested_at: ingestedAt, contract: p.contract }));
  if (payload.length === 0) return 0;
  const { error } = await db
    .from("observations")
    .upsert(payload, { onConflict: "series_id,ts", ignoreDuplicates: false });
  if (error) throw new Error(`upsert serie ${seriesId}: ${error.message}`);
  return payload.length;
}

const FUTURES = [
  { asset: "SJC", code: "SOJA_FUT" },
  { asset: "CCM", code: "MILHO_FUT" },
  { asset: "BGI", code: "BOI_FUT" },
  { asset: "ICF", code: "CAFE_FUT" },
  { asset: "ETH", code: "ETANOL_FUT" },
];

async function backfillFutures(): Promise<void> {
  const todayUtc = new Date().toISOString().slice(0, 10);
  for (const f of FUTURES) {
    try {
      // Front month = mesma logica do worker (menor vencimento ainda ativo).
      const tsJson = await getJson(`https://brapi.dev/api/v2/futures/term-structure?asset=${f.asset}`, brapiHeaders);
      const contracts: any[] = Array.isArray(tsJson?.contracts) ? tsJson.contracts : [];
      const active = contracts
        .filter((c) => c?.expirationDate && c.expirationDate >= todayUtc)
        .sort((a, b) => String(a.expirationDate).localeCompare(String(b.expirationDate)));
      const front = active[0] ?? contracts[0];
      if (!front?.symbol) {
        console.log(`${f.code}: sem contrato front`);
        continue;
      }
      const symbol: string = front.symbol;

      // future.history vem DESCENDENTE (mais recente primeiro). Pegamos os ~12
      // mais recentes DESSE contrato. value = settlement (oficial), fallback close.
      const histJson = await getJson(`https://brapi.dev/api/v2/futures/historical?symbol=${symbol}`, brapiHeaders);
      const hist: any[] = histJson?.future?.history ?? [];
      const rows: Row[] = hist
        .slice(0, HIST_DAYS)
        .map((d) => {
          const value = d.settlement ?? d.close;
          return d.date != null && value != null
            ? { ts: unixToUtcMidnight(d.date), value: Number(value), contract: symbol }
            : null;
        })
        .filter((r): r is Row => r !== null);

      const seriesId = await seriesIdByCode(f.code);
      const n = await upsertObs(seriesId, rows);
      console.log(`${f.code} (${symbol}): ${n} pontos gravados`);
    } catch (e: any) {
      console.log(`${f.code}: ERRO ${e?.message ?? String(e)}`);
    }
  }
}

async function backfillGold(): Promise<void> {
  try {
    const json = await getJson(
      "https://brapi.dev/api/v2/crypto?coin=PAXG&currency=USD&range=1y&interval=1d",
      brapiHeaders,
    );
    const coin = Array.isArray(json?.coins) ? json.coins[0] : null;
    const hist: any[] = coin?.historicalDataPrice ?? [];
    const rows: Row[] = hist
      .map((d) =>
        d.date != null && d.close != null
          ? { ts: unixToUtcMidnight(d.date), value: Number(d.close), contract: null }
          : null,
      )
      .filter((r): r is Row => r !== null);
    const seriesId = await seriesIdByCode("OURO_PAXG");
    const n = await upsertObs(seriesId, rows);
    console.log(`OURO_PAXG: ${n} pontos gravados (de ${hist.length} no historico)`);
  } catch (e: any) {
    console.log(`OURO_PAXG: ERRO ${e?.message ?? String(e)}`);
  }
}

(async () => {
  console.log("=== backfill futuros (graos + etanol): ~10 pregoes do contrato atual ===");
  await backfillFutures();
  console.log("=== backfill ouro (PAXG, 1 ano) ===");
  await backfillGold();
  console.log("=== fim ===");
  process.exit(0);
})();
