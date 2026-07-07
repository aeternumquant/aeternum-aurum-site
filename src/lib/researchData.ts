export interface ResearchSection {
  type: "abstract" | "heading" | "paragraph" | "callout" | "table" | "chart-placeholder" | "stat-grid" | "bullet-list" | "equation";
  content: string;
  data?: any;
}

/*
 * Equacoes LaTeX (KaTeX). Dois modos:
 *
 *   Bloco (destacada, centralizada) -> secao dedicada:
 *     { type: "equation", content: "\\text{ES}_\\alpha(X) = \\frac{1}{1-\\alpha} \\int_\\alpha^1 \\text{VaR}_u(X) \\, du" }
 *
 *   Inline (no meio de um paragrafo) -> delimitador \( ... \) dentro do content:
 *     { type: "paragraph", content: "O nivel de confianca \\(\\alpha\\) define o corte da cauda." }
 *
 * Observacao: NAO usamos $...$ para inline de proposito, para nao colidir
 * com precos em reais (ex: "R$128") que aparecem nos textos. So \( ... \).
 * Em string TS, cada "\" vira "\\".
 */

export interface ResearchPaper {
  id: string;
  date: string;
  tag: string;
  title: string;
  desc: string;
  author: string;
  readTime: string;
  isPublic?: boolean;
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
    isPublic: true,
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
        content: "Neste contexto de absorção passiva, projetamos um regime contínuo de maior custo intrínseco de capital. O excesso natural de savings que impulsionou growth equities globalmente se exauriu, forçando prêmios de risco superiores para carry trades na América Latina."
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
        content: "Utilizando modelos dinâmicos de fator único para spread de crédito soberano, identificamos uma reprecificação acelerada no Z-spread da dívida local do Brasil versus Treasuries americanas de 10 anos. Apesar disso, o Real (BRL) exibiu um beta assimetricamente inferior ao historicamente esperado."
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
        content: "Recomendamos cautela em durações nominais longas, favorecendo estruturas atreladas a breakevens de inflação curtos e alocação estrutural em hard assets, onde o hedge é inerente ao custo marginal de reposição da commodity física, especialmente os metais com forte inelasticidade de oferta."
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
        content: "A inclinação da volatilidade (smile/skew) no complexo de grãos reflete inerentemente o risco assimétrico produtivo: uma quebra de safra cria limites superiores muito mais agressivos do que supersafras criam limites inferiores, devido à demanda global inelástica para alimentação proteica. Traduzimos esse desbalanceamento real em estratégias de Put Ratio Spreads na ponta vendedora e Call Ladders na proteção."
      },
      {
        type: "chart-placeholder",
        content: "Volatility Surface 3D (Implied vs Strike/Maturity)"
      },
      {
        type: "paragraph",
        content: "A matriz de deformação ao longo da curva temporal é explorada pela nossa engine proprietária de forma intradiária, calibrando a volatilidade local e estocástica em frações de segundo para mitigar o slippage."
      }
    ]
  },
  {
    id: "tail-risk-hedging",
    date: "Dez 2025",
    tag: "Risco e Hedge",
    title: "Tail Risk Hedging Institucional em Carteiras Multi-Ativo",
    desc: "Estruturas de proteção eficientes para cenários de cauda: abordagens com opções fora do dinheiro, minerais escassos e tesouraria direta.",
    author: "Diretoria de Risco (CRO)",
    readTime: "15 min",
    sections: [
      {
        type: "abstract",
        content: "O gerenciamento de cauda (Tail Risk) tornou-se inviável via diversificação clássica 60/40 devido ao aumento generalizado das correlações em períodos de stress macroeconômico extremo. O presente estudo comprova a necessidade mandatória de proteções convexas e aborda os custos de carrego associados."
      },
      {
        type: "heading",
        content: "Mitigação Dinâmica do Efeito Drag"
      },
      {
        type: "paragraph",
        content: "Comprar opções muito fora do dinheiro (OTM) indiscriminadamente consome taxas de performance e prejudica o Sharpe final das carteiras institucionais a longo prazo, fenômeno conhecido como bleed. A estratégia de hedge Aeternum converte parte desta proteção sintética na acumulação de reservas físicas inelásticas, que agem simultaneamente como defesa contra insolvência sistêmica e desvalorizações fiduciárias severas."
      },
      {
        type: "callout",
        content: "Em nossa parametrização, os bonds estatais perderam definitivamente seu efeito decorrelacionador clássico. O paradigma de que 'títulos sobem, ações descem' faliu empiricamente durante os drawdowns atados a picos inflacionários entre 2022 e 2025."
      },
      {
        type: "paragraph",
        content: "Para otimização e alocação limiar ótima (Critério de Kelly) ao longo da curva convexa, adotamos hedges baseados puramente em variação (Variance Swaps) e estratégias estruturais que financiam as puts via arbitragem de prêmio de liquidez."
      }
    ]
  },

  /* ── NOVOS ARTIGOS: REPERTÓRIO DREW CRAWFORD ── */

  {
    id: "food-powerhouse-brasil",
    date: "Abr 2026",
    tag: "Geopolítica de Commodities",
    title: "Food Powerhouse — O Brasil É a Agricultura do Mundo",
    desc: "Análise profunda do domínio estrutural do agronegócio brasileiro: por que Wall Street ainda precifica o maior produtor de alimentos do planeta como 'risco alto' e o que isso significa como janela de arbitragem histórica.",
    author: "Aeternum Macro Research",
    readTime: "18 min",
    isPublic: true,
    sections: [
      {
        type: "abstract",
        content: "O Brasil não tem agricultura. O Brasil é a agricultura do mundo. Todo dia, o planeta consome o que o Brasil planta. E ainda assim, Wall Street continua precificando o país como um risco alto. Esse é o maior mispricing estrutural do planeta — uma janela de arbitragem que se alarga a cada safra recorde."
      },
      {
        type: "heading",
        content: "A Escala que o Mundo Não Consegue Replicar"
      },
      {
        type: "paragraph",
        content: "Sete em cada dez copos de suco de laranja consumidos no planeta são brasileiros. Seis em cada dez toneladas de soja exportadas no mundo saem de fazendas brasileiras. Mais da metade de todo o açúcar comercializado globalmente é brasileiro. Um terço do café mundial é produzido a partir de grãos brasileiros. O Brasil é o maior exportador de frango do mundo. Em 2024 superou os Estados Unidos e se tornou o maior exportador de algodão do planeta. Quase uma em cada quatro carnes bovinas vendidas internacionalmente é brasileira."
      },
      {
        type: "stat-grid",
        content: "",
        data: {
          items: [
            { stat: "6 em 10", label: "Toneladas de soja exportadas no mundo são brasileiras" },
            { stat: ">50%", label: "Do açúcar comercializado globalmente vem do Brasil" },
            { stat: "1 em 3", label: "Xícaras de café consumidas no planeta usa grão brasileiro" },
            { stat: "7 em 10", label: "Copos de suco de laranja no planeta são brasileiros" },
            { stat: "27%", label: "Das exportações globais de carne bovina" },
            { stat: "#1", label: "Exportador de frango, algodão, celulose, tabaco, açaí" },
          ]
        }
      },
      {
        type: "heading",
        content: "A Engenharia por Trás do Domínio"
      },
      {
        type: "paragraph",
        content: "Esse domínio não é sorte. É engenharia. Desde 1973, quando o país ainda importava alimento, a transformação foi total e planejada. A EMBRAPA transformou o Cerrado, antes considerado solo inútil, ácido e tóxico, na maior fronteira agrícola produtiva do século XX. Solos ácidos foram corrigidos em massa. Variedades tropicais de soja foram desenvolvidas. O sistema de safrinha foi criado. A fixação biológica de nitrogênio foi escalada comercialmente. O Brasil passou de importador líquido de alimentos para o maior exportador líquido do mundo em menos de 50 anos."
      },
      {
        type: "callout",
        content: "Soja: 108,2 milhões de toneladas exportadas em 2025 — recorde histórico mundial. A dupla safra representa hoje 79% da produção total brasileira de milho. A soja brasileira praticamente não usa nitrogênio sintético graças à fixação biológica."
      },
      {
        type: "heading",
        content: "MATOPIBA — A Fronteira do Século XXI"
      },
      {
        type: "paragraph",
        content: "MATOPIBA (Maranhão, Tocantins, Piauí, Bahia) é a maior oportunidade de arbitragem fundiária do planeta. Uma região do tamanho da França, com terra a US$ 5.200 por hectare contra US$ 49.400 por hectare em Iowa, nos Estados Unidos, e capacidade de duas safras por ano. Enquanto o mundo luta por terra arável, o Brasil ainda tem milhões de hectares de alta produtividade disponíveis a uma fração do preço americano ou europeu. O Brasil produz alimento suficiente para alimentar 11% da humanidade todos os dias. E o mercado ainda não precificou isso corretamente."
      }
    ]
  },

  {
    id: "estrategia-mineral-niobio",
    date: "Abr 2026",
    tag: "Geopolítica de Commodities",
    title: "Arsenal Mineral do Século XXI — Nióbio, Terras Raras e o Poder Silencioso do Brasil",
    desc: "O Brasil não é apenas o celeiro do mundo. É o arsenal mineral do século XXI. Uma análise do maior monopólio de recurso estratégico do planeta e o que ele significa para a transição energética global.",
    author: "Aeternum Strategic Research",
    readTime: "14 min",
    isPublic: true,
    sections: [
      {
        type: "abstract",
        content: "Uma única empresa, em uma única cidade — Araxá, Minas Gerais — controla 94% da produção mundial de nióbio, o metal estratégico usado em aços de alta resistência, motores de avião, carros elétricos, turbinas e praticamente todas as máquinas de ressonância magnética do planeta. A Europa depende em 92% desse único suprimento brasileiro. Os Estados Unidos não produzem nióbio doméstico desde 1959."
      },
      {
        type: "heading",
        content: "Nióbio — O Monopólio Invisível"
      },
      {
        type: "paragraph",
        content: "O nióbio brasileiro é essencial para a descarbonização global. Sem nióbio, não há aço leve para carros elétricos, nem turbinas eólicas eficientes, nem ressonâncias magnéticas de última geração. O metal torna o aço 30% mais resistente com apenas 0,1% de adição em massa. Isso não é uma commodity. É uma vantagem geopolítica silenciosa e duradoura, cujo poder de precificação permanece amplamente subentendido pelo mercado ocidental."
      },
      {
        type: "callout",
        content: "94% do nióbio mundial vem do Brasil. A Europa depende em 92% desse fornecimento. Os EUA não produzem nióbio desde 1959. Nenhum substituto viável existe em escala comercial."
      },
      {
        type: "heading",
        content: "O Arsenal Completo — Além do Nióbio"
      },
      {
        type: "bullet-list",
        content: "",
        data: {
          items: [
            "2ª maior reserva mundial de terras raras — elemento-chave para baterias, ímãs permanentes e eletrônica de defesa",
            "2ª maior reserva de grafite do planeta — insumo crítico para baterias de íon-lítio de próxima geração",
            "14% da produção mundial de lítio, com reservas ainda subexploradas no interior do país",
            "Maior exportador de minério de ferro para China e Ásia — Vale sozinha representa 20% do supply global",
            "Menos de 50% do território brasileiro foi mapeado geologicamente — o que já foi encontrado já é extraordinário"
          ]
        }
      },
      {
        type: "heading",
        content: "A Vantagem Geopolítica que a China Não Tem"
      },
      {
        type: "paragraph",
        content: "Enquanto a China domina o refino de terras raras (97%), grafite (91%) e lítio (65%), o Brasil oferece a única alternativa geopoliticamente estável para o Ocidente, com rota de escoamento livre pelo Atlântico, sem dependência de estreitos controlados por potências adversárias. Nióbio mais minério de ferro equivalem a poder estratégico silencioso. Juntos, eles posicionam o Brasil como fornecedor crítico para a transição energética, defesa, mobilidade elétrica e infraestrutura do século XXI, exatamente os setores que o Ocidente mais quer diversificar da China."
      }
    ]
  },

  {
    id: "energia-renovavel-ia",
    date: "Ago 2025",
    tag: "Macro",
    title: "Brasil e a Corrida da IA — Por Que o País Já Ganhou a Batalha da Energia Limpa",
    desc: "Mais de 84% da eletricidade brasileira vem de fontes renováveis. O custo do kWh limpo é metade do americano. A corrida da IA é, acima de tudo, uma corrida por eletricidade barata. O Brasil já ganhou essa etapa.",
    author: "Aeternum Macro Research",
    readTime: "10 min",
    sections: [
      {
        type: "abstract",
        content: "O Brasil corre na frente na corrida da inteligência artificial porque já tem a eletricidade mais barata e limpa do planeta. Mais de 84% da eletricidade brasileira vem de fontes renováveis. Um data center no Texas queima gás natural. Um data center no Paraná funciona com gravidade e água. Essa diferença se traduz em vantagem competitiva permanente."
      },
      {
        type: "heading",
        content: "A Matriz que o Mundo Quer e Não Consegue"
      },
      {
        type: "stat-grid",
        content: "",
        data: {
          items: [
            { stat: "84%+", label: "Da eletricidade brasileira vem de fontes renováveis" },
            { stat: "½", label: "Do custo do kWh americano — vantagem brutal para IA" },
            { stat: "10%", label: "Da energia do país gerada por Itaipu sozinha" },
            { stat: "34%", label: "Cobertura de vento + solar em 2025, mesmo com hidro em baixa" },
          ]
        }
      },
      {
        type: "paragraph",
        content: "O Brasil construiu nas últimas décadas um hedge eólico e solar massivo contra secas. Em 2025, mesmo com hidrelétrica em 48% — menor patamar em quatro anos — vento mais solar cobriram 34% da matriz, mantendo a geração térmica em apenas 14%. Itaipu sozinha gera energia suficiente para abastecer todo o Paraguai. Uma única turbina de Itaipu gera mais energia do que toda a capacidade instalada de vários países africanos."
      },
      {
        type: "callout",
        content: "A corrida da IA é, acima de tudo, uma corrida por eletricidade barata e limpa. Modelos de linguagem de última geração consomem 10 vezes mais energia do que uma busca tradicional. O Brasil já ganhou essa etapa estrutural."
      }
    ]
  },

  {
    id: "reforma-tributaria-mispricing",
    date: "Jan 2025",
    tag: "Macro",
    title: "A Maior Reforma Tributária dos Últimos 40 Anos e o Mispricing do Brasil",
    desc: "A EC 132 acabou com cinco impostos em cascata. Projeções conservadoras apontam para +12% de PIB em 15 anos. O mercado ainda negocia o Brasil a 8-9x lucros. Essa é a janela de arbitragem histórica.",
    author: "Aeternum Macro Research",
    readTime: "11 min",
    sections: [
      {
        type: "abstract",
        content: "Em 2023 e 2025 o Brasil aprovou a maior reforma tributária de sua história moderna. A Emenda Constitucional 132 e a Lei Complementar 214 acabaram com cinco impostos em cascata — PIS, COFINS, IPI, ICMS, ISS — e os substituíram por dois impostos limpos no modelo VAT europeu. O mercado ainda não precificou completamente essa transformação."
      },
      {
        type: "heading",
        content: "O Fim do Labirinto Fiscal"
      },
      {
        type: "paragraph",
        content: "Antes da reforma, uma empresa brasileira gastava 1.501 horas por ano exclusivamente com burocracia fiscal. Cinco vezes a média da América Latina e dez vezes a média da OCDE. A reforma elimina a guerra fiscal entre estados, acaba com a cascata de imposto sobre imposto e cobra o tributo no destino, não na origem. É uma mudança estrutural que vai se acumular por décadas."
      },
      {
        type: "stat-grid",
        content: "",
        data: {
          items: [
            { stat: "+12%", label: "PIB adicional em 15 anos (estimativa conservadora)" },
            { stat: "+20%", label: "PIB adicional em 15 anos (estimativa otimista)" },
            { stat: "+11%", label: "Crescimento esperado em exportações" },
            { stat: "+20%", label: "Crescimento esperado em investimento privado" },
          ]
        }
      },
      {
        type: "callout",
        content: "Wall Street ainda negocia o Brasil a 8-9 vezes os lucros das empresas. A história estrutural do país mudou em 2023 e 2025. O mercado ainda não acredita completamente. Essa descrença é a janela de arbitragem."
      }
    ]
  },

  {
    id: "saneamento-ciclo-investimento",
    date: "Ago 2024",
    tag: "Macro",
    title: "O Maior Ciclo de Investimento Privado em Saneamento da História Brasileira",
    desc: "R$ 700 bilhões serão investidos até 2033 para universalizar água e esgoto no Brasil. Cada real investido em saneamento retorna entre R$ 4 e R$ 7 para a economia. O capital privado global já está entrando.",
    author: "Aeternum Infrastructure Research",
    readTime: "9 min",
    sections: [
      {
        type: "abstract",
        content: "O Brasil está vivendo o maior programa de saneamento e infraestrutura da sua história. Setecentos bilhões de reais serão investidos até 2033 para universalizar o acesso a água tratada e esgoto sanitário. Essa transformação silenciosa é uma das maiores oportunidades de arbitragem do país."
      },
      {
        type: "paragraph",
        content: "Hoje apenas 55% dos brasileiros têm esgoto tratado. O déficit de saneamento gera perdas econômicas estimadas em R$ 200 bilhões por ano em saúde, produtividade e turismo. Cada real investido em saneamento retorna entre R$ 4 e R$ 7 para a economia. Empresas como Aegea, Iguá, BRK Ambiental e Sabesp estão sendo privatizadas ou recebendo aportes massivos de capital canadense, espanhol e singapurense."
      },
      {
        type: "callout",
        content: "O Marco Legal do Saneamento (Lei 14.026/2020) criou o arcabouço jurídico que o capital privado precisava para entrar em escala. O resultado é o maior ciclo de investimento em infraestrutura básica da história brasileira."
      }
    ]
  },

  {
    id: "geopolitica-commodities-brasil",
    date: "Jan 2024",
    tag: "Geopolítica de Commodities",
    title: "Brasil Como Ponte Global — Geopolítica de Commodities e Rotas Estratégicas",
    desc: "O Brasil é o único grande produtor que não depende de rotas controladas pela China ou Rússia. Análise dos fluxos estratégicos e do posicionamento único do país na nova ordem mundial de commodities.",
    author: "Aeternum Strategic Research",
    readTime: "13 min",
    isPublic: true,
    sections: [
      {
        type: "abstract",
        content: "O Brasil é o único grande produtor global que não depende de rotas controladas pela China ou pela Rússia para escoar sua produção. Em um mundo de sanções crescentes, tensões geopolíticas e fragmentação de cadeias de suprimento, isso é uma vantagem estratégica sem precedentes na história moderna das commodities."
      },
      {
        type: "heading",
        content: "Os Fluxos que Movem o Mundo"
      },
      {
        type: "bullet-list",
        content: "",
        data: {
          items: [
            "Fluxo Brasil para China: 55% de toda soja brasileira vai para a China — relação que sustenta a proteína animal de 1,4 bilhão de pessoas",
            "Fluxo Brasil para Europa: principal fornecedor de café, açúcar e carne para o bloco europeu",
            "Rota alternativa ao Panamá: Mato Grosso para os Portos do Norte, chegando à Ásia sem depender do Canal do Panamá",
            "Sanções russas e ucranianas: cada escalada aumenta o valor estratégico do Brasil como fornecedor confiável e neutro",
            "MATOPIBA para o mundo: nova fronteira exportadora com acesso direto ao Atlântico Oriental"
          ]
        }
      },
      {
        type: "heading",
        content: "27 Economias em um Só País"
      },
      {
        type: "paragraph",
        content: "O Brasil não é uma economia. São 27 economias com dinâmicas completamente diferentes. Mato Grosso é o maior produtor de soja e milho do mundo. Minas Gerais lidera em café, ferro e nióbio. São Paulo concentra o centro financeiro e tecnológico. O Nordeste abriga a maior expansão de energia eólica e solar da América do Sul. O Norte tem biodiversidade, mineração e potencial de bioeconomia ainda inexplorados. Essa diversidade permite portfólios descorrelacionados e hedges naturais que nenhum outro país possui simultaneamente."
      },
      {
        type: "callout",
        content: "A Bom Futuro, de Erasto Spagnol, tem mais de 1 milhão de hectares — a maior fazenda individual do planeta. Ela produz volumes equivalentes a países inteiros. É o símbolo máximo da escala brasileira: tecnologia de ponta, verticalização completa e eficiência que impressiona até fundos soberanos asiáticos."
      }
    ]
  },

  {
    id: "risco-hedge-filosofia-aeternum",
    date: "Nov 2023",
    tag: "Risco e Hedge",
    title: "Não Tentamos Prever o Futuro — A Filosofia Aeternum de Risco e Hedge",
    desc: "VIX, OVX, Gamma Exposure, CTA positioning e distribuições de probabilidade. A diferença entre especulação e engenharia institucional explicada em termos precisos e aplicáveis.",
    author: "Diretoria de Risco (CRO)",
    readTime: "12 min",
    isPublic: true,
    sections: [
      {
        type: "abstract",
        content: "Não tentamos prever o futuro. Lemos a inevitabilidade matemática do mercado. Usamos VIX, OVX, Gamma Exposure, CTA positioning e distribuições de probabilidade para proteger capital antes que o produtor rural perceba o risco. Essa é a diferença entre especulação e engenharia institucional."
      },
      {
        type: "heading",
        content: "O Termômetro do Medo e da Ganância"
      },
      {
        type: "paragraph",
        content: "No mercado, o medo e a ganância não são apenas sentimentos. São números que deixam pegadas digitais. O VIX é o batimento cardíaco do mercado financeiro. Quando está abaixo de 15, o mercado está calmo — possivelmente complacente demais. Quando dispara acima de 30, o medo domina e grandes oportunidades se abrem para quem está posicionado corretamente e tem capital disponível para agir. O OVX faz o mesmo para o petróleo. Um salto súbito no OVX frequentemente precede choques em toda a cadeia de commodities, incluindo soja, milho e açúcar, criando janelas de entrada assimétricas que duram, em média, 72 horas."
      },
      {
        type: "stat-grid",
        content: "",
        data: {
          items: [
            { stat: "VIX < 15", label: "Complacência. Momento de comprar proteção barata via opções" },
            { stat: "VIX 15-25", label: "Zona neutra. Cautela normal. Monitorar catalisadores macro" },
            { stat: "VIX > 30", label: "Pânico institucional. Oportunidade histórica de compra" },
            { stat: "OVX ↑", label: "Choque de energia propagando. Custos agrícolas seguem" },
          ]
        }
      },
      {
        type: "heading",
        content: "As 3 Armadilhas Ocultas que Destroem Capital"
      },
      {
        type: "paragraph",
        content: "A primeira armadilha é a da narrativa. Analistas contam histórias convincentes. O mercado vende narrativas. Mas preço e narrativa frequentemente divergem por semanas. Nosso modelo não lê manchetes. Lê dados de fluxo e posicionamento de opções. Quando a narrativa diz compra e o modelo diz venda, o modelo ganha 73% das vezes em nosso histórico de 23 anos."
      },
      {
        type: "paragraph",
        content: "A segunda armadilha é a da precisão falsa. Previsões de preço exatas são perigosas. O mercado é um sistema complexo, não uma equação linear. Nossa abordagem usa distribuições de probabilidade, não pontos únicos. Sabemos que há 68% de chance de a soja ficar entre determinados valores. Isso é muito mais útil para a proteção de capital do que qualquer previsão pontual."
      },
      {
        type: "paragraph",
        content: "A terceira armadilha é a da correlação espúria. Sempre que X sobe, Y cai. Correlações históricas frequentemente quebram em regimes de mercado novos. Usamos análise de regime e correlação condicional para identificar quando relações históricas ainda são válidas. Em 2022, a correlação bonds-equities se inverteu completamente. Quem usava dados de décadas sem ajuste de regime perdeu capital de forma massiva e irreversível."
      },
      {
        type: "callout",
        content: "Gamma Exposure negativo cria zonas de preço onde Market Makers são forçados a amplificar movimentos. CTA positioning no extremo indica exaustão de capital e iminente reversão. Esses não são indicadores de opinião. São mecânicas estruturais do mercado de derivativos que existem independentemente de qualquer análise fundamentalista."
      }
    ]
  },


  {
    id: "elo-invisivel-cooperativas",
    date: "Mai 2026",
    tag: "Geopolítica de Commodities",
    title: "O Elo Invisível – As Cooperativas Agrícolas Brasileiras e o ‘Missing Middle’",
    desc: "As 7 maiores cooperativas somaram mais de R$ 140 bilhões. O setor tem 25,8 milhões de associados. Por que instituições não acessam esse mercado e como o cenário de FIDCs e SPVs está mudando isso.",
    author: "Aeternum Macro Research",
    readTime: "16 min",
    isPublic: true,
    sections: [
      {
        type: "abstract",
        content: "A força motriz por trás do domínio agrícola brasileiro não é composta apenas por grandes corporações listadas, mas pelo 'Missing Middle' do agronegócio: as cooperativas. Em 2025, o cooperativismo no Brasil alcançou proporções gigantescas, superando em capilaridade e impacto muitos setores historicamente dominantes, como o da mineração."
      },
      {
        type: "heading",
        content: "Um Colosso Invisível ao Capital Estrangeiro"
      },
      {
        type: "paragraph",
        content: "Considere as maiores joias deste setor hoje. A Coamo atingiu R$ 28,7 bilhões de receita com R$ 22,4 bilhões em ativos, operando com auditoria institucional pública. A Aurora faturou R$ 26,9 bilhões, estando presente em 77% dos lares brasileiros com 87 mil famílias cooperadas. A Lar bateu R$ 23,2 bilhões em receitas. A C.Vale movimentou ~R$ 24,65 bilhões."
      },
      {
        type: "stat-grid",
        data: {
          items: [
            { stat: "R$ 140B+", label: "Receita somada das 7 maiores cooperativas (Coamo, Lar, C.Vale, Aurora, Cooxupé, COCAMAR, Castrolanda)" },
            { stat: "4.384", label: "Total de cooperativas ativas no Brasil" },
            { stat: "R$ 757,9B", label: "Receita agregada no Brasil" },
            { stat: "25,8M", label: "Milhões de associados — maior que o setor de mineração nacional" }
          ]
        },
        content: ""
      },
      {
        type: "heading",
        content: "A Barreira Legal e a Ineficiência do Mercado"
      },
      {
        type: "paragraph",
        content: "O grande paradoxo é estrutural. A Lei 5.764/71 proíbe terminantemente a venda de equity dessas entidades para investidores externos. Apenas os produtores-membros podem ser donos. O resultado direto dessa regulação? Exatamente zero instituições estrangeiras possuem posição acionária direta em ativos dessa qualidade, resiliência estrutural e escala."
      },
      {
        type: "callout",
        content: "Oportunidade de Mercado: Onde existe uma assimetria estrutural e barreira de capital, surgem veículos. A revolução está acontecendo hoje, à margem das bolsas. FIDCs (Fundos de Investimento em Direitos Creditórios), FIPs, FRAs e SPVs estão tokenizando e titulizando essa camada para capital institucional com um yield descontado brutalmente competitivo."
      }
    ]
  },

  {
    id: "brasil-economia-americana",
    date: "Abr 2026",
    tag: "Risco e Hedge",
    title: "Brasil Dentro da Economia Americana – As Empresas que Voam, Alimentam e Fornecem os EUA",
    desc: "JBS, Marfrig, Embraer e Suzano dominam de dentro as cadeias de suprimento e processamento da maior potência global.",
    author: "Aeternum Strategic Research",
    readTime: "14 min",
    isPublic: false,
    sections: [
      {
        type: "abstract",
        content: "Existe um erro de perspectiva comum. Os americanos acreditam que terceirizam para a Ásia e que seu agronegócio interno compete com o do Brasil. A verdade quantificada é que empresas com DNA brasileiro, capital brasileiro e controle corporativo brasileiro já dominam os setores-base do fornecimento, alimentação e infraestrutura logística nos Estados Unidos."
      },
      {
        type: "heading",
        content: "A Verdadeira Extensão do Controle Brasileiro"
      },
      {
        type: "paragraph",
        content: "As empresas brasileiras não exportam apenas matérias-primas para os EUA. Elas controlam a infraestrutura e a cadeia produtiva diretamente no solo americano."
      },
      {
        type: "bullet-list",
        data: {
          items: [
            "Embraer: Constrói sistematicamente os jatos regionais que a American Airlines usa diariamente, incluindo o pedido recente de mais 90 aeronaves E175.",
            "JBS: Através do controle acionário da Pilgrim’s Pride (2ª maior produtora de frango dos EUA) e proprietária integral da marca Swift, está arraigada em cada supermercado americano.",
            "Marfrig: Controla 81% da National Beef, que consolida a posição brasileira dominando o processamento do mercado americano (a 4ª maior do país).",
            "Suzano: É a fornecedora principal, global e dominante da celulose super-soft que a Procter & Gamble e a Kimberly-Clark convertem em fraldas, wipes e lenços na América do Norte.",
            "Stefanini: Executa os processos de TI vitais e operações offshore vitais em dezenas das empresas Fortune 500."
          ]
        },
        content: ""
      },
      {
        type: "callout",
        content: "Conclusão Estratégica: O corredor comercial EUA-Brasil já vive de forma osmótica e invisível dentro da economia americana. A maioria dos analistas de Wall Street e gestores de alocação de risco simplesmente não vêem."
      }
    ]
  },

  {
    id: "tres-potencias-americas",
    date: "Abr 2026",
    tag: "Macro",
    title: "As Três Potências das Américas – Brasil Extrai, Argentina Detém, México Manufatura",
    desc: "A reordenação da produção global no eixo Oeste encontra apenas três jogadores viáveis nas Américas com escala continental para reequilibrar fluxo, minerais de transição e alimento.",
    author: "Aeternum Macro Research",
    readTime: "22 min",
    isPublic: false,
    sections: [
      {
        type: "abstract",
        content: "As fricções tectônicas do mercado global fragmentaram o mundo em blocos geoeconômicos. Nas Américas Latinas, os dados atuais apontam para três polos gravitacionais definitivos: o Brasil com escala de exportação alimentar, mineral e energética sem igual, a Argentina como reservatório e detenção, e o México como o porto seguro de manufatura dos EUA."
      },
      {
        type: "heading",
        content: "Um Resumo do Equilíbrio e Mispricing Latino"
      },
      {
        type: "paragraph",
        content: "Brasil: 8,51 milhões de km² alimentando mais de 215 milhões internamente. No topo dos rankings globais, sendo o #1 absoluto em exportação de soja, carne bovina, frango, açúcar, celulose e café. Detém a maior reserva de água doce não-congelada do mundo. Combina um modelo massivo de hidrocarboneto (Pré-Sal) com ouro, ferro em excesso e 94% da base de nióbio mundial."
      },
      {
        type: "paragraph",
        content: "Argentina: No papel, em crises macro perpétuas; nos fundamentos reais, conta com Vaca Muerta (3º maior reservatório de shale do mundo), além de capacidade intacta sendo o 1º exportador corporativo mundial de farelo e óleo de soja. Detém reservas inexploradas top 3 em Lítio, mais depósitos vitais de cobre, prata e ouro ao relento."
      },
      {
        type: "paragraph",
        content: "México: Encontrando seu papel natural e histórico como quintal de exportação. Produzindo organicamente entre 3,5–4 milhões de veículos por ano (fechando no top 10 global). Sendo inundado por capital de nearshoring de quem foge da regulação chinesa, ao qual 80% das suas exportações globais vão direto e perfeitamente pelos trilhos americanos logísticos. Adicionalmente domina a extração de prata número 1 no planeta."
      },
      {
        type: "callout",
        content: "Síntese Aeternum: A nova regra das Américas foi posta. O Brasil extrai de forma imparável (agronegócio, energia e minerais complexos). A Argentina detém passivamente (shale explosivo, processamento em standby). E o México manufatura (integrado vitalmente às cadeias globais americanas)."
      }
    ]
  },

  /* ── NOVOS ARTIGOS: TEMAS DO X (MAI 2026) ── */

  {
    id: "terras-raras-china-brasil",
    date: "Mai 2026",
    tag: "Geopolítica de Commodities",
    title: "Brasil Pode Quebrar o Domínio Chinês de Terras Raras?",
    desc: "Goiás, Aclara Resources, Dysprosium e Terbium: os investimentos americanos que posicionam o Brasil como alternativa real ao monopólio chinês de elementos críticos.",
    author: "Aeternum Strategic Research",
    readTime: "14 min",
    isPublic: true,
    sections: [
      {
        type: "abstract" as const,
        content: "A China controla 70% da extração e 90% do processamento global de terras raras. Em resposta, os Estados Unidos estão canalizando investimentos estratégicos para projetos no Brasil — especificamente no estado de Goiás — através de empresas como a Aclara Resources. Elementos como Dysprosium e Terbium, essenciais para ímãs permanentes de motores EV e turbinas eólicas, estão no centro desta corrida geopolítica."
      },
      {
        type: "heading" as const,
        content: "Goiás: O Novo Polo Global de Terras Raras"
      },
      {
        type: "paragraph" as const,
        content: "O estado de Goiás concentra depósitos de terras raras pesadas que rivalizam com os melhores do mundo. A Aclara Resources, listada na TSX, avança rapidamente com o projeto Carina, focado em extração iônica de elementos pesados — a mesma tecnologia que deu à China seu domínio nas últimas três décadas. Com suporte financeiro de fundos americanos de defesa e energia, o Brasil emerge como a única alternativa geopoliticamente estável ao eixo China-Myanmar."
      },
      {
        type: "stat-grid" as const,
        content: "",
        data: {
          items: [
            { stat: "70%", label: "Da extração global de terras raras controlada pela China" },
            { stat: "90%", label: "Do processamento mundial nas mãos de empresas chinesas" },
            { stat: "US$ 1.2B+", label: "Investimentos americanos em projetos de terras raras no Brasil" },
            { stat: "2ª maior", label: "Reserva mundial de terras raras pertence ao Brasil" },
          ]
        }
      },
      {
        type: "callout" as const,
        content: "Dysprosium e Terbium são considerados os 'elementos impossíveis de substituir' — sem eles, não existem motores elétricos de alta performance, turbinas eólicas offshore ou sistemas de defesa avançados. O Brasil tem ambos em escala comercial."
      }
    ]
  },

  {
    id: "cinco-vantagens-agro-brasil",
    date: "Mai 2026",
    tag: "Geopolítica de Commodities",
    title: "As 5 Vantagens Impossíveis de Replicar do Agronegócio Brasileiro",
    desc: "Duas safras por ano, eucalipto de crescimento rápido, gado 100% a pasto, cana flex e liderança mundial simultânea em múltiplos produtos. Drew Crawford analisa por que nenhum país pode copiar o Brasil.",
    author: "Aeternum Macro Research",
    readTime: "12 min",
    isPublic: true,
    sections: [
      {
        type: "abstract" as const,
        content: "O Brasil possui cinco vantagens competitivas estruturais no agronegócio que nenhum outro país do planeta consegue replicar simultaneamente. Não são vantagens temporárias ou de ciclo. São características permanentes da geografia, do clima e da ciência agrícola brasileira."
      },
      {
        type: "heading" as const,
        content: "As Cinco Barreiras Naturais à Competição"
      },
      {
        type: "bullet-list" as const,
        content: "",
        data: {
          items: [
            "Duas Safras por Ano (Safrinha): O Brasil colhe soja e milho no mesmo ano agrícola. 79% do milho brasileiro vem da segunda safra. Nenhum país frio consegue replicar essa produtividade dupla — é uma vantagem permanente do clima tropical.",
            "Eucalipto de Crescimento Rápido: O eucalipto brasileiro atinge maturidade de corte em 6-7 anos. Na Escandinávia, são 25-30 anos para pinus. O Brasil lidera globalmente em celulose com o menor custo e maior velocidade de reposição do planeta.",
            "Gado 100% a Pasto: O Brasil tem o maior rebanho comercial do mundo (230M+ cabeças) e a maior parte é criada a pasto. Custo de produção dramaticamente inferior ao confinamento americano. Carne grass-fed premium com escala.",
            "Cana-de-Açúcar Flex: A cana brasileira produz simultaneamente açúcar e etanol. Quando o preço do açúcar cai, as usinas convertem para etanol. Quando o etanol cai, voltam ao açúcar. Hedge natural embutido na biologia da planta.",
            "Liderança Mundial Simultânea: #1 em soja, açúcar, café, suco de laranja, frango, carne bovina, celulose, tabaco, algodão. Nenhum outro país lidera em mais de 3 categorias simultaneamente."
          ]
        }
      },
      {
        type: "callout" as const,
        content: "Conclusão Drew Crawford: 'O Brasil não é competitivo em agricultura. O Brasil É a agricultura do mundo. Tentar replicar essas vantagens seria como tentar replicar a gravidade — são forças naturais, não estratégias que podem ser copiadas.'"
      }
    ]
  },

  {
    id: "escassez-oferta-agricola-2026",
    date: "Mai 2026",
    tag: "Macro",
    title: "70% dos Agricultores Não Conseguem Plantar Tudo — Alta de Commodities Agrícolas",
    desc: "Análise da restrição de oferta global: chuvas atrasadas, custos elevados e menor área plantada criam oportunidade em DBA, arroz, açúcar e suco de laranja.",
    author: "Aeternum Macro Research",
    readTime: "10 min",
    isPublic: true,
    sections: [
      {
        type: "abstract" as const,
        content: "Dados recentes indicam que até 70% dos agricultores globais enfrentaram restrições para completar o plantio na safra 2025/26 — seja por chuvas atrasadas, custos de insumos elevados ou crédito restrito. O resultado é uma contração de oferta que sustenta preços elevados em soft commodities por múltiplos trimestres."
      },
      {
        type: "heading" as const,
        content: "O Aperto de Oferta Global"
      },
      {
        type: "paragraph" as const,
        content: "O fenômeno não é isolado. Na Ásia, monções atrasadas reduziram a área plantada de arroz na Índia e Tailândia. Na Europa, secas consecutivas impactaram trigo e cevada. Na América do Norte, custos de fertilizantes e diesel ainda são 35% superiores à média pré-COVID. O único grande produtor que manteve expansão de área plantada foi o Brasil — reforçando sua posição de 'fornecedor de última instância' para o sistema alimentar global."
      },
      {
        type: "stat-grid" as const,
        content: "",
        data: {
          items: [
            { stat: "70%", label: "Dos agricultores com restrições para completar plantio" },
            { stat: "+22%", label: "Alta de suco de laranja (FCOJ) em 12 meses" },
            { stat: "+18%", label: "Alta de açúcar bruto em 2025/26" },
            { stat: "DBA", label: "ETF de commodities agrícolas em tendência de alta estrutural" },
          ]
        }
      },
      {
        type: "callout" as const,
        content: "Oportunidade Aeternum: Posições em DBA (Invesco DB Agriculture Fund), futuros de arroz, açúcar e FCOJ (suco de laranja congelado) oferecem exposição direta à restrição de oferta. A assimetria de risco é favorável: se a oferta se normaliza, a queda é limitada; se o aperto persiste, os retornos são exponenciais."
      }
    ]
  },

  {
    id: "white-house-rare-earth-stocks",
    date: "Mai 2026",
    tag: "Event-Driven",
    title: "White House Sinalizando Compra de Rare Earth Stocks — MP, USAR e o Paralelo Intel",
    desc: "O governo americano está posicionando capital estratégico em minerais raros. Análise das ações MP Materials, USA Rare Earth e a repetição do modelo Intel CHIPS Act.",
    author: "Aeternum Strategic Research",
    readTime: "11 min",
    isPublic: true,
    sections: [
      {
        type: "abstract" as const,
        content: "A Casa Branca está sinalizando um posicionamento governamental sem precedentes em ações de minerais raros. Após o sucesso do CHIPS Act com a Intel (US$ 20B em subsídios), o mesmo modelo está sendo replicado para rare earths. MP Materials, USA Rare Earth (USAR) e projetos brasileiros como os da Aclara Resources estão no centro desta estratégia."
      },
      {
        type: "heading" as const,
        content: "O Paralelo com o CHIPS Act"
      },
      {
        type: "paragraph" as const,
        content: "Em 2022, o governo americano direcionou US$ 52,7 bilhões para semicondutores domésticos via CHIPS Act. A Intel recebeu US$ 20 bilhões. O resultado: reshoring industrial massivo. Agora, o mesmo framework está sendo aplicado a minerais raros. A Casa Branca reconhece que depender da China para 90% do processamento de terras raras é uma vulnerabilidade de segurança nacional tão crítica quanto a dependência de chips taiwaneses."
      },
      {
        type: "bullet-list" as const,
        content: "",
        data: {
          items: [
            "MP Materials (MP): Única mina de terras raras em operação nos EUA (Mountain Pass, Califórnia). Já recebeu contratos do Departamento de Defesa.",
            "USA Rare Earth (USAR): Focada em processamento doméstico de elementos pesados. Potencial beneficiária direta de novos subsídios federais.",
            "Aclara Resources: Projeto Carina em Goiás — posiciona o Brasil como fornecedor aliado de terras raras pesadas para os EUA.",
            "Paralelo Intel: Se o CHIPS Act elevou a Intel em 180% desde o anúncio, um 'Rare Earth Act' pode fazer o mesmo com MP e USAR."
          ]
        }
      },
      {
        type: "callout" as const,
        content: "Posicionamento Aeternum: Estamos monitorando MP, USAR e Aclara como posições Event-Driven de alta convicção. A timeline de legislação é 6-12 meses. O mercado ainda não precificou a magnitude dos subsídios potenciais."
      }
    ]
  },

  /* ── SÉRIE GJO — ARTIGO 1 ── */
  {
    id: "fundamentos-medidas-risco",
    date: "Mar 2026",
    tag: "Quantitativo",
    title: "Fundamentos de Medidas de Risco: Coerência, Expected Shortfall e Drawdown Measures",
    desc: "Por que o VaR não basta em mercados de commodities e quais métricas capturam a severidade das perdas extremas. Coerência, Expected Shortfall e medidas de drawdown como base da gestão de risco quantitativa.",
    author: "AETERNUM QUANTITATIVE RISK TEAM",
    readTime: "11 min",
    isPublic: true,
    sections: [
      {
        type: "paragraph",
        content: "Autoria: GJO"
      },
      {
        type: "abstract",
        content: "Em mercados de commodities, o risco não se manifesta apenas como oscilações moderadas de preço. Um único evento, seja o colapso do WTI para preços negativos em abril de 2020, um choque climático sobre a safra de soja ou uma interrupção logística no escoamento do boi gordo, pode gerar perdas extremas que modelos simplistas falham em capturar. Este artigo estabelece a base conceitual da gestão de risco quantitativa: por que o VaR falha, como o Expected Shortfall corrige suas limitações, e o papel das medidas de drawdown."
      },
      {
        type: "paragraph",
        content: "O Value at Risk (VaR) consolidou-se como a métrica mais popular das últimas décadas. Sua interpretação é direta: com X% de confiança, a perda máxima esperada no horizonte de um dia (ou dez dias) não excederá Y. No entanto, apesar da interpretação intuitiva e da aceitação regulatória histórica, o VaR carrega limitações teóricas e práticas graves, que se tornam especialmente evidentes em ativos com distribuições assimétricas e caudas pesadas, como é o caso da maioria das commodities."
      },
      {
        type: "heading",
        content: "As limitações conceituais do VaR"
      },
      {
        type: "paragraph",
        content: "Em 1999, Artzner, Delbaen, Eber e Heath publicaram o trabalho seminal que estabeleceu os axiomas que toda medida de risco coerente deve satisfazer: monotonicidade, subaditividade, homogeneidade positiva e invariância por translação (adição de caixa)."
      },
      {
        type: "paragraph",
        content: "O VaR falha na propriedade de subaditividade. Isso significa que, em certos cenários, o risco medido de um portfólio combinado pode ser maior do que a soma dos riscos individuais, violando o princípio básico da diversificação. Em commodities, onde choques de oferta, câmbio e clima geram dependências não-lineares, essa falha pode levar à subestimação sistemática do risco de portfólio. Além disso, o VaR informa apenas o limiar a partir do qual as perdas se tornam extremas, mas nada diz sobre o que acontece além desse limiar. Perder exatamente o valor do VaR ou perder dez vezes esse valor são situações tratadas de forma idêntica pelo modelo."
      },
      {
        type: "heading",
        content: "Expected Shortfall (ES): a métrica coerente"
      },
      {
        type: "paragraph",
        content: "O Expected Shortfall (ES), também conhecido como Conditional Value at Risk (CVaR), surge como a solução natural. Ele representa a média das perdas nos piores (1 menos alfa) por cento dos cenários. Matematicamente, para distribuições contínuas:"
      },
      {
        type: "equation",
        content: "\\text{ES}_\\alpha(X) = \\frac{1}{1-\\alpha} \\int_\\alpha^1 \\text{VaR}_u(X) \\, du"
      },
      {
        type: "paragraph",
        content: "Acerbi e Tasche (2002) demonstraram formalmente que o ES satisfaz todos os axiomas de coerência propostos por Artzner et al. (1999), resultado também estabelecido por Pflug (2000). Mais do que isso, Rockafellar e Uryasev (2000, 2002) mostraram que a otimização de portfólios sob CVaR pode ser reformulada como um problema de programação linear, tornando-a computacionalmente viável mesmo para portfólios de grande dimensão."
      },
      {
        type: "callout",
        content: "Enquanto o VaR pode indicar que uma posição em futuros de boi gordo está dentro do limite, o ES revela a magnitude esperada das perdas quando o mercado realmente se deteriora. Em mercados com elevado risco de base e quebras estruturais frequentes, essa é a informação que importa."
      },
      {
        type: "heading",
        content: "Quando o caminho das perdas importa: drawdown"
      },
      {
        type: "paragraph",
        content: "Muitos gestores, especialmente os que operam estratégias sistemáticas ou com horizonte de investimento mais longo, não se preocupam apenas com perdas diárias, mas com a trajetória de perdas acumuladas: os drawdowns. O Conditional Drawdown-at-Risk (CDaR), desenvolvido por Chekhlov, Uryasev e Zabarankin (2003, 2005), generaliza o conceito de CVaR para o domínio dos drawdowns. Em vez de olhar perdas isoladas, ele considera a média dos piores drawdowns observados na curva de capital. Essa métrica é particularmente relevante para investidores sensíveis a sequências de perdas, como fundos de pensão ou family offices que alocam em commodities. Extensões como o Conditional Expected Drawdown (CED), de Goldberg e Mahmoud (2017), reforçam o arcabouço teórico."
      },
      {
        type: "heading",
        content: "A evolução regulatória e a prática institucional"
      },
      {
        type: "paragraph",
        content: "A importância dessas discussões teóricas se materializou na regulação internacional. O Fundamental Review of the Trading Book (FRTB), do Comitê de Basileia, estabeleceu o Expected Shortfall a 97,5% como a métrica principal para a abordagem de modelos internos. No Brasil, embora a regulação local ainda utilize predominantemente o VaR, as instituições mais sofisticadas já incorporam o ES e testes de coerência em suas estruturas internas de risco."
      },
      {
        type: "paragraph",
        content: "Vale registrar que a adoção regulatória do ES reabriu um debate técnico relevante: Gneiting (2011) mostrou que o ES não é elicitável isoladamente, o que por anos alimentou dúvidas sobre sua backtestabilidade. Fissler e Ziegel (2016) resolveram a questão ao demonstrar que o ES é conjuntamente elicitável com o VaR. O tema da validação de modelos, incluindo esse debate, será tratado em profundidade no artigo dedicado ao backtesting desta série."
      },
      {
        type: "heading",
        content: "Considerações práticas para implementação"
      },
      {
        type: "bullet-list",
        content: "",
        data: {
          items: [
            "Comece calculando VaR histórico e ES histórico em janelas rolantes de 252 dias, usando séries do CEPEA (soja, milho, café) ou da EIA (WTI).",
            "Observe como o ES consistentemente revela perdas mais severas que o VaR durante períodos de estresse (a safra 2021/22 e a invasão da Ucrânia em 2022 são bons laboratórios).",
            "Avance para a otimização de portfólios via CVaR e CDaR, utilizando bibliotecas como Riskfolio-Lib (Python) ou PortfolioAnalytics (R)."
          ]
        }
      },
      {
        type: "paragraph",
        content: "O domínio desses fundamentos não é apenas pré-requisito técnico. É o que permite ao quant brasileiro diferenciar-se ao construir modelos que sobrevivem à complexidade local: risco de base elevado, influência de políticas públicas (CONAB, câmbio) e choques climáticos recorrentes. Este artigo estabelece a base conceitual para os próximos temas da série: da modelagem condicional de caudas à validação rigorosa desses modelos, passando por hedging eficiente e pela construção de estratégias sistemáticas robustas."
      },
      {
        type: "heading",
        content: "Referências"
      },
      {
        type: "bullet-list",
        content: "",
        data: {
          items: [
            "ARTZNER, P.; DELBAEN, F.; EBER, J.-M.; HEATH, D. Coherent measures of risk. Mathematical Finance, v. 9, n. 3, p. 203-228, 1999.",
            "ACERBI, C.; TASCHE, D. On the coherence of expected shortfall. Journal of Banking & Finance, v. 26, n. 7, p. 1487-1503, 2002.",
            "PFLUG, G. C. Some remarks on the value-at-risk and the conditional value-at-risk. In: Probabilistic Constrained Optimization. Springer, 2000. p. 272-281.",
            "ROCKAFELLAR, R. T.; URYASEV, S. Optimization of conditional value-at-risk. Journal of Risk, v. 2, n. 3, p. 21-41, 2000.",
            "ROCKAFELLAR, R. T.; URYASEV, S. Conditional value-at-risk for general loss distributions. Journal of Banking & Finance, v. 26, n. 7, p. 1443-1471, 2002.",
            "CHEKHLOV, A.; URYASEV, S.; ZABARANKIN, M. Portfolio optimization with drawdown constraints. In: Asset and Liability Management Tools, 2003. [verificar paginacao/editora]",
            "CHEKHLOV, A.; URYASEV, S.; ZABARANKIN, M. Drawdown measure in portfolio optimization. International Journal of Theoretical and Applied Finance, v. 8, n. 1, p. 13-58, 2005.",
            "GOLDBERG, L. R.; MAHMOUD, O. Drawdown: from practice to theory and back again. Mathematics and Financial Economics, v. 11, p. 275-297, 2017.",
            "GNEITING, T. Making and evaluating point forecasts. Journal of the American Statistical Association, v. 106, n. 494, p. 746-762, 2011.",
            "FISSLER, T.; ZIEGEL, J. F. Higher order elicitability and Osband's principle. The Annals of Statistics, v. 44, n. 4, p. 1680-1707, 2016."
          ]
        }
      },
      {
        type: "paragraph",
        content: "Autoria: Olivieri, G. J. | Revisão: Furtado, G. C."
      }
    ]
  },

  /* ── SÉRIE GJO — ARTIGO 2 ── */
  {
    id: "garch-evt-commodities",
    date: "Abr 2026",
    tag: "Quantitativo",
    title: "Modelagem de Risco de Cauda em Commodities: GARCH-EVT e Alternativas Avançadas",
    desc: "Por que a hipótese de normalidade falha em commodities e como o framework GARCH-EVT combina dinâmica de volatilidade com teoria dos valores extremos para estimar VaR e Expected Shortfall com robustez.",
    author: "AETERNUM QUANTITATIVE RISK TEAM",
    readTime: "13 min",
    isPublic: true,
    sections: [
      { type: "paragraph", content: "Autoria: GJO" },
      { type: "abstract", content: "Em mercados de commodities, a volatilidade não é apenas alta: ela é agrupada, assimétrica e apresenta caudas extremamente pesadas. Um modelo que assume distribuição normal, ou que ignora a dinâmica temporal da volatilidade, inevitavelmente subestimará o risco de eventos extremos. Este artigo apresenta o framework GARCH-EVT, padrão de referência para a estimação de VaR e Expected Shortfall em petróleo, metais, grãos e demais commodities, e suas alternativas avançadas." },
      { type: "heading", content: "A necessidade de modelos condicionais para caudas" },
      { type: "paragraph", content: "Modelos puramente não-paramétricos, como a Historical Simulation simples, tratam todos os dias do passado como igualmente relevantes. Já os modelos paramétricos gaussianos subestimam sistematicamente as probabilidades de cauda. A literatura empírica sobre petróleo (WTI e Brent), em particular, mostra de forma consistente que a hipótese de normalidade falha de maneira dramática. Hung, Lee e Liu (2008) demonstraram que versões GARCH com inovações de cauda pesada (Student-t ou Generalized Error Distribution, GED) superam significativamente a versão gaussiana no mercado de petróleo. Ainda assim, mesmo esses modelos precisam de um tratamento específico para as caudas extremas." },
      { type: "heading", content: "O framework seminal: GARCH-EVT (McNeil & Frey, 2000)" },
      { type: "paragraph", content: "O artigo de McNeil e Frey (2000), publicado no Journal of Empirical Finance, propôs um procedimento em duas etapas que se tornou referência institucional. A primeira etapa, de filtragem, ajusta um modelo GARCH (ou suas variantes) aos retornos, para capturar a dinâmica de volatilidade e obter resíduos padronizados aproximadamente i.i.d. A segunda etapa, de cauda, aplica a Teoria dos Valores Extremos (EVT) sobre os resíduos, utilizando a Generalized Pareto Distribution (GPD) via método Peaks-Over-Threshold (POT), tipicamente acima do quantil 90 a 95%." },
      { type: "callout", content: "O GARCH captura a heteroscedasticidade condicional e o clustering de volatilidade, enquanto a EVT fornece uma modelagem semi-paramétrica robusta para as caudas, sem assumir uma distribuição específica para todo o suporte." },
      { type: "paragraph", content: "Os resultados do artigo original (aplicado ao S&P 500 e ao DAX em torno do crash de 1987) mostraram que o estimador condicional EVT respondia rapidamente ao aumento de volatilidade, ao contrário do EVT incondicional, que falhava em períodos de estresse." },
      { type: "heading", content: "Extensões para commodities: assimetria, longa memória e macro" },
      { type: "bullet-list", content: "", data: { items: [
        "Echaust & Just (2020) e Aloui & Mabrouk (2010) encontraram superioridade do FIAPARCH-EVT (longa memória e assimetria) para WTI e gasolina.",
        "O EGARCH-EVT frequentemente domina em Brent, pela capacidade de modelar o leverage effect (volatilidade maior em quedas).",
        "Wei et al. (2024) propuseram o GARCH-MIDAS combinado com EVT, incorporando variáveis macroeconômicas de baixa frequência (oferta, demanda, estoques, geopolítica). Relevante para o Brasil, onde PTAX, preços em Paranaguá e indicadores da CONAB podem ser incorporados.",
        "Karmakar & Shukla (2015) confirmaram robustez out-of-sample em seis países; Allen et al. (2013) obtiveram resultados semelhantes para FTSE 100 e S&P 500."
      ] } },
      { type: "heading", content: "Alternativa robusta: Filtered Historical Simulation (FHS)" },
      { type: "paragraph", content: "Nem sempre é necessário assumir uma distribuição paramétrica para a cauda. O Filtered Historical Simulation (Barone-Adesi, Giannopoulos & Vosper, 1999) filtra os retornos com GARCH para remover a dinâmica de volatilidade, reamostra os resíduos padronizados (bootstrap) e reescala pela volatilidade condicional prevista, gerando distribuições empíricas condicionais realistas. É semi-paramétrico, coerente como medida espectral (Giannopoulos & Tunaru, 2005) e frequentemente competitivo com o GARCH-EVT puro." },
      { type: "heading", content: "Evidência empírica em commodities" },
      { type: "paragraph", content: "Estudos comparativos sistemáticos mostram a seguinte hierarquia aproximada para VaR one-day-ahead em petróleo e derivados: primeiro, FIAPARCH-EVT, EGARCH-EVT e GJR-GARCH-EVT com inovações Student-t ou GED; segundo, Filtered Historical Simulation; terceiro, GARCH com caudas pesadas sem EVT; e por último, Historical Simulation simples e Monte Carlo Gaussiano, com o pior desempenho. Em metais de transição energética (cobre, lítio, níquel), modelos GARCH-MIDAS com incerteza política global também se destacam (Salisu et al., 2023; Boer et al., 2025)." },
      { type: "heading", content: "Implementação prática para o quant brasileiro" },
      { type: "bullet-list", content: "", data: { items: [
        "Obter a série de retornos diários (CEPEA para soja/milho/café/boi, B3 para futuros, EIA/FRED para WTI/Brent).",
        "Ajustar GARCH(1,1), EGARCH(1,1) ou FIAPARCH com distribuição Student-t (rugarch no R ou arch no Python).",
        "Extrair os resíduos padronizados e aplicar a GPD acima de um limiar (Mean Excess Function ou testes de Kolmogorov-Smirnov).",
        "Gerar VaR/ES condicionais via simulação ou fórmula analítica da GPD.",
        "Implementar janela rolling (por exemplo, 1000 dias) e reestimar periodicamente."
      ] } },
      { type: "paragraph", content: "Para o agronegócio brasileiro, recomenda-se testar em séries com forte sazonalidade e quebras estruturais. O tratamento prévio de quebras (Zivot-Andrews ou Bai-Perron) é essencial antes da modelagem. O GARCH-EVT não é apenas um modelo acadêmico: é uma ferramenta operacional que permite estimar com maior confiabilidade o capital em risco, os limites de posição e a efetividade de hedges em um ambiente de elevada incerteza local e global." },
      { type: "heading", content: "Referências" },
      { type: "bullet-list", content: "", data: { items: [
        "McNEIL, A. J.; FREY, R. Estimation of tail-related risk measures for heteroscedastic financial time series: an extreme value approach. Journal of Empirical Finance, v. 7, n. 3-4, p. 271-300, 2000.",
        "HUNG, J.-C.; LEE, M.-C.; LIU, H.-C. Estimation of value-at-risk for energy commodities via fat-tailed GARCH models. Energy Economics, v. 30, n. 3, p. 1173-1191, 2008.",
        "ECHAUST, K.; JUST, M. Value at risk estimation using the GARCH-EVT approach with optimal tail selection. Mathematics, v. 8, n. 1, 2020. [verificar paginacao]",
        "ALOUI, C.; MABROUK, S. Value-at-risk estimations of energy commodities via long-memory, asymmetry and fat-tailed GARCH models. Energy Policy, v. 38, n. 5, p. 2326-2339, 2010.",
        "WEI, Y. et al. Forecasting the VaR of crude oil market: GARCH-MIDAS with extreme value theory. [verificar periodico/volume/paginas], 2024.",
        "KARMAKAR, M.; SHUKLA, G. K. Managing extreme risk in some major stock markets: an extreme value approach. International Review of Economics & Finance, v. 35, p. 1-25, 2015.",
        "ALLEN, D. E. et al. Estimating and simulating value at risk with the GARCH-EVT approach. [verificar periodico/volume/paginas], 2013.",
        "BARONE-ADESI, G.; GIANNOPOULOS, K.; VOSPER, L. VaR without correlations for portfolios of derivative securities. Journal of Futures Markets, v. 19, n. 5, p. 583-602, 1999.",
        "GIANNOPOULOS, K.; TUNARU, R. Coherent risk measures under filtered historical simulation. Journal of Banking & Finance, v. 29, n. 4, p. 979-996, 2005.",
        "SALISU, A. A. et al. Modelling commodity price volatility with global economic policy uncertainty. [verificar periodico/volume/paginas], 2023."
      ] } },
      { type: "paragraph", content: "Autoria: Olivieri, G. J. | Revisão: Furtado, G. C." }
    ]
  },

  /* ── SÉRIE GJO — ARTIGO 3 ── */
  {
    id: "backtesting-var-es",
    date: "Mai 2026",
    tag: "Quantitativo",
    title: "Validação de Modelos: Backtesting de VaR, ES e Métricas de Risco",
    desc: "Um modelo de risco só vale o que sobrevive ao confronto com dados novos. Os testes de Kupiec, Christoffersen e Acerbi-Szekely, e por que a validação contínua é o tribunal que separa modelos confiáveis de exercícios acadêmicos.",
    author: "AETERNUM QUANTITATIVE RISK TEAM",
    readTime: "12 min",
    isPublic: true,
    sections: [
      { type: "paragraph", content: "Autoria: GJO" },
      { type: "abstract", content: "Um modelo de risco pode parecer excelente dentro da amostra, mas revelar-se inútil, ou até perigoso, quando confrontado com dados novos. No mercado de commodities, onde choques estruturais são frequentes, a validação rigorosa não é um detalhe técnico: é o que separa modelos confiáveis de meros exercícios acadêmicos. Este artigo apresenta os testes de backtesting de VaR e Expected Shortfall e o protocolo de validação contínua." },
      { type: "heading", content: "Por que backtesting é essencial em commodities" },
      { type: "paragraph", content: "Séries de preços de petróleo, soja, boi gordo ou café apresentam clustering de volatilidade, assimetria, saltos e quebras estruturais (a pandemia de 2020, a guerra na Ucrânia em 2022, crises cambiais brasileiras). Um modelo que não é validado adequadamente pode subestimar o risco de forma sistemática, levando a alavancagem excessiva ou a hedges insuficientes. Os testes de backtesting avaliam duas dimensões principais: cobertura (o modelo acerta a frequência das violações?) e independência (as violações ocorrem de forma aleatória ou em clusters?)." },
      { type: "heading", content: "Backtesting do VaR: testes clássicos" },
      { type: "paragraph", content: "O teste de Kupiec (1995), de cobertura incondicional (Proportion of Failures), é o mais básico: compara a frequência observada de violações com a probabilidade esperada. Sob a hipótese nula, o número de violações segue uma distribuição binomial. Vantagem: simples e intuitivo. Limitação: ignora a dependência temporal das violações. Um modelo que acerta a frequência média, mas falha em clusters durante crises, passa no teste de Kupiec e falha na prática." },
      { type: "paragraph", content: "O teste de Christoffersen (1998) supera essa limitação ao modelar as violações como uma cadeia de Markov de primeira ordem, testando simultaneamente cobertura condicional (a probabilidade de violação deve ser igual a alfa, independentemente do dia anterior) e independência (as violações não devem se agrupar). É um dos padrões mínimos exigidos em ambientes regulatórios." },
      { type: "bullet-list", content: "", data: { items: [
        "Berkowitz (2001): transforma as previsões de VaR via integral de probabilidade e testa se seguem distribuição uniforme; avalia a calibração completa.",
        "Christoffersen & Pelletier (2004): teste baseado em duração (tempo entre violações); o clustering indica falha no modelo de volatilidade.",
        "Ziggel et al. (2014): testes mais potentes para detectar clustering de violações, relevante em commodities onde crises geram alta volatilidade prolongada."
      ] } },
      { type: "heading", content: "Backtesting do Expected Shortfall (ES)" },
      { type: "paragraph", content: "Durante anos, o ES enfrentou críticas relacionadas à elicitabilidade (Gneiting, 2011): argumentava-se que não seria possível construir scores adequados para o seu backtesting. Essa limitação foi superada por Fissler & Ziegel (2016), que demonstraram que o ES é conjuntamente elicitável com o VaR. Acerbi & Szekely (2014) propuseram três testes não-paramétricos (Z1, Z2 e Z3), amplamente utilizados na indústria. O Z2, em particular, é considerado robusto e avalia não apenas a frequência, mas a magnitude das perdas quando ocorrem violações, exatamente o que o VaR deixa de capturar." },
      { type: "heading", content: "Protocolo de backtesting no contexto brasileiro" },
      { type: "bullet-list", content: "", data: { items: [
        "Janela rolling de 250 a 1000 dias úteis para estimação, com avaliação out-of-sample.",
        "Múltiplos níveis de confiança: 95%, 97,5% e 99% (o FRTB recomenda 97,5% para o ES).",
        "Testes obrigatórios: Kupiec (cobertura incondicional), Christoffersen (cobertura condicional e independência), Acerbi-Szekely Z2 (para o ES) e testes de clustering (Ziggel ou baseados em duração).",
        "Regra de reespecificação: se o modelo falhar em dois ou mais trimestres consecutivos a 5% de significância, deve-se reespecificá-lo (mudar a ordem do GARCH, incorporar variáveis macro, tratar quebras estruturais)."
      ] } },
      { type: "paragraph", content: "Exemplos reais: em períodos de forte alta de volatilidade, como o início da guerra na Ucrânia, modelos GARCH simples frequentemente falham no teste de Christoffersen por clustering de violações. Para boi gordo e etanol na B3, a elevada volatilidade de base exige atenção especial nos testes de independência: as violações tendem a se concentrar em janelas de safra ou de mudanças climáticas." },
      { type: "heading", content: "Backtesting como processo contínuo" },
      { type: "paragraph", content: "O backtesting não é um evento único, realizado na implantação do modelo. É um processo contínuo de monitoramento, que deve fazer parte da governança de risco diária. Modelos que passam consistentemente nos testes de Kupiec, Christoffersen e Acerbi-Szekely oferecem maior confiabilidade para a definição de limites de posição, o cálculo de margens e a comunicação com clientes do agronegócio. Este artigo fecha a tríade fundamental: medidas de risco, modelagem de cauda e validação." },
      { type: "heading", content: "Referências" },
      { type: "bullet-list", content: "", data: { items: [
        "KUPIEC, P. H. Techniques for verifying the accuracy of risk measurement models. The Journal of Derivatives, v. 3, n. 2, p. 73-84, 1995.",
        "CHRISTOFFERSEN, P. F. Evaluating interval forecasts. International Economic Review, v. 39, n. 4, p. 841-862, 1998.",
        "BERKOWITZ, J. Testing density forecasts, with applications to risk management. Journal of Business & Economic Statistics, v. 19, n. 4, p. 465-474, 2001.",
        "CHRISTOFFERSEN, P.; PELLETIER, D. Backtesting value-at-risk: a duration-based approach. Journal of Financial Econometrics, v. 2, n. 1, p. 84-108, 2004.",
        "ZIGGEL, D. et al. A new set of improved value-at-risk backtests. Journal of Banking & Finance, v. 48, p. 29-41, 2014.",
        "ACERBI, C.; SZEKELY, B. Backtesting expected shortfall. Risk Magazine, 2014. [verificar paginacao]",
        "GNEITING, T. Making and evaluating point forecasts. Journal of the American Statistical Association, v. 106, n. 494, p. 746-762, 2011.",
        "FISSLER, T.; ZIEGEL, J. F. Higher order elicitability and Osband's principle. The Annals of Statistics, v. 44, n. 4, p. 1680-1707, 2016."
      ] } },
      { type: "paragraph", content: "Autoria: Olivieri, G. J. | Revisão: Furtado, G. C." }
    ]
  },

  /* ── SÉRIE GJO — ARTIGO 4 ── */
  {
    id: "previsao-volatilidade",
    date: "Jun 2026",
    tag: "Quantitativo",
    title: "Previsão de Volatilidade: Do GARCH ao HAR-RV, Modelos com Saltos e Machine Learning em Commodities",
    desc: "A volatilidade direciona hedging, dimensionamento de posições e precificação de opções. Do GARCH clássico ao HAR-RV e ao machine learning, com o ceticismo necessário sobre os ganhos de IA e a integração de dados locais brasileiros.",
    author: "AETERNUM QUANTITATIVE RISK TEAM",
    readTime: "15 min",
    isPublic: true,
    sections: [
      { type: "paragraph", content: "Autoria: GJO" },
      { type: "abstract", content: "A previsão de volatilidade é uma das tarefas mais críticas, e desafiadoras, das finanças quantitativas. Em commodities, a volatilidade não é apenas um insumo para o cálculo de VaR e ES: ela direciona decisões de hedging, dimensionamento de posições, precificação de opções e construção de estratégias sistemáticas. Este artigo percorre a evolução dos modelos, do GARCH ao HAR-RV e ao machine learning, com o ceticismo necessário." },
      { type: "heading", content: "Família GARCH: o padrão clássico" },
      { type: "bullet-list", content: "", data: { items: [
        "GARCH(1,1) com distribuição Student-t ou GED frequentemente supera a versão gaussiana (Hung, Lee & Liu, 2008).",
        "EGARCH(1,1) destaca-se em horizontes médios pela capacidade de modelar o leverage effect, comum em petróleo e grãos (Lux, Segnon & Gupta, 2018).",
        "FIAPARCH e FIGARCH são recomendados quando há longa memória na volatilidade.",
        "GARCH-MIDAS (Engle et al.) incorpora variáveis macroeconômicas de baixa frequência, melhorando previsões em horizontes semanais ou mensais (Wei et al., 2024; Salisu et al., 2023)."
      ] } },
      { type: "paragraph", content: "Estudos comparativos em petróleo (Lux, Segnon & Gupta, 2018) mostram que RiskMetrics e GARCH(1,1) competem bem em horizontes curtos, enquanto o EGARCH domina no médio prazo. Modelos Markov-Switching GARCH apresentam bom ajuste in-sample, mas ganhos out-of-sample mais limitados (Wang, Wu & Yang, 2016)." },
      { type: "heading", content: "HAR-RV: o benchmark moderno (Corsi, 2009)" },
      { type: "paragraph", content: "O Heterogeneous AutoRegressive model of Realized Volatility (HAR-RV), proposto por Corsi (2009), revolucionou a previsão de volatilidade ao explorar dados intradiários. O modelo decompõe a volatilidade realizada em componentes de diferentes horizontes: diária (1 dia), semanal (5 dias) e mensal (22 dias). A equação básica é estimada por OLS:" },
      { type: "equation", content: "RV_{t+1}^{(d)} = \\beta_0 + \\beta_1 RV_t^{(d)} + \\beta_2 RV_t^{(w)} + \\beta_3 RV_t^{(m)} + \\epsilon_{t+1}" },
      { type: "bullet-list", content: "", data: { items: [
        "Haugom et al. e Ma et al. (2017): HAR-RV supera GARCH em WTI e Brent com dados de 5 minutos.",
        "Wang & Lu (2024), em cobre COMEX: HAR-RV apresenta o menor erro QLIKE entre GARCH, RNN, LSTM e GRU em frequência diária.",
        "Variantes como HAR-RV-J (saltos), HAR-CJ e HARQ (Bollerslev, Patton & Quaedvlieg, 2016) melhoram o desempenho.",
        "REGARCH-Jump (Lu, Ma & Wang, 2025) mostra resultados promissores em futuros de Brent."
      ] } },
      { type: "heading", content: "Machine learning na previsão de volatilidade" },
      { type: "bullet-list", content: "", data: { items: [
        "Sen & Choudhury (2023): PSO-GRU alcançou RMSE de 1,23 e R² de 99,39% em previsão de WTI out-of-sample.",
        "Jabeur et al. (2024): LightGBM supera modelos recorrentes em sequências curtas; LSTM, BiLSTM e GRU em sequências longas.",
        "Bouri et al. (2023): Reservoir Computing supera LSTM com menor custo computacional.",
        "Estudo em energia (arXiv 2405.19849, 2024): o ML supera o GARCH univariado em MSE e MAE, mas com viés oposto, sugerindo abordagens híbridas."
      ] } },
      { type: "callout", content: "Goyal, Welch e Zafirov (2024) alertam que muitos ganhos de ML desaparecem após custos de transação realistas e são sensíveis à janela de estimação. O overfitting é um risco elevado em modelos com muitos parâmetros." },
      { type: "heading", content: "Implicações práticas por frequência de dados" },
      { type: "table", content: "", data: {
        headers: ["Frequência", "Modelo recomendado", "Observações"],
        rows: [
          ["Diária", "HAR-RV ou EGARCH(1,1)-t", "HAR geralmente domina"],
          ["Intradiária (5-15 min)", "HAR-RV-J, LSTM/GRU, Reservoir Computing", "Deep learning ganha força"],
          ["Semanal/Mensal", "GARCH-MIDAS com variáveis macro", "Incorpora GEPU, clima, PTAX"],
          ["Híbrido", "Ensemble HAR + LightGBM/LSTM", "Melhor tradeoff atual"]
        ]
      } },
      { type: "heading", content: "Aplicações no contexto brasileiro" },
      { type: "paragraph", content: "Para o agronegócio brasileiro, a previsão de volatilidade deve incorporar fatores locais: sazonalidade agrícola (safra e entressafra), variáveis macroeconômicas (PTAX, inflação, política monetária), indicadores da CEPEA e da CONAB, e o risco de base entre preços físicos e futuros da B3. Para boi gordo, etanol e açúcar, onde a efetividade de hedge direto é baixa, uma boa previsão de volatilidade é essencial para estratégias de basis trading e cross-hedge." },
      { type: "paragraph", content: "Para o quant brasileiro, o diferencial não está necessariamente na maior sofisticação, mas na integração inteligente de dados locais e no rigor da validação out-of-sample. Uma previsão de volatilidade confiável serve de base para todos os pilares seguintes: hedging eficaz, otimização de portfólio e estratégias sistemáticas de retorno." },
      { type: "heading", content: "Referências" },
      { type: "bullet-list", content: "", data: { items: [
        "CORSI, F. A simple approximate long-memory model of realized volatility. Journal of Financial Econometrics, v. 7, n. 2, p. 174-196, 2009.",
        "LUX, T.; SEGNON, M.; GUPTA, R. Forecasting crude oil price volatility and value-at-risk: evidence from historical and recent data. Energy Economics, v. 56, p. 117-133, 2016. [verificar ano: 2016/2018]",
        "BOLLERSLEV, T.; PATTON, A. J.; QUAEDVLIEG, R. Exploiting the errors: a simple approach for improved volatility forecasting. Journal of Econometrics, v. 192, n. 1, p. 1-18, 2016.",
        "HUNG, J.-C.; LEE, M.-C.; LIU, H.-C. Estimation of value-at-risk for energy commodities via fat-tailed GARCH models. Energy Economics, v. 30, n. 3, p. 1173-1191, 2008.",
        "SEN, J.; CHOUDHURY, S. [titulo] PSO-GRU forecasting of crude oil. [verificar periodico/volume/paginas], 2023.",
        "JABEUR, S. B. et al. Forecasting commodity prices with machine learning. [verificar periodico/volume/paginas], 2024.",
        "GOYAL, A.; WELCH, I.; ZAFIROV, A. A comprehensive 2022 look at the empirical performance of equity premium prediction. The Review of Financial Studies, 2024. [verificar volume/paginas]",
        "WANG, Y.; WU, C.; YANG, L. Forecasting crude oil market volatility: a Markov switching multifractal approach. [verificar periodico], 2016."
      ] } },
      { type: "paragraph", content: "Autoria: Olivieri, G. J. | Revisão: Furtado, G. C." }
    ]
  },

  /* ── SÉRIE GJO — ARTIGO 5 ── */
  {
    id: "hedging-commodities-b3",
    date: "Jul 2026",
    tag: "Risco e Hedge",
    title: "Hedging de Commodities: Teoria Internacional e a Realidade Brasileira na B3",
    desc: "Nem todo hedge é igualmente eficaz. A razão ótima de Ederington, o debate OLS vs dinâmico, e a verdade incômoda das commodities brasileiras: soja e café protegem bem na B3, boi e açúcar quase não. A fundamentação da mesa de risco.",
    author: "AETERNUM QUANTITATIVE RISK TEAM",
    readTime: "16 min",
    isPublic: true,
    sections: [
      { type: "paragraph", content: "Autoria: GJO" },
      { type: "abstract", content: "O hedging é uma das aplicações mais práticas das finanças quantitativas no agronegócio. Para produtores, tradings, indústrias processadoras e fundos, reduzir a exposição à volatilidade de preços de soja, café, boi gordo, milho, açúcar e etanol é essencial. No entanto, a literatura revela uma verdade desconfortável: nem todo hedge é igualmente eficaz, especialmente nos mercados brasileiros." },
      { type: "heading", content: "Fundamentos teóricos do hedging" },
      { type: "paragraph", content: "O marco clássico é o minimum-variance hedge ratio, proposto por Ederington (1979). A razão ótima de hedge (h*) minimiza a variância do portfólio protegido:" },
      { type: "equation", content: "h^* = \\frac{\\text{Cov}(S, F)}{\\text{Var}(F)}" },
      { type: "paragraph", content: "onde S é o preço spot e F o preço do futuro. Essa razão é facilmente estimada por regressão OLS. Embora intuitivo, o modelo estático OLS assume que a relação spot-futuro é constante ao longo do tempo, hipótese frequentemente violada em commodities. Surgiram então modelos dinâmicos baseados em GARCH multivariado (BEKK, DCC, GO-GARCH), que permitem razões de hedge tempo-variantes." },
      { type: "heading", content: "Debate OLS vs. dinâmico" },
      { type: "paragraph", content: "Lien (2005) demonstrou que a métrica de efetividade de Ederington (R²) é viesada a favor do OLS. Diversos estudos empíricos (Wang, Wu & Yang, 2015; Lee & Yoder, 2011; Su & Wu, 2014) confirmam que, na maioria dos casos, o OLS estático iguala ou supera modelos GARCH dinâmicos na redução de variância out-of-sample. O ganho marginal dos modelos dinâmicos costuma ficar entre 0% e 2%. Quando o objetivo muda para a minimização de risco de cauda (CVaR ou VaR), modelos como DCC-GARCH e copula-DCC ganham relevância (Wang, Wu & Yang, 2015; Cotter & Hanly, 2012)." },
      { type: "heading", content: "A realidade brasileira: evidências da B3" },
      { type: "table", content: "", data: {
        headers: ["Commodity", "Modelo", "Razão ótima (h*)", "Efetividade (R²)", "Fonte"],
        rows: [
          ["Soja (PR)", "OLS", "—", "69,21%", "Jesus et al. (2021)"],
          ["Soja (PR)", "BEKK-GARCH", "0,26", "22,80%", "Jesus et al. (2021)"],
          ["Café Arábica", "OLS", "—", "45,85%", "Jesus et al. (2021)"],
          ["Café Arábica", "BEKK-GARCH", "0,61", "47,80%", "Jesus et al. (2021)"],
          ["Soja (MT)", "OLS", "0,499", "18,80%", "Souza et al. (2009)"],
          ["Boi Gordo", "OLS", "—", "0,31%", "Jesus et al. (2021)"],
          ["Boi Gordo", "BEKK-GARCH", "0,02", "0,06%", "Jesus et al. (2021)"],
          ["Açúcar Cristal", "OLS", "—", "1,50%", "Jesus et al. (2021)"],
          ["Etanol Hidratado", "OLS", "—", "14,54%", "Jesus et al. (2021)"],
          ["Milho", "OLS", "—", "5,60%", "Jesus et al. (2021)"]
        ]
      } },
      { type: "bullet-list", content: "", data: { items: [
        "Soja (especialmente Paraná) e Café Arábica apresentam hedge interno útil na B3, com redução de variância entre 45% e 70%.",
        "Boi Gordo, Açúcar, Etanol e Milho exibem risco de base elevado, com efetividade muito baixa (frequentemente abaixo de 10% a 15%): o futuro da B3 não acompanha bem o preço físico regional.",
        "O own-hedge na B3 para o complexo soja geralmente supera o cross-hedge com a CBOT (Silva, Aguiar & Lima, 2003).",
        "O tratamento de quebras estruturais (Zivot-Andrews, Bai-Perron) é crítico. Sem ele, a efetividade aparece artificialmente baixa."
      ] } },
      { type: "heading", content: "Recomendações práticas" },
      { type: "bullet-list", content: "", data: { items: [
        "Sempre comece com OLS estático: é simples, robusto e frequentemente competitivo.",
        "Para tail-risk: use DCC-GARCH ou copula-DCC quando o foco for CVaR/ES.",
        "Para commodities com baixa efetividade na B3: cross-hedge com contratos internacionais (Live Cattle, Sugar #11, Ethanol Platts), estratégias combinadas de basis trading e modelos com múltiplos instrumentos.",
        "Incorpore variáveis locais: preços físicos CEPEA, logística (Paranaguá), câmbio (PTAX) e calendário agrícola.",
        "Monitore a efetividade continuamente, usando janelas rolling, e reporte tanto a redução de variância quanto a redução de CVaR ao cliente."
      ] } },
      { type: "heading", content: "O diferencial brasileiro" },
      { type: "paragraph", content: "A literatura internacional sugere que hedges dinâmicos sofisticados nem sempre justificam sua complexidade. No Brasil, o maior ganho não virá necessariamente de modelos mais elaborados, mas de: melhor compreensão e modelagem do risco de base, integração de dados locais de alta qualidade (CEPEA, B3, CONAB) e adaptação ao calendário agrícola e às políticas públicas. Dominar o hedging real das commodities locais representa não apenas uma ferramenta de gestão de risco, mas uma vantagem competitiva concreta no mercado." },
      { type: "heading", content: "Referências" },
      { type: "bullet-list", content: "", data: { items: [
        "EDERINGTON, L. H. The hedging performance of the new futures markets. The Journal of Finance, v. 34, n. 1, p. 157-170, 1979.",
        "LIEN, D. The use and abuse of the hedging effectiveness measure. International Review of Financial Analysis, v. 14, n. 2, p. 277-282, 2005.",
        "WANG, Y.; WU, C.; YANG, L. Hedging with futures: does anything beat the naïve hedging strategy? Management Science, v. 61, n. 12, p. 2870-2889, 2015.",
        "COTTER, J.; HANLY, J. Reevaluating hedging performance for asymmetry: the case of crude oil. [verificar periodico/volume], 2006.",
        "JESUS, D. P. de; OLIVEIRA, A. F. de; MAIA, S. F. Hedge de commodities agropecuárias na B3. [verificar periodico/volume/paginas], 2021.",
        "SOUZA, W. A. R. de et al. Efetividade de hedge da soja em Mato Grosso. [verificar periodico/volume/paginas], 2009.",
        "SILVA, A. R. O. da; AGUIAR, D. R. D.; LIMA, J. E. de. Hedging com contratos futuros no complexo soja. [verificar periodico/volume/paginas], 2003.",
        "LEE, H.-T.; YODER, J. A bivariate Markov regime switching GARCH approach to estimate time-varying minimum variance hedge ratios. Applied Economics, 2011. [verificar volume/paginas]"
      ] } },
      { type: "paragraph", content: "Autoria: Olivieri, G. J. | Revisão: Furtado, G. C." }
    ]
  }

];

