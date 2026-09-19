import { useState, lazy, Suspense } from "react";
import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { RouteSeo } from "../../lib/seo/RouteSeo";
import "../../components/terminal/tokens.css"; // dossiê Linear (--t-*), global
import "./tecnologia-linear.css";              // remapeia shadcn → Linear no escopo da página
const GammaExposureChart = lazy(() => import("../../components/GammaExposureChart"));
import OptionsMatrixGrid from "../../components/OptionsMatrixGrid";
import VolatilitySurface from "../../components/common/VolatilitySurface";
import { Tooltip } from "../../components/common/Tooltip";
import { useLanguage } from "../../context/LanguageContext";
const GexProfileChart = lazy(() => import("../../components/charts/tecnologia/GexProfileChart"));
const ScoreHistoryChart = lazy(() => import("../../components/charts/tecnologia/ScoreHistoryChart"));
const TermStructureModule = lazy(() => import("../../components/charts/tecnologia/TermStructureModule"));

const scoreHistoryData = [
  { d: "03-15", mom: 2, vol: 2 },
  { d: "03-20", mom: 2, vol: 4 },
  { d: "03-25", mom: 3, vol: 5 },
  { d: "03-30", mom: 3, vol: 4 },
  { d: "04-07", mom: 3, vol: 3 },
];
const gexProfileData = [
  { strike: 2300, put: 18, call: 3 },
  { strike: 2320, put: 28, call: 8 },
  { strike: 2340, put: 52, call: 15 },
  { strike: 2360, put: 15, call: 38 },
  { strike: 2380, put: 8, call: 60 },
  { strike: 2400, put: 3, call: 72 },
  { strike: 2420, put: -8, call: -25 },
  { strike: 2450, put: -15, call: -48 },
  { strike: 2500, put: -5, call: -22 },
];

const indicators = [
  {
    title: "Net Gamma Exposure",
    description: "Revela os níveis de preço mais importantes combinando Gamma e Open Interest, ajudando a identificar zonas onde o mercado tende a reagir com força. É como rastrear as pegadas dos grandes institucionais.",
  },
  {
    title: "Q-Score",
    description: "Métrica quantitativa que avalia ativos com base em momentum, sazonalidade, volatilidade e atividade de opções. Um índice único que resume tudo em um único número.",
  },
  {
    title: "Gamma Levels on Stocks",
    description: "Acesso direto aos níveis de gamma em ações, ETFs e índices, oferecendo uma visão completa das zonas de reação no mercado de renda variável.",
  },
  {
    title: "Gamma Levels on Futures",
    description: "Expõe a exposição de opções de futuros, essencial para entender zonas de preço críticas em índices, commodities, metais, taxas e forex.",
  },
  {
    title: "Blind Spot Levels Indicator",
    description: "Descobre pontos de inflexão ocultos no mercado usando análise de correlação entre ativos. Revela o que analistas institucionais frequentemente ignoram.",
  },
  {
    title: "Volatility Risk Premium (VRP)",
    description: "Compara volatilidade implícita com histórica, mostrando se o mercado está precificando risco corretamente. Ferramenta fundamental para decisões de timing.",
  },
  {
    title: "Volatility Smile",
    description: "Monitora como a volatilidade implícita varia entre diferentes strikes, revelando assimetrias estruturais e oportunidades de mispricing.",
  },
  {
    title: "Swing Trading Model",
    description: "Usa machine learning para prever reversões de volatilidade com projeções confiáveis de 5 e 20 dias, seguindo padrões dos grandes operadores.",
  },
  {
    title: "Skew",
    description: "Acompanha como o mercado precifica riscos assimétricos em diferentes strikes, revelando expectativas implícitas de movimentos estruturais.",
  },
];

