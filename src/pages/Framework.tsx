import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
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

const frentes = [
  {
    titulo: "Inteligência Quantitativa",
    fraseCurta: "Análise sistemática de macro, ciclos e choques de oferta.",
    subtitulo: "Leitura macro e modelagem de ciclos.",
    descricao: "Análise sistemática de fluxos globais de capital, política monetária, ciclos de commodities e choques de oferta. Os modelos são fundamentados em literatura científica peer-reviewed e calibrados para o mercado brasileiro.",
    paraQuem: "Para quem precisa ler o cenário antes de tomar a próxima decisão de capital.",
    selo: false,
  },
  {
    titulo: "Plataforma de Risco",
    fraseCurta: "Painel claro de preço, câmbio, basis e exposição.",
    subtitulo: "Painel quantitativo em tempo real.",
    descricao: "Software de inteligência de risco que traduz preço, câmbio, basis e marcação a mercado em um painel claro. O cliente acompanha sua exposição em tempo real e recebe alertas quando os modelos identificam mudança relevante no risco.",
    paraQuem: "Para tesourarias, mesas e operadores que precisam decidir sobre risco com base quantitativa, todos os dias.",
    selo: false,
  },
  {
    titulo: "Consultoria Institucional",
    fraseCurta: "Implantação na tesouraria do cliente.",
    subtitulo: "Integração da plataforma à sua operação.",
    descricao: "Implantação da inteligência quantitativa dentro da tesouraria do cliente. Diagnóstico da exposição, modelagem dos riscos específicos da empresa, integração da plataforma ao fluxo interno de decisão e acompanhamento contínuo da equipe.",
    paraQuem: "Para grandes empresas que querem inteligência de risco moderna integrada à sua estrutura de capital, não como ferramenta avulsa.",
    selo: true,
  },
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
            <Link to="/pesquisa" className="text-primary/80 hover:text-primary text-xs tracking-wide transition-colors">
              Ver fundamentação completa →
            </Link>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function FrenteCard({ frente, index }: { frente: typeof frentes[0]; index: number }) {
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
          <span className="flex flex-col gap-1">
            <span className="flex items-center gap-2 flex-wrap">
              <span className="font-display text-base text-foreground tracking-wide">{frente.titulo}</span>
              {frente.selo && (
                <span className="text-[8px] tracking-[0.2em] uppercase text-primary/80 border border-primary/40 rounded-full px-2 py-0.5">
                  Serviço Dedicado
                </span>
              )}
            </span>
            <span className="text-muted-foreground text-sm leading-relaxed">{frente.fraseCurta}</span>
          </span>
          <span className={`text-primary/60 text-xl leading-none transition-transform duration-300 shrink-0 ${open ? "rotate-45" : ""}`}>+</span>
        </button>
        {open && (
          <div className="px-5 pb-5 -mt-1">
            <p className="text-primary/70 text-xs tracking-wide mb-3">{frente.subtitulo}</p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">{frente.descricao}</p>
            <p className="text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "rgba(198,168,90,0.70)" }}>Para quem é</p>
            <p className="text-muted-foreground text-sm leading-relaxed">{frente.paraQuem}</p>
          </div>
        )}
      </div>
    </FadeIn>
  );
}

