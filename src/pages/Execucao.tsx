import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, AreaChart, Area } from "recharts";

const GOLD = "#C6A75C";
const GOLD_DIM = "rgba(198,167,92,0.15)";

const dadosMes1 = [
  { semana: "Sem. 1", retorno: 1.2, evento: "Captura de Backwardation em Futuros de Petróleo" },
  { semana: "Sem. 2", retorno: 0.6, evento: "Custo de Hedge / Consolidação" },
  { semana: "Sem. 3", retorno: 1.9, evento: "Pico de Volatilidade Ouro/Prata" },
  { semana: "Sem. 4", retorno: 0.8, evento: "Rebalanceamento de Estoques" },
];
const dadosMes2 = [
  { semana: "Sem. 5", retorno: 0.5, evento: "Coleta de Theta Decay" },
  { semana: "Sem. 6", retorno: 2.0, evento: "Evento de Desvalorização Cambial" },
  { semana: "Sem. 7", retorno: 1.5, evento: "Captura de Gamma Squeeze" },
  { semana: "Sem. 8", retorno: 1.1, evento: "Reversão à Média" },
];
const equityCurve = [
  { t: "Jan", equity: 100 }, { t: "Fev", equity: 104.2 }, { t: "Mar", equity: 102.8 },
  { t: "Abr", equity: 107.5 }, { t: "Mai", equity: 105.9 }, { t: "Jun", equity: 111.3 },
  { t: "Jul", equity: 109.1 }, { t: "Ago", equity: 114.8 }, { t: "Set", equity: 112.4 },
  { t: "Out", equity: 118.9 }, { t: "Nov", equity: 117.2 }, { t: "Dez", equity: 124.1 },
];

const TooltipPersonalizado = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-white/10 px-4 py-3 text-xs font-sans">
      <p className="text-muted-foreground tracking-wider uppercase mb-1">{label}</p>
      <p className="text-primary font-medium">+{payload[0].value.toFixed(1)}%</p>
      {payload[0].payload.evento && <p className="text-muted-foreground/60 mt-1 max-w-[200px] leading-relaxed">{payload[0].payload.evento}</p>}
    </div>
  );
};

