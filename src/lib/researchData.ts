export interface ResearchSection {
  type: "abstract" | "heading" | "paragraph" | "callout" | "table" | "chart-placeholder";
  content: string;
  data?: any;
}

export interface ResearchPaper {
  id: string;
  date: string;
  tag: string;
  title: string;
  desc: string;
  author: string;
  readTime: string;
  sections: ResearchSection[];
}

export const researchPapers: ResearchPaper[] = [
  {
    id: "ciclos-liquidez-global",
    date: "Mar 2026",
    tag: "Macro",
    title: "Ciclos de Liquidez Global e Implicações para Mercados Emergentes",
    desc: "Análise dos principais determinantes de liquidez global e seu impacto nos fluxos de capital para economias emergentes em 2024–2025.",
    author: "Aeternum Macro Research",
    readTime: "12 min",
    sections: [
      {
        type: "abstract",
        content: "A contração sincrônica dos balanços dos maiores bancos centrais (Fed, BCE e PBoC) redefiniu a liquidez estrutural global. Este paper examina a relação defasada entre as reservas bancárias centrais agregadas e a compressão de múltiplos em ativos de risco (equities e commodities), com foco em vetores de fluxo diretos para economias com saldo exportador positivo como o Brasil."
      },
      {
        type: "heading",
        content: "1. A Dinâmica da M0 Global e Velocidade do Dinheiro",
      },
      {
        type: "paragraph",
        content: "A transição do Quantitative Easing (QE) para o Quantitative Tightening (QT) reduziu o suprimento agregado de M0 (base monetária) nas economias do G4 a uma taxa anualizada de -4.2% ao longo do último ciclo. Diferentemente do consenso de varejo, a liquidez de mercado não é uma função unidimensional da taxa diretora overnight de fundos federais (Fed Funds), mas antes da derivada da drenagem de reservas através de mecanismos como RRPs (Reverse Repos) e a conta geral do tesouro (TGA)."
      },
      {
        type: "paragraph",
        content: "Neste contexto de absorção passiva, projetamos um regime contínuo de maior custo intrínseco de capital. O 'excesso natural' de savings que impulsionou growth equities globalmente se exauriu, forçando prêmios de risco superiores para carry trades na América Latina."
      },
      {
        type: "callout",
        content: "Em ambientes de drenagem de balanço, a volatilidade cruzada (cross-asset volatility) tende a convergir abruptamente. A correlação entre o Bloomberg Commodity Index (BCOM) e o DXY intensificou sua natureza não-linear."
      },
      {
        type: "heading",
        content: "2. Impactos na Curva Z-Spread Soberana"
      },
      {
        type: "paragraph",
        content: "Utilizando modelos dinâmicos de fator único para spread de crédito soberano, identificamos uma reprecificação acelerada no Z-spread do dívida local do Brasil vs. Treasuries americanas de 10 anos. Apesar disso, o Real (BRL) exibiu um 'beta' asymetricamente inferior ao historicamente esperado."
      },
      {
        type: "table",
        data: {
          headers: ["Fator (12M)", "Beta Histórico", "Beta Realizado 2025", "Variância Explicada (R²)"],
          rows: [
            ["Fed TGA Drawdown", "0.45", "0.12", "0.81"],
            ["BCOM Agriculture", "0.62", "0.88", "0.94"],
            ["Volatility (VIX)", "-0.50", "-0.32", "0.67"]
          ]
        },
        content: ""
      },
      {
        type: "heading",
        content: "3. Conclusão e Perspectivas Táticas"
      },
      {
        type: "paragraph",
        content: "Recomendamos cautela em durações (duration) nominais longas, favorecendo estruturas atreladas a breakevens de inflação curtos e alocação estrutural em 'hard assets', onde o hedge é inerente ao custo marginal de reposição da commodity física, especialmente os metais com forte inelasticidade de oferta, como evidenciado nos mercados estaduais locais de extração mineral (Goiás)."
      }
    ]
  },
  {
    id: "superficie-volatilidade-soja",
    date: "Fev 2026",
    tag: "Quantitativo",
    title: "Modelos de Superfície em Volatilidade Implícita de Commodities",
    desc: "Estudo sobre opções de soja e milho, com foco em assimetrias na estrutura temporal e precificação de eventos climáticos.",
    author: "Aeternum Quantitative Risk Team",
    readTime: "9 min",
    sections: [
      {
        type: "abstract",
        content: "Arbitragem estatística no mercado futuro da CBOT e B3 (milho e soja) tem provado ser uma fonte consistente de Alpha descorrelacionado. Apresentamos nosso modelo modificado de Black-76 para interpolação da superfície de volatilidade, ajustado por processos de saltos (Jump-Diffusion) vinculados a relatórios do USDA e eventos sazonais de La Niña."
      },
      {
        type: "heading",
        content: "O Efeito Skew no Plantio de Inverno"
      },
      {
        type: "paragraph",
        content: "A inclinação da volatilidade (smile/skew) no complexo de grãos reflete inerentemente o risco assimétrico produtivo: uma quebra de safra cria limites superiores ('limit up') muito mais agressivos do que super-safras criam limites inferiores, devido à demanda global inelástica para alimentação proteica. Traduzimos esse desbalanceamento real em estratégias de 'Put Ratio Spreads' na ponta vendedora e 'Call Ladders' na proteção."
      },
      {
        type: "chart-placeholder",
        content: "Volatility Surface 3D (Implied vs Strike/Maturity)"
      },
      {
        type: "paragraph",
        content: "A matriz de deformação ao longo da curva temporal é explorada pelas nossas engine C++ de forma intra-diária, calibrando a volatilidade local e estocástica em frações de segundo para mitigar o 'slippage'."
      }
    ]
  },
  {
    id: "tail-risk-hedging",
    date: "Dez 2025",
    tag: "Risco",
    title: "Tail Risk Hedging Institucional em Carteiras Multi-Ativo",
    desc: "Estruturas de proteção eficientes para cenários de cauda: abordagens com opções fora do dinheiro, minerais escassos e tesouraria direta.",
    author: "Diretoria de Risco (CRO)",
    readTime: "15 min",
    sections: [
      {
        type: "abstract",
        content: "O gerenciamento de cauda (Tail Risk) tornou-se inviável via diversificação clássica 60/40 devido ao aumento generalizado das correlações em períodos de stress macroeconômico extremo. O presente estudo comprova a necessidade mandatória de proteções convexas e aborda os custos de carrego ('bleed') associados."
      },
      {
        type: "heading",
        content: "Mitigação Dinâmica do Efeito 'Drag'"
      },
      {
        type: "paragraph",
        content: "Comprar opções muito fora do dinheiro (OTM) indiscriminadamente consome taxas de performance e prejudica o Sharpe final das carteiras institucionais a longo prazo (conhecido como bleed). A estratégia de hedge Aeternum converte parte desta proteção sintética na acumulação de reservas físicas inelásticas, que agem simultaneamente como defesa contra insolvência sistêmica e devaluations fiduciários severos."
      },
      {
        type: "callout",
        content: "Em nossa parametrização, os bonds estatais perderam definitivamente seu efeito decorrelacionador clássico. O Paradigma de que 'Titulos sobem, Ações descem' faliu empiricamente durante os drawdowns atados a picos inflacionários entre 2022 e 2025."
      },
      {
        type: "paragraph",
        content: "Para otimização e alocação limiar ótima (Kelly Criterion) ao longo da curva convexa, adotamos hedges baseados puramente em variação (Variance Swaps) e estratégias estruturais que financiam as calls put via arbitragem de prêmio de liquidez."
      }
    ]
  }
];

