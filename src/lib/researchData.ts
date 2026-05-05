export interface ResearchSection {
  type: "abstract" | "heading" | "paragraph" | "callout" | "table" | "chart-placeholder" | "stat-grid" | "bullet-list";
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
    tag: "Risco",
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
