/**
 * assets.ts, a FONTE UNICA de ativos (preco + categoria + editorial). O mapa
 * (GlobalFlowMap) e o terminal (CommodityTerminal) leem DAQUI, nao de listas
 * proprias. Foi o DRIFT (duas listas) que deixou o terminal em 4 de 35 series
 * enquanto o mapa cresceu: adicionar um ativo aqui o adiciona nos DOIS.
 *
 *  - price: codigo da serie de preco (series_latest) + secundario (referencia)
 *    ou { code:null, noQuote } quando nao ha bolsa (niobio, paladio).
 *  - curveCode: series_code da futures_curve, SO os 5 futuros B3 tem estrutura
 *    a termo; spot/WB nao tem curva.
 *  - editorial: OPCIONAL. So onde ja existe (soja/milho/boi/cafe); as demais
 *    entram so com o dado. O Gabriel adiciona editorial aos poucos.
 */
export type AssetCategory = "Agro" | "Minérios" | "Energia" | "Fertilizantes" | "Financeiro";

export type PriceCfg =
  | { code: string; secondary?: { code: string; note: string } }
  | { code: null; noQuote: string };

export type Editorial = {
  insight?: string;
  fearTitle: string;
  fear: string[];
  greedTitle: string;
  greed: string[];
};

export type AssetDef = {
  key: string; // 'Soja' (== AssetType do mapa quando aplicavel)
  label: string;
  category: AssetCategory;
  price: PriceCfg;
  curveCode?: string; // SOJA_FUT... (so os 5 futuros B3)
  editorial?: Editorial;
};

