import { useState } from "react";
import { Link } from "react-router-dom";
import FrameworkSection from "../components/common/Framework";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
import MacroRiskModels from "../components/common/MacroRiskModels";
import ZonaPiloto from "../components/common/ZonaPiloto";
import { RouteSeo } from "../lib/seo/RouteSeo";

const steps = [
  {
    num: "01",
    title: "Diagnóstico",
    subtitle: "Mapeamento da exposição atual.",
    desc: "Levantamento completo das exposições do cliente: commodities, câmbio, contratos a termo, basis, marcação a mercado, contratos de crédito. Identificação dos riscos materiais e da janela de decisão típica da tesouraria.",
    entregavel: "Diagnóstico de exposição em documento auditável, com mapa de riscos e prioridades.",
  },
  {
    num: "02",
    title: "Modelagem Adaptativa",
    subtitle: "Calibração ao caso específico.",
    desc: "Aplicação dos modelos quantitativos peer-reviewed ao contexto do cliente. Calibração local com dados próprios da operação, séries de mercado relevantes e tratamento de quebras estruturais. Validação por backtesting antes da implantação.",
    entregavel: "Modelos calibrados e validados, com relatório de aceitação técnica.",
  },
  {
    num: "03",
    title: "Implantação",
    subtitle: "Integração ao fluxo de tesouraria.",
    desc: "Instalação da plataforma na infraestrutura do cliente. Integração com sistemas internos (ERP, sistemas de tesouraria, planilhas de risco). Treinamento da equipe interna no uso diário do painel, dos alertas e da leitura dos modelos.",
    entregavel: "Plataforma operacional, equipe treinada, documentação técnica completa.",
  },
  {
    num: "04",
    title: "Acompanhamento",
    subtitle: "Manutenção contínua e revisão de modelos.",
    desc: "Atualização contínua dos modelos conforme mudanças de regime e novas evidências da literatura. Suporte técnico à equipe interna, revisões periódicas dos calibradores e relatórios de desempenho dos alertas. Decisão de operação permanece com a tesouraria do cliente.",
    entregavel: "Relatórios periódicos, suporte técnico ativo, revisão semestral dos modelos.",
  },
];

const streams = [
  { icon: "◈", label: "Redes de Televisão Globais", desc: "CNN, Bloomberg, Reuters. Captura de eventos de alto impacto antes da digestão pelo mercado." },
  { icon: "◈", label: "Desenvolvimentos Militares", desc: "Movimentos de tropas, escaladas e sanções monitorados como preditores de prêmio de risco em commodities e câmbio." },
  { icon: "◈", label: "Anúncios Macroeconômicos", desc: "Fed, BCE, OPEP. Leitura antecipada de fluxos de liquidez e reposicionamento institucional." },
  { icon: "◈", label: "Choques de Oferta em Commodities", desc: "Estoques do EIA, dados CFTC, relatórios de safra USDA. Identificação de desequilíbrios estruturais." },
  { icon: "◈", label: "Geopolítica & Diplomacia", desc: "Sanções, acordos bilaterais e tensões regionais convertidos em sinais de posicionamento para o portfólio." },
  { icon: "◈", label: "Fluxos de Capital Institucional", desc: "Posicionamento de fundos soberanos, hedge funds e bancos centrais via dados de custódia e prime brokers." },
];

const scienceModels = [
  {
    categoria: "Risco de cauda",
    detalhe: "GARCH-EVT (McNeil & Frey, 2000, Journal of Empirical Finance), com extensões assimétricas EGARCH-EVT e FIAPARCH-EVT. Backtesting: Kupiec (cobertura incondicional), Christoffersen (cobertura condicional e independência), Acerbi-Szekely Z1/Z2/Z3 para Expected Shortfall. Aplicação: VaR/ES 97.5% para portfólios expostos a commodities, câmbio e renda variável.",
  },
  {
    categoria: "Previsão de volatilidade",
    detalhe: "HAR-RV (Corsi, 2009, Journal of Financial Econometrics) como benchmark de referência. EGARCH e FIGARCH para mercados assimétricos. REGARCH-Jump para séries com saltos. Comparação out-of-sample via QLIKE, MSE e Diebold-Mariano. Ensembles com machine learning quando há ganho líquido após custos de transação.",
  },
  {
    categoria: "Dependência entre ativos",
    detalhe: "Copulas tempo-variantes (DCC, GAS) para risco sistêmico e spillovers. Vine copulas para portfólios de mais de três ativos. CoVaR e ΔCoVaR (Adrian & Brunnermeier, 2016, American Economic Review) para medidas canônicas de risco sistêmico. Aplicação direta no spillover petróleo-agricultura relevante para o agronegócio brasileiro.",
  },
  {
    categoria: "Construção de portfólio",
    detalhe: "Otimização CVaR (Rockafellar & Uryasev, 2002, Journal of Banking & Finance) como medida coerente de risco. Risk Parity (Maillard, Roncalli & Teiletche, 2010) e Hierarchical Risk Parity (López de Prado, 2016). Validação via Combinatorial Purged Cross-Validation com Deflated Sharpe Ratio (Bailey & López de Prado, 2014) como métrica de aceitação.",
  },
];

