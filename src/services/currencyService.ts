import type { Currency, ExchangeRateSource } from '../types/tokenization';

const BCB_CODES: Record<Currency, string> = {
  USD: '220',
  EUR: '978',
  CNY: '720',
};

const FALLBACK_RATES: Record<Currency, number> = {
  USD: 4.89,
  EUR: 5.31,
  CNY: 0.68,
};

interface CacheEntry {
  rate: number;
  timestamp: number;
  source: ExchangeRateSource;
}

const cache = new Map<Currency, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora
const FETCH_TIMEOUT_MS = 5000;
const LOOKBACK_WINDOW_DAYS = 7;

function formatDateBR(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

interface PtaxResponse {
  value?: Array<{ cotacaoVenda?: number }>;
}

export interface ExchangeRateResult {
  rate: number;
  source: ExchangeRateSource;
}

export async function getExchangeRate(currency: Currency): Promise<ExchangeRateResult> {
  const cached = cache.get(currency);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { rate: cached.rate, source: cached.source };
  }

  try {
    const today = new Date();
    const lookbackStart = new Date(today.getTime() - LOOKBACK_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const dateStart = formatDateBR(lookbackStart);
    const dateEnd = formatDateBR(today);

    const url =
      `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/` +
      `CotacaoMoedaPeriodoFechamento(codigoMoeda=@codigoMoeda,dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)` +
      `?@codigoMoeda='${BCB_CODES[currency]}'` +
      `&@dataInicial='${dateStart}'` +
      `&@dataFinalCotacao='${dateEnd}'` +
      `&$format=json&$top=1&$orderby=dataHoraCotacao%20desc`;

    const response = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error('PTAX response not ok');
    }

    const data = (await response.json()) as PtaxResponse;
    const rate = data?.value?.[0]?.cotacaoVenda;

    if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) {
      throw new Error('Invalid PTAX rate');
    }

    cache.set(currency, { rate, timestamp: Date.now(), source: 'live' });
    return { rate, source: 'live' };
  } catch {
    const fallbackRate = FALLBACK_RATES[currency];
    cache.set(currency, { rate: fallbackRate, timestamp: Date.now(), source: 'cache' });
    return { rate: fallbackRate, source: 'cache' };
  }
}