export const ASSETS: AssetDef[] = [
  // ── AGRO ──
  {
    key: "Soja", label: "Soja", category: "Agro",
    price: { code: "SOJA_FUT", secondary: { code: "SOJA_WB", note: "referência global · US Gulf" } },
    curveCode: "SOJA_FUT",
    editorial: {
      insight: "Brasil produz 6 em cada 10 toneladas de soja exportadas no mundo. A rota Mato Grosso–Hong Kong é a nova artéria da proteína global.",
      fearTitle: "Riscos invisíveis",
      fear: [
        "Tensões no Mar Negro + retenção de exportação russa afetam 30% do trigo global, soja sofre contágio direto.",
        "OVX em alta = frete explode → custo de escoamento de Goiás para Santos dispara sem aviso.",
        "Gamma Wall em US$ 11,80/bushel → preço ricocheteia sem nenhuma notícia fundamental.",
      ],
      greedTitle: "Proteção Aeternum",
      greed: [
        "Hedge institucional com assimetria positiva via modelos CTA calibrados para o Basis de Goiás.",
        "Parceiros diretos de escoamento na China + UAE, contratos de receita já estruturados e tokenizados.",
        "Tokenização de CPR / CDA via Stellar → liquidez instantânea sem banco, sem taxa CDI.",
      ],
    },
  },
  {
    key: "Milho", label: "Milho", category: "Agro",
    price: { code: "MILHO_FUT", secondary: { code: "MILHO_WB", note: "referência global · US Gulf" } },
    curveCode: "MILHO_FUT",
    editorial: {
      insight: "Brasil é o 2º exportador mundial de milho, safra 23/24 recorde de 135 M ton. CBOT ainda subestima a oferta brasileira.",
      fearTitle: "Riscos invisíveis",
      fear: [
        "Descolamento do Basis B3–CBOT impede hedges tradicionais de funcionar nas janelas de rolagem.",
        "Choques El Niño/La Niña com lags ocultos, modelos climáticos privados chegam tarde demais.",
        "Alta correlação com energia: when OVX sobe, o custo de secagem e frete terrestre explode.",
      ],
      greedTitle: "Proteção Aeternum",
      greed: [
        "Pair Trading algorítmico inter-safras (verão/inverno) com margem isolada e sizing por volatilidade.",
        "Monitoramento satelital de umidade para antecipar o Basis real antes do USDA reportar.",
        "Colateral on-chain de CPR de milho indexado em USDC → custo de capital zero para o produtor.",
      ],
    },
  },
  {
    key: "Cafe", label: "Café", category: "Agro",
    price: { code: "CAFE_FUT", secondary: { code: "CAFE_ICO", note: "referência global · ICO" } },
    curveCode: "CAFE_FUT",
    editorial: {
      insight: "Brasil produz 1 em cada 3 xícaras de café consumidas no planeta, 38% da oferta global. O mercado ainda subestima o poder de pricing.",
      fearTitle: "Riscos invisíveis",
      fear: [
        "Short Squeeze estrutural forçado por fundos na ICE NY, exportadores com posição short são dizimados.",
        "Geadas pontuais em MG/SP com modelos meteorológicos privados chegando com 5 dias de atraso.",
        "Risco de contraparte elevado nas tradings em momentos de margin calls extremas e liquidações.",
      ],
      greedTitle: "Proteção Aeternum",
      greed: [
        "Mapeamento termal satelital preditivo anulando o atraso informacional (vs USDA e CONAB).",
        "Volatility Selling estruturado configurado para lucrar via Theta quando o mercado atinge histeria.",
        "Integração com redes de trade finance suíças para clearing premium isolado do câmbio local.",
      ],
    },
  },
  {
    key: "BoiGordo", label: "Boi Gordo", category: "Agro",
    price: { code: "BOI_FUT" },
    curveCode: "BOI_FUT",
    editorial: {
      insight: "Brasil é o maior exportador de carne bovina global (27%), China concentra 50% do volume. Rota Goiás–Xangai é estratégica.",
      fearTitle: "Riscos invisíveis",
      fear: [
        "Banimentos sanitários por febre aftosa ou BSE travam exportação da noite para o dia sem aviso.",
        "Basis Risk irrecuperável entre mercado físico e contrato futuro B3 em momentos de liquidação.",
        "Custo de reposição (garrote) descolado da curva forward da arroba, ciclo pecuário distorcido.",
      ],
      greedTitle: "Proteção Aeternum",
      greed: [
        "Cross-hedge proprietário Grãos–Proteína travando a relação de crushing spread boi/milho.",
        "Opções exóticas customizadas cobrindo picos de custo de reposição no pico do ciclo de alta.",
        "Auditoria IoT de rastreabilidade + tokenização on-chain permitindo acesso a mercados premium.",
      ],
    },
  },
  { key: "Trigo", label: "Trigo", category: "Agro", price: { code: "TRIGO_WB" } },
  { key: "Algodao", label: "Algodão", category: "Agro", price: { code: "ALGODAO_WB" } },
  { key: "Acucar", label: "Açúcar", category: "Agro", price: { code: "ACUCAR_WB" } },
  { key: "Arroz", label: "Arroz", category: "Agro", price: { code: "ARROZ_WB" } },
  { key: "Cacau", label: "Cacau", category: "Agro", price: { code: "CACAU_WB" } },
  { key: "Frango", label: "Frango", category: "Agro", price: { code: "FRANGO_WB" } },
  { key: "Amendoim", label: "Amendoim", category: "Agro", price: { code: "AMENDOIM_WB" } },
  { key: "Laranja", label: "Laranja", category: "Agro", price: { code: "LARANJA_WB" } },

  // ── MINÉRIOS ──
  { key: "MinerioFerro", label: "Minério de Ferro", category: "Minérios", price: { code: "MINERIO_WB" } },
  {
    key: "Ouro", label: "Ouro", category: "Minérios",
    price: { code: "OURO_PAXG", secondary: { code: "OURO_LBMA", note: "spot Londres · LBMA" } },
  },
  { key: "Prata", label: "Prata", category: "Minérios", price: { code: "PRATA_LBMA" } },
  { key: "Cobre", label: "Cobre", category: "Minérios", price: { code: "COBRE_WB" } },
  { key: "Aluminio", label: "Alumínio", category: "Minérios", price: { code: "ALUMINIO_WB" } },
  { key: "Niobio", label: "Nióbio", category: "Minérios", price: { code: null, noQuote: "Sem cotação pública em bolsa" } },
  { key: "Paladio", label: "Paládio", category: "Minérios", price: { code: null, noQuote: "Sem cotação disponível" } },

  // ── ENERGIA ──
  {
    key: "Brent", label: "Petróleo", category: "Energia",
    price: { code: "BRENT_SPOT", secondary: { code: "WTI_SPOT", note: "WTI · Cushing" } },
  },
  { key: "GasNatural", label: "Gás Natural", category: "Energia", price: { code: "GAS_NATURAL_HH" } },
  { key: "Etanol", label: "Etanol", category: "Energia", price: { code: "ETANOL_FUT" }, curveCode: "ETANOL_FUT" },

  // ── FERTILIZANTES ──
  { key: "Ureia", label: "Ureia", category: "Fertilizantes", price: { code: "UREIA_WB" } },
  { key: "KCl", label: "KCl (potássio)", category: "Fertilizantes", price: { code: "KCL_WB" } },
  { key: "MAP", label: "Fosfatado (MAP/DAP)", category: "Fertilizantes", price: { code: "DAP_WB" } },
  { key: "TSP", label: "TSP", category: "Fertilizantes", price: { code: "TSP_WB" } },
  { key: "Rocha", label: "Rocha fosfática", category: "Fertilizantes", price: { code: "ROCHA_FOSFATICA_WB" } },

  // ── FINANCEIRO (so no terminal; nao sao ativos do mapa) ──
  { key: "Dolar", label: "Dólar PTAX", category: "Financeiro", price: { code: "PTAX_USD_VENDA" } },
  { key: "RWA", label: "RWA tokenizado", category: "Financeiro", price: { code: "RWA_TVL_TOTAL" } },
];

/** Lookup de preco por chave, o mapa usa (ASSET_SERIES[selectedAsset]). */
export const ASSET_SERIES: Record<string, PriceCfg> = Object.fromEntries(ASSETS.map((a) => [a.key, a.price]));

/** ordem de exibicao das secoes no terminal (alinhada com as abas do mapa). */
export const ASSET_CATEGORIES: AssetCategory[] = ["Agro", "Minérios", "Energia", "Fertilizantes", "Financeiro"];
