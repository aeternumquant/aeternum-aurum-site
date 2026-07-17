import type { Config } from "@netlify/functions";
import { PostgrestClient } from "@supabase/postgrest-js";
import * as XLSX from "xlsx";

/**
 * Worker de dados de mercado (Etapa 2).
 *
 * Roda 2x/dia (ver netlify.toml + config no fim deste arquivo). Busca dados nas
 * fontes publicas/pagas e grava no cache do Supabase (tabelas sources, series,
 * observations, ja criadas na Etapa 1).
 *
 * SEGURANCA: usa SUPABASE_SERVICE_ROLE_KEY, que ignora RLS por design. Essa
 * chave e a EIA_API_KEY e o BRAPI_TOKEN so existem no escopo Functions do
 * Netlify. NUNCA prefixar com VITE_. NUNCA importar este arquivo em src/.
 *
 * ROBUSTEZ: cada fonte roda em try/catch independente; uma fonte que cai nao
 * derruba as outras. Timeout de 10s por requisicao. Upsert idempotente (rodar
 * duas vezes no mesmo dia nao duplica). Retorna 200 com resumo mesmo se uma
 * fonte falhar; 500 so se TODAS falharem.
 */

// Cliente REST puro (postgrest-js), NAO o supabase-js. O supabase-js instancia
// o Realtime (WebSocket) no construtor do createClient, e o runtime de Functions
// do Netlify (Node 20 por padrao) nao tem WebSocket nativo, entao crashava antes
// de qualquer fetch. Este worker so faz REST (from/select/upsert), entao o
// postgrest-js resolve e nunca carrega WebSocket. O front (src/lib/supabase.ts)
// segue no supabase-js: roda no browser, que tem WebSocket.
//
// A service_role vai como apikey E como Bearer (ignora RLS por design).
const db = new PostgrestClient(`${process.env.VITE_SUPABASE_URL!}/rest/v1`, {
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY!}`,
  },
});

// ---------------------------------------------------------------------------
// Utilitarios
// ---------------------------------------------------------------------------

function log(msg: string): void {
  console.log(`[sync-market-data] ${msg}`);
}

/** Host + path sem query string, para nao vazar api_key nos logs de erro. */
function safeHost(url: string): string {
  try {
    const u = new URL(url);
    return u.host + u.pathname;
  } catch {
    return "url";
  }
}

/** fetch com timeout via AbortController e checagem de status + parse JSON. */
async function fetchJson(
  url: string,
  opts: { headers?: Record<string, string>; timeoutMs?: number } = {},
): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 10_000);
  try {
    const res = await fetch(url, {
      headers: opts.headers,
      signal: controller.signal,
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`HTTP ${res.status} em ${safeHost(url)}: ${body.slice(0, 200)}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Helpers de banco
// ---------------------------------------------------------------------------

type Frequency = "continua" | "diaria" | "mensal";

type SeriesOpts = {
  sourceSlug: string;
  code: string;
  labelPt: string;
  labelEn: string;
  unit: string | null;
  category: string;
  visibility: string;
  frequency: Frequency;
  /** Onde o preco se FORMA (B3, BCB). Distinto da source, que ENTREGA. null se nao se aplica. */
  market: string | null;
};

/**
 * Garante que a serie existe e devolve o id. Busca source_id pelo slug, faz
 * upsert em series com onConflict 'source_id,code' e retorna o id.
 */
async function ensureSeries(opts: SeriesOpts): Promise<number> {
  const { data: source, error: sourceErr } = await db
    .from("sources")
    .select("id")
    .eq("slug", opts.sourceSlug)
    .single();

  if (sourceErr || !source) {
    throw new Error(
      `source '${opts.sourceSlug}' nao encontrada: ${sourceErr?.message ?? "sem linha"}`,
    );
  }

  const { data: series, error: seriesErr } = await db
    .from("series")
    .upsert(
      {
        source_id: source.id,
        code: opts.code,
        label_pt: opts.labelPt,
        label_en: opts.labelEn,
        unit: opts.unit,
        category: opts.category,
        visibility: opts.visibility,
        frequency: opts.frequency,
        market: opts.market,
        active: true,
      },
      { onConflict: "source_id,code" },
    )
    .select("id")
    .single();

  if (seriesErr || !series) {
    throw new Error(`falha ao garantir serie '${opts.code}': ${seriesErr?.message ?? "sem linha"}`);
  }

  return series.id;
}

/** contract: simbolo do contrato de futuro (ex.: SJCQ26). null para nao-futuros. */
type Point = { ts: string; value: number; contract?: string | null };

/**
 * Grava observacoes com upsert idempotente por chave (series_id, ts).
 * Em conflito faz DO UPDATE: atualiza value, ingested_at e contract (nao ignora).
 * Motivo: fontes revisam valores (a EIA revisa; o BCB corrige a PTAX), entao
 * re-rodar precisa consertar dado errado, nao mante-lo. A chave nao muda, entao
 * nao duplica. Ignora pontos com value null/NaN/infinito ou sem ts.
 */
async function saveObservations(seriesId: number, points: Point[]): Promise<number> {
  const ingestedAt = new Date().toISOString();
  const rows = points
    .filter((p) => p && p.ts && p.value != null && Number.isFinite(p.value))
    .map((p) => ({
      series_id: seriesId,
      ts: p.ts,
      value: p.value,
      ingested_at: ingestedAt,
      contract: p.contract ?? null,
    }));

  if (rows.length === 0) return 0;

  // ignoreDuplicates: false => ON CONFLICT (series_id, ts) DO UPDATE. Como
  // passamos ingested_at no payload, ele tambem e atualizado no re-run.
  const { error } = await db
    .from("observations")
    .upsert(rows, { onConflict: "series_id,ts", ignoreDuplicates: false });

  if (error) {
    throw new Error(`falha ao gravar observacoes da serie ${seriesId}: ${error.message}`);
  }

  return rows.length;
}

// ---------------------------------------------------------------------------
// Fonte: BCB (dolar PTAX de fechamento) - sem chave
// ---------------------------------------------------------------------------

/** Converte "2026-07-15 13:10:15.650309" (horario de Brasilia, UTC-3) em ISO. */
function bcbTimestampToIso(raw: string): string {
  const trimmed = raw.trim().replace(" ", "T").replace(/(\.\d{3})\d+$/, "$1");
  return new Date(`${trimmed}-03:00`).toISOString();
}

/** Formata Date como MM-DD-YYYY (formato americano exigido pela OData do BCB). */
function bcbDate(d: Date): string {
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${mm}-${dd}-${d.getUTCFullYear()}`;
}

async function syncBcb(): Promise<Record<string, unknown>> {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  const url =
    "https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/" +
    "CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)" +
    `?@dataInicial='${bcbDate(start)}'&@dataFinalCotacao='${bcbDate(end)}'` +
    "&$top=100&$format=json";

  const json = await fetchJson(url);
  const rows: any[] = Array.isArray(json?.value) ? json.value : [];

  // Este endpoint ja devolve o boletim de fechamento e nao traz tipoBoletim.
  // O filtro fica como guarda caso um dia venha com o campo.
  const closings = rows.filter((r) => !r.tipoBoletim || r.tipoBoletim === "Fechamento");
  const points: Point[] = closings.map((r) => ({
    ts: bcbTimestampToIso(String(r.dataHoraCotacao)),
    value: Number(r.cotacaoVenda),
  }));

  const seriesId = await ensureSeries({
    sourceSlug: "bcb",
    code: "PTAX_USD_VENDA",
    labelPt: "Dólar PTAX (venda)",
    labelEn: "USD/BRL PTAX (ask)",
    unit: "BRL/USD",
    category: "cambio",
    visibility: "public",
    frequency: "diaria",
    market: "BCB",
  });

  const saved = await saveObservations(seriesId, points);
  return { fetched: points.length, saved };
}

// ---------------------------------------------------------------------------
// Fonte: EIA (petroleo WTI e Brent, gas natural Henry Hub) - com chave
// ---------------------------------------------------------------------------
//
// route: cada serie vive numa rota da API v2. WTI/Brent em petroleum/pri/spt; o
// gas natural NAO esta em petroleum (retorna vazio ali), esta em
// natural-gas/pri/fut. Descoberto ao vivo na etapa 2d.

const EIA_SERIES = [
  {
    eiaId: "RWTC",
    code: "WTI_SPOT",
    labelPt: "Petróleo WTI (spot Cushing)",
    labelEn: "Crude Oil WTI (Cushing spot)",
    route: "petroleum/pri/spt",
    unit: "USD/bbl",
  },
  {
    eiaId: "RBRTE",
    code: "BRENT_SPOT",
    labelPt: "Petróleo Brent (spot Europa)",
    labelEn: "Crude Oil Brent (Europe spot)",
    route: "petroleum/pri/spt",
    unit: "USD/bbl",
  },
  {
    eiaId: "RNGWHHD",
    code: "GAS_NATURAL_HH",
    labelPt: "Gás natural (spot Henry Hub)",
    labelEn: "Natural Gas (Henry Hub spot)",
    route: "natural-gas/pri/fut",
    unit: "USD/MMBtu",
  },
];

async function syncEia(): Promise<Record<string, unknown>> {
  const key = process.env.EIA_API_KEY;
  if (!key) throw new Error("EIA_API_KEY ausente no ambiente");

  let fetched = 0;
  let saved = 0;

  for (const s of EIA_SERIES) {
    const url =
      `https://api.eia.gov/v2/${s.route}/data/` +
      `?api_key=${encodeURIComponent(key)}` +
      "&frequency=daily&data[0]=value" +
      `&facets[series][]=${s.eiaId}` +
      "&sort[0][column]=period&sort[0][direction]=desc&length=10";

    const json = await fetchJson(url);
    const data: any[] = json?.response?.data ?? [];

    // period vem como 'YYYY-MM-DD'; viramos meia-noite UTC. value pode vir como
    // string na v2, por isso o Number(). NaN e descartado no saveObservations.
    const points: Point[] = data.map((d) => ({
      ts: `${d.period}T00:00:00Z`,
      value: Number(d.value),
    }));
    fetched += points.length;

    const seriesId = await ensureSeries({
      sourceSlug: "eia",
      code: s.code,
      labelPt: s.labelPt,
      labelEn: s.labelEn,
      unit: s.unit,
      category: "energia",
      visibility: "public",
      frequency: "diaria",
      market: null,
    });

    saved += await saveObservations(seriesId, points);
  }

  return { fetched, saved };
}

