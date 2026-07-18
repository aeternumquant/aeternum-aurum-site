/**
 * flowMapConfig — a lista fechada do Mapa v2: qual card usa a lei nova e com
 * quais codigos SH6 do trade_flows. A chave e o AssetType do GlobalFlowMap.
 *
 * A LEI (validada no piloto da soja, herdada sem recalibracao):
 *  - linha geodesica uniforme fina com dash correndo; verde = exportacao
 *    (Brasilia -> pais), ambar = importacao (pais -> Brasilia);
 *  - bolinha no centroide, raio = piso + (teto-piso)*sqrt(vol/max) (area ~ volume);
 *  - preenchimento: verde comprador / ambar fornecedor / listrado os dois /
 *    vermelho competidor (SO lista curada; sem saber, nao pinta);
 *  - piso 1% do volume da carta; resto vira "+N paises" no card;
 *  - card com preco (honestidade de sempre) + numeros exatos de fluxo.
 *
 * Casos: mode "priceOnly" = prata/paladio (sem fluxo, mapa vazio);
 * noPriceText = nióbio/suco (fluxo normal, card sem cotacao).
 */
export type FlowDirection = "export" | "import";

/**
 * REGRA CRITICA DO ROTULO (Gabriel): o preco fica COLADO ao produto que
 * descreve, nunca solto no topo do card. Por isso o preco e POR SUB-CARD:
 * cada produto carrega SEU preco e SEU fluxo (a fruta tem preco sem fluxo, o
 * suco tem fluxo sem preco — nenhum numero descreve o produto errado).
 */
export type SubPriceCfg =
  | { code: string; secondary?: { code: string; note: string } }
  | { code: null; noQuote: string };

export type SubCardCfg = {
  key: string;
  label: string;
  /** codigos SH6 (strings zero-pad, como em trade_flows.product_code) */
  export?: string[];
  import?: string[];
  /** preco DESTE produto (series_latest). Ausente = herda o do card (ASSET_SERIES). */
  price?: SubPriceCfg;
  /** nota de honestidade especifica do sub (ex.: laranja-fruta) */
  note?: string;
};

export type FlowCardCfg = {
  subs: SubCardCfg[];
  /** sobrescreve o label do chip (ex.: "Laranja e suco") */
  cardLabel?: string;
  /** competidores curados (ISO 3166-1 numerico). Sem curadoria = nao pinta. */
  competitorsN3?: number[];
  /** rotulos de honestidade quando preco e fluxo sao produtos DIFERENTES */
  priceNote?: string;
  flowNote?: string;
  /** caso 3: so preco, sem fluxo (mapa vazio) */
  mode?: "priceOnly";
  /** caso 4: fluxo normal, card sem cotacao (texto exato no lugar do preco) */
  noPriceText?: string;
};