// O resto das antigas do Research para popular o grid e parecer ter volume, mas redirecionarão / não abrirão detalhe por enquanto (ou posso mockar rápido)
export const shortPapers = [
  ...researchPapers,
  { id: "artigo-ma", date: "Jan 2026", tag: "Event-Driven", title: "M&A Cross-Border em Setores Regulados: Oportunidades e Riscos", desc: "Levantamento de 48 transações em setores regulados nos últimos 5 anos e sua correlação com retornos anormais.", author: "Analista de Arbitragem", readTime: "8 min", sections: [
    { type: "abstract", content: "M&A em setores regulados apresentam distorções de preço que nossa mesa de Event-Driven explora com eficiência institucional." },
    { type: "paragraph", content: "Este paper resume fatores observados em 48 transações que foram mapeadas globalmente entre 2021 e 2025. O prêmio de risco ('spread') captura as chances de veto por entidades reguladoras." }
  ] },
  { id: "artigo-iso", date: "Mar 2026", tag: "Finanças Digitais", title: "ISO 20022 e Infraestrutura de Pagamentos Institucionais", desc: "Como o novo padrão de mensageria financeira redefine liquidação, custódia e fluxos interbancários globais.", author: "Tech & Ops", readTime: "10 min", sections: [
    { type: "abstract", content: "O padrão ISO 20022 oferece granularidade de dados sem precedentes, habilitando novos modelos de liquidação e reconciliação automática para Aeternum." },
    { type: "paragraph", content: "A adoção por centrais interbancárias exige uma nova infraestrutura tecnológica de ponta que reduz custos de fricção transfronteiriça." }
  ] },
  { id: "artigo-diesel", date: "Jan 2026", tag: "Logística", title: "Influência do Diesel no Plantio Agrícola de Goiás", desc: "Correlação entre preço do diesel e custo de plantio no estado de Goiás: impacto direto na margem do produtor.", author: "Operação Brasil", readTime: "5 min", sections: [
    { type: "abstract", content: "Nossos modelos quantitativos isolam o preço do diesel como o vetor de custo marginal mais expressivo no estado de Goiás para grãos." },
    { type: "paragraph", content: "Através da análise de componentes principais (PCA), demonstramos que as oscilações de margem dos produtores goianos podem ser hedgiadas prevendo oscilações de combustíveis aliadas aos custos de frete rodoviário." }
  ] },
];