// ---------------------------------------------------------------------------
// Fonte: brapi Pro (futuros agricolas B3) - com token
// ---------------------------------------------------------------------------
//
// Codigos confirmados na doc oficial (brapi.dev/docs/futuros): boi = BGI,
// cafe = ICF, milho = CCM, soja = SJC. O endpoint /term-structure devolve, num
// unico request por ativo, todos os vencimentos ja com o ultimo ajuste
// (settlement) e as specs (multiplicador, moeda, vencimento). Escolhemos o
// contrato de MENOR vencimento ainda ativo (front month). O front month ROLA ao
// longo do ano, por isso os rotulos deixam explicito "1o vencimento" e o codigo
// do contrato escolhido vai para o log (passo 3.5.d).
//
// A API nao expoe a denominacao por quantidade (saca, @, m3) como campo. Mas ela
// devolve tradingCurrency (USD/BRL) e contractMultiplier, e o multiplicador
// identifica a denominacao das specs da B3 (soja/milho = 450 => saca, cafe =
// 100 => saca, boi = 330 => @, etanol = 30 => m3). Entao a unit e INFERIDA de
// moeda + multiplicador e a inferencia e verificavel: se o multiplicador vier
// diferente do esperado, o worker loga um aviso em vez de gravar unidade errada.
//
// Etanol (ETH, "Etanol Hidratado"): descoberto na 2d. O ET1 e "Rolagem de
// Etanol Hidratado" (spread), nao o contrato; usar ETH. category 'energia'.

