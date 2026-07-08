import { NavLink } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import Disclosure from "../../components/common/Disclosure";
import { RouteSeo } from "../../lib/seo/RouteSeo";

/* ────────────────────────────────────────────────────────────
   Metadado de fonte, sobrio, ao pe de cada conteudo denso.
──────────────────────────────────────────────────────────── */
function SourceMeta({ referencia, confianca }: { referencia: string; confianca: string }) {
  return (
    <div className="mt-5 pt-3 border-t border-white/5 flex flex-wrap gap-x-6 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/45">
      <span>
        Referência: <span className="text-muted-foreground/70">{referencia}</span>
      </span>
      <span>
        Confiança: <span className="text-primary/60">{confianca}</span>
      </span>
    </div>
  );
}

/* Rotulo + titulo de secao, padrao da casa. */
function SectionHead({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <FadeIn>
      <p className="text-[10px] text-primary/70 tracking-[0.3em] uppercase mb-3">{eyebrow}</p>
      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-foreground tracking-wide uppercase mb-5 leading-tight">
        {title}
      </h2>
      {children}
    </FadeIn>
  );
}

/* ────────────────────────────────────────────────────────────
   DADOS (pesquisa verificada, com data de referencia)
──────────────────────────────────────────────────────────── */

const CAMADAS = [
  {
    rotulo: "Mensageria",
    titulo: "ISO 20022",
    frase: "A linguagem dos pagamentos. O Brasil já fala.",
  },
  {
    rotulo: "Liquidação",
    titulo: "Onde o valor se move",
    frase: "Quatro trilhos em disputa pela camada de liquidação.",
  },
  {
    rotulo: "Ativo",
    titulo: "Tokenização de RWA",
    frase: "Do bond soberano à CPR do produtor.",
  },
];

const TRILHOS = [
  {
    nome: "Stablecoins",
    volume: "~US$ 10,8 tri ajustados/ano",
    linha: "Onde o volume realmente está: ~US$ 400 bi cross-border/ano (BIS).",
    referencia: "Brutos 2025; ajuste pela metodologia Visa",
    confianca: "Alta",
    detalhe: (
      <p>
        USDC movimentou US$ 18,3 tri e USDT US$ 13,3 tri em volume bruto (2025). Ajustado pela
        metodologia da Visa, que remove bots e transferências internas, o total do ano fica em
        cerca de US$ 10,8 tri. Em junho de 2026, recorde de US$ 1,79 tri ajustado em um único mês.
        Leitura operacional: o USDT move mais transações (varejo, mercados emergentes), o USDC move
        mais dinheiro por transação (fluxo institucional).
      </p>
    ),
  },
  {
    nome: "Depósitos tokenizados",
    volume: "Kinexys (JPMorgan) ~US$ 3 bi/dia",
    linha: "O trilho que os bancos construíram para si.",
    referencia: "2025 / 2026 (JPMorgan)",
    confianca: "Alta",
    detalhe: (
      <p>
        A Kinexys (JPMorgan) liquida mais de US$ 3 bi por dia e acumula mais de US$ 3 tri desde o
        lançamento; o token JPMD foi levado à Base, uma blockchain pública. São três os pilares do
        dólar on-chain, com naturezas jurídicas distintas: o depósito tokenizado (claim contra o
        banco), a stablecoin (claim contra reservas segregadas) e o money market fund tokenizado
        (BUIDL, da BlackRock, cerca de US$ 3 bi, que é valor mobiliário). É o trilho que os grandes
        bancos ergueram para operar entre si.
      </p>
    ),
  },
  {
    nome: "CBDCs de atacado",
    volume: "mBridge ~US$ 55,5 bi vs Agorá",
    linha: "A bifurcação geopolítica: substituir o correspondente ou preservá-lo.",
    referencia: "out 2024 (BIS); Agorá no 1º sem 2026",
    confianca: "Média-alta (número do mBridge merece dupla checagem)",
    detalhe: (
      <p>
        O BIS graduou-se para fora do mBridge em outubro de 2024, em meio a preocupação com evasão
        de sanções. O mBridge virou trilho de liquidação em renminbi entre a China e o Golfo (cerca
        de US$ 55,5 bi movimentados, aproximadamente 95% em yuan digital, sem bancos centrais
        ocidentais). O Project Agorá segue o caminho oposto: preserva o correspondent banking
        tokenizando depósitos de bancos comerciais (G7 ampliado e SWIFT), com resultados esperados
        para o 1º semestre de 2026. A distinção estrutural é nítida: o mBridge substitui o
        correspondente, o Agorá o preserva. Pano de fundo: os fluxos cross-border somaram cerca de
        US$ 195 tri em 2024.
      </p>
    ),
  },
  {
    nome: "Interligação de instantâneos",
    volume: "Project Nexus, liquidação em ~60s",
    linha: "O Pix internacional. O único trilho em que o Brasil tem assento natural.",
    referencia: "Desenho consolidado; cronograma em aberto",
    confianca: "Alta no desenho, baixa em cronograma",
    detalhe: (
      <p>
        O Project Nexus conecta sistemas de pagamento instantâneo domésticos (Malásia, Singapura e a
        Zona do Euro via Itália; Brasil como observador), com liquidação em cerca de 60 segundos. É
        nativamente ISO 20022, o que dá ao Pix um encaixe direto. É o terceiro modelo arquitetural
        da liquidação cross-border, ao lado de mBridge e Agorá, e o único em que o Brasil tem
        assento natural. Ainda sem data oficial de lançamento.
      </p>
    ),
  },
];

