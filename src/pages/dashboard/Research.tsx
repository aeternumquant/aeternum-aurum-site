/**
 * Research.tsx — Pesquisa Institucional Aeternum Aurum
 *
 * Layout: Hero → Termômetro → Armadilhas → Teses Brasil (Drew Crawford)
 *         → Filtros → Grid de Publicações (público vs. acesso restrito)
 */
import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { shortPapers } from "../../lib/researchData";
import { ArrowRight, Lock } from "lucide-react";

const GOLD = "#C6A85A";

/* ── Tags e cores ── */
const tagColor: Record<string, string> = {
  Macro: "text-blue-400/70 border-blue-400/20",
  Quantitativo: "text-purple-400/70 border-purple-400/20",
  "Event-Driven": "text-green-400/70 border-green-400/20",
  Risco: "text-orange-400/70 border-orange-400/20",
  "Risco e Hedge": "text-orange-400/70 border-orange-400/20",
  "Finanças Digitais": "text-cyan-400/70 border-cyan-400/20",
  Logística: "text-yellow-400/60 border-yellow-400/20",
  "Geopolítica de Commodities": "text-emerald-400/70 border-emerald-400/20",
};

/* IDs públicos — sem bloqueio de acesso */
const PUBLIC_IDS = new Set([
  "ciclos-liquidez-global",
  "food-powerhouse-brasil",
  "estrategia-mineral-niobio",
  "geopolitica-commodities-brasil",
  "risco-hedge-filosofia-aeternum",
  "tail-risk-hedging",
  "elo-invisivel-cooperativas",
  "terras-raras-china-brasil",
  "cinco-vantagens-agro-brasil",
  "escassez-oferta-agricola-2026",
  "white-house-rare-earth-stocks",
]);

/* Filtros disponíveis */
const FILTERS = [
  "Todos",
  "Macro",
  "Geopolítica de Commodities",
  "Risco e Hedge",
  "Quantitativo",
  "Event-Driven",
  "Logística",
  "Finanças Digitais",
];

/* ── Helpers de layout ── */
function SectionLabel({ children }: { children: string }) {
  return (
    <p
      className="font-sans text-[9px] uppercase tracking-[0.32em] mb-3"
      style={{ color: `${GOLD}85` }}
    >
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display font-light uppercase tracking-widest leading-tight mb-4"
      style={{ fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", color: GOLD }}
    >
      {children}
    </h2>
  );
}

function GoldLine() {
  return (
    <div
      className="h-px max-w-[80px] mb-8 shimmer-line"
    />
  );
}

function ContentBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="p-6 sm:p-8"
      style={{
        border: `1px solid ${GOLD}20`,
        backgroundColor: "rgba(10,10,10,0.55)",
      }}
    >
      {children}
    </div>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="font-display font-light uppercase tracking-wider mb-4 mt-6 first:mt-0"
      style={{ fontSize: "clamp(0.9rem, 1.6vw, 1.1rem)", color: GOLD }}
    >
      {children}
    </h3>
  );
}

function BodyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={`font-sans leading-relaxed ${className}`}
      style={{ fontSize: "clamp(0.8rem, 1.1vw, 0.9rem)", color: "rgba(255,255,255,0.58)" }}
    >
      {children}
    </p>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="my-6 px-5 py-4 border-l-2 text-sm leading-relaxed"
      style={{
        borderColor: GOLD,
        backgroundColor: `${GOLD}08`,
        color: `${GOLD}cc`,
        fontStyle: "italic",
      }}
    >
      {children}
    </div>
  );
}