/** Grupo A (exportacao simples) + a soja (piloto). Grupos B-E entram depois. */
export const FLOW_CARDS: Record<string, FlowCardCfg> = {
  Soja: {
    subs: [
      {
        key: "grao",
        label: "Grão",
        export: ["120190"],
        price: { code: "SOJA_FUT", secondary: { code: "SOJA_WB", note: "referência global · US Gulf" } },
      },
      { key: "farelo", label: "Farelo", export: ["230400"], price: { code: "FARELO_SOJA_WB" } },
      { key: "oleo", label: "Óleo", export: ["150710", "150790"], price: { code: "OLEO_SOJA_WB" } },
    ],
    competitorsN3: [840, 32], // EUA, Argentina (curados pelo Gabriel)
  },
  // Opcao (b) do Gabriel: card unico "Laranja e suco", tres produtos, cada um
  // com SEU preco e SEU fluxo. A fruta tem preco (referencia UE) e fluxo ~zero;
  // o suco tem fluxo real e preco nenhum. Nenhum numero descreve o outro.
  // Card "Laranja e suco" (opcao b): abre no FCOJ (o produto real); a fruta
  // (~zero de fluxo) vem por ultimo. A fruta empresta CONTEXTO, nao NUMERO:
  // o preco da fruta NAO entra no card do suco (mercados descolam — geada
  // dispara o FCOJ sem mexer na fruta mediterranea); o suco so REFERENCIA
  // onde o numero vive com o rotulo certo.
  Laranja: {
    cardLabel: "Laranja e suco",
    subs: [
      {
        key: "fcoj",
        label: "Suco FCOJ",
        export: ["200911"],
        price: { code: null, noQuote: "Sem cotação pública de FCOJ" },
        note: "Preço da laranja-fruta: ver o sub-card Laranja (fruta). Mercados distintos — o suco descola da fruta.",
      },
      {
        key: "nfc",
        label: "Suco NFC",
        export: ["200912", "200919"],
        price: { code: null, noQuote: "Sem cotação pública de suco NFC" },
        note: "Preço da laranja-fruta: ver o sub-card Laranja (fruta). Mercados distintos — o suco descola da fruta.",
      },
      {
        key: "fruta",
        label: "Laranja (fruta)",
        price: { code: "LARANJA_WB" },
        note:
          "Preço de referência da fruta na UE (Mediterrâneo, navel, importação) — não o recebido pelo Brasil. O Brasil exporta ~zero de fruta: a laranja vira suco.",
      },
    ],
  },
  Milho: { subs: [{ key: "milho", label: "Milho", export: ["100590"] }] },
  Cafe: { subs: [{ key: "cafe", label: "Café verde", export: ["090111"] }] },
  BoiGordo: {
    subs: [{ key: "carne", label: "Carne bovina", export: ["020230"] }],
    // preco (boi vivo B3) e fluxo (carne desossada) sao produtos DIFERENTES:
    // cada linha com sua verdade, sem fundir (aprovado pelo Gabriel).
    priceNote: "Preço: boi gordo, B3 (animal vivo)",
    flowNote: "Fluxo: carne bovina desossada congelada (exportação)",
  },
  Algodao: { subs: [{ key: "algodao", label: "Algodão", export: ["520100"] }] },
  Cacau: { subs: [{ key: "cacau", label: "Amêndoa", export: ["180100"] }] },
  Amendoim: { subs: [{ key: "amendoim", label: "Amendoim", export: ["120242"] }] },
  MinerioFerro: {
    subs: [
      { key: "finos", label: "Finos", export: ["260111"] },
      { key: "pelotas", label: "Pelotas", export: ["260112"] },
    ],
  },
  Cobre: {
    subs: [{ key: "concentrado", label: "Concentrado", export: ["260300"] }],
    // preco LME (catodo refinado) vs fluxo (concentrado ~30% Cu): estagios
    // diferentes da cadeia — o rotulo carrega, nao funde.
    priceNote: "Preço: cobre refinado, LME",
    flowNote: "Fluxo: concentrado de cobre (exportação)",
  },
  Ouro: { subs: [{ key: "ouro", label: "Ouro", export: ["710812"] }] },
  Brent: {
    subs: [{ key: "petroleo", label: "Petróleo bruto", export: ["270900"] }],
    priceNote: "Preço: Brent (referência global)",
    flowNote: "Fluxo: petróleo bruto brasileiro (exportação)",
  },
  // ── Grupo B: exportacao com sub-cards. Preco COLADO ao sub que descreve:
  // referencia de acucar bruto (ISA) nao precifica refinado; Thai 5% e arroz
  // BRANQUEADO; LME e o METAL, nao bauxita/alumina.
  Acucar: {
    subs: [
      { key: "bruto", label: "Bruto", export: ["170114"], price: { code: "ACUCAR_WB" } },
      {
        key: "refinado",
        label: "Refinado",
        export: ["170199"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
    ],
  },
  Frango: {
    subs: [
      { key: "cortes", label: "Cortes", export: ["020714"] },
      { key: "inteiro", label: "Inteiro", export: ["020712"] },
    ],
    // FRANGO_WB (atacado SP) descreve frango como carne — vale para os dois
    // subs; herdado do card (ASSET_SERIES), sem duplicar.
  },
  Arroz: {
    subs: [
      {
        key: "branqueado",
        label: "Branqueado",
        export: ["100630"],
        price: { code: "ARROZ_WB" }, // Thai 5% = arroz beneficiado/branqueado
      },
      {
        key: "casca",
        label: "Em casca",
        export: ["100610"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
      {
        key: "quebrado",
        label: "Quebrado",
        export: ["100640"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
    ],
  },
  Aluminio: {
    subs: [
      {
        key: "bauxita",
        label: "Bauxita",
        export: ["260600"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
      {
        key: "alumina",
        label: "Alumina",
        export: ["281820"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
      { key: "metal", label: "Metal", export: ["760110"], price: { code: "ALUMINIO_WB" } },
    ],
  },
  // ── Grupo C: IMPORTACAO (Caso 1) — linha AMBAR pais -> Brasilia, pais
  // pintado ambar. Trigo fica em Agro e gas em Energia; os 5 fertilizantes
  // ganham a aba propria (a unica categoria toda de importacao).
  Trigo: {
    subs: [{ key: "trigo", label: "Trigo", import: ["100199"] }], // preco herdado: TRIGO_WB (US HRW)
  },
  GasNatural: {
    // DECISAO DE PRECO: o Henry Hub que temos e a referencia DOMESTICA dos
    // EUA — nao precifica o gas que o Brasil importa (Bolivia: contrato
    // indexado a petroleo; GNL: mercado global, ~JKM/TTF, que historicamente
    // DESCOLA do HH). Emprestar o numero seria o erro da laranja. Os dois
    // subs dizem "sem cotacao" e a nota explica onde a referencia HH vive.
    subs: [
      {
        key: "gnl",
        label: "GNL",
        import: ["271111"],
        price: { code: null, noQuote: "Sem cotação do gás importado" },
        note: "GNL é precificado no mercado global (~JKM/TTF). O Henry Hub (EUA) é outra praça — não descreve o que o Brasil paga.",
      },
      {
        key: "gasoduto",
        label: "Gasoduto",
        import: ["271121"],
        price: { code: null, noQuote: "Sem cotação do gás importado" },
        note: "Gás boliviano é contrato indexado a petróleo — sem cotação spot. O Henry Hub (EUA) não descreve o que o Brasil paga.",
      },
    ],
  },
  Ureia: { subs: [{ key: "ureia", label: "Ureia", import: ["310210"], price: { code: "UREIA_WB" } }] },
  KCl: { subs: [{ key: "kcl", label: "KCl", import: ["310420"], price: { code: "KCL_WB" } }] },
  MAP: {
    cardLabel: "Fosfatado (MAP)",
    subs: [{ key: "map", label: "MAP", import: ["310540"], price: { code: "DAP_WB" } }],
    // MAP e DAP sao SUBSTITUTOS no mesmo estagio: o preco de referencia
    // internacional e DAP; o que o Brasil compra e MAP. O rotulo diz.
    priceNote: "Preço: DAP (referência internacional — substituto do MAP)",
    flowNote: "Fluxo: MAP (importação)",
  },
  TSP: { subs: [{ key: "tsp", label: "TSP", import: ["310311"], price: { code: "TSP_WB" } }] },
  Rocha: {
    cardLabel: "Rocha fosfática",
    subs: [
      { key: "bruta", label: "Bruta", import: ["251010"], price: { code: "ROCHA_FOSFATICA_WB" } },
      {
        key: "moida",
        label: "Moída",
        import: ["251020"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
    ],
  },
};
