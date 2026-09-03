/**
 * INGESTOR DIARIO — opcoes sobre futuros agro (brapi Pro) -> public.opcoes_futuros.
 * Rodar 1x/dia APOS as 19h BRT (o arquivo de fim de dia entra nesse horario):
 *   npx tsx --env-file=.env scripts/ingest-opcoes-daily.mts   (local)
 *   pnpm exec tsx scripts/ingest-opcoes-daily.mts             (CI, env via secrets)
 *
 * Pega SO o snapshot corrente (a cadeia do dia via /analytics) + o OI via
 * /positions, para TODOS os vencimentos dos 4 contratos. Nao recarrega historia.
 *   - IDEMPOTENTE: upsert on conflict (date,symbol) — rodar 2x no mesmo dia nao
 *     duplica; se o dia nao mudou (feriado), so re-atualiza a mesma data.
 *   - OI com DATA PROPRIA: a analytics fecha em date; o /positions em
 *     open_interest_date (reportDate). Casados por symbol, cada um com sua data.
 *   - EXIT CODE honesto (nao engole erro): feriado/sem pregao (contratos
 *     respondem mas sem cadeia) -> loga e sai 0. Falha REAL (403/token, API
 *     fora do ar, erro de escrita no Supabase) -> exit != 0, VISIVEL no cron.
 *   - Dia PERDIDO (job nao rodou/falhou): o dia seguinte NAO recupera sozinho
 *     (o diario so pega o snapshot corrente). Recuperacao = rerodar o backfill
 *     (ingest-opcoes-backfill.mts usa /analytics/history, ~1 ano, idempotente).
 *   - ~50 chamadas/dia, throttle pelos ~20/min dos endpoints de opcoes.
 *
 * 🔒 USO INTERNO (licenca brapi cl.2). Chave so no header (nunca URL/log).
 */
import { PostgrestClient } from "@supabase/postgrest-js";

