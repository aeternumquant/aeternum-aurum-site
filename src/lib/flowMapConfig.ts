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
  /** producao IBGE (PAM) DESTE sub — ex.: a laranja-fruta no card do suco */
  ibge?: { slug: string };
};

/**
 * Balanco interno do USDA PSD (producao/consumo do Brasil), tabela SEPARADA do
 * fluxo (unilateral vs bilateral) — os dois eixos de tempo ficam DISTINTOS no
 * card (safra USDA vs 12m civil MDIC). Consumo NAO e o mesmo atributo em todas
 * (descoberta do cross-check): o mapa por commodity fica aqui, RASTREAVEL —
 * consumoNote registra qual attribute_id alimentou o numero.
 */
export type PsdCfg = {
  code: string;              // commodity_code do PSD ('2222000')
  consumoAttrs: number[];    // attribute_id(s) que somam o "consumo/uso interno"
  consumoLabel: string;      // "Consumo interno" | "Uso interno" (fiel ao atributo)
  consumoNote: string;       // rastreabilidade: "Total Disappearance (attr 126)"
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
  /** balanco interno USDA PSD (so as 9 que existem no PSD) */
  psd?: PsdCfg;
  /**
   * Producao IBGE (PAM, campo brasileiro) no card. PRESENTE = mostra (ao lado
   * do USDA onde conversa; sozinho onde o USDA nao tem). AUSENTE = fica so no
   * banco (acucar/algodao/arroz: cana!=acucar etc — nao confrontar).
   */
  ibge?: { slug: string };
  /** abate IBGE (peso carcaca, INSPECIONADO) — metrica propria, rotulo distinto */
  abate?: { species: string };
  /** nome USGS da commodity p/ o ranking mundial de PRODUCAO no rodape (minerios) */
  usgs?: string;
};

/**
 * Mapa de consumo por commodity (opcao a do Gabriel; rastreavel no card).
 * A maioria usa Domestic Consumption (125); acucar e algodao contabilizam
 * consumo em atributos proprios (descoberta do cross-check), com rotulo
 * "Uso interno" (mais fiel: incluem perda/uso industrial, nao so consumo).
 */