function ScienceCard({ model, index }: { model: typeof scienceModels[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <FadeIn delay={index * 0.08} direction="up">
      <div className="border border-white/8 bg-card/40 hover:border-primary/20 transition-colors">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="w-full flex items-center justify-between gap-4 p-5 text-left"
        >
          <span className="font-display text-base text-foreground tracking-wide">{model.categoria}</span>
          <span className={`text-primary/60 text-xl leading-none transition-transform duration-300 ${open ? "rotate-45" : ""}`}>+</span>
        </button>
        {open && (
          <div className="px-5 pb-5 -mt-1">
            <p className="text-muted-foreground text-xs leading-relaxed mb-4">{model.detalhe}</p>
            <Link to="/research" className="text-primary/80 hover:text-primary text-xs tracking-wide transition-colors">
              Ver fundamentação completa →
            </Link>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

export default function FrameworkPage() {
  return (
    <main className="pt-14 min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      <RouteSeo
        title="Framework"
        description="Arquitetura quantitativa em quatro pilares: Foundation Models, Engenharia de Volatilidade, Inferência Bayesiana e Derivativos Climáticos. Plataforma de tecnologia para clientes institucionais."
        path="/framework"
      />
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Tecnologia Aplicada</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Soluções</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">A Aeternum Aurum constrói a ponte tecnológica entre o cliente brasileiro e a infraestrutura financeira global. Holdings, indústrias, tesourarias corporativas e instituições parceiras usam os nossos modelos quantitativos para decidir sobre risco e capital com o mesmo rigor matemático que move as maiores mesas institucionais do mundo.</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BLOCO 2 — AS TRÊS FRENTES
          O que a plataforma entrega: três frentes de atuação
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
              Frentes de atuação
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-primary uppercase tracking-widest mb-4 text-center">
              O que entregamos
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-primary to-primary/10 mx-auto mb-12" />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                titulo: "Inteligência Quantitativa",
                subtitulo: "Leitura macro e modelagem de ciclos.",
                descricao: "Análise sistemática de fluxos globais de capital, política monetária, ciclos de commodities e choques de oferta. Os modelos são fundamentados em literatura científica peer-reviewed e calibrados para o mercado brasileiro.",
                paraQuem: "Para quem precisa ler o cenário antes de tomar a próxima decisão de capital.",
                selo: false,
              },
              {
                titulo: "Plataforma de Risco",
                subtitulo: "Painel quantitativo em tempo real.",
                descricao: "Software de inteligência de risco que traduz preço, câmbio, basis e marcação a mercado em um painel claro. O cliente acompanha sua exposição em tempo real e recebe alertas quando os modelos identificam mudança relevante no risco.",
                paraQuem: "Para tesourarias, mesas e operadores que precisam decidir sobre risco com base quantitativa, todos os dias.",
                selo: false,
              },
              {
                titulo: "Consultoria Institucional",
                subtitulo: "Integração da plataforma à sua operação.",
                descricao: "Implantação da inteligência quantitativa dentro da tesouraria do cliente. Diagnóstico da exposição, modelagem dos riscos específicos da empresa, integração da plataforma ao fluxo interno de decisão e acompanhamento contínuo da equipe.",
                paraQuem: "Para grandes empresas que querem inteligência de risco moderna integrada à sua estrutura de capital, não como ferramenta avulsa.",
                selo: true,
              },
            ].map((frente, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="border border-white/8 bg-card/40 p-6 h-full hover:border-primary/20 transition-colors relative flex flex-col">
                  {frente.selo && (
                    <span className="absolute top-4 right-4 text-[8px] tracking-[0.2em] uppercase text-primary/80 border border-primary/40 rounded-full px-2.5 py-1">
                      Serviço Dedicado
                    </span>
                  )}
                  <h3 className="font-display text-base text-foreground tracking-wide mb-1.5 pr-24">
                    {frente.titulo}
                  </h3>
                  <p className="text-primary/70 text-xs tracking-wide mb-4">{frente.subtitulo}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-grow">{frente.descricao}</p>
                  <p className="text-muted-foreground/70 text-xs leading-relaxed italic border-t border-white/5 pt-4">
                    {frente.paraQuem}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BLOCO 3 — A ESPINHA CIENTÍFICA
          Fundamentação peer-reviewed dos modelos da plataforma
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/15">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
              Fundamentação
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-primary uppercase tracking-widest mb-4 text-center">
              A ciência por trás da plataforma
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-primary to-primary/10 mx-auto mb-10" />
            <p
              className="font-display text-2xl sm:text-3xl text-center mb-8 leading-snug"
              style={{ color: "rgba(198,168,90,0.90)", fontWeight: 500 }}
            >
              Inevitabilidade Matemática Aplicada.
            </p>
            <p className="text-muted-foreground text-base leading-relaxed text-center max-w-2xl mx-auto mb-10">
              Não inventamos teoria. Aplicamos, com rigor, o que a fronteira da pesquisa já validou.
              A Aeternum trabalha com modelos consolidados na literatura científica internacional,
              peer-reviewed em periódicos como Journal of Financial Economics, Journal of Banking
              &amp; Finance, Energy Economics e Mathematical Finance.
            </p>
          </FadeIn>

          {/* Camada 1: em superfície */}
          <FadeIn delay={0.1}>
            <div className="border border-primary/15 bg-primary/3 p-5 mb-8 text-center">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Os modelos centrais cobrem risco de cauda, previsão de volatilidade, dependência
                entre ativos e construção de portfólio.
              </p>
            </div>
          </FadeIn>

          {/* Camada 2: 4 cards expandíveis */}
          <div className="space-y-3 mb-10">
            {scienceModels.map((model, i) => (
              <ScienceCard key={i} model={model} index={i} />
            ))}
          </div>

          {/* Fechamento */}
          <FadeIn delay={0.2}>
            <p className="text-muted-foreground text-sm leading-relaxed text-center max-w-2xl mx-auto">
              Cada modelo carrega referência ao paper e à janela em que foi validado. Quando a
              literatura diverge, mostramos a divergência e indicamos a evidência que sustenta nossa
              escolha metodológica. Modelos consolidados nas maiores mesas institucionais do mundo,
              agora calibrados para o solo brasileiro. Esse é o piso técnico da plataforma.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          RESUMO PARA O PÚBLICO — LINGUAGEM ACESSÍVEL
          Posicionado logo após o hero, antes dos passos técnicos
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/15">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
              Entendendo a Plataforma
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-primary uppercase tracking-widest mb-4 text-center">
              Em Linguagem Simples
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-primary to-primary/10 mx-auto mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed text-center max-w-2xl mx-auto mb-12">
              Você não precisa ser matemático ou economista para entender o que fazemos.
              Aqui está o que a Aeternum Aurum faz, explicado de forma direta.
            </p>
          </FadeIn>

          {/* 4 Conceitos em Linguagem Simples */}
          <div className="grid sm:grid-cols-2 gap-5 mb-12">
            {[
              {
                icone: "◆",
                titulo: "O que é o 'medo do mercado' e por que importa?",
                corpo: `Existe um indicador chamado VIX — chamamos de "termômetro do medo". Quando está alto,
                  os grandes investidores estão com medo. Quando está baixo, estão confiantes demais.
                  Ambos os extremos criam oportunidades. A Aeternum lê esse termômetro antes de qualquer decisão.`,
              },
              {
                icone: "◆",
                titulo: "Por que dados valem mais que opiniões?",
                corpo: `Um analista pode estar certo ou errado. Dados de posicionamento de mercado mostram
                  o que as pessoas realmente estão fazendo com seu dinheiro — não o que elas falam.
                  Nosso sistema lê essas "pegadas digitais" e toma decisões baseadas em fatos, não em narrativas.`,
              },
              {
                icone: "◆",
                titulo: "Como protegemos seu capital em crises?",
                corpo: `Usamos um sistema de proteção chamado hedge — como um seguro para seu investimento.
                  Quando identificamos risco crescendo (o VIX subindo, por exemplo), compramos proteção
                  preventiva. É o equivalente a colocar um seguro no carro antes de sair na chuva forte.`,
              },
              {
                icone: "◆",
                titulo: "O que significa 'quantitativo' na prática?",
                corpo: `Significa que todas as nossas decisões têm número. Em vez de dizer "achamos que soja vai
                  subir", dizemos "há 68% de probabilidade de soja entre R$128 e R$148 nos próximos 30 dias,
                  baseado em dados de opções, estoques e sazonalidade". Isso permite tamanhar o risco corretamente.`,
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="border border-white/8 bg-card/40 p-6 h-full hover:border-primary/20 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-primary/50 text-xs mt-0.5 flex-shrink-0">{item.icone}</span>
                    <h3 className="font-display text-sm text-foreground tracking-wide leading-snug">
                      {item.titulo}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.corpo}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 5 Princípios — Bloco 4 */}
          <FadeIn delay={0.4}>
            <div className="border border-primary/15 bg-primary/3 p-6">
              <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
                Princípios
              </p>
              <h3 className="font-display text-base sm:text-lg text-primary uppercase tracking-wider mb-8 text-center">
                Cinco princípios que orientam toda decisão
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { num: "I", titulo: "Dados primeiro, sempre", corpo: "Toda decisão parte do dado, não da opinião. A intuição entra depois, calibrada pelo modelo, nunca antes." },
                  { num: "II", titulo: "Risco definido antes da entrada", corpo: "Cada decisão de capital tem perda máxima conhecida antes de ser tomada. Quando o cenário muda, o modelo recalibra; quando o risco muda, o cliente decide." },
                  { num: "III", titulo: "Diversificação real, não aparente", corpo: "Diversificação verdadeira começa onde as correlações dinâmicas começam. Ativos que parecem descorrelacionados em mercados calmos podem se mover juntos em crises. Os modelos medem isso continuamente, não assumem." },
                  { num: "IV", titulo: "Alertas antes do estresse, não depois", corpo: "Modelos de risco de cauda e detecção de regime sinalizam mudança estrutural antes que ela apareça nos preços. O cliente recebe o alerta com tempo de decidir, ajustar ou esperar." },
                  { num: "V", titulo: "Transparência total no processo", corpo: "Cada modelo carrega referência ao paper, à janela de validação e ao limite onde ele falha. O que entregamos é auditável do início ao fim." },
                ].map((p) => (
                  <div key={p.num} className="border border-white/8 bg-card/40 p-5 h-full">
                    <div className="font-display text-2xl text-primary/30 mb-2">{p.num}</div>
                    <h4 className="font-display text-sm text-foreground tracking-wide mb-2 leading-snug">{p.titulo}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{p.corpo}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/20 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
              Implementação
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-primary uppercase tracking-widest mb-4 text-center">
              Como a consultoria acontece
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-primary to-primary/10 mx-auto mb-6" />
            <p className="text-muted-foreground text-sm leading-relaxed text-center max-w-2xl mx-auto mb-14">
              A implantação personalizada segue quatro etapas estruturadas, com escopo definido,
              entregáveis claros e ponto de aceitação antes da próxima começar.
            </p>
          </FadeIn>
          <div className="space-y-10">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="flex gap-8 border-b border-white/5 pb-10 last:border-0 last:pb-0 group">
                  <span className="font-display text-4xl text-primary/20 shrink-0 tabular-nums group-hover:text-primary/40 transition-colors">{step.num}</span>
                  <div>
                    <h3 className="font-display text-lg text-foreground uppercase tracking-wider mb-1">{step.title}</h3>
                    <p className="text-primary/70 text-xs tracking-wide mb-3">{step.subtitle}</p>
                    <p className="text-muted-foreground text-sm leading-relaxed font-light mb-4">{step.desc}</p>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed">
                      <span className="text-primary/60 uppercase tracking-wider text-[10px] mr-1">Entregável:</span>
                      {step.entregavel}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4 text-center">Operação Contínua</p>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4 text-center">Inteligência em Tempo Real</h2>
            <p className="text-center text-muted-foreground text-sm font-light max-w-2xl mx-auto mb-16">Agentes operam 24 horas por dia, 7 dias por semana, monitorando fluxos globais de informação relevantes para mercados macro.</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mb-12"><MacroRiskModels /></div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((s, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <div className="p-5 border border-white/5 bg-card/30 hover:bg-card/60 transition-colors group">
                  <div className="flex items-start gap-3">
                    <span className="text-primary/40 text-xs mt-0.5 shrink-0">{s.icon}</span>
                    <div>
                      <p className="font-display text-sm text-primary tracking-wide mb-1">{s.label}</p>
                      <p className="text-muted-foreground text-xs font-light leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ZONA PILOTO: World Map with Real-Time Commodity Flows */}
      <ZonaPiloto />

      {/* New: Capital Protection in Crises Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn>
            <p className="text-[10px] text-accent/60 tracking-[0.3em] uppercase mb-4">Resiliência & Proteção</p>
            <h2 className="font-display text-4xl text-accent uppercase tracking-widest mb-6">Proteção de Capital em Crises</h2>
            <p className="text-muted-foreground text-base leading-relaxed font-light max-w-3xl mb-12">
              Implementamos protocolos multi-camada para monitorar liquidez em mercados, rastrear exposição a risco político e financeiro, e execute hedges preventivos usando ISO 20022 para liquidações internacionais seguras.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Liquidity Tracking Card */}
            <FadeIn delay={0.1}>
              <div className="border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 group hover:border-accent/40 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-display text-lg group-hover:bg-accent/30 transition-colors">
                    ≋
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-accent tracking-wide mb-1">Rastreamento de Liquidez</h3>
                    <p className="text-muted-foreground text-sm">Monitoramos spreads bid-ask, volumes de ordem, e profundidade de livro em tempo real</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/10 p-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spread Médio</span>
                    <span className="text-accent">0.15 bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Diário</span>
                    <span className="text-accent">$2.45B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profundidade (10M)</span>
                    <span className="text-accent">$125M</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-primary">
                    <span>Status Liquidez</span>
                    <span className="animate-pulse">● Saudável</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Risk Management Card */}
            <FadeIn delay={0.2}>
              <div className="border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 group hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg group-hover:bg-primary/30 transition-colors">
                    ◆
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-primary tracking-wide mb-1">Proteção contra Crises</h3>
                    <p className="text-muted-foreground text-sm">Hedges dinâmicos contra risco político, bancário e de câmbio com derivativos cross-border</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/10 p-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risco Político</span>
                    <span className="text-primary">Cobertura 85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risco Câmbio</span>
                    <span className="text-primary">Cobertura 92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risco Crédito</span>
                    <span className="text-primary">Cobertura 78%</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-accent">
                    <span>Exposição Residual</span>
                    <span>2.3%</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ISO 20022 & Cross-Border Payments Section */}
          <FadeIn delay={0.3}>
            <div className="border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-8 mb-8">
              <h3 className="font-display text-2xl text-primary uppercase tracking-wider mb-4">ISO 20022 - Pagamentos Transfronteiriços Modernos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Operamos sob o protocolo <span className="text-accent font-semibold">ISO 20022</span>, o padrão internacional para mensagens financeiras estruturadas. Isso permite:
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Liquidação T+0 em múltiplas moedas</span></li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Rastreabilidade fim-a-fim de transferências</span></li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Conformidade com reguladores globais (Basel III, EMIR)</span></li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Redução de risco operacional em 40%</span></li>
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 rounded p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tempo Médio de Liquidação</span>
                    <span className="text-primary">2.1 min</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de Confirmação</span>
                    <span className="text-accent">99.97%</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Moedas Suportadas</span>
                    <span className="text-primary">45+</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="text-center text-accent">
                    <p className="text-[10px] uppercase tracking-wider">Última Atualização</p>
                    <p>07/04/2026 14:35 UTC</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Crisis Scenarios Card */}
          <FadeIn delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 font-semibold">Cenário 1: Crise Banco Central</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Proteção via forwards de moeda, ouro e ativos não-correlacionados. Redução de drawdown: 65%</p>
              </div>
              <div className="border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-accent/70 uppercase tracking-widest mb-2 font-semibold">Cenário 2: Crack Acionário Global</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Pivô para ativos defensivos e liquidez. Put spreads dinâmicas. Redução de drawdown: 48%</p>
              </div>
              <div className="border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-orange-400/70 uppercase tracking-widest mb-2 font-semibold">Cenário 3: Evento Geopolítico</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Realocação para mercados não-afetados, comodidades e ativos seguros. Redução de drawdown: 72%</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <FrameworkSection />
      <Footer />
    </main>
  );
}
