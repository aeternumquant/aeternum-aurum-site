/**
 * CARGA INICIAL — opcoes sobre futuros agro (brapi Pro) -> public.opcoes_futuros.
 *   npx tsx --env-file=.env scripts/ingest-opcoes-backfill.mts
 *
 * O dado antigo NAO volta (a janela do plano corta em ~1 ano e cai 1 dia por
 * pregao — a ATM do milho para em 2025-09-01). Por isso a carga vem antes de tudo.
 *
 * ESTRUTURA REAL (do recon): /analytics/history e por SIMBOLO DE OPCAO (nao por
 * contrato). Fluxo: descobrir os simbolos via /analytics (por underlying x
 * vencimento) e puxar /analytics/history de cada um. O OI (open interest) NAO vem
 * no history (so no /positions corrente) -> aqui fica null; entra pelo diario.
 *
 * RATE LIMIT (descoberto na pratica, NAO documentado): os endpoints de opcoes tem
 * balde PROPRIO de ~20 requisicoes/MINUTO (limit=20, reset=60), distinto da cota de
 * 500k/ciclo. O backoff e dimensionado por ISSO: >=3,2s entre chamadas (~18/min).
 *
 * ORDEM DE PRIORIDADE (nao alfabetica): vencimentos FRONT primeiro e, dentro,
 * das ATM para as asas (|strike - subjacente|). Se quebrar na 3a hora, o que
 * importa ja esta salvo. RESUMIVEL: progresso em arquivo; retomar de onde parou.
 *
 * IDEMPOTENTE: upsert on conflict (date,symbol) — rerodar nao duplica.
 *
 * 🔒 USO INTERNO (licenca brapi cl.2). Chave so no header Authorization (nunca URL/log).
 */