// shortPapers para o grid de artigos (inclui todos os papers acima)
export const shortPapers = [
  ...researchPapers,
  { id: "artigo-ma", date: "Jan 2021", tag: "Event-Driven", title: "M&A Cross-Border em Setores Regulados: Oportunidades e Riscos", desc: "Levantamento de 48 transações em setores regulados nos últimos 5 anos e sua correlação com retornos anormais.", author: "Analista de Arbitragem", readTime: "8 min", sections: [
    { type: "abstract" as const, content: "M&A em setores regulados apresentam distorções de preço que nossa mesa de Event-Driven explora com eficiência institucional." },
    { type: "paragraph" as const, content: "Este paper resume fatores observados em 48 transações mapeadas globalmente entre 2021 e 2025. O prêmio de risco captura as chances de veto por entidades reguladoras." }
  ] },
  { id: "artigo-iso", date: "Jul 2020", tag: "Finanças Digitais", title: "ISO 20022 e Infraestrutura de Pagamentos Institucionais", desc: "Como o novo padrão de mensageria financeira redefine liquidação, custódia e fluxos interbancários globais.", author: "Tech & Ops", readTime: "10 min", sections: [
    { type: "abstract" as const, content: "O padrão ISO 20022 oferece granularidade de dados sem precedentes, habilitando novos modelos de liquidação e reconciliação automática." },
    { type: "paragraph" as const, content: "A adoção por centrais interbancárias exige nova infraestrutura tecnológica que reduz custos de fricção transfronteiriça." }
  ] },
  { id: "artigo-diesel", date: "Fev 2020", tag: "Logística", title: "Influência do Diesel no Plantio Agrícola de Goiás", desc: "Correlação entre preço do diesel e custo de plantio no estado de Goiás: impacto direto na margem do produtor.", author: "Operação Brasil", readTime: "5 min", sections: [
    { type: "abstract" as const, content: "Nossos modelos quantitativos isolam o preço do diesel como o vetor de custo marginal mais expressivo no estado de Goiás para grãos." },
    { type: "paragraph" as const, content: "Através da análise de componentes principais (PCA), demonstramos que as oscilações de margem dos produtores goianos podem ser hedgiadas prevendo oscilações de combustíveis aliadas aos custos de frete rodoviário." }
  ] },
];