export default function ExecucaoPage() {
  const total1 = dadosMes1.reduce((s, d) => s + d.retorno, 0).toFixed(1);
  const total2 = dadosMes2.reduce((s, d) => s + d.retorno, 0).toFixed(1);

  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Desempenho</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-4">Execução</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-xl mx-auto">Relatórios de execução mensais detalhando cada estratégia e retorno semanal.</p>
          </FadeIn>
          <FadeIn delay={0.3} direction="none">
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-0 border border-white/5 max-w-sm mx-auto divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="flex-1 w-full py-4 px-6 text-center"><div className="font-display text-3xl text-primary">+{total1}%</div><div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Mês 1 · Commodities</div></div>
              <div className="flex-1 w-full py-4 px-6 text-center"><div className="font-display text-3xl text-primary">+{total2}%</div><div className="text-[10px] text-muted-foreground tracking-widest uppercase mt-1">Mês 2 · Câmbio</div></div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Risk Management */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card/10 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Controle de Risco</p>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-12">Gestão de Risco</h2>
          </FadeIn>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-10">
            <FadeIn delay={0.1}>
              <div className="p-6 border border-white/5 bg-background h-full">
                <p className="text-[9px] text-primary/50 tracking-widest uppercase mb-4">Dimensionamento</p>
                <div className="space-y-3">
                  {[{ label: "Capital Total", val: "100%", w: 100 }, { label: "Risco por Trade", val: "1–2%", w: 15 }, { label: "Tamanho da Posição", val: "Calculado", w: 35 }].map((item, i) => (
                    <div key={i}><div className="flex justify-between mb-1"><span className="text-[9px] text-muted-foreground/60 tracking-wider">{item.label}</span><span className="text-[9px] text-primary/70">{item.val}</span></div><div className="h-px bg-white/5 relative"><div className="absolute left-0 top-0 h-full bg-primary/40" style={{ width: `${item.w}%` }} /></div></div>
                  ))}
                </div>
              </div>
            </FadeIn>
            <FadeIn delay={0.2}>
              <div className="p-6 border border-white/5 bg-background h-full">
                <p className="text-[9px] text-primary/50 tracking-widest uppercase mb-4">Stop Loss Estrutural</p>
                <div className="relative h-32 border border-white/5 bg-card/30 mb-3 overflow-hidden">
                  <svg viewBox="0 0 100 60" className="w-full h-full" preserveAspectRatio="none">
                    <polyline points="0,45 15,38 25,30 35,22 42,28 50,18 55,25 62,32 70,40 75,45" fill="none" stroke="rgba(198,167,92,0.6)" strokeWidth="1.2" />
                    <line x1="0" y1="48" x2="100" y2="48" stroke="rgba(198,167,92,0.2)" strokeWidth="0.5" strokeDasharray="2 3" />
                    <line x1="0" y1="53" x2="100" y2="53" stroke="rgba(239,68,68,0.35)" strokeWidth="0.5" strokeDasharray="2 3" />
                    <text x="2" y="46.5" fontSize="3.5" fill="rgba(198,167,92,0.4)">Suporte</text>
                    <text x="2" y="51.5" fontSize="3.5" fill="rgba(239,68,68,0.4)">Stop Loss</text>
                    <circle cx="35" cy="22" r="2" fill="rgba(198,167,92,0.8)" />
                    <text x="37" y="20.5" fontSize="3" fill="rgba(198,167,92,0.5)">Entrada</text>
                  </svg>
                </div>
                <p className="text-muted-foreground text-[10px] font-light leading-relaxed">Stop posicionado abaixo do suporte estrutural.</p>
              </div>
            </FadeIn>
            <FadeIn delay={0.3}>
              <div className="p-6 border border-white/5 bg-background h-full">
                <p className="text-[9px] text-primary/50 tracking-widest uppercase mb-4">Controle de Drawdown</p>
                <div className="h-32 mb-3">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={equityCurve} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
                      <defs><linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={GOLD} stopOpacity={0.15} /><stop offset="95%" stopColor={GOLD} stopOpacity={0} /></linearGradient></defs>
                      <ReferenceLine y={95} stroke="rgba(239,68,68,0.25)" strokeDasharray="2 3" />
                      <Area type="monotone" dataKey="equity" stroke={GOLD} strokeWidth={1.2} fill="url(#equityGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-muted-foreground text-[10px] font-light leading-relaxed">Limite de drawdown de 5% ativa circuit breakers.</p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Month 1 */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div><p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-2">Mês 1</p><h2 className="font-display text-2xl sm:text-3xl text-foreground uppercase tracking-widest">O Ciclo de Commodities</h2></div>
              <div className="text-right"><div className="font-display text-3xl text-primary">+{total1}%</div><div className="text-[10px] text-muted-foreground tracking-wider uppercase">Retorno acumulado</div></div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="w-full h-64 sm:h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dadosMes1} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fill: "#8A8A8A", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `+${v}%`} tick={{ fill: "#8A8A8A", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} domain={[0, 2.5]} />
                  <Tooltip content={<TooltipPersonalizado />} cursor={{ stroke: GOLD, strokeWidth: 1, strokeDasharray: "4 3" }} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,0.05)" />
                  <Line type="monotone" dataKey="retorno" stroke={GOLD} strokeWidth={1.5} dot={{ fill: GOLD, strokeWidth: 0, r: 4 }} activeDot={{ fill: GOLD, stroke: "rgba(198,167,92,0.3)", strokeWidth: 6, r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dadosMes1.map((d, i) => (<div key={i} className="p-4 border border-white/5 bg-card/40"><div className="font-display text-xl text-primary mb-1">+{d.retorno.toFixed(1)}%</div><div className="text-[9px] text-muted-foreground/50 tracking-wider uppercase mb-2">{d.semana}</div><div className="text-[10px] text-muted-foreground/70 leading-relaxed">{d.evento}</div></div>))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Month 2 */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card/10">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
              <div><p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-2">Mês 2</p><h2 className="font-display text-2xl sm:text-3xl text-foreground uppercase tracking-widest">Derivativos de Câmbio &amp; Arbitragem</h2></div>
              <div className="text-right"><div className="font-display text-3xl text-primary">+{total2}%</div><div className="text-[10px] text-muted-foreground tracking-wider uppercase">Retorno acumulado</div></div>
            </div>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="w-full h-64 sm:h-80 mb-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosMes2} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} barSize={36}>
                  <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis dataKey="semana" tick={{ fill: "#8A8A8A", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `+${v}%`} tick={{ fill: "#8A8A8A", fontSize: 10, fontFamily: "Inter" }} axisLine={false} tickLine={false} domain={[0, 2.5]} />
                  <Tooltip content={<TooltipPersonalizado />} cursor={{ fill: GOLD_DIM }} />
                  <Bar dataKey="retorno" radius={[2, 2, 0, 0]}>
                    {dadosMes2.map((_, i) => (<Cell key={i} fill={i === 1 ? GOLD : `rgba(198,167,92,${0.45 + i * 0.08})`} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {dadosMes2.map((d, i) => (<div key={i} className="p-4 border border-white/5 bg-background/60"><div className="font-display text-xl text-primary mb-1">+{d.retorno.toFixed(1)}%</div><div className="text-[9px] text-muted-foreground/50 tracking-wider uppercase mb-2">{d.semana}</div><div className="text-[10px] text-muted-foreground/70 leading-relaxed">{d.evento}</div></div>))}
            </div>
          </FadeIn>
        </div>
      </section>
      <Footer />
    </main>
  );
}