const MARCOS = [
  {
    data: "10 nov 2025",
    titulo: "BCB publica as Resoluções 519, 520 e 521",
    detalhe:
      "Regulamentam a Lei 14.478/2022. A 519 trata da autorização das prestadoras de serviços de ativos virtuais. A 520 cuida da constituição e do funcionamento (intermediárias, custodiantes, corretoras). A 521 inclui os ativos virtuais nas normas do mercado de câmbio.",
  },
  {
    data: "2 fev 2026",
    titulo: "As regras entram em vigor",
    detalhe:
      "Passa a valer o arcabouço das três resoluções para as prestadoras que buscam autorização de funcionamento.",
  },
  {
    data: "4 mai 2026",
    titulo: "Normas de câmbio passam a valer",
    detalhe:
      "Entra o reporte mensal detalhado ao BCB, com travel rule e identificação dos titulares de carteiras.",
  },
  {
    data: "jul 2026",
    titulo: "DeCripto (IN RFB 2.291)",
    detalhe:
      "A Instrução Normativa da Receita Federal alinha o Brasil ao CARF/OCDE de troca de informações sobre ativos virtuais.",
  },
  {
    data: "30 out 2026",
    titulo: "Trava de contrapartes",
    detalhe:
      "Instituições autorizadas ficam proibidas de operar ativos virtuais com contrapartes não autorizadas no Brasil.",
  },
];