const BRAPI_FUTURES = [
  {
    asset: "SJC",
    code: "SOJA_FUT",
    labelPt: "Soja (futuro B3, 1º vencimento)",
    labelEn: "Soybean (B3 futures, front month)",
    category: "agro",
    expectedMultiplier: 450,
    expectedCurrency: "USD",
    denomination: "saca",
  },
  {
    asset: "CCM",
    code: "MILHO_FUT",
    labelPt: "Milho (futuro B3, 1º vencimento)",
    labelEn: "Corn (B3 futures, front month)",
    category: "agro",
    expectedMultiplier: 450,
    expectedCurrency: "BRL",
    denomination: "saca",
  },
  {
    asset: "BGI",
    code: "BOI_FUT",
    labelPt: "Boi gordo (futuro B3, 1º vencimento)",
    labelEn: "Live cattle (B3 futures, front month)",
    category: "agro",
    expectedMultiplier: 330,
    expectedCurrency: "BRL",
    denomination: "@",
  },
  {
    asset: "ICF",
    code: "CAFE_FUT",
    labelPt: "Café arábica (futuro B3, 1º vencimento)",
    labelEn: "Arabica coffee (B3 futures, front month)",
    category: "agro",
    expectedMultiplier: 100,
    expectedCurrency: "USD",
    denomination: "saca",
  },
  {
    asset: "ETH",
    code: "ETANOL_FUT",
    labelPt: "Etanol (futuro B3, 1º vencimento)",
    labelEn: "Ethanol (B3 futures, front month)",
    category: "energia",
    expectedMultiplier: 30,
    expectedCurrency: "BRL",
    denomination: "m³",
  },
];