// SUPABASE_URL e o nome limpo (server); VITE_SUPABASE_URL e o fallback do .env do
// front (a mesma URL publica) p/ o run local seguir funcionando sem duplicar.
const SB_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL, SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY, BRAPI = process.env.BRAPI_TOKEN;
if (!SB_URL || !SB_KEY || !BRAPI) { console.error("Faltam SUPABASE_URL (ou VITE_SUPABASE_URL) / SUPABASE_SERVICE_ROLE_KEY / BRAPI_TOKEN no ambiente"); process.exit(1); }
const db = new PostgrestClient(`${SB_URL}/rest/v1`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
const brapiHeaders = { Authorization: `Bearer ${BRAPI}`, "User-Agent": "AeternumWorker" };
const API = "https://brapi.dev/api/v2";

const UNDERLYINGS = [
  { u: "BGI", currency: "BRL" }, { u: "CCM", currency: "BRL" },
  { u: "ICF", currency: "USD" }, { u: "SJC", currency: "USD" },
];
const MIN_GAP_MS = 3200; // ~18/min, sob o teto de 20/min

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const log = (m: string) => console.log(`[${new Date().toISOString()}] ${m}`);

let lastCall = 0;
async function brapiGet(pathQ: string, tries = 5): Promise<{ status: number; body: any }> {
  for (let i = 0; i < tries; i++) {
    const gap = MIN_GAP_MS - (Date.now() - lastCall); if (gap > 0) await sleep(gap);
    lastCall = Date.now();
    let res: Response;
    try { res = await fetch(`${API}${pathQ}`, { headers: brapiHeaders, signal: AbortSignal.timeout(60_000) }); }
    catch { await sleep(2000); continue; }
    if (res.status === 429) { const ra = Number(res.headers.get("retry-after")) || 60; log(`429 -> ${ra}s`); await sleep((ra + 1) * 1000); continue; }
    if (res.status === 403) return { status: 403, body: { error: "fora do plano" } };
    if (res.status >= 500) { await sleep(3000 * (i + 1)); continue; }
    let body: any = null; try { body = await res.json(); } catch {}
    return { status: res.status, body };
  }
  return { status: 0, body: null }; // esgotou tentativas (rede/5xx) — tratado como falha
}

async function flush(rows: any[], tries = 3): Promise<number> {
  if (!rows.length) return 0;
  for (let i = 0; i < tries; i++) {
    const { error } = await db.rpc("upsert_opcoes_futuros", { p_rows: rows });
    if (!error) return rows.length;
    if (i === tries - 1) throw new Error(`rpc apos ${tries} tentativas: ${error.message}`);
    await sleep(2000 * (i + 1));
  }
  return 0;
}

async function main(): Promise<number> {
  let total = 0, chains = 0, emptyChains = 0, contractsOk = 0, rpcFails = 0, authError = false;
  for (const { u, currency } of UNDERLYINGS) {
    const ex = await brapiGet(`/futures/options/expirations?underlying=${u}`);
    if (ex.status === 403) { authError = true; log(`${u}: 403 — token invalido / fora do plano`); continue; }
    const exps: string[] = ex.body?.expirations ?? [];
    if (!exps.length) { log(`${u}: sem vencimentos (API instavel — feriado NAO zera expirations)`); continue; }
    contractsOk++;
    for (const exp of exps) {
      const ch = await brapiGet(`/futures/options/analytics?underlying=${u}&expirationDate=${exp}`);
      if (ch.status === 403) { authError = true; continue; }
      const chain: any[] = ch.body?.analytics ?? [];
      if (!chain.length) { log(`${u} ${exp}: cadeia vazia — pula`); emptyChains++; continue; }
      // OI por simbolo (/positions), com a data propria
      const pos = await brapiGet(`/futures/options/positions?underlying=${u}&expirationDate=${exp}`);
      const oi = new Map<string, { oi: number | null; chg: number | null; date: string | null }>();
      for (const p of pos.body?.positions ?? []) {
        oi.set(p.symbol, {
          oi: p.openInterest ?? p.reportedOpenInterest ?? null,
          chg: p.openInterestChange ?? p.reportedOpenInterestChange ?? null,
          date: p.openInterestDate ?? p.reportDate ?? null,
        });
      }
      const rows = chain.filter((o) => o?.symbol && o.strike != null).map((o) => {
        const k = oi.get(o.symbol);
        return {
          date: o.date, symbol: o.symbol, underlying: u, option_type: o.optionType, strike: o.strike, expiration_date: o.expirationDate ?? exp,
          option_price: o.optionPrice ?? null, underlying_price: o.underlyingPrice ?? null, implied_volatility: o.impliedVolatility ?? null,
          delta: o.delta ?? null, gamma: o.gamma ?? null, theta: o.theta ?? null, vega: o.vega ?? null, rho: o.rho ?? null,
          time_to_expiration_years: o.timeToExpirationYears ?? null, risk_free_rate: o.riskFreeRate ?? null,
          model: o.model ?? null, price_source: o.priceSource ?? null, confidence: o.confidence ?? null,
          contract_multiplier: o.contractMultiplier ?? null, currency, quotation_type: "price",
          open_interest: k?.oi ?? null, open_interest_change: k?.chg ?? null, open_interest_date: k?.date ?? null,
        };
      });
      try { total += await flush(rows); chains++; log(`${u} ${exp}: ${rows.length} opcoes (date=${chain[0]?.date}, OI de ${oi.size})`); }
      catch (e: any) { rpcFails++; log(`${u} ${exp}: ERRO upsert ${e?.message}`); }
    }
  }
  log(`DIARIO: ${total} linhas em ${chains} cadeias · contratos_ok=${contractsOk}/${UNDERLYINGS.length} · vazias=${emptyChains} · rpc_falhas=${rpcFails}${authError ? " · AUTH_ERROR" : ""}`);
  // Exit code honesto: falha real = 1 (visivel no Actions); feriado/sem pregao = 0.
  if (authError)         { log("FALHA: 403 — token brapi invalido/expirado ou fora do plano"); return 1; }
  if (contractsOk === 0) { log("FALHA: nenhum contrato retornou vencimentos — API fora do ar ou credencial ruim"); return 1; }
  if (rpcFails > 0)      { log("FALHA: erro de escrita no Supabase (dados parciais gravados; idempotente na proxima rodada)"); return 1; }
  if (total === 0)       { log("OK-VAZIO: contratos responderam sem cadeia (feriado/sem pregao) — nada a gravar"); return 0; }
  return 0; // sucesso — inclui feriado (analytics traz o ultimo pregao, re-upsert idempotente)
}
// Feriado/sem pregao sai 0; falha real sai != 0 (visivel no cron, sem engolir erro).
main().then((code) => process.exit(code)).catch((e) => { log(`FALHA inesperada: ${e?.stack ?? e}`); process.exit(1); });
