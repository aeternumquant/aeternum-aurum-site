import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import { NavLink } from "react-router-dom";
import { FileText, Lock } from "lucide-react";

const reports = [
  { month: "Março 2024", title: "Relatório Mensal: Macro & Portfólio", type: "Mensal", locked: false, desc: "Análise de cenário, performance do portfólio e movimentações táticas do mês." },
  { month: "Fevereiro 2024", title: "Relatório Mensal: Macro & Portfólio", type: "Mensal", locked: false, desc: "Impacto das decisões de política monetária nos EUA e reposicionamento em EM bonds." },
  { month: "Q1 2024", title: "Carta Trimestral aos Parceiros", type: "Trimestral", locked: true, desc: "Visão estratégica para o trimestre, desempenho e perspectivas para os próximos 90 dias." },
  { month: "Janeiro 2024", title: "Relatório Mensal: Macro & Portfólio", type: "Mensal", locked: true, desc: "Início de ano: rebalanceamento tático, commodities e posicionamento em volatilidade." },
  { month: "2023", title: "Relatório Anual de Performance", type: "Anual", locked: true, desc: "Performance consolidada, análise de risco/retorno e perspectivas para 2024." },
];

const typeColor: Record<string, string> = {
  Mensal: "text-blue-400/60 border-blue-400/15",
  Trimestral: "text-primary/70 border-primary/20",
  Anual: "text-purple-400/60 border-purple-400/15",
};

export default function ReportsPage() {
  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Documentação</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Reports</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">Relatórios mensais, trimestrais e anuais de performance.</p>
          </FadeIn>
        </div>
      </section>
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto space-y-3">
          {reports.map((r, i) => (
            <FadeIn key={i} delay={i * 0.08}>
              <div className={`group flex items-start gap-5 p-5 border transition-colors ${r.locked ? "border-white/4 bg-card/40 opacity-60" : "border-white/5 bg-card hover:bg-white/[0.02] cursor-pointer"}`}>
                <div className={`shrink-0 w-9 h-9 border flex items-center justify-center mt-0.5 ${r.locked ? "border-white/10" : "border-primary/20 group-hover:border-primary/40 transition-colors"}`}>
                  {r.locked ? <Lock className="w-3.5 h-3.5 text-muted-foreground/40" strokeWidth={1.5} /> : <FileText className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-sans ${typeColor[r.type] ?? "text-primary/60 border-primary/20"}`}>{r.type}</span>
                    <span className="text-[10px] text-muted-foreground/40 font-sans">{r.month}</span>
                  </div>
                  <h3 className={`font-display text-base tracking-wide mb-1 ${r.locked ? "text-foreground/40" : "text-foreground group-hover:text-primary/90 transition-colors"}`}>{r.title}</h3>
                  <p className="text-muted-foreground/60 text-xs font-light leading-relaxed">{r.desc}</p>
                </div>
                {!r.locked && <span className="text-primary/40 group-hover:text-primary transition-colors text-xs shrink-0 mt-1">↓</span>}
              </div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.5} direction="none">
          <div className="max-w-3xl mx-auto mt-10 p-6 border border-white/5 bg-card/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div><p className="text-sm text-foreground font-display tracking-wide mb-1">Acesso completo ao arquivo</p><p className="text-[11px] text-muted-foreground/60 font-light">Relatórios anteriores disponíveis sob solicitação.</p></div>
            <NavLink to="/acesso" className="shrink-0 px-6 py-2.5 border border-primary/30 text-primary text-[9px] tracking-[0.2em] uppercase font-sans hover:border-primary/60 hover:bg-primary/5 transition-all duration-200">Solicitar Acesso</NavLink>
          </div>
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}