/* ────────────────────────────────────────────────────────────
   PAGINA
──────────────────────────────────────────────────────────── */
export default function PagamentosGlobais() {
  return (
    <main className="pt-14 min-h-screen bg-[#0A0A0A]">
      <RouteSeo
        title="Pagamentos Globais"
        fullTitle="Pagamentos Globais · Aeternum Aurum Partners"
        description="A reconfiguração da infraestrutura de pagamentos em três camadas: mensageria (ISO 20022), liquidação (stablecoins, depósitos tokenizados, CBDCs, Nexus) e ativo (tokenização de RWA), com a janela regulatória brasileira de 2026."
        path="/pagamentos-globais"
      />

      {/* ═══════════════ HERO (PASSO 3) ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="relative z-10 max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">
              Infraestrutura de liquidação global
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground uppercase tracking-widest mb-5 leading-tight">
              Pagamentos <span className="text-primary">Globais</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light max-w-2xl">
              A maior reconfiguração da infraestrutura de pagamentos em décadas, organizada em três
              camadas.
            </p>
          </FadeIn>

          {/* Três camadas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12">
            {CAMADAS.map((c, i) => (
              <FadeIn key={c.rotulo} delay={0.1 + i * 0.08}>
                <div className="h-full bg-[#1C1C1C]/40 border border-[#C6A85A]/10 rounded-sm p-5 hover:border-[#C6A85A]/30 transition-colors">
                  <p className="text-[9px] text-primary/60 tracking-[0.3em] uppercase mb-3">
                    {c.rotulo}
                  </p>
                  <h3 className="font-display text-lg sm:text-xl text-foreground tracking-wide mb-2 leading-snug">
                    {c.titulo}
                  </h3>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">
                    {c.frase}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ O BRASIL JÁ FALA ISO 20022 (PASSO 4) ═══════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <SectionHead eyebrow="Camada de mensageria" title="O Brasil já fala ISO 20022">
            <p className="text-foreground/90 text-base sm:text-lg leading-relaxed font-light mb-3">
              A empresa brasileira não precisa se preparar para o ISO 20022. Ela já opera sobre ele
              via Pix.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
              O Pix é nativamente ISO 20022 desde o desenho (BCB, 2016). O mundo chegou lá em
              novembro de 2025, quando a SWIFT encerrou a coexistência MT/MX para pagamentos
              cross-border.
            </p>
          </SectionHead>

          <FadeIn delay={0.1}>
            <div className="mt-8">
              <Disclosure
                title="Por que o padrão é camada de dados, não só de transporte"
                subtitle="O estudo do BCB de 2016, a arquitetura dividida do sistema brasileiro e a escala da mensagem."
              >
                <ul className="space-y-3 list-none">
                  <li>
                    O estudo do BCB de junho de 2016 (grupo SG-ISO20022-TF) embasou o uso de ISO
                    20022 no SPI, o sistema que viria a operar o Pix.
                  </li>
                  <li>
                    A arquitetura é curiosa: o varejo instantâneo (Pix) nasce nativo em ISO 20022,
                    convivendo com o atacado (STR) ainda em formato proprietário.
                  </li>
                  <li>
                    A escala do padrão salta de cerca de 100 para cerca de 9.000 caracteres por
                    mensagem, com mais de 750 componentes de negócio e mais de 1.900 definições de
                    mensagem. É camada de dados, não só de transporte.
                  </li>
                </ul>
                <SourceMeta
                  referencia="2016 (estudo BCB) / nov 2025 (SWIFT)"
                  confianca="Alta (documentos primários BCB e SWIFT)"
                />
              </Disclosure>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ CAUSA RAIZ (PASSO 5) ═══════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <SectionHead eyebrow="A causa raiz" title="Um vácuo a preencher">
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
              Tudo isto existe para preencher um vácuo: o correspondent banking encolheu cerca de 20
              a 30% desde 2011, e a América Latina foi a região mais afetada.
            </p>
          </SectionHead>

          <FadeIn delay={0.1}>
            <div className="mt-8">
              <Disclosure
                title="O tamanho do encolhimento e suas consequências"
                subtitle="Números do BIS/CPMI e do FSB, e por que as respostas convergem para o mesmo ponto."
              >
                <ul className="space-y-3 list-none">
                  <li>
                    Queda de cerca de 22% já em 2020 (CPMI/BIS); a BAFT estima cerca de 29%
                    acumulados em 2025. O motor é o custo de compliance AML/CFT.
                  </li>
                  <li>
                    Consequência direta: apenas 35% dos pagamentos cross-border de varejo cumpriam a
                    meta do G20 (crédito em uma hora) em 2025, contra a meta de 75% até 2027 (FSB).
                  </li>
                  <li>
                    Em paralelo, o CIPS chinês já conectava instituições em 119 países (março de
                    2025).
                  </li>
                  <li className="text-foreground/80">
                    Stablecoins, Nexus, mBridge, Agorá e depósitos tokenizados são todos respostas ao
                    mesmo vácuo.
                  </li>
                </ul>
                <SourceMeta
                  referencia="2020/2025 (BIS, CPMI, FSB); BAFT como secundária"
                  confianca="Alta (BIS/CPMI/FSB primários); BAFT secundário"
                />
              </Disclosure>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ OS QUATRO TRILHOS (PASSO 6) ═══════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <SectionHead
            eyebrow="Camada de liquidação"
            title="Os quatro trilhos da liquidação"
          >
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
              Quatro trilhos disputam hoje a camada onde o valor efetivamente se move. Cada card
              abre para o detalhe verificado.
            </p>
          </SectionHead>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-8">
            {TRILHOS.map((t, i) => (
              <FadeIn key={t.nome} delay={0.05 + i * 0.06}>
                <Disclosure
                  className="h-full"
                  title={
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span>{t.nome}</span>
                      <span className="font-sans text-[11px] tracking-wide text-primary/70 font-normal normal-case">
                        {t.volume}
                      </span>
                    </span>
                  }
                  subtitle={t.linha}
                >
                  {t.detalhe}
                  <SourceMeta referencia={t.referencia} confianca={t.confianca} />
                </Disclosure>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ JANELA REGULATÓRIA 2026 (PASSO 7) ═══════════════ */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <SectionHead
            eyebrow="Marco regulatório brasileiro"
            title="A janela de adequação de 2026"
          >
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light">
              Entre fevereiro e outubro de 2026 há uma corrida de adequação. É o vão entre a
              regulação e a implementação que uma casa de software e ciência de dados preenche.
            </p>
          </SectionHead>

          {/* Timeline: cada marco expansivel */}
          <div className="mt-8 space-y-3">
            {MARCOS.map((m, i) => (
              <FadeIn key={m.data} delay={0.04 * i}>
                <Disclosure
                  title={
                    <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="font-sans text-[11px] tracking-[0.2em] uppercase text-primary/70 font-normal">
                        {m.data}
                      </span>
                      <span>{m.titulo}</span>
                    </span>
                  }
                >
                  <p>{m.detalhe}</p>
                </Disclosure>
              </FadeIn>
            ))}
          </div>

          {/* O que muda para o cliente */}
          <FadeIn delay={0.1}>
            <div className="mt-6">
              <Disclosure
                defaultOpen
                title="O que muda para o cliente"
                subtitle="Operações que passam a ser câmbio, a nuance que a versão idealizada omite, a prova nos dados da Receita e o reposicionamento do Drex."
              >
                <div className="space-y-5">
                  <div>
                    <p className="text-foreground/85 mb-1">Passam a ser câmbio</p>
                    <p>
                      Pagamentos e transferências internacionais com ativos virtuais, quitar despesa
                      no exterior com cripto, e compra, venda ou troca de stablecoins. Limites de US$
                      100 mil (US$ 500 mil para corretoras e DTVMs). Capital mínimo das prestadoras:
                      de R$ 10,8 mi a R$ 37,2 mi.
                    </p>
                  </div>
                  <div>
                    <p className="text-primary/80 mb-1">A nuance que a versão idealizada omite</p>
                    <p>
                      Usar stablecoin não elimina a obrigação cambial na conversão para reais (Lei
                      14.286). A operação de câmbio ainda passa por instituição autorizada.
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/85 mb-1">A prova doméstica (Receita Federal, jun/jul 2026)</p>
                    <p>
                      Cerca de R$ 1,58 tri declarados em cripto (agosto de 2019 a dezembro de 2025),
                      dos quais R$ 1,13 tri (71,7%) em stablecoins; o USDT responde por 88,7% do
                      volume em stablecoin. A dolarização digital via stablecoin não é tendência
                      futura no Brasil, é fato consumado nos dados da Receita.
                    </p>
                  </div>
                  <div>
                    <p className="text-foreground/85 mb-1">Drex reposicionado (nov 2025)</p>
                    <p>
                      A plataforma Besu foi desativada, o foco mudou para reconciliação de gravames e
                      garantias, os pagamentos deixaram de ser prioridade e a integração
                      internacional foi adiada. A narrativa de Drex como trilho de exportação em
                      breve está morta no curto prazo.
                    </p>
                  </div>
                </div>
                <SourceMeta
                  referencia="Normas publicadas (BCB) e dado oficial da Receita Federal, 2025/2026"
                  confianca="Alta (normas publicadas, dado oficial da Receita)"
                />
              </Disclosure>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════════ FECHO + CTA + COMPLIANCE (PASSO 8) ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px shimmer-line" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(198,167,92,0.04)_0%,transparent_60%)] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto">
          <FadeIn direction="none">
            <p className="text-[10px] text-primary/70 tracking-[0.3em] uppercase mb-3 text-center">
              Posição estratégica
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-wide uppercase mb-6 text-center leading-tight">
              Quem se alinha agora, lidera
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light mb-6">
              As três camadas (mensageria, liquidação e ativo) e a janela de adequação de 2026
              desenham um mesmo trabalho: transformar norma publicada em operação rodando. A Aeternum
              atua como integradora e viabilizadora técnica em três frentes operacionais.
            </p>

            <ul className="space-y-3 mb-8">
              {[
                "Leitura e estruturação de dados ISO 20022, o padrão que o Pix já fala e que o mundo adotou.",
                "Desenho de operação de liquidação dentro do marco das Resoluções 519, 520 e 521.",
                "Estruturação e análise quantitativa de ativos tokenizados, em diálogo com a série de artigos de risco da Pesquisa.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-sm text-muted-foreground font-light leading-relaxed">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary/60" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="text-foreground/80 text-sm sm:text-base leading-relaxed font-light mb-10">
              O benefício é sempre operacional: pagar, liquidar, colateralizar e tokenizar com menos
              atrito e mais rastreabilidade.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink
                to="/acesso"
                className="px-8 py-3 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 btn-glow relative overflow-hidden flex items-center gap-2 group"
              >
                <span className="relative z-10">Solicitar acesso</span>
                <ArrowRight className="w-3 h-3 relative z-10 group-hover:translate-x-0.5 transition-transform" />
              </NavLink>
              <NavLink
                to="/research/pagamentos-transfronteiricos-ledgers"
                className="px-8 py-3 border border-white/10 text-muted-foreground text-[10px] tracking-[0.25em] uppercase font-sans hover:border-white/25 hover:text-foreground transition-all duration-300 flex items-center gap-2 group"
              >
                <span>Fundamentação completa na Pesquisa</span>
                <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </NavLink>
            </div>
          </FadeIn>

          {/* Rodapé de compliance (obrigatório) */}
          <FadeIn delay={0.15}>
            <div className="mt-16 pt-6 border-t border-white/5">
              <p className="text-[11px] text-muted-foreground/50 font-light leading-relaxed text-center max-w-2xl mx-auto">
                Esta página apresenta tecnologia, infraestrutura e casos de uso. Não constitui
                recomendação de investimento. Os benefícios descritos são operacionais (pagar,
                liquidar, colateralizar, tokenizar), não financeiro-especulativos. Dados com data de
                referência indicada; fontes primárias quando disponíveis.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