async function syncBrapi(): Promise<Record<string, unknown>> {
  const token = process.env.BRAPI_TOKEN;
  if (!token) throw new Error("BRAPI_TOKEN ausente no ambiente");
  const headers = { Authorization: `Bearer ${token}` };
  const todayUtc = new Date().toISOString().slice(0, 10);

  let fetched = 0;
  let saved = 0;
  const chosen: Record<string, unknown> = {};
  const errors: string[] = [];

  for (const a of BRAPI_FUTURES) {
    try {
      const url = `https://brapi.dev/api/v2/futures/term-structure?asset=${a.asset}`;
      const json = await fetchJson(url, { headers });
      const contracts: any[] = Array.isArray(json?.contracts) ? json.contracts : [];

      // Front month = menor vencimento ainda ativo (>= hoje). Fallback: o
      // primeiro da lista, que a API ja devolve ordenado por vencimento.
      const active = contracts
        .filter((c) => c?.expirationDate && c.expirationDate >= todayUtc)
        .sort((x, y) => String(x.expirationDate).localeCompare(String(y.expirationDate)));
      const front = active[0] ?? contracts[0];

      if (!front) {
        errors.push(`${a.asset}: sem contratos na resposta`);
        continue;
      }

      // Preco oficial do dia e o settlement (preco de ajuste), sempre
      // preenchido. close (ultimo negocio) pode vir null em contrato ilíquido.
      const price = front.settlement ?? front.close;
      if (price == null || !Number.isFinite(Number(price))) {
        errors.push(`${a.asset}/${front.symbol}: sem settlement nem close`);
        continue;
      }

      // date vem em Unix (segundos) com a data do pregao; viramos ISO.
      const ts = front.date
        ? new Date(front.date * 1000).toISOString()
        : `${todayUtc}T00:00:00Z`;

      // Unidade inferida da moeda (API) + denominacao (multiplicador das specs
      // B3). Se o multiplicador vier diferente do esperado, avisa: a inferencia
      // deixa de ser confiavel e nao queremos gravar unidade errada calada.
      const multiplier = front.contractMultiplier;
      if (multiplier != null && multiplier !== a.expectedMultiplier) {
        log(
          `[brapi] AVISO ${a.code}/${front.symbol}: multiplicador ${multiplier} ` +
            `difere do esperado ${a.expectedMultiplier}; unidade inferida (${a.denomination}) pode estar errada.`,
        );
      }
      const currency = front.tradingCurrency ?? a.expectedCurrency;
      const unit = `${currency}/${a.denomination}`;

      const seriesId = await ensureSeries({
        sourceSlug: "brapi",
        code: a.code,
        labelPt: a.labelPt,
        labelEn: a.labelEn,
        unit,
        category: a.category,
        visibility: "public",
        frequency: "diaria",
        market: "B3",
      });

      const n = await saveObservations(seriesId, [
        { ts, value: Number(price), contract: front.symbol },
      ]);
      fetched += 1;
      saved += n;

      chosen[a.code] = {
        asset: a.asset,
        contract: front.symbol,
        expirationDate: front.expirationDate,
        settlement: front.settlement,
        close: front.close,
        contractMultiplier: front.contractMultiplier,
        tradingCurrency: front.tradingCurrency,
        unit,
      };
      log(
        `[brapi] ${a.code}: contrato ${front.symbol} (venc ${front.expirationDate}), ` +
          `settlement=${price}, mult=${front.contractMultiplier}, moeda=${front.tradingCurrency}, unit=${unit}`,
      );
    } catch (e: any) {
      errors.push(`${a.asset}: ${e?.message ?? String(e)}`);
    }
  }

  if (fetched === 0) {
    throw new Error(`nenhuma serie de futuro gravada. Erros: ${errors.join(" | ")}`);
  }

  const out: Record<string, unknown> = { fetched, saved, chosen };
  if (errors.length) out.errors = errors;
  return out;
}

