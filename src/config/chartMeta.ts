/**
 * chartMeta — o micro-texto POR TIPO DE GRAFICO (nao por commodity: a curva
 * explica a mesma coisa na soja e no milho). O <ChartSection> le daqui e mostra
 * o micro-texto (1 a 2 linhas, o que o grafico mostra e como ler) abaixo de cada
 * grafico, com um `microOverride` opcional para a nuance de uma commodity.
 *
 * O `title` fica aqui como REFERENCIA (o proprio componente do grafico ja
 * renderiza o titulo discreto — PriceHistoryChart, FuturesCurveCard,
 * TradeTrendChart, etc. — entao o ChartSection NAO duplica; o titulo listado e o
 * que aquele componente mostra).
 *
 * COMPLIANCE: o micro explica O QUE o dado mostra e COMO ler, nunca recomendacao
 * nem previsao. Zero travessoes. Texto base — o Gabriel refina.
 */
export type ChartKind =
  | "price_history"
  | "futures_curve"
  | "trade_trend"
  | "dot_plot"
  | "leite_uf"
  | "leite_evolucao"
  | "rebanho"
  | "references";

export const CHART_META: Record<ChartKind, { title: string; micro: string }> = {
  price_history: {
    title: "Preço ao longo do tempo",
    micro:
      "O preço de fechamento no período coberto pela nossa base. A janela real está rotulada no eixo; onde há troca de contrato, a linha é quebrada para não confundir rolagem com movimento de mercado.",
  },
  futures_curve: {
    title: "Preço por data de entrega",
    micro:
      "Quanto o mercado paga hoje para receber a mercadoria em cada vencimento. Entrega distante mais cara indica custo de carregar estoque; mais barata indica aperto no presente.",
  },
  trade_trend: {
    title: "Comércio ao longo do tempo",
    micro:
      "O volume que o Brasil exportou ou importou a cada ano desde 1997, de fonte primária (MDIC/Secex). O ano corrente é parcial e aparece tracejado.",
  },
  dot_plot: {
    title: "Preço por praça",
    micro:
      "O mesmo produto em mercados que não se comunicam por gasoduto. O ponto é o valor de hoje; a faixa mostra onde a praça negociou nos últimos cinco anos.",
  },
  leite_uf: {
    title: "Preço ao produtor por estado",
    micro:
      "O que o produtor recebe em cada unidade da federação, média trimestral do IBGE. A diferença entre estados é o ponto de partida de qualquer negociação com o laticínio.",
  },
  // leite_evolucao: NAO estava na lista do Gabriel (o grafico existe no terminal);
  // micro base redigido no mesmo tom, para o Gabriel refinar.
  leite_evolucao: {
    title: "Preço ao produtor ao longo do tempo",
    micro:
      "A evolução trimestral do preço médio pago ao produtor pelo leite cru (R$/litro), medida pelo IBGE. É a receita na porteira, não a cotação de atacado ou de hub.",
  },
  rebanho: {
    title: "Rebanho",
    micro:
      "O efetivo declarado ao IBGE na Pesquisa da Pecuária Municipal, anual. É o plantel físico por trás da oferta.",
  },
  references: {
    title: "Referências de mercado",
    micro:
      "Outras praças ou variedades do mesmo produto. O spread só aparece quando as unidades são comparáveis.",
  },
};
