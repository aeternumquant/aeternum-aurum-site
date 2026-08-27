/**
 * escadaTexts.ts — o CONTEUDO da "isca explicada" do terminal (a escada publica:
 * MAPA -> TERMINAL -> PESQUISA). Um texto curto por commodity, exibido no FIM do
 * card (depois dos graficos e do editorial) pelo <EscadaTextBlock>, com "ler mais"
 * -> Pesquisa.
 *
 * A chave e a MESMA de assets.ts (AssetDef.key) — 'Soja', 'Cafe', 'Ouro'...
 *
 * A FORMA do texto (definida com o Gabriel): (1) o que o dado e (X anos, desde
 * 199X, fonte primaria); (2) por que serve ao produtor / a tesouraria; (3) a ponte
 * para o modelo (insumo de hedge dinamico / regimes de mercado / gestao de risco).
 *
 * COMPLIANCE: educativo sobre o DADO, nunca recomendacao de investimento nem
 * promessa de retorno. Beneficio OPERACIONAL, nao financeiro.
 *
 * TEXTOS APROVADOS pelo Gabriel, gravados VERBATIM (nao reescrever nem "melhorar").
 * Onde a chave NAO existe aqui, o bloco NAO aparece (o componente retorna null) —
 * nao inventar texto, nao mostrar placeholder. Adicionar uma commodity = adicionar
 * sua chave aqui.
 */
export const TERMINAL_TEXTS: Record<string, string> = {
  // ── AGRO ──
  Soja:
    "Três décadas de preço e fluxo de exportação da soja, desde 1997, de fonte primária (B3, MDIC/Secex, World Bank). A série longa revela os ciclos e a sazonalidade que um único ano esconde: quando o prêmio se abre, como o mercado reagiu a cada choque de safra e câmbio. É o insumo bruto para modelar regimes de mercado e estruturar hedge dinâmico sobre a exposição física do produtor.",
  Milho:
    "Trinta anos de preço e comércio do milho, desde 1997, de fonte primária (B3, MDIC/Secex). O milho é ao mesmo tempo grão de exportação e insumo: ele forma o custo da ração que alimenta frango, suíno e boi confinado, e alimenta a indústria de etanol no Centro-Oeste, o que faz seu preço atravessar três cadeias ao mesmo tempo. A série longa mostra como a segunda safra reorganizou a sazonalidade do mercado brasileiro, e é o ponto de partida para modelar o custo de produção de quem compra milho e a receita de quem vende.",
  Cafe:
    "Três décadas de preço e exportação do café, desde 1997, com o contrato futuro da B3 e as referências internacionais de arábica e robusta. O café é a commodity em que o clima brasileiro move o preço mundial: uma geada ou uma seca no Sudeste reprecifica o mercado inteiro, e o spread entre arábica e conilon mostra quando os dois mercados se descolam. A série longa registra cada um desses episódios, o que a torna a base natural para estudar regimes de preço e dimensionar proteção contra choque de oferta.",
  BoiGordo:
    "Trinta anos de preço da arroba e de exportação de carne bovina, desde 1997, somados ao efetivo do rebanho nacional (IBGE). O ciclo pecuário é longo: a decisão de reter ou liberar matrizes hoje aparece no preço anos depois, e o custo do confinamento acompanha o milho. A série longa é o que permite enxergar esse ciclo inteiro em vez de um trecho dele, e é o insumo para modelar o valor do plantel e a exposição de quem vive da arroba.",
  Trigo:
    "Trinta anos de comércio do trigo, desde 1997, de fonte primária (MDIC/Secex), com a referência de preço internacional. O Brasil é importador estrutural de trigo: a série longa mostra de onde vem o grão a cada período e como a origem se desloca conforme a safra da Argentina, o câmbio e as tensões geopolíticas que afetam o Mar Negro. Para o moinho e para a indústria, essa é uma exposição dupla, ao preço em dólar e ao câmbio, e é sobre ela que se constrói qualquer proteção de custo.",
  Algodao:
    "Três décadas de preço e exportação do algodão, desde 1997, de fonte primária. O dado de comércio acompanha a pluma, não o caroço, o que importa porque são produtos e mercados distintos saídos da mesma lavoura. A série longa registra a transformação do Brasil de importador em um dos maiores exportadores do mundo, e mostra como o preço responde ao ciclo da indústria têxtil asiática. É a base para dimensionar a exposição de quem planta e de quem processa.",
  Acucar:
    "Trinta anos de preço e exportação do açúcar, desde 1997, de fonte primária. O açúcar carrega uma decisão que nenhuma outra commodity tem: a mesma cana pode virar açúcar ou etanol, e a usina escolhe conforme a relação entre os dois preços, que por sua vez segue a gasolina e o petróleo. A série longa mostra esse pêndulo funcionando ao longo de décadas, e é o insumo para modelar a margem de quem opera nos dois mercados ao mesmo tempo.",
  Arroz:
    "Três décadas de comércio do arroz, desde 1997, de fonte primária, com as referências internacionais do grão branqueado e do quebrado. Diferente da soja e do milho, o arroz brasileiro é sobretudo mercado interno, com produção concentrada no Sul, e o preço internacional funciona como teto e piso da importação quando a safra local aperta. A série longa mostra quando essas janelas se abriram, o que ajuda a antecipar pressão de custo na cadeia.",
  Celulose:
    "A celulose é um dos maiores fluxos de exportação do Brasil e não tem cotação pública no nosso banco, porque o mercado negocia em contratos de longo prazo e índices privados de assinatura, não em bolsa aberta. O que se observa é o volume, e a série de trinta anos conta uma história de escala: a produção brasileira de fibra curta multiplicou-se ao longo do período, apoiada em ciclo de floresta e capex de maturação longa. Para quem opera nessa cadeia, o dado relevante não é a variação diária de preço, é o ritmo de expansão da capacidade e o destino do embarque, que é onde a China pesa. É sobre esse fluxo que se constrói qualquer leitura de exposição da cadeia florestal.",

  // ── MINÉRIOS ──
  Niobio:
    "O nióbio é a commodity em que o Brasil não é um participante do mercado, é praticamente o mercado inteiro: os levantamentos do USGS colocam o país com a quase totalidade da produção mundial. Por isso ele não tem cotação pública de bolsa, e essa ausência não é falha do dado, é a natureza do ativo: sem múltiplos vendedores disputando preço num pregão, a precificação acontece em contrato bilateral, entre a mineradora e a siderurgia que precisa da liga. O que se pode observar publicamente é o fluxo, o quanto sai do país e para onde, e a série de trinta anos mostra essa dependência global se consolidando. Para quem estuda risco de suprimento, o nióbio é o caso extremo: um insumo crítico do aço de alta resistência cuja oferta está concentrada num único país, o que faz dele um exercício de concentração de risco, não de volatilidade de preço.",

  // ── FERTILIZANTES ──
  Enxofre:
    "O enxofre não aparece nas manchetes, mas atravessa a agricultura brasileira: ele é insumo do ácido sulfúrico que produz o fertilizante fosfatado, e o Brasil importa a maior parte do que consome. Não há cotação pública no nosso banco porque o produto é majoritariamente subproduto do refino de petróleo e do processamento de gás, negociado entre indústrias, não em pregão. A série longa de importação mostra a dependência externa se firmando, e é um indicador antecedente do custo do fertilizante que chega à lavoura. Quem modela custo de produção agrícola encontra aqui o começo da cadeia.",
};