// ---------------------------------------------------------------------------
// Fonte: DefiLlama (TVL de RWA tokenizado) - sem chave
// ---------------------------------------------------------------------------

async function syncDefillama(): Promise<Record<string, unknown>> {
  // Payload grande (varios MB). NUNCA logar a resposta inteira, so o agregado.
  const json = await fetchJson("https://api.llama.fi/protocols", { timeoutMs: 10_000 });
  const arr: any[] = Array.isArray(json) ? json : [];

  let total = 0;
  let count = 0;
  for (const p of arr) {
    if (p && p.category === "RWA" && typeof p.tvl === "number" && Number.isFinite(p.tvl) && p.tvl > 0) {
      total += p.tvl;
      count += 1;
    }
  }

  // Resposta e um snapshot, nao serie historica: o ts e agora.
  const ts = new Date().toISOString();

  const seriesId = await ensureSeries({
    sourceSlug: "defillama",
    code: "RWA_TVL_TOTAL",
    labelPt: "RWA tokenizado (TVL total, DefiLlama)",
    labelEn: "Tokenized RWA (total TVL, DefiLlama)",
    unit: "USD",
    category: "rwa",
    visibility: "internal",
    frequency: "continua",
    market: null,
  });

  const saved = await saveObservations(seriesId, [{ ts, value: total }]);
  return { fetched: 1, saved, rwaProtocols: count, tvlUsd: Math.round(total) };
}

// ---------------------------------------------------------------------------
// Fonte: brapi crypto (ouro via PAXG) - com token
// ---------------------------------------------------------------------------
//
// PAXG e um token 1:1 com 1 onca troy de ouro fisico. A brapi agrega o preco de
// exchanges (declara Binance, OKX, Hyperliquid) e bate 0,05% com a DefiLlama
// (on-chain), o que valida o numero. Gravamos SEMPRE em USD/oz: o currency=BRL
// da brapi usa cambio proprio (~5,136 vs PTAX 5,0975), entao o front converte
// com a NOSSA PTAX. source 'brapi_crypto' (atribuicao distinta da B3). O
// historico (366 pontos) vem no backfill; o worker so grava o ponto do dia.

async function syncBrapiGold(): Promise<Record<string, unknown>> {
  const token = process.env.BRAPI_TOKEN;
  if (!token) throw new Error("BRAPI_TOKEN ausente no ambiente");
  const headers = { Authorization: `Bearer ${token}` };

  const json = await fetchJson("https://brapi.dev/api/v2/crypto?coin=PAXG&currency=USD", {
    headers,
  });
  const coin = Array.isArray(json?.coins) ? json.coins[0] : null;
  if (!coin) throw new Error("brapi crypto: coin PAXG ausente na resposta");

  const value = Number(coin.regularMarketPrice);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`brapi crypto PAXG: preco invalido (${coin.regularMarketPrice})`);
  }

  // Serie diaria: um ponto por dia. ts = hoje a meia-noite UTC, para que as duas
  // execucoes diarias dedupem no mesmo dia (mesma chave series_id,ts).
  const ts = `${new Date().toISOString().slice(0, 10)}T00:00:00Z`;

  const seriesId = await ensureSeries({
    sourceSlug: "brapi_crypto",
    code: "OURO_PAXG",
    labelPt: "Ouro (via PAXG, token lastreado em ouro físico)",
    labelEn: "Gold (via PAXG, physical-backed token)",
    unit: "USD/oz",
    category: "metal",
    visibility: "public",
    frequency: "diaria",
    market: null,
  });

  const saved = await saveObservations(seriesId, [{ ts, value }]);
  log(`[brapi_crypto] OURO_PAXG: USD/oz ${value} em ${ts.slice(0, 10)}`);
  return { fetched: 1, saved, priceUsdOz: value };
}