import { PostgrestClient } from "@supabase/postgrest-js";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const SB_URL = process.env.VITE_SUPABASE_URL, SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY, BRAPI = process.env.BRAPI_TOKEN;
if (!SB_URL || !SB_KEY || !BRAPI) { console.error("Faltam VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY / BRAPI_TOKEN no .env"); process.exit(1); }
const db = new PostgrestClient(`${SB_URL}/rest/v1`, { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
const brapiHeaders = { Authorization: `Bearer ${BRAPI}`, "User-Agent": "AeternumWorker" };
const API = "https://brapi.dev/api/v2";

/** BGI/CCM em BRL, ICF/SJC em USD (a analytics nao traz currency; fixo por underlying). */
const UNDERLYINGS = [
  { u: "BGI", currency: "BRL" },
  { u: "CCM", currency: "BRL" },
  { u: "ICF", currency: "USD" },
  { u: "SJC", currency: "USD" },
];

const MIN_GAP_MS = 3200;   // ~18/min, sob o teto de 20/min dos endpoints de opcoes
const BATCH = 800;
// Estado em disco ESTAVEL (sobrevive a reboot; NAO em %TEMP%, que o Disk Cleanup/
// Storage Sense pode limpar). Le TAMBEM os arquivos antigos de %TEMP% como fallback
// (uniao), para nao perder o progresso de uma execucao que gravou la antes.
const STATE_DIR = path.join(os.homedir(), ".aeternum", "opcoes-state");
fs.mkdirSync(STATE_DIR, { recursive: true });
const WORKLIST_CACHE = path.join(STATE_DIR, "worklist.json");
const PROGRESS_FILE = path.join(STATE_DIR, "progress.jsonl"); // 1 symbol por linha (done)
const LOG_FILE = path.join(STATE_DIR, "backfill.log");
const TMP = os.tmpdir();
const TMP_WORKLIST = path.join(TMP, "opcoes-backfill-worklist.json");
const TMP_PROGRESS = path.join(TMP, "opcoes-backfill-progress.jsonl");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function log(msg: string) { const line = `[${new Date().toISOString()}] ${msg}`; console.log(line); try { fs.appendFileSync(LOG_FILE, line + "\n"); } catch {} }

let lastCall = 0;
/** GET brapi com throttle 20/min + retry (429 Retry-After, 503 backoff, 403 fora do plano). */
async function brapiGet(pathQ: string, tries = 6): Promise<{ status: number; body: any }> {
  for (let i = 0; i < tries; i++) {
    const gap = MIN_GAP_MS - (Date.now() - lastCall);
    if (gap > 0) await sleep(gap);
    lastCall = Date.now();
    let res: Response;
    try { res = await fetch(`${API}${pathQ}`, { headers: brapiHeaders, signal: AbortSignal.timeout(60_000) }); }
    catch (e: any) { if (i === tries - 1) return { status: 0, body: { error: e?.message } }; await sleep(2000); continue; }
    if (res.status === 429) { const ra = Number(res.headers.get("retry-after")) || 60; log(`  429 rate limit -> aguarda ${ra}s`); await sleep((ra + 1) * 1000); continue; }
    if (res.status === 403) { return { status: 403, body: { error: "403 fora do plano" } }; } // NAO e token invalido
    if (res.status >= 500) { await sleep(3000 * (i + 1)); continue; } // 503 transitorio da brapi
    let body: any = null; try { body = await res.json(); } catch {}
    return { status: res.status, body };
  }
  return { status: 0, body: { error: "esgotou retries" } };
}

type Work = { underlying: string; currency: string; symbol: string; strike: number; expirationDate: string; expirationRank: number; optionType: string; contractMultiplier: number | null; moneyness: number };

/** DESCOBERTA: /expirations + /analytics por underlying x vencimento -> worklist. */
async function discover(): Promise<Work[]> {
  const wlSrc = fs.existsSync(WORKLIST_CACHE) ? WORKLIST_CACHE : (fs.existsSync(TMP_WORKLIST) ? TMP_WORKLIST : null);
  if (wlSrc) {
    const cached = JSON.parse(fs.readFileSync(wlSrc, "utf8"));
    if (wlSrc !== WORKLIST_CACHE) fs.writeFileSync(WORKLIST_CACHE, JSON.stringify(cached)); // migra p/ estavel
    log(`worklist em cache (${wlSrc === WORKLIST_CACHE ? "estavel" : "tmp->migrado"}): ${cached.length} simbolos`);
    return cached;
  }
  const work: Work[] = [];
  for (const { u, currency } of UNDERLYINGS) {
    const ex = await brapiGet(`/futures/options/expirations?underlying=${u}`);
    const exps: string[] = ex.body?.expirations ?? [];
    log(`${u}: ${exps.length} vencimentos`);
    for (let rank = 0; rank < exps.length; rank++) {
      const exp = exps[rank];
      const ch = await brapiGet(`/futures/options/analytics?underlying=${u}&expirationDate=${exp}`);
      const chain: any[] = ch.body?.analytics ?? [];
      const spot = chain[0]?.underlyingPrice ?? null;
      for (const o of chain) {
        if (!o?.symbol || o.strike == null) continue;
        work.push({
          underlying: u, currency, symbol: o.symbol, strike: o.strike, expirationDate: o.expirationDate ?? exp,
          expirationRank: rank, optionType: o.optionType, contractMultiplier: o.contractMultiplier ?? null,
          moneyness: spot != null ? Math.abs(o.strike - spot) : 1e12,
        });
      }
      log(`  ${u} ${exp} (rank ${rank}): ${chain.length} opcoes (spot=${spot})`);
    }
  }
  // PRIORIDADE: front primeiro (expirationRank), depois ATM->asas (moneyness).
  work.sort((a, b) => a.expirationRank - b.expirationRank || a.moneyness - b.moneyness);
  fs.writeFileSync(WORKLIST_CACHE, JSON.stringify(work));
  log(`worklist: ${work.length} simbolos (ordenados por prioridade)`);
  return work;
}

function loadDone(): Set<string> {
  const done = new Set<string>();
  for (const f of [PROGRESS_FILE, TMP_PROGRESS]) { // uniao: estavel + %TEMP% (fallback do run anterior)
    if (fs.existsSync(f)) for (const l of fs.readFileSync(f, "utf8").split(/\r?\n/)) { const s = l.trim(); if (s) done.add(s); }
  }
  return done;
}

async function flush(rows: any[]): Promise<void> {
  if (!rows.length) return;
  const { error } = await db.rpc("upsert_opcoes_futuros", { p_rows: rows });
  if (error) throw new Error(`rpc: ${error.message}`);
}

async function main() {
  const t0 = Date.now();
  const work = await discover();

  // DISCOVER_ONLY: valida a descoberta + reporta o universo + dry-run de 1 history,
  // SEM tocar no banco (para rodar antes do schema existir). Cacheia a worklist.
  if (process.env.DISCOVER_ONLY) {
    const byU: Record<string, number> = {};
    for (const w of work) byU[w.underlying] = (byU[w.underlying] ?? 0) + 1;
    log(`UNIVERSO por underlying: ${JSON.stringify(byU)} · total=${work.length} simbolos`);
    log(`ETA backfill: ~${(work.length * MIN_GAP_MS / 60000).toFixed(0)} min de throttle (${work.length} chamadas a ~18/min)`);
    const top = work[0];
    if (top) {
      const h = await brapiGet(`/futures/options/analytics/history?symbol=${encodeURIComponent(top.symbol)}`);
      const opt = h.body?.option ?? {}; const series: any[] = opt.analytics ?? [];
      log(`dry-run top ${top.symbol} (rank ${top.expirationRank}, |K-S|=${top.moneyness.toFixed(2)}): ${series.length} datas ${series[series.length - 1]?.date}..${series[0]?.date}`);
      if (series[0]) log(`  amostra row: date=${series[0].date} IV=${series[0].impliedVolatility} delta=${series[0].delta} optPrice=${series[0].optionPrice} underPrice=${series[0].underlyingPrice}`);
    }
    return;
  }

  const done = loadDone();
  const todo = work.filter((w) => !done.has(w.symbol));
  log(`INICIO backfill: ${work.length} simbolos, ${done.size} ja feitos, ${todo.length} a fazer (~${(todo.length * MIN_GAP_MS / 60000).toFixed(0)} min so de throttle)`);

  let batch: any[] = [];
  let attempted = 0, withData = 0, notFound = 0, errors = 0, rowsUp = 0;
  for (const w of todo) {
    attempted++;
    const h = await brapiGet(`/futures/options/analytics/history?symbol=${encodeURIComponent(w.symbol)}`);
    if (h.status === 404) { notFound++; }
    else if (h.status !== 200) { errors++; log(`  ERRO ${w.symbol}: status=${h.status} ${JSON.stringify(h.body).slice(0, 120)}`); }
    else {
      const opt = h.body?.option ?? {};
      const series: any[] = opt.analytics ?? [];
      if (series.length) withData++;
      for (const a of series) {
        batch.push({
          date: a.date, symbol: w.symbol, underlying: w.underlying, option_type: opt.optionType ?? w.optionType,
          strike: opt.strike ?? w.strike, expiration_date: opt.expirationDate ?? w.expirationDate,
          option_price: a.optionPrice ?? null, underlying_price: a.underlyingPrice ?? null,
          implied_volatility: a.impliedVolatility ?? null, delta: a.delta ?? null, gamma: a.gamma ?? null,
          theta: a.theta ?? null, vega: a.vega ?? null, rho: a.rho ?? null,
          time_to_expiration_years: a.timeToExpirationYears ?? null, risk_free_rate: a.riskFreeRate ?? null,
          model: a.model ?? null, price_source: a.priceSource ?? null, confidence: a.confidence ?? null,
          contract_multiplier: opt.contractMultiplier ?? w.contractMultiplier, currency: w.currency, quotation_type: "price",
          open_interest: null, open_interest_change: null, open_interest_date: null,
        });
      }
    }
    // marca feito (mesmo 404/vazio: nao re-tentar) + flush periodico
    fs.appendFileSync(PROGRESS_FILE, w.symbol + "\n");
    if (batch.length >= BATCH) { await flush(batch); rowsUp += batch.length; batch = []; }
    if (attempted % 50 === 0) {
      const el = (Date.now() - t0) / 60000, pct = (100 * attempted / todo.length).toFixed(1);
      log(`progresso ${attempted}/${todo.length} (${pct}%) · comData=${withData} 404=${notFound} err=${errors} linhas~${rowsUp + batch.length} · ${el.toFixed(1)}min`);
    }
  }
  if (batch.length) { await flush(batch); rowsUp += batch.length; }
  log(`FIM backfill: tentados=${attempted} comData=${withData} 404=${notFound} err=${errors} linhas=${rowsUp} · ${((Date.now() - t0) / 60000).toFixed(1)}min`);
  log(`(colhidos ${withData} de ${attempted} simbolos; ${notFound} sem history/404; ${errors} erros)`);
}
main().then(() => process.exit(0)).catch((e) => { log(`ERRO FATAL: ${e?.message ?? e}`); process.exit(1); });
