import type { Currency } from '../types/tokenization';

// Cotacao de referencia para o equivalente na moeda do destino.
//
// NOTA (15/07/2026): o fallback fixo (USD 4,89 / EUR 5,31 / CNY 0,68) foi
// REMOVIDO. Ele exibia um cambio inventado ao usuario, sem aviso, como se fosse
// real. Regra: nunca inventar taxa. Sem cotacao real, esta funcao retorna null
// e o consumidor mostra "cotacao indisponivel".
//
// Alem disso, o nome de funcao 'CotacaoMoedaPeriodoFechamento' NAO e reconhecido
// pela API do BCB (HTTP 400): a busca live sempre falhava. A correcao limpa
// (usar a PTAX do cache Supabase para USD e EUR via worker; a PTAX do BCB NAO
// cobre CNY) esta pendente de decisao. Ate la, EUR/CNY caem em null aqui. Para
// USD, o ExportCalculator ja le a PTAX do cache e nem chama esta funcao.

const BCB_CODES: Record<Currency, string> = {
  USD: '220',
  EUR: '978',
  CNY: '720',
};

const FETCH_TIMEOUT_MS = 5000;
const LOOKBACK_WINDOW_DAYS = 7;

function formatDateBR(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

/** "2026-07-15 13:05:35.123" -> "15/07" (data da cotacao, para o rotulo). */
function toDayMonth(dataHoraCotacao: string): string {
  const [yyyyMmDd] = String(dataHoraCotacao).split(' ');
  const [, mm, dd] = (yyyyMmDd ?? '').split('-');
  return dd && mm ? `${dd}/${mm}` : '';
}

interface PtaxResponse {
  value?: Array<{ cotacaoVenda?: number; dataHoraCotacao?: string }>;
}

export interface ExchangeRateResult {
  /** BRL por unidade da moeda (PTAX venda). */
  rate: number;
  /** "DD/MM" da cotacao usada. */
  date: string;
}

/** Retorna a cotacao de referencia ou null (sem inventar taxa). */
export async function getExchangeRate(currency: Currency): Promise<ExchangeRateResult | null> {
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
    if (!response.ok) return null;

    const data = (await response.json()) as PtaxResponse;
    const row = data?.value?.[0];
    const rate = row?.cotacaoVenda;
    if (typeof rate !== 'number' || !isFinite(rate) || rate <= 0) return null;

    return { rate, date: row?.dataHoraCotacao ? toDayMonth(row.dataHoraCotacao) : '' };
  } catch {
    return null;
  }
}
