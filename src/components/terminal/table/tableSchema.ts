/**
 * Configs das tabelas densas. Uma TableConfig = {rows, cols}; entra no
 * CommandRegistry como um comando kind:"table". Adicionar a mensal/metais/energia
 * é uma config nova + uma entrada no registry — sem componente.
 *
 * `width` é propriedade da coluna (como `cap`): com table-layout:fixed + <colgroup>,
 * thead e tbody usam a MESMA grade de larguras — não podem divergir.
 * `cap` (teto da barra) vive na métrica — NUNCA Math.max. Coluna sem cap não tem barra.
 *
 * CAPS PROVISÓRIOS (2026-09-10, p95 de 48 pontos diários dos futuros B3, rolagem
 * suprimida, entressafra jul–set): 1D 2,89% · 1S 6,99% · 1M 7,61% → ±4/±8/±15
 * arredondados p/ leitura. Revisitar quando a série diária passar de ~1 ano.
 */
export type ColType = "asset" | "num" | "numchg" | "bar" | "tag";
export type Fonte = { titulo: string; link: string };
export type Col = {
  key: string;
  label: string;
  type: ColType;
  width: number;   // px — declarado (table-layout:fixed). Alinhamento por construção.
  cap?: number;    // só bar. Ausência => sem barra.
  unit?: string;
  dec?: number;
  fonte?: Fonte;   // fonte específica da coluna (stu/regime); preço usa a da série
};
export type Row = { code: string; label: string; psd?: string };
export type TableConfig = { rows: Row[]; cols: Col[] };

export const REGIME_BAND = 4;    // |1M| < 4% => Estável; >= +4 Acima; <= -4 Abaixo
export const COVERAGE_MIN = 0.6; // abaixo disso a coluna-barra vira num

const FONTE_PSD: Fonte = { titulo: "USDA/FAS — Production, Supply & Distribution (PSD)", link: "https://apps.fas.usda.gov/psdonline/app/index.html" };
const FONTE_REGIME: Fonte = { titulo: "Derivado: variação de 21 pregões da própria série (não é regime estatístico)", link: "" };

/** AGRO — classe de vol homogênea (11–31%) → barras com cap compartilhado honesto. */
export const AGRO_TABLE: TableConfig = {
  rows: [
    { code: "SOJA_FUT", label: "Soja", psd: "2222000" },
    { code: "MILHO_FUT", label: "Milho", psd: "0440000" },
    { code: "BOI_FUT", label: "Boi gordo", psd: "0111000" },
    { code: "CAFE_FUT", label: "Café", psd: "0711100" },
    { code: "ETANOL_FUT", label: "Etanol" },
  ],
  cols: [
    { key: "asset", label: "Ativo", type: "asset", width: 124 },
    { key: "last", label: "Último", type: "num", width: 92 },
    { key: "d1", label: "1D", type: "bar", cap: 4, unit: "%", dec: 2, width: 108 },
    { key: "s1", label: "1S", type: "bar", cap: 8, unit: "%", dec: 2, width: 108 },
    { key: "m1", label: "1M", type: "bar", cap: 15, unit: "%", dec: 2, width: 108 },
    { key: "vol30", label: "Vol 30D", type: "num", unit: "%", dec: 1, width: 72 },
    { key: "stu", label: "Stocks-to-use", type: "num", unit: "%", dec: 1, width: 106, fonte: FONTE_PSD },
    { key: "regime", label: "No mês", type: "tag", width: 82, fonte: FONTE_REGIME },
  ],
};

/** MACRO — classe heterogênea (câmbio 7% … petróleo 77%): NÃO há cap único honesto.
 *  Variações viram numchg (número com sinal, colorido, sem barra). Vol30D carrega a magnitude. */
export const MACRO_TABLE: TableConfig = {
  rows: [
    { code: "PTAX_USD_VENDA", label: "Dólar (PTAX)" },
    { code: "BRENT_SPOT", label: "Brent" },
    { code: "WTI_SPOT", label: "WTI" },
    { code: "OURO_PAXG", label: "Ouro" },
  ],
  cols: [
    { key: "asset", label: "Ativo", type: "asset", width: 132 },
    { key: "last", label: "Último", type: "num", width: 96 },
    { key: "d1", label: "1D", type: "numchg", unit: "%", dec: 2, width: 96 },
    { key: "s1", label: "1S", type: "numchg", unit: "%", dec: 2, width: 96 },
    { key: "m1", label: "1M", type: "numchg", unit: "%", dec: 2, width: 96 },
    { key: "vol30", label: "Vol 30D", type: "num", unit: "%", dec: 1, width: 104 },
  ],

};