// ---------------------------------------------------------------------------
// Fonte: World Bank Commodity Markets "Pink Sheet" (mensal, CC BY 4.0)
// ---------------------------------------------------------------------------
//
// Raspa o link "Monthly prices" da pagina do WB (HTML de servidor) e baixa o
// CMO-Historical-Data-Monthly.xlsx (o hash da URL muda por ano, mas a pagina
// serve o link atual). E o WB servindo o dado dele sob CC BY 4.0.
//
// A aba "Monthly Prices" e uma tabela LARGA: linha 4 = nomes das commodities
// (nas colunas), linha 5 = unidades, dados da linha 6 (col 0 = data YYYYMmm).
// Transpomos: cada coluna vira uma serie. "..." = ausente, NAO grava (nao e 0).
// Reprocessamos os ultimos meses (o WB revisa retroativamente; upsert DO UPDATE).
//
// Nao pegamos Brent nem Natural gas US (a EIA ja da, diario). As duplicatas que
// entram sao referencia DIFERENTE (LBMA vs token, US Gulf global vs B3). Rotulo
// carrega a verdade: nunca "Boi Gordo" para Beef, nunca "Suco" para Oranges.
// frequency 'mensal' (2f: limite 45 dias, changeLabel "vs. mes anterior").

type WbSeries = {
  name: string; // nome EXATO na linha 4 do XLSX (o "**" e espaco final sao tolerados)
  code: string;
  labelPt: string;
  labelEn: string;
  unit: string;
  category: string;
  market: string | null;
};

