import { useState } from "react";
import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import GammaExposureChart from "../../components/GammaExposureChart";
import OptionsMatrixGrid from "../../components/OptionsMatrixGrid";
import VolatilitySurface from "../../components/common/VolatilitySurface";
import DarkPoolLiquidity from "../../components/DarkPoolLiquidity";
import { Tooltip } from "../../components/common/Tooltip";
import { useLanguage } from "../../context/LanguageContext";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const curveData = [
  { days: 0, price: 2370, past: 2345 },
  { days: 30, price: 2385, past: 2360 },
  { days: 60, price: 2415, past: 2390 },
  { days: 90, price: 2450, past: 2425 },
  { days: 120, price: 2485, past: 2460 },
];
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
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);
  const [assetTarget, setAssetTarget] = useState("GOLD FUTURES (GCQ2026)");
  const { t } = useLanguage();

  const handleRefreshMarketData = async () => {
    setIsLoadingMarketData(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("Dados de mercado atualizados");
    } catch (error) {
      console.error("Erro ao atualizar dados de mercado:", error);
    } finally {
      setIsLoadingMarketData(false);
    }
  };

  return (
    <main className="pt-14 min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">TRL 7+ Certificado</p>
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
                  "Risco por operação nunca excede 1.5% do capital total",
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

          {/* Métricas de desempenho do sistema */}
          <FadeIn delay={0.35}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { value: "73%", label: "Taxa de Acerto vs Narrativa" },
                { value: "1.5%", label: "Risco Máximo por Trade" },
                { value: "23 anos", label: "Histórico de Backtests" },
                { value: "65%", label: "Redução de Drawdown em Crise" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="border border-primary/15 bg-primary/3 p-4 text-center"
                >
                  <div className="font-display text-2xl text-primary mb-1">{stat.value}</div>
                  <div className="text-[9px] text-muted-foreground/60 uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
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
                <div className="border border-primary/20 bg-primary/5 p-6 rounded-sm hover:border-primary/40 transition-all duration-300">
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
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4">Análise Operacional</h2>
            <p className="text-muted-foreground text-sm font-light max-w-3xl leading-relaxed mb-12">
              Monitoramento em tempo real de fluxos de opções, níveis de <Tooltip content="Gamma Exposure (GEX): Métrica do impacto de proteção de portfólio dos market makers, mostrando suporte ou resistência dinâmica.">gamma (GEX)</Tooltip> e <Tooltip content="Volatility Skew: A diferença da volatilidade implícita entre opções fora do dinheiro de compra e venda.">skew de volatilidade</Tooltip> para os principais ativos.
            </p>
          </FadeIn>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
            <FadeIn delay={0.1} className="lg:col-span-7">
              <GammaExposureChart />
            </FadeIn>
            <FadeIn delay={0.2} className="lg:col-span-5 flex items-stretch">
              <div className="w-full flex items-center justify-center">
                <VolatilitySurface />
              </div>
            </FadeIn>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <FadeIn delay={0.3} className="lg:col-span-8">
              <OptionsMatrixGrid />
            </FadeIn>
            <FadeIn delay={0.4} className="lg:col-span-4 flex items-stretch">
              <DarkPoolLiquidity />
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
          BLOCO: Dashboard Quantitativo (movido de Execução)
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-[1600px] mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: "rgba(198,168,90,0.6)" }}>{t("tec.dash.title", "Dashboard Quantitativo")}</p>
            <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-5">{t("tec.dash.title", "Dashboard Quantitativo")}</h2>
            <div className="h-px w-24 bg-gradient-to-r from-primary to-primary/10 mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed max-w-3xl mb-8">{t("tec.dash.desc", "Painel operacional em tempo real com dados institucionais para tomada de decisão quantitativa.")}</p>
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
                  <div><p className="text-[10px] text-muted-foreground uppercase tracking-widest">{t("tec.dash.gammaCondition", "Condição Gamma")}</p><p className="text-[#C6A85A] font-mono text-lg">{t("tec.dash.positive", "Positivo")}</p></div>
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
                  <div className="bg-[#0A0A0A]/50 border border-[#C6A85A]/20 p-4 text-center"><p className="text-3xl text-[#F5F5F5] font-display mb-1">4</p><p className="text-[10px] text-[#C6A85A] uppercase tracking-widest">{t("tec.dash.positive", "Positivo")}</p><div className="w-8 h-[1px] bg-[#C6A85A]/20 mx-auto my-2" /><p className="text-[9px] text-[#C6A85A] uppercase tracking-wider">{t("tec.dash.seasonality", "Sazonalidade")}</p></div>
                </div>
              </div>
            </div>

            {/* Row 2: GEX + Key Levels */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-5">
                <h3 className="text-[#F5F5F5] font-display text-lg tracking-widest">{t("tec.dash.gexTitle", "Exposição Gamma Líquida (GEX)")}</h3>
                <p className="text-[10px] text-muted-foreground mb-6">{t("tec.dash.gexDesc", "Analisa as métricas de formadores de mercado para antecipar pontos de rejeição de preço.")}</p>
                <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gexProfileData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }} barCategoryGap={1}>
                      <XAxis type="number" hide />
                      <YAxis type="category" dataKey="strike" tick={{ fill: "#8A8A8A", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <RTooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "10px" }} />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
                      <Bar dataKey="put" fill="#F44336" stackId="a" />
                      <Bar dataKey="call" fill="#4CAF50" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-4 h-[220px] flex flex-col">
                <h3 className="text-[#F5F5F5] font-display text-sm tracking-widest mb-1">{t("tec.dash.futuresCurve", "Estrutura Termo (Futuros)")}</h3>
                <div className="flex-1 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={curveData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}><XAxis dataKey="days" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis domain={['dataMin', 'dataMax']} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} /><CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} /><Line type="monotone" dataKey="price" stroke="#4CAF50" strokeWidth={1.5} dot={false} /><Line type="monotone" dataKey="past" stroke="#F44336" strokeWidth={1} strokeDasharray="3 3" dot={false} /></LineChart></ResponsiveContainer></div>
              </div>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-4 h-[220px] flex flex-col">
                <h3 className="text-[#F5F5F5] font-display text-sm tracking-widest mb-1">{t("tec.dash.momentumHistory", "Histórico de Momentum")}</h3>
                <div className="flex-1 w-full mt-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={scoreHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><XAxis dataKey="d" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} /><CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} /><Line type="stepAfter" dataKey="mom" stroke="#4CAF50" strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer></div>
              </div>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-4 h-[220px] flex flex-col">
                <h3 className="text-[#F5F5F5] font-display text-sm tracking-widest mb-1">{t("tec.dash.volHistory", "Histórico de Volatilidade")}</h3>
                <div className="flex-1 w-full mt-2"><ResponsiveContainer width="100%" height="100%"><LineChart data={scoreHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}><XAxis dataKey="d" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} /><YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} /><CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} /><Line type="stepAfter" dataKey="vol" stroke="#9C27B0" strokeWidth={1.5} dot={false} /></LineChart></ResponsiveContainer></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
