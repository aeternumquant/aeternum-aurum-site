import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import { shortPapers } from "@/lib/researchData";

const tagColor: Record<string, string> = {
  Macro: "text-blue-400/70 border-blue-400/20",
  Quantitativo: "text-purple-400/70 border-purple-400/20",
  "Event-Driven": "text-green-400/70 border-green-400/20",
  Risco: "text-orange-400/70 border-orange-400/20",
  "Finanças Digitais": "text-cyan-400/70 border-cyan-400/20",
  Logística: "text-yellow-400/60 border-yellow-400/20",
  Soberano: "text-rose-400/70 border-rose-400/20",
  "Supply Chain": "text-emerald-400/60 border-emerald-400/20",
};

const allTags = ["Todos", ...Array.from(new Set(shortPapers.map((p) => p.tag)))];

export default function ResearchPage() {
  const [activeTag, setActiveTag] = useState("Todos");
  const papers = activeTag === "Todos" ? shortPapers : shortPapers.filter((p) => p.tag === activeTag);

  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Inteligência Estrutural</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Pesquisa</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">Publicações proprietárias de análise macroeconômica, quantitativa e estratégica.</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-6 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/10 sticky top-14 z-30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setActiveTag(tag)} className={`text-[9px] tracking-widest uppercase px-3 py-1.5 border transition-colors duration-200 font-sans ${activeTag === tag ? "border-primary/50 text-primary bg-primary/5" : "border-white/8 text-muted-foreground/50 hover:text-muted-foreground hover:border-white/20"}`}>
              {tag}
            </button>
          ))}
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-4xl mx-auto space-y-4">
          {papers.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.06}>
              <Link to={`/research/${p.id}`} className="block group p-6 border border-white/5 bg-card hover:bg-white/[0.02] hover:border-primary/20 transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-sans ${tagColor[p.tag] ?? "text-primary/60 border-primary/20"}`}>
                      {p.tag}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 font-sans tracking-widest">{p.date}</span>
                    <span className="text-primary/20 text-xs">·</span>
                    <span className="text-[9px] text-muted-foreground/50 font-sans tracking-widest uppercase">{p.readTime} Leitura</span>
                  </div>
                  <span className="text-primary/40 group-hover:text-primary transition-colors text-xs shrink-0">→</span>
                </div>
                <h3 className="font-display text-base sm:text-lg text-foreground tracking-wide mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed mb-4">{p.desc}</p>
                <p className="text-[9px] text-primary/40 uppercase tracking-[0.2em]">{p.author}</p>
              </Link>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.5} direction="none">
          <div className="max-w-4xl mx-auto mt-10 text-center border-t border-white/5 pt-10">
            <p className="text-[10px] text-muted-foreground/40 tracking-wider mb-6 uppercase">Relatórios macro & código-fonte disponíveis mediante acesso LPs.</p>
            <NavLink to="/acesso" className="inline-block px-8 py-3 border border-primary/30 text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:border-primary/60 hover:bg-primary/5 transition-all duration-200">
              Solicitar Acesso Completo
            </NavLink>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
