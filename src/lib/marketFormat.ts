import type { MarketPoint } from "../hooks/useMarketData";

/**
 * Formatacao e conversao de dado de mercado, compartilhadas entre os
 * consumidores (CommodityTerminal e ExportCalculator). Uma fonte de verdade:
 * a logica de conversao PTAX e as travas de honestidade vivem so aqui.
 */

/** Code da serie de cambio no banco (PTAX venda). */
export const PTAX_CODE = "PTAX_USD_VENDA";

/** Decimais em virgula (pt-BR), 2 casas. */
const valueFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Valor + unidade colada, ex.: "26,50 USD/saca". */
export function formatValueUnit(point: Pick<MarketPoint, "value" | "unit">): string {
  const v = valueFmt.format(point.value);
  return point.unit ? `${v} ${point.unit}` : v;
}

const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "R$ 134,45" (2 casas), para a linha de conversao de referencia. */
export function formatBRLRef(value: number): string {
  return brlFmt.format(value);
}

/** "15/07" usando a data UTC (evita virar 14/07 num fuso UTC-3). */
export function formatDayMonthUTC(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

/** Chave de data em UTC (YYYY-MM-DD) para casar dias ignorando a hora. */
export function utcDateKey(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

/**
 * Conversao de REFERENCIA USD -> BRL pela PTAX, com as travas de honestidade:
 *  - so converte serie cotada em USD (nao faz o inverso em milho/boi);
 *  - exige PTAX presente, positiva e NAO defasada (isStale=false): cambio velho
 *    convertendo preco novo e pior que nao converter;
 *  - exige MESMO DIA (data UTC): a PTAX tem hora e o settlement e meia-noite,
 *    entao comparamos a data, nao o timestamp. Converter preco de 15/07 com
 *    cambio de 16/07 produz um numero que nunca existiu.
 * Devolve null quando qualquer trava falha; nesse caso mostramos so o USD.
 */
export function brlReference(
  point: Pick<MarketPoint, "unit" | "ts" | "value">,
  ptax: Pick<MarketPoint, "isStale" | "value" | "ts"> | null,
): { brl: number; ptaxDate: string } | null {
  if (!point.unit || !point.unit.toUpperCase().startsWith("USD")) return null;
  if (!ptax || ptax.isStale) return null;
  if (!Number.isFinite(ptax.value) || ptax.value <= 0) return null;
  if (utcDateKey(point.ts) !== utcDateKey(ptax.ts)) return null;
  return { brl: point.value * ptax.value, ptaxDate: formatDayMonthUTC(ptax.ts) };
}