const WORLDBANK_SERIES: WbSeries[] = [
  // Metais
  { name: "Gold", code: "OURO_LBMA", labelPt: "Ouro (spot Londres/LBMA)", labelEn: "Gold (London spot/LBMA)", unit: "USD/oz", category: "metal", market: "LBMA" },
  { name: "Silver", code: "PRATA_LBMA", labelPt: "Prata (spot Londres/LBMA)", labelEn: "Silver (London spot/LBMA)", unit: "USD/oz", category: "metal", market: "LBMA" },
  { name: "Copper", code: "COBRE_WB", labelPt: "Cobre (LME)", labelEn: "Copper (LME)", unit: "USD/t", category: "metal", market: "LME" },
  { name: "Aluminum", code: "ALUMINIO_WB", labelPt: "Alumínio (LME)", labelEn: "Aluminum (LME)", unit: "USD/t", category: "metal", market: "LME" },
  { name: "Iron ore, cfr spot", code: "MINERIO_WB", labelPt: "Minério de ferro (spot cfr China, 62% Fe)", labelEn: "Iron ore (spot cfr China, 62% Fe)", unit: "USD/t", category: "metal", market: null },
  // Agro (category 'agro'; category hoje so serve para o mapa agrupar)
  { name: "Coffee, Arabica", code: "CAFE_ICO", labelPt: "Café arábica (ICO, referência global)", labelEn: "Coffee, arabica (ICO)", unit: "USD/kg", category: "agro", market: "ICO" },
  { name: "Cocoa", code: "CACAU_WB", labelPt: "Cacau (ICCO)", labelEn: "Cocoa (ICCO)", unit: "USD/kg", category: "agro", market: "ICCO" },
  { name: "Sugar, world", code: "ACUCAR_WB", labelPt: "Açúcar (bruto, ISA)", labelEn: "Sugar, world (ISA)", unit: "USD/kg", category: "agro", market: "ISA" },
  { name: "Cotton, A Index", code: "ALGODAO_WB", labelPt: "Algodão (Cotlook A Index)", labelEn: "Cotton (Cotlook A Index)", unit: "USD/kg", category: "agro", market: "Cotlook" },
  { name: "Soybeans", code: "SOJA_WB", labelPt: "Soja (FOB US Gulf, referência global)", labelEn: "Soybeans (FOB US Gulf)", unit: "USD/t", category: "agro", market: null },
  { name: "Maize", code: "MILHO_WB", labelPt: "Milho (FOB US Gulf, referência global)", labelEn: "Maize (FOB US Gulf)", unit: "USD/t", category: "agro", market: null },
  { name: "Wheat, US HRW", code: "TRIGO_WB", labelPt: "Trigo (US HRW, FOB Golfo)", labelEn: "Wheat, US HRW (Gulf)", unit: "USD/t", category: "agro", market: null },
  { name: "Rice, Thai 5%", code: "ARROZ_WB", labelPt: "Arroz (Tailândia 5%, FOB Bangkok)", labelEn: "Rice, Thai 5% (FOB Bangkok)", unit: "USD/t", category: "agro", market: null },
  { name: "Groundnuts", code: "AMENDOIM_WB", labelPt: "Amendoim (CFR Europa)", labelEn: "Groundnuts (CFR Europe)", unit: "USD/t", category: "agro", market: null },
  { name: "Chicken", code: "FRANGO_WB", labelPt: "Frango (Brasil, atacado São Paulo)", labelEn: "Chicken (Brazil, São Paulo wholesale)", unit: "USD/kg", category: "agro", market: null },
  { name: "Beef", code: "CARNE_BOVINA_WB", labelPt: "Carne bovina (Nova Zelândia, 90% lean, cif EUA)", labelEn: "Beef (New Zealand, 90% lean, cif US)", unit: "USD/kg", category: "agro", market: null },
  { name: "Orange", code: "LARANJA_WB", labelPt: "Laranja (Mediterrâneo, navel, importação UE)", labelEn: "Oranges (Mediterranean, navel, EU import)", unit: "USD/kg", category: "agro", market: null },
];

const WB_REPROCESS_MONTHS = 6; // reprocessa os ultimos meses (revisoes retroativas)

/** "2026M06" -> "2026-06-01T00:00:00Z" (primeiro dia do mes, UTC). null se invalido. */
function wbMonthToIso(raw: unknown): string | null {
  const m = /^(\d{4})M(\d{2})$/.exec(String(raw).trim());
  return m ? `${m[1]}-${m[2]}-01T00:00:00Z` : null;
}

/** Normaliza o nome do cabecalho: tira "**"/"*" e espaco finais, colapsa espacos. */
function normWbName(s: unknown): string {
  return String(s).replace(/\s*\*+\s*$/, "").trim().replace(/\s+/g, " ");
}