function SectionHeader({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  return (
    <div className={`flex flex-col ${isCenter ? "items-center text-center" : "items-start text-left"}`}>
      <p
        className="font-sans uppercase text-[11px] tracking-[0.22em]"
        style={{ color: "rgba(198,168,90,0.60)" }}
      >
        {eyebrow}
      </p>
      <div
        className={`h-px w-9 mt-3 mb-5 ${isCenter ? "mx-auto" : ""}`}
        style={{ backgroundColor: "rgba(198,168,90,0.35)" }}
      />
      <h2
        className="font-display text-[28px] md:text-[34px] leading-[1.1] tracking-[-0.015em]"
        style={{ color: "#e8e6dd" }}
      >
        {title}
      </h2>
    </div>
  );
}

export default function FrameworkPage() {
  const [ctaEmail, setCtaEmail] = useState("");
  const [ctaSent, setCtaSent] = useState(false);
  const [ctaError, setCtaError] = useState(false);

  const handleCtaSubmit = () => {
    const valido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ctaEmail.trim());
    if (!valido) {
      setCtaError(true);
      return;
    }
    setCtaError(false);
    // TODO: conectar EmailJS quando as credenciais reais estiverem em .env.local.
    // O hook useEmailJS (src/hooks/useEmailJS.ts) ja existe; hoje as chaves
    // VITE_EMAILJS_* sao placeholders, entao o envio fica em modo visual.
    setCtaSent(true);
    setCtaEmail("");
  };

  return (
    <main className="pt-14 min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      <RouteSeo
        title="Framework"
        description="Arquitetura quantitativa em quatro pilares: Foundation Models, Engenharia de Volatilidade, Inferência Bayesiana e Derivativos Climáticos. Plataforma de tecnologia para clientes institucionais."
        path="/framework"
      />
      <section className="py-14 md:py-24 px-6 md:px-10 border-b border-white/5 relative" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:items-center">
          <FadeIn>
            <p className="font-sans uppercase text-[11px] tracking-[0.22em] mb-4" style={{ color: "rgba(198,168,90,0.60)" }}>Tecnologia Aplicada</p>
            <h1 className="font-display text-[56px] md:text-[60px] leading-[0.95] tracking-[-0.015em]" style={{ color: "#e8e6dd" }}>Soluções</h1>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-muted-foreground text-base leading-relaxed font-light">A Aeternum Aurum constrói a ponte tecnológica entre o cliente brasileiro e a <span style={{ color: "rgba(198,168,90,0.90)" }}>infraestrutura financeira global</span>. Holdings, indústrias, tesourarias corporativas e instituições parceiras usam os nossos modelos quantitativos para decidir sobre risco e capital com o mesmo rigor matemático que move as maiores mesas institucionais do mundo.</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BLOCO 2: AS TRÊS FRENTES
          O que a plataforma entrega: três frentes de atuação
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 md:px-10 border-y" style={{ backgroundColor: "#0c0c0c", borderColor: "rgba(198,168,90,0.08)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-12">
            <FadeIn>
              <SectionHeader eyebrow="Frentes de atuação" title="O que entregamos" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="text-muted-foreground text-base leading-relaxed">
                Três frentes que funcionam <span style={{ color: "rgba(198,168,90,0.90)" }}>isoladas ou em conjunto</span>, conforme a necessidade do cliente.
              </p>
            </FadeIn>
          </div>

          <div className="space-y-3">
            {frentes.map((frente, i) => (
              <FrenteCard key={i} frente={frente} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          A CIÊNCIA  (fusão: Espinha Científica + Em Linguagem Simples)
          Camada acessível primeiro, cards técnicos depois
      ══════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 md:px-10 border-b border-white/5" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-14">
            <FadeIn>
              <SectionHeader eyebrow="Fundamentação" title="A ciência por trás da plataforma" />
            </FadeIn>
            <FadeIn delay={0.1}>
              <p className="font-display text-2xl sm:text-3xl mb-6 leading-snug" style={{ color: "#e8e6dd", fontWeight: 500 }}>
                <span style={{ color: "rgba(198,168,90,0.90)" }}>Inevitabilidade Matemática</span> Aplicada.
              </p>
              <p className="text-muted-foreground text-base leading-relaxed">
                Não inventamos teoria. Aplicamos, com rigor, o que a fronteira da pesquisa já validou.
                A Aeternum trabalha com modelos consolidados na literatura científica internacional,
                peer-reviewed em periódicos como Journal of Financial Economics, Journal of Banking
                &amp; Finance, Energy Economics e Mathematical Finance.
              </p>
            </FadeIn>
          </div>

          {/* Camada acessível: Em Linguagem Simples (rebaixado de seção própria para subtítulo interno) */}
          <FadeIn delay={0.05}>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
              Entendendo a Plataforma
            </p>
            <h3 className="font-display text-2xl sm:text-3xl uppercase tracking-widest mb-4 text-center" style={{ color: "#e8e6dd" }}>
              Em Linguagem Simples
            </h3>
            <div className="h-px w-20 bg-gradient-to-r from-primary to-primary/10 mx-auto mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed text-center max-w-2xl mx-auto mb-12">
              Você não precisa ser matemático ou economista para entender o que fazemos.
              Aqui está o que a Aeternum Aurum faz, explicado de forma direta.
            </p>
          </FadeIn>

          {/* 3 Conceitos em Linguagem Simples (conceito do indicador de medo movido para rascunho) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12 items-start">
            {[
              {
                icone: "◆",
                titulo: "Como protejo meu capital em crises?",
                corpo: "Ao implementar o modelo de proteção Aeternum, o sistema acompanha os sinais de estresse do mercado e antecipa quando o risco começa a crescer. Ele enxerga o cenário global com um alcance e uma velocidade além da capacidade humana, e traduz isso de forma simples, para qualquer nível de conhecimento. Como um alerta meteorológico, ele não impede a tempestade, mas avisa a tempo de você decidir como se preparar.",
              },
              {
                icone: "◆",
                titulo: "Por que dados valem mais que opiniões?",
                corpo: `Um analista pode estar certo ou errado. Dados de posicionamento de mercado mostram
                  o que as pessoas realmente estão fazendo com seu dinheiro, não o que elas falam.
                  Nosso sistema lê essas "pegadas digitais" e toma decisões baseadas em fatos, não em narrativas.`,
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
                <div className="border border-white/8 bg-card/40 p-6 hover:border-primary/20 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-primary/50 text-xs mt-1.5 flex-shrink-0">{item.icone}</span>
                    <h3 className="font-display text-lg text-foreground tracking-wide leading-snug">
                      {item.titulo}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.corpo}</p>
                </div>
              </FadeIn>
            ))}
          </div>

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

      <section className="py-14 md:py-24 px-6 md:px-10 border-b border-white/5" style={{ backgroundColor: "#0c0c0c" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionHeader eyebrow="Implementação" title="Como a consultoria acontece" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mt-6 mb-14">
              A implantação personalizada segue <span style={{ color: "rgba(198,168,90,0.90)" }}>quatro etapas estruturadas</span>, com escopo definido,
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
                      <span className="text-muted-foreground/60 uppercase tracking-[0.18em] text-[10px] mr-1">Entregável:</span>
                      {step.entregavel}
                    </p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA DE CONTATO  (campo de email + envio)
          Nivel 1: validacao + estado visual. EmailJS pendente de credenciais.
      ══════════════════════════════════════════════════════ */}
      <section id="contato" className="py-14 md:py-24 px-6 md:px-10 border-b border-white/5" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="max-w-2xl mx-auto text-center">
          <FadeIn>
            <SectionHeader eyebrow="Contato" title="Vamos conversar" align="center" />
            <p className="text-muted-foreground text-base leading-relaxed mt-6 mb-8">
              Deixe seu email e a equipe entra em contato.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            {ctaSent ? (
              <p className="text-base" style={{ color: "rgba(198,168,90,0.90)" }}>
                Obrigado, entraremos em contato.
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  id="contato-email"
                  type="email"
                  inputMode="email"
                  placeholder="email@instituicao.com"
                  value={ctaEmail}
                  onChange={(e) => { setCtaEmail(e.target.value); if (ctaError) setCtaError(false); }}
                  className="flex-1 bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none transition-colors font-sans"
                  style={{ border: "1px solid rgba(198,168,90,0.20)" }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(198,168,90,0.45)"; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(198,168,90,0.20)"; }}
                />
                <button
                  type="button"
                  onClick={handleCtaSubmit}
                  className="py-3 px-6 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans bg-primary/0 hover:bg-primary hover:text-background transition-all duration-300 whitespace-nowrap"
                >
                  Enviar
                </button>
              </div>
            )}
            {ctaError && (
              <p className="text-xs text-muted-foreground/70 mt-3">
                Digite um email válido.
              </p>
            )}
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