export default function TecnologiaPage() {
  const [assetTarget, setAssetTarget] = useState("GOLD FUTURES (GCQ2026)");
  const { t } = useLanguage();

  return (
    <main className="tbr tec-linear pt-14 min-h-screen" style={{ background: "var(--t-s0)" }}>
      <RouteSeo
        title="Tecnologia"
        description="Stack técnico da plataforma: Time-MoE, EGARCH, Redes Bayesianas e otimização CVaR com aceleração de 160x via NVIDIA cuOpt."
        path="/tecnologia"
      />
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Nível TRL 7+</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground uppercase tracking-widest mb-4 leading-tight">
              Tecnologia <span className="text-primary">EUA</span><br />
              Aplicada ao Brasil
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light max-w-2xl mt-4">Validando ferramentas quantitativas americanas de nível TRL 7+ no maior hub agroindustrial do Brasil: o estado de Goiás.</p>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BLOCO: Como a Aeternum Evita Riscos e Multiplica Capital
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/10">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(198,168,90,0.6)" }}>
              Gestão de Risco Institucional
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-5">
              Como a Aeternum Evita Riscos e Multiplica Seu Capital
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-primary to-primary/10 mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mb-12">
              Nosso sistema não opera em adivinhações. Cada decisão passa por múltiplas camadas
              de confirmação quantitativa antes de qualquer exposição de capital. O resultado é
              um processo de gestão de risco que elimina o calor emocional do processo.
            </p>
          </FadeIn>

          {/* 3 Pilares */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                num: "01",
                title: "Múltiplas Camadas de Confirmação",
                items: [
                  "Sinal só é válido quando VIX, GEX e Skew convergem",
                  "Mínimo de 3 timeframes alinhados (intraday, semanal, mensal)",
                  "Volume de opções confirma direção antes da entrada",
                  "Dados de Dark Pool validam o fluxo institucional",
                ],
              },
              {
                num: "02",
                title: "Sizing Baseado em Volatilidade",
                items: [
                  "Risco por operação nunca excede 1,5% do capital total",
                  "Tamanho da posição é função inversa da volatilidade atual",
                  "ATR e VRP calibram o stop loss dinamicamente",
                  "Correlação entre posições monitorada em tempo real",
                ],
              },
              {
                num: "03",
                title: "Hedges Dinâmicos Automáticos",
                items: [
                  "Puts de proteção são compradas quando VIX < 15 (proteção barata)",
                  "Rebalanceamento automático ao atingir Delta-neutral",
                  "Cross-hedge entre commodities correlacionadas (soja × milho × câmbio)",
                  "Cobertura de risco político via forward fx em crises geopolíticas",
                ],
              },
            ].map((pillar) => (
              <FadeIn key={pillar.num} delay={parseInt(pillar.num) * 0.1} direction="up">
                <div className="border border-primary/20 bg-primary/5 p-6 h-full hover:border-primary/35 transition-colors">
                  <span className="font-display text-4xl text-primary/20 tabular-nums block mb-3">
                    {pillar.num}
                  </span>
                  <h3 className="font-display text-base text-primary uppercase tracking-wider mb-4">
                    {pillar.title}
                  </h3>
                  <ul className="space-y-2">
                    {pillar.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2">
                        <span className="text-primary/60 text-xs mt-0.5 flex-shrink-0">◆</span>
                        <span className="text-muted-foreground text-xs leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Métricas de desempenho removidas: eram números sem fonte (acerto/backtest/
              drawdown). A afirmação qualitativa fica nos 3 pilares acima; o limite de
              1,5% por operação segue declarado no pilar 02. */}
        </div>
      </section>

      {/* INDICADORES GRID */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center mb-16">
              <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-4">Indicadores Disponíveis</h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/20 mx-auto" />
              <p className="text-muted-foreground text-base mt-6 max-w-3xl mx-auto">Cada indicador foi desenvolvido para revelar estruturas ocultas no mercado. Conheça como cada um funciona.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {indicators.map((indicator, i) => (
              <FadeIn key={i} delay={0.05 * i} direction="up">
                <div className="border border-primary/20 bg-primary/5 p-6 rounded-sm hover:border-primary/40 transition-colors duration-300">
                  <h3 className="font-display text-base sm:text-lg text-primary mb-3 uppercase tracking-wider leading-tight">
                    {indicator.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {indicator.description}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* GRÁFICOS OPERACIONAIS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/15">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-3">Análise Operacional</h2>
            <span className="inline-block mb-4 text-[9px] tracking-[0.2em] uppercase border border-primary/25 text-primary/70 px-2 py-0.5">Dados de demonstração</span>
            <p className="text-muted-foreground text-sm font-light max-w-3xl leading-relaxed mb-12">
              Monitoramento em tempo real de fluxos de opções, níveis de <Tooltip content="Gamma Exposure (GEX): Métrica do impacto de proteção de portfólio dos market makers, mostrando suporte ou resistência dinâmica.">gamma (GEX)</Tooltip> e <Tooltip content="Volatility Skew: A diferença da volatilidade implícita entre opções fora do dinheiro de compra e venda.">skew de volatilidade</Tooltip> para os principais ativos.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <FadeIn delay={0.1} className="lg:col-span-7">
              <Suspense fallback={<div className="h-96 bg-[#1C1C1C] animate-pulse rounded" />}>
                <GammaExposureChart />
              </Suspense>
            </FadeIn>
            <FadeIn delay={0.2} className="lg:col-span-5 flex items-stretch">
              <div className="w-full flex items-center justify-center">
                <VolatilitySurface />
              </div>
            </FadeIn>
          </div>

          {/* Dark pool removido: dado de bolsa dos EUA, sem fonte grátis/automatizável
              — módulo sem caminho para dado real vira decoração. OptionsMatrix ocupa a linha. */}
          <div className="grid grid-cols-1 gap-8">
            <FadeIn delay={0.3}>
              <OptionsMatrixGrid />
            </FadeIn>
          </div>

          <FadeIn delay={0.5} className="mt-16">
            <div className="p-6 border border-primary/20 bg-primary/4">
              <p className="text-[10px] text-primary/70 tracking-widest uppercase mb-2">Síntese Estratégica</p>
              <p className="text-foreground/80 text-sm leading-relaxed font-light">
                Combinando análise quantitativa direta com <Tooltip content="Dark Pools: Redes privadas de negociação de ativos usadas para evitar impactos maciços nos preços das exchanges públicas.">Dark Pools</Tooltip> e modelagem de derivativos avançada, a Aeternum Aurum isola oportunidades descorrelacionadas com alta precisão. Nosso framework instituional permite identificar inflexões estruturais e posicionar-se à frente de movimentos de grande magnitude.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BLOCO: Estrutura a Termo — DADO REAL (futures_curve)
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-3xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(198,168,90,0.6)" }}>Dado real · B3</p>
            <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-4">Estrutura a Termo</h2>
            <div className="h-px w-24 bg-gradient-to-r from-primary to-primary/10 mb-6" />
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl mb-8">
              A curva de futuros por data de entrega: o settlement (ajuste) de cada vencimento no último pregão. É o único módulo desta página com dado de mercado ao vivo; os demais são demonstração.
            </p>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="max-w-xl">
              <Suspense fallback={<div className="h-64 bg-[#1C1C1C] animate-pulse rounded" />}>
                <TermStructureModule />
              </Suspense>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BLOCO: Dashboard Quantitativo (movido de Execução)
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(198,168,90,0.6)" }}>{t("tec.dash.title", "Dashboard Quantitativo")}</p>
            <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-4">{t("tec.dash.title", "Dashboard Quantitativo")}</h2>
            <span className="inline-block mb-5 text-[9px] tracking-[0.2em] uppercase border border-primary/25 text-primary/70 px-2 py-0.5">Dados de demonstração</span>
            <div className="h-px w-24 bg-gradient-to-r from-primary to-primary/10 mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mb-8">{t("tec.dash.desc", "Painel de demonstração da interface operacional para decisão quantitativa.")}</p>
          </FadeIn>

          <div className="bg-[#1C1C1C]/50 border-b border-[#C6A85A]/10 px-4 sm:px-8 py-3 flex items-center justify-between mb-4 rounded-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full font-display text-primary shadow-[0_0_15px_rgba(198,168,90,0.2)]">Q</div>
              <input type="text" value={assetTarget} onChange={(e) => setAssetTarget(e.target.value)} className="bg-transparent border-none text-[#F5F5F5] text-lg font-display tracking-widest outline-none uppercase w-full max-w-[400px]" />
            </div>
            <div className="flex gap-4">
              <span className="text-[#F5F5F5] bg-white/10 px-4 py-1.5 text-xs font-mono rounded-sm">2026-04-05</span>
              <button className="bg-transparent border border-[#C6A85A]/30 text-[#C6A85A] hover:bg-[#C6A85A]/10 transition-colors px-4 py-1.5 text-xs font-mono rounded-sm">{t("tec.dash.addOrder", "Adicionar Ordem")}</button>
            </div>
          </div>

          <div className="space-y-4">
            {/* Row 1: Metrics + QScore */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4 bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-5 row-span-2">
                <h3 className="text-[#F5F5F5] font-display text-xl mb-4 tracking-widest hover:text-primary transition-colors cursor-pointer">{assetTarget}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("tec.dash.pcoi", "P/C OI (Liquidez)")}</p><p className="text-[#F5F5F5] font-mono text-lg">0.68</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("tec.dash.move1d", "Movimento Esp. 1D")}</p><p className="text-[#F5F5F5] font-mono text-lg">± 1.25%</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("tec.dash.gammaCondition", "Condição Gamma")}</p><p className="text-[#F5F5F5] font-mono text-lg">{t("tec.dash.positive", "Positivo")}</p></div>
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("tec.dash.implVol", "Vol. Implícita 30D")}</p><p className="text-[#F5F5F5] font-mono text-lg">18.45%</p></div>
                </div>
              </div>
              <div className="lg:col-span-8 bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-5">
                <div className="text-center mb-6">
                  <h3 className="text-[#F5F5F5] font-display text-2xl tracking-widest flex items-center justify-center gap-2"><span className="text-[#F5F5F5]/60 text-lg">Q</span>SCORE</h3>
                  <p className="text-[10px] text-muted-foreground font-light tracking-wide mt-1">{t("tec.dash.qscoreDesc", "Nosso score quantitativo que condensa dados operacionais em sinais de ação.")}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-[#0A0A0A]/50 border border-[#C6A85A]/10 p-4 text-center"><p className="text-3xl text-[#F5F5F5] font-display mb-1">2</p><p className="text-[10px] text-[#F5F5F5] uppercase tracking-widest">{t("tec.dash.neutral", "Neutro")}</p><div className="w-8 h-[1px] bg-white/20 mx-auto my-2" /><p className="text-[9px] text-[#C6A85A] uppercase tracking-wider">{t("tec.dash.options", "Opções")}</p></div>
                  <div className="bg-[#0A0A0A]/50 border border-[#F5F5F5]/20 p-4 text-center"><p className="text-3xl text-[#F5F5F5] font-display mb-1">4</p><p className="text-[10px] text-[#F5F5F5] uppercase tracking-widest">{t("tec.dash.high", "Alto")}</p><div className="w-8 h-[1px] bg-[#F5F5F5]/20 mx-auto my-2" /><p className="text-[9px] text-[#F5F5F5] uppercase tracking-wider">{t("tec.dash.volatility", "Volatilidade")}</p></div>
                  <div className="bg-[#0A0A0A]/50 border border-[#C6A85A]/10 p-4 text-center"><p className="text-3xl text-[#F5F5F5] font-display mb-1">3</p><p className="text-[10px] text-[#F5F5F5] uppercase tracking-widest">{t("tec.dash.alert", "Alerta")}</p><div className="w-8 h-[1px] bg-white/20 mx-auto my-2" /><p className="text-[9px] text-[#C6A85A] uppercase tracking-wider">{t("tec.dash.momentum", "Momentum")}</p></div>
                  <div className="bg-[#0A0A0A]/50 border border-[#C6A85A]/10 p-4 text-center"><p className="text-3xl text-[#F5F5F5] font-display mb-1">4</p><p className="text-[10px] text-[#F5F5F5] uppercase tracking-widest">{t("tec.dash.positive", "Positivo")}</p><div className="w-8 h-[1px] bg-white/20 mx-auto my-2" /><p className="text-[9px] text-[#C6A85A] uppercase tracking-wider">{t("tec.dash.seasonality", "Sazonalidade")}</p></div>
                </div>
              </div>
            </div>

            {/* Row 2: GEX + Key Levels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-5">
                <h3 className="text-[#F5F5F5] font-display text-lg tracking-widest">{t("tec.dash.gexTitle", "Exposição Gamma Líquida (GEX)")}</h3>
                <p className="text-[10px] text-muted-foreground mb-6">{t("tec.dash.gexDesc", "Analisa as métricas de formadores de mercado para antecipar pontos de rejeição de preço.")}</p>
                <div className="w-full h-[250px]">
                  <Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse rounded" />}>
                    <GexProfileChart data={gexProfileData} />
                  </Suspense>
                </div>
              </div>
              <div className="lg:col-span-4 bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-5">
                <h3 className="text-[#F5F5F5] font-display text-lg tracking-widest mb-1">{t("tec.dash.levels", "Níveis Principais")}</h3>
                <p className="text-[10px] text-muted-foreground mb-6">{t("tec.dash.levelsDesc", "Sumário de pontos nodais na estrutura de precificação.")}</p>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {[{l:t("tec.dash.callResistance","Resistência de Call"),v:"2450.00"},{l:t("tec.dash.highVolLevel","Nível de Alta Vol"),v:"2180.00"},{l:t("tec.dash.putSupport","Suporte de Put"),v:"2250.00"},{l:t("tec.dash.dailyMax","Máxima Diária (1DMax)"),v:"2375.40"},{l:t("tec.dash.totalGex","GEX Total"),v:"12.8M",gold:true},{l:t("tec.dash.distHighVol","Distância p/ Alta Vol"),v:"2.45%"}].map((item,i)=>(
                    <div key={i} className="bg-[#0A0A0A] border border-[#C6A85A]/10 p-2 px-3"><p className="text-[9px] text-[#C6A85A] uppercase tracking-widest mb-1">{item.l}</p><p className={`${item.gold?"text-[#C6A85A]":"text-[#F5F5F5]"} font-mono text-sm leading-none`}>{item.v}</p></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 3: Mini Charts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-4 h-[220px] flex flex-col">
                <h3 className="text-[#F5F5F5] font-display text-sm tracking-widest mb-1">{t("tec.dash.momentumHistory", "Histórico de Momentum")}</h3>
                <div className="flex-1 w-full mt-2"><Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse rounded" />}><ScoreHistoryChart data={scoreHistoryData} dataKey="mom" stroke="#5b90b3" /></Suspense></div>
              </div>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-4 h-[220px] flex flex-col">
                <h3 className="text-[#F5F5F5] font-display text-sm tracking-widest mb-1">{t("tec.dash.volHistory", "Histórico de Volatilidade")}</h3>
                <div className="flex-1 w-full mt-2"><Suspense fallback={<div className="w-full h-full bg-white/5 animate-pulse rounded" />}><ScoreHistoryChart data={scoreHistoryData} dataKey="vol" stroke="#c19a4e" /></Suspense></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BLOCO: Inteligência Macro (movido de Execução)
          Hero de Execução reaproveitado como SEÇÃO (não 2º hero da página).
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/10">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(198,168,90,0.6)" }}>{t("exec.macro.subtitle", "Inevitabilidade Matemática e Proteção Quantitativa")}</p>
            <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-5">
              {t("exec.macro.title", "INTELIGÊNCIA MACRO")} <span className="text-primary/70">{t("exec.macro.aeternum", "• AETERNUM")}</span>
            </h2>
            <div className="h-px w-24 bg-gradient-to-r from-primary to-primary/10 mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mb-12">
              Análise institucional de volatilidade, proteção quantitativa e ciência de ponta aplicada à gestão de risco em commodities e ativos reais.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
            {/* Termômetro Real-Time */}
            <FadeIn>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 h-full hover:border-[#C6A85A]/40 transition-colors">
                <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">Atualização intradiária</p>
                <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.realtime.title", "Termômetro de Volatilidade em Tempo Real")}</h4>
                <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                  {t("exec.science.realtime.text", 'Entregamos um termômetro de volatilidade atualizado ao longo do pregão. Quando ele sobe acima de certo nível, o sistema sugere (ou executa, se o cliente autorizar) aumento de hedge ou redução de exposição. É como ter um "alerta de tempestade" acompanhando o mercado.')}
                </p>
              </div>
            </FadeIn>

            {/* Hedging Inteligente */}
            <FadeIn delay={0.1}>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 h-full hover:border-[#C6A85A]/40 transition-colors">
                <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">Fonte: Hanetho, 2023 • arXiv:2309.00630</p>
                <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.hedging.title", "Hedging Inteligente")}</h4>
                <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                  {t("exec.science.hedging.text", "A literatura de deep hedging (Hanetho, 2023) reporta redução de custo de 23% a 42% com Deep Policy Gradient e Reinforcement Learning frente a métodos estáticos. É a abordagem que orienta nosso desenho de hedge dinâmico, que aprende e se adapta em vez de proteger de forma estática.")}
                </p>
              </div>
            </FadeIn>

            {/* Validação Quantitativa — qualitativo (números de performance sem fonte removidos) */}
            <FadeIn delay={0.2}>
              <div className="bg-gradient-to-br from-[#0a0a0a] to-[#C6A85A]/5 border border-[#C6A85A]/30 rounded-sm p-6 h-full flex flex-col justify-center">
                <h4 className="text-[#F5F5F5] font-display text-lg tracking-widest mb-6 uppercase text-center">{t("exec.backtests.title", "Validação Quantitativa")}</h4>
                <ul className="space-y-4">
                  <li className="border-b border-[#C6A85A]/10 pb-3">
                    <p className="text-sm text-[#F5F5F5]/85 leading-relaxed">Métricas de risco-retorno por ativo (Sharpe, MAE), avaliadas em janelas longas.</p>
                  </li>
                  <li className="border-b border-[#C6A85A]/10 pb-3">
                    <p className="text-sm text-[#F5F5F5]/85 leading-relaxed">Comparação sempre contra benchmark, não contra o pior caso.</p>
                  </li>
                  <li>
                    <p className="text-sm text-[#F5F5F5]/85 leading-relaxed">Foco em reduzir o custo de hedge via opções dinâmicas.</p>
                  </li>
                </ul>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