const psdDC = (code: string): PsdCfg => ({
  code,
  consumoAttrs: [125],
  consumoLabel: "Consumo interno",
  consumoNote: "Domestic Consumption (attr 125)",
});

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
    psd: psdDC("2222000"), // Oilseed, Soybean
    ibge: { slug: "soja" }, // conversa com o USDA (grao vs grao)
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
        ibge: { slug: "laranja" }, // o numero que faltava: producao da fruta (IBGE)
      },
    ],
  },
  Milho: { subs: [{ key: "milho", label: "Milho", export: ["100590"] }], psd: psdDC("0440000"), ibge: { slug: "milho" } },
  Cafe: { subs: [{ key: "cafe", label: "Café verde", export: ["090111"] }], psd: psdDC("0711100"), ibge: { slug: "cafe" } },
  BoiGordo: {
    subs: [{ key: "carne", label: "Carne bovina", export: ["020230"] }],
    // preco (boi vivo B3) e fluxo (carne desossada) sao produtos DIFERENTES:
    // cada linha com sua verdade, sem fundir (aprovado pelo Gabriel).
    priceNote: "Preço: boi gordo, B3 (animal vivo)",
    flowNote: "Fluxo: carne bovina desossada congelada (exportação)",
    psd: psdDC("0111000"), // Meat, Beef and Veal (produção em 1000 MT CWE)
    abate: { species: "bovino" }, // IBGE abate INSPECIONADO (~85% do total USDA; rotulo distinto)
  },
  Algodao: {
    subs: [{ key: "algodao", label: "Algodão", export: ["520100"] }],
    // algodao: consumo = Domestic Use (142) + Loss (150); rotulo "Uso interno"
    psd: {
      code: "2631000",
      consumoAttrs: [142, 150],
      consumoLabel: "Uso interno",
      consumoNote: "Domestic Use + Loss (attr 142+150)",
    },
  },
  // Cacau: SO IBGE (o USDA PSD nao tem cacau). O bloco de producao preenche a
  // historia "produz e consome, quase nao exporta" que o fluxo ~zero nao contava.
  Cacau: { subs: [{ key: "cacau", label: "Amêndoa", export: ["180100"] }], ibge: { slug: "cacau" } },
  // Amendoim: so IBGE no nosso banco (o PSD do amendoim nao foi ingerido).
  Amendoim: { subs: [{ key: "amendoim", label: "Amendoim", export: ["120242"] }], ibge: { slug: "amendoim" } },
  MinerioFerro: {
    subs: [
      { key: "finos", label: "Finos", export: ["260111"] },
      { key: "pelotas", label: "Pelotas", export: ["260112"] },
    ],
    usgs: "Iron Ore",
  },
  Cobre: {
    subs: [{ key: "concentrado", label: "Concentrado", export: ["260300"] }],
    // preco LME (catodo refinado) vs fluxo (concentrado ~30% Cu): estagios
    // diferentes da cadeia — o rotulo carrega, nao funde.
    priceNote: "Preço: cobre refinado, LME",
    flowNote: "Fluxo: concentrado de cobre (exportação)",
    usgs: "Copper",
  },
  Ouro: { subs: [{ key: "ouro", label: "Ouro", export: ["710812"] }], usgs: "Gold" },
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
    // acucar: consumo = Total Disappearance (126, inclui perda); rotulo "Uso interno"
    psd: {
      code: "0612000",
      consumoAttrs: [126],
      consumoLabel: "Uso interno",
      consumoNote: "Total Disappearance (attr 126)",
    },
  },
  Frango: {
    subs: [
      { key: "cortes", label: "Cortes", export: ["020714"] },
      { key: "inteiro", label: "Inteiro", export: ["020712"] },
    ],
    // FRANGO_WB (atacado SP) descreve frango como carne — vale para os dois
    // subs; herdado do card (ASSET_SERIES), sem duplicar.
    psd: psdDC("0115000"), // Meat, Chicken
    abate: { species: "frango" }, // IBGE abate INSPECIONADO (~90% do total USDA)
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
    psd: psdDC("0422110"), // Rice, Milled
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
    usgs: "Bauxite", // o Brasil e grande produtor de bauxita (o minerio do aluminio)
  },
  // ── Grupo C: IMPORTACAO (Caso 1) — linha AMBAR pais -> Brasilia, pais
  // pintado ambar. Trigo fica em Agro e gas em Energia; os 5 fertilizantes
  // ganham a aba propria (a unica categoria toda de importacao).
  Trigo: {
    subs: [{ key: "trigo", label: "Trigo", import: ["100199"] }], // preco herdado: TRIGO_WB (US HRW)
    // trigo: a historia e o balanco — produz 7,9 Mt, consome 12,2, importa o gap.
    psd: psdDC("0410000"), // Wheat
    ibge: { slug: "trigo" }, // conversa com o USDA (grao vs grao)
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
  // ── Grupo D: o unico Caso 2 — o Brasil exporta E importa etanol (EUA nos
  // dois lados). Cada sub tem as duas direcoes; pais nos dois = linhas
  // PARALELAS (verde/ambar), pais listrado, bolinha miolo verde + anel ambar.
  // Preco: o contrato ETH da B3 e etanol HIDRATADO (BRL/m3) — descreve o sub
  // hidratado e cola nele; o desnaturado nao tem cotacao.
  Etanol: {
    subs: [
      {
        key: "hidratado",
        label: "Hidratado",
        export: ["220710"],
        import: ["220710"],
        price: { code: "ETANOL_FUT" },
      },
      {
        key: "desnat",
        label: "Desnaturado",
        export: ["220720"],
        import: ["220720"],
        price: { code: null, noQuote: "Sem cotação disponível" },
      },
    ],
  },
  // ── Grupo E: os casos degenerados. ──
  // Niobio (Caso 4): fluxo REAL sem preco — o Brasil domina a producao
  // mundial e nao existe bolsa de niobio. O "sem cotacao" E a historia.
  Niobio: {
    cardLabel: "Nióbio (FeNb)",
    subs: [
      {
        key: "fenb",
        label: "Ferronióbio",
        export: ["720293"],
        price: { code: null, noQuote: "Sem cotação pública em bolsa" },
        note: "O Brasil domina a produção mundial de nióbio (CBMM, Araxá-MG). Mercado OTC: não existe bolsa de referência.",
      },
    ],
    usgs: "Niobium (Columbium)", // o espelho da soja: Brasil ~93% da producao mundial
  },
  // Prata e Paladio (Caso 3): preco sem fluxo — o Brasil exporta ~zero.
  // Mapa vazio e honesto; as linhas de quem compra virao com fontes futuras.
  Prata: {
    mode: "priceOnly",
    subs: [
      {
        key: "prata",
        label: "Prata",
        price: { code: "PRATA_LBMA" },
        note: "O Brasil exporta ~zero — sem fluxo relevante. As linhas de quem compra virão com fontes futuras.",
      },
    ],
    usgs: "Silver",
  },
  Paladio: {
    mode: "priceOnly",
    subs: [
      {
        key: "paladio",
        label: "Paládio",
        price: { code: null, noQuote: "Sem cotação disponível" },
        note: "O Brasil exporta ~zero — sem fluxo relevante. As linhas de quem compra virão com fontes futuras.",
      },
    ],
  },
  // ── Frente B (expansao): 8 codigos novos do Comex, SO FLUXO (sem serie de
  // preco no nosso banco). Mesmo tratamento do niobio: o "sem cotacao" e a
  // verdade, NAO "sob consulta". Import pinta fornecedores (ambar); export,
  // compradores (verde). Os encadeamentos ficam nos comentarios (UI vem depois).
  Celulose: {
    subs: [{
      key: "celulose", label: "Pasta de eucalipto", export: ["470329"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Brasil é o maior exportador mundial de celulose de eucalipto (fibra curta). Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  Suino: {
    subs: [{
      key: "suino", label: "Carne suína congelada", export: ["020329"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Carne suína congelada (exportação). Completa a proteína animal ao lado de boi e frango. Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  Fumo: {
    subs: [{
      key: "fumo", label: "Fumo em folha", export: ["240120"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Fumo em folha destalado (exportação). Brasil é o maior exportador mundial. Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  Malte: {
    subs: [{
      key: "malte", label: "Malte", import: ["110710"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Malte não torrado (importação, cadeia da cerveja). Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  Leite: {
    subs: [{
      key: "leite", label: "Leite em pó", import: ["040221"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Leite em pó integral (importação, sobretudo Argentina e Uruguai). Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  Borracha: {
    subs: [{
      key: "borracha", label: "Borracha natural", import: ["400122"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Borracha natural TSNR (importação, insumo de pneus). Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  // ENERGIA. Encadeamento: carvao importado + minerio de ferro exportado sao os
  // dois insumos do alto-forno (a siderurgia depende do carvao que importa).
  Carvao: {
    subs: [{
      key: "carvao", label: "Hulha betuminosa", import: ["270112"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Carvão metalúrgico (importação). Insumo do alto-forno junto do minério de ferro que o Brasil exporta. Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
  // FERTILIZANTES. Encadeamento: enxofre importado vira acido sulfurico, insumo
  // do fosfatado (MAP/TSP/rocha) JA mapeado (a montante da cadeia).
  Enxofre: {
    subs: [{
      key: "enxofre", label: "Enxofre", import: ["250300"],
      price: { code: null, noQuote: "Sem cotação pública no nosso banco" },
      note: "Enxofre (importação). A montante do fertilizante fosfatado já mapeado: enxofre vira ácido sulfúrico, insumo do MAP/TSP. Fluxo MDIC/Secex; sem série de preço no nosso banco.",
    }],
  },
};