async function syncWorldBank(): Promise<Record<string, unknown>> {
  const ua = { "User-Agent": "Mozilla/5.0 (AeternumWorker)" };

  // 1. Raspar o link do XLSX mensal na pagina do WB.
  const pageRes = await fetch("https://www.worldbank.org/en/research/commodity-markets", {
    headers: ua,
    signal: AbortSignal.timeout(20_000),
  });
  if (!pageRes.ok) throw new Error(`pagina WB HTTP ${pageRes.status}`);
  const html = await pageRes.text();
  const linkMatch = /href="([^"]*CMO-Historical-Data-Monthly\.xlsx)"/i.exec(html);
  if (!linkMatch) throw new Error("link 'Monthly prices' (CMO-Historical-Data-Monthly.xlsx) nao encontrado na pagina");
  const xlsxUrl = linkMatch[1];

  // 2. Baixar o XLSX (575 KB).
  const fileRes = await fetch(xlsxUrl, { headers: ua, signal: AbortSignal.timeout(25_000) });
  if (!fileRes.ok) throw new Error(`XLSX HTTP ${fileRes.status} em ${safeHost(xlsxUrl)}`);
  const buf = Buffer.from(await fileRes.arrayBuffer());

  // 3. Parsear a aba "Monthly Prices" como grade.
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets["Monthly Prices"];
  if (!ws) throw new Error("aba 'Monthly Prices' ausente no XLSX");
  const grid = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, raw: true, blankrows: true });

  // Linha 4 (idx 4) = nomes nas colunas. Mapeia nome normalizado -> indice.
  const headerNames: any[] = grid[4] ?? [];
  const colByName = new Map<string, number>();
  headerNames.forEach((n, i) => {
    if (i > 0 && n != null && String(n).trim() !== "") colByName.set(normWbName(n), i);
  });

  // Linhas de dados (col 0 no formato YYYYMmm), os ultimos WB_REPROCESS_MONTHS.
  const dataRows = grid.slice(6).filter((r) => r && /^\d{4}M\d{2}$/.test(String(r[0] ?? "")));
  const recent = dataRows.slice(-WB_REPROCESS_MONTHS);

  let seriesCount = 0;
  let saved = 0;
  const missing: string[] = [];

  for (const s of WORLDBANK_SERIES) {
    try {
      const col = colByName.get(normWbName(s.name));
      if (col == null) {
        missing.push(s.name);
        continue;
      }

      const points: Point[] = [];
      for (const row of recent) {
        const ts = wbMonthToIso(row[0]);
        const rawVal = row[col];
        // "..." (ausente) -> Number(...) = NaN -> descartado. Nao gravar zero.
        const value = typeof rawVal === "number" ? rawVal : Number(rawVal);
        if (ts && Number.isFinite(value)) points.push({ ts, value });
      }

      const seriesId = await ensureSeries({
        sourceSlug: "worldbank",
        code: s.code,
        labelPt: s.labelPt,
        labelEn: s.labelEn,
        unit: s.unit,
        category: s.category,
        visibility: "public",
        frequency: "mensal",
        market: s.market,
      });

      saved += await saveObservations(seriesId, points);
      seriesCount += 1;
    } catch (e: any) {
      missing.push(`${s.code}: ${e?.message ?? String(e)}`);
    }
  }

  if (seriesCount === 0) {
    throw new Error(`nenhuma serie WB gravada. Problemas: ${missing.join(" | ")}`);
  }

  const lastRow = recent[recent.length - 1];
  const out: Record<string, unknown> = {
    fetched: seriesCount,
    saved,
    ultimoMes: lastRow ? lastRow[0] : null,
  };
  if (missing.length) out.missing = missing;
  return out;
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

const SOURCES: Array<{ name: string; run: () => Promise<Record<string, unknown>> }> = [
  { name: "bcb", run: syncBcb },
  { name: "eia", run: syncEia },
  { name: "brapi", run: syncBrapi },
  { name: "brapi_crypto", run: syncBrapiGold },
  { name: "defillama", run: syncDefillama },
  { name: "worldbank", run: syncWorldBank },
];

export default async (_req: Request): Promise<Response> => {
  const startedAt = new Date().toISOString();
  log(`inicio ${startedAt}`);

  // Fontes rodam em paralelo e cada uma ja tem seu try/catch. allSettled garante
  // que uma rejeicao nao cancela as outras.
  const settled = await Promise.allSettled(SOURCES.map((s) => s.run()));

  const summary: Record<string, unknown> = {};
  let okCount = 0;

  settled.forEach((result, i) => {
    const name = SOURCES[i].name;
    if (result.status === "fulfilled") {
      okCount += 1;
      summary[name] = { ok: true, ...result.value };
      log(`[${name}] OK ${JSON.stringify(result.value)}`);
    } else {
      const message = result.reason?.message ?? String(result.reason);
      summary[name] = { ok: false, error: message };
      log(`[${name}] ERRO ${message}`);
    }
  });

  const allFailed = okCount === 0;
  const body = JSON.stringify(
    {
      startedAt,
      finishedAt: new Date().toISOString(),
      okCount,
      total: SOURCES.length,
      sources: summary,
    },
    null,
    2,
  );

  log(`fim: ${okCount}/${SOURCES.length} fontes OK`);
  return new Response(body, {
    status: allFailed ? 500 : 200,
    headers: { "content-type": "application/json" },
  });
};

export const config: Config = { schedule: "0 11,23 * * *" };