function StatGrid({ items }: { items: { stat: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 my-6">
      {items.map((item, i) => (
        <div
          key={i}
          className="p-4 text-center"
          style={{ border: `1px solid ${GOLD}22`, backgroundColor: `${GOLD}07` }}
        >
          <div
            className="font-display font-light text-2xl mb-1"
            style={{ color: GOLD }}
          >
            {item.stat}
          </div>
          <p className="font-sans text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3 my-4">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span
            className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: GOLD }}
          />
          <span className="font-sans text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function ResearchPage() {
  const [activeTag, setActiveTag] = useState("Todos");
  const navigate = useNavigate();

  const papers =
    activeTag === "Todos"
      ? shortPapers
      : shortPapers.filter((p) => p.tag === activeTag || p.tag === activeTag);

  return (
    <main className="pt-14 min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>

      {/* ══ HERO ══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div
          className="absolute inset-0 z-0"
          style={{ background: `radial-gradient(ellipse at top, ${GOLD}09 0%, transparent 60%)` }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase mb-4" style={{ color: `${GOLD}80` }}>
              Inteligência Estrutural
            </p>
            <h1
              className="font-display font-light uppercase tracking-widest mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: GOLD }}
            >
              Pesquisa
            </h1>
            <p className="text-sm leading-relaxed font-light max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.38)" }}>
              Publicações proprietárias de análise macroeconômica, quantitativa, geopolítica e estratégica.
              Conteúdo construído com o mesmo rigor das mesas proprietárias de Chicago e Genebra.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ══ BLOCO 3: PUBLICAÇÕES E FILTROS ══ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <SectionLabel>The MIT Intelligence Core</SectionLabel>
            <SectionTitle>
              Publicações &{" "}
              <span className="text-white">Análises</span>
            </SectionTitle>
            <GoldLine />
          </FadeIn>
        </div>
      </section>

      {/* ── Filtros sticky ── */}
      <div
        className="sticky top-14 z-30 py-4 px-4 sm:px-6 lg:px-8 border-b border-white/5 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(10,10,10,0.93)" }}
      >
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
          {FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(tag)}
              className="font-sans text-[9px] tracking-widest uppercase px-3 py-1.5 border transition-colors duration-200"
              style={
                activeTag === tag
                  ? { borderColor: `${GOLD}60`, color: GOLD, backgroundColor: `${GOLD}0a` }
                  : { borderColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.35)" }
              }
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grid de artigos ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="max-w-4xl mx-auto space-y-3">
          {papers.map((p, i) => {
            const isPublic = PUBLIC_IDS.has(p.id) || p.isPublic;
            return (
              <FadeIn key={p.id} delay={i * 0.04}>
                <div
                  className="group relative p-6 border border-white/5 cursor-pointer transition-all duration-200"
                  style={{ backgroundColor: "rgba(10,8,4,0.5)" }}
                  onClick={() => isPublic ? navigate(`/research/${p.id}`) : navigate("/acesso")}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${GOLD}28`)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
                >
                  {/* Badge de acesso restrito */}
                  {!isPublic && (
                    <div
                      className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 border"
                      style={{
                        borderColor: "rgba(255,255,255,0.1)",
                        backgroundColor: "rgba(0,0,0,0.4)",
                      }}
                    >
                      <Lock className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.3)" }} />
                      <span className="font-sans text-[8px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
                        Acesso LP
                      </span>
                    </div>
                  )}

                  <div className="flex items-start gap-3 mb-3 flex-wrap pr-20">
                    <span
                      className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-sans ${tagColor[p.tag] ?? "text-primary/60 border-primary/20"}`}
                    >
                      {p.tag}
                    </span>
                    <span className="text-[10px] font-sans tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {p.date}
                    </span>
                    <span className="text-[9px] font-sans tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
                      {p.readTime} Leitura
                    </span>
                  </div>

                  <h3
                    className="font-display text-base sm:text-lg tracking-wide mb-2"
                    style={{ color: "rgba(255,255,255,0.85)" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed mb-3" style={{ color: "rgba(255,255,255,0.38)" }}>
                    {p.desc}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: `${GOLD}50` }}>
                      {p.author}
                    </p>
                    <span className="text-xs" style={{ color: `${GOLD}55` }}>
                      {isPublic ? "→" : "Acesso →"}
                    </span>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* CTA */}
        <FadeIn delay={0.4} direction="none">
          <div className="max-w-4xl mx-auto mt-14 text-center border-t border-white/5 pt-10">
            <p
              className="text-[10px] tracking-wider mb-6 uppercase font-sans"
              style={{ color: "rgba(255,255,255,0.22)" }}
            >
              Relatórios macro, código-fonte e análises em tempo real disponíveis para LPs e parceiros.
            </p>
            <NavLink
              to="/acesso"
              className="inline-flex items-center gap-2 px-8 py-3 border font-sans text-[10px] tracking-[0.25em] uppercase transition-all duration-200 group"
              style={{ borderColor: `${GOLD}40`, color: GOLD }}
            >
              Solicitar Acesso Completo
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </NavLink>
          </div>
        </FadeIn>
      </section>

      <Footer />
    </main>
  );
}
