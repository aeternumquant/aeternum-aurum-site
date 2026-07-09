/**
 * Research.tsx — Pesquisa Institucional Aeternum Aurum
 *
 * Layout: Hero → label Publicações & Análises → Filtros (sticky)
 *         → Grid de Publicações (público vs. acesso restrito) → CTA
 */
import Footer from "../../components/common/Footer";
import Reveal from "../../components/common/Reveal";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { RouteSeo } from "../../lib/seo/RouteSeo";
import { shortPapers } from "../../lib/researchData";
import { useLanguage } from "../../context/LanguageContext";
import { ArrowRight, Lock, Search } from "lucide-react";

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
  "fundamentos-medidas-risco",
  "garch-evt-commodities",
  "backtesting-var-es",
  "previsao-volatilidade",
  "hedging-commodities-b3",
  "risco-sistemico-copulas",
  "otimizacao-portfolios-estrategias",
  "geopolitica-brics-hard-assets",
  "clima-resiliencia-commodities",
  "hard-assets-hub-global",
  "tokenizacao-empresas-familiares",
  "gap-financiamento-credito-tokenizado",
  "demografia-tokenizacao-terras",
  "pagamentos-transfronteiricos-ledgers",
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

/* ── Busca: normalizacao (case + acento insensitive) ── */
const norm = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ── Datas "MMM YYYY" (PT) -> valor ordenavel. Formato confirmado em todos os papers ── */
const MESES: Record<string, number> = {
  Jan: 1, Fev: 2, Mar: 3, Abr: 4, Mai: 5, Jun: 6,
  Jul: 7, Ago: 8, Set: 9, Out: 10, Nov: 11, Dez: 12,
};
function dateValue(d: string): number {
  const m = /^(\w{3})\s+(\d{4})$/.exec(d.trim());
  if (!m) return -Infinity;
  return parseInt(m[2], 10) * 12 + (MESES[m[1]] ?? 0);
}

/* Publicacoes mais recentes (apenas publicas) para o estado vazio */
const recentPublicPapers = [...shortPapers]
  .filter((p) => PUBLIC_IDS.has(p.id) || p.isPublic)
  .sort((a, b) => dateValue(b.date) - dateValue(a.date))
  .slice(0, 4);

/* ── Card de publicacao (reusado na listagem e nas sugestoes do estado vazio) ── */
function PaperCard({ p, index }: { p: (typeof shortPapers)[number]; index: number }) {
  const navigate = useNavigate();
  const isPublic = PUBLIC_IDS.has(p.id) || p.isPublic;
  return (
    <Reveal delay={Math.min(index, 5) * 0.05}>
      <div
        className="group relative p-6 border border-white/5 cursor-pointer transition-all duration-200"
        style={{ backgroundColor: "rgba(10,8,4,0.5)" }}
        onClick={() => (isPublic ? navigate(`/research/${p.id}`) : navigate("/acesso"))}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = `${GOLD}28`)}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
      >
        {!isPublic && (
          <div
            className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 border"
            style={{ borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(0,0,0,0.4)" }}
          >
            <Lock className="w-2.5 h-2.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            <span className="font-sans text-[8px] tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.3)" }}>
              Acesso LP
            </span>
          </div>
        )}

        <div className="flex items-start gap-3 mb-3 flex-wrap pr-20">
          <span className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 font-sans ${tagColor[p.tag] ?? "text-primary/60 border-primary/20"}`}>
            {p.tag}
          </span>
          <span className="text-[10px] font-sans tracking-widest" style={{ color: "rgba(255,255,255,0.28)" }}>
            {p.date}
          </span>
          <span className="text-[9px] font-sans tracking-widest uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
            {p.readTime} Leitura
          </span>
        </div>

        <h3 className="font-display text-base sm:text-lg tracking-wide mb-2" style={{ color: "rgba(255,255,255,0.85)" }}>
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
    </Reveal>
  );
}

/* ══════════════════════════════════════════════════════════
   PÁGINA PRINCIPAL
══════════════════════════════════════════════════════════ */
export default function ResearchPage() {
  const [activeTag, setActiveTag] = useState("Todos");
  const [query, setQuery] = useState("");
  const { t } = useLanguage();

  const byTag =
    activeTag === "Todos"
      ? shortPapers
      : shortPapers.filter((p) => p.tag === activeTag);
  const q = norm(query.trim());
  const matched =
    q === ""
      ? byTag
      : byTag.filter(
          (p) =>
            norm(p.title).includes(q) ||
            norm(p.desc).includes(q) ||
            norm(p.tag).includes(q)
        );
  /* Ordena por data, mais recente primeiro (reusa dateValue). Copia para nao mutar o array original. */
  const results = [...matched].sort((a, b) => dateValue(b.date) - dateValue(a.date));

  return (
    <main className="pt-14 min-h-screen">
      <RouteSeo
        title="Pesquisa"
        description="Inteligência aplicada: análises técnicas sobre regimes de volatilidade, spillovers DCC-GARCH e inferência causal em cadeias de commodities. Conteúdo de caráter educacional."
        path="/research"
      />

      {/* ══ HERO ══ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div
          className="absolute inset-0 z-0"
          style={{ background: `radial-gradient(ellipse at top, ${GOLD}09 0%, transparent 60%)` }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
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
              Conteúdo construído com o mesmo rigor metodológico aplicado em mesas proprietárias institucionais.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ══ BLOCO 3: PUBLICAÇÕES E FILTROS ══ */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>The MIT Intelligence Core</SectionLabel>
            <SectionTitle>
              Publicações &{" "}
              <span className="text-white">Análises</span>
            </SectionTitle>
            <GoldLine />
          </Reveal>
        </div>
      </section>

      {/* ── Filtros sticky ── */}
      <div
        className="sticky top-14 z-30 py-4 px-4 sm:px-6 lg:px-8 border-b border-white/5 backdrop-blur-sm"
        style={{ backgroundColor: "rgba(10,10,10,0.93)" }}
      >
        <div className="max-w-4xl mx-auto">
          {/* Campo de busca */}
          <div className="relative mb-3">
            <Search
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "rgba(255,255,255,0.3)" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar publicações"
              aria-label="Buscar publicações"
              className="w-full pl-9 pr-3 py-2 text-xs font-sans text-white/80 placeholder:text-white/25 focus:outline-none transition-colors duration-200 ease-rapido"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = `${GOLD}55`)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>
          {/* Filtros por area */}
          <div className="flex flex-wrap gap-2">
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
      </div>

      {/* ── Grid de artigos ── */}
      <section className="py-14 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {results.length > 0 ? (
            <div className="space-y-3">
              {results.map((p, i) => (
                <PaperCard key={p.id} p={p} index={i} />
              ))}
            </div>
          ) : (
            <div>
              <p className="font-sans text-sm mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
                Nenhuma publicação encontrada para "{query}".
              </p>
              <SectionLabel>Publicações recentes</SectionLabel>
              <div className="space-y-3">
                {recentPublicPapers.map((p, i) => (
                  <PaperCard key={p.id} p={p} index={i} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <Reveal delay={0.4} direction="none">
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
        </Reveal>
      </section>

      {/* ══ BLOCO: Ciência de Ponta Aplicada (movido de Execução) ══ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>{t("exec.science.subtitle", "Pesquisa Peer-Reviewed Validada em Operações Reais")}</SectionLabel>
            <SectionTitle>{t("exec.science.title", "Ciência de Ponta Aplicada")}</SectionTitle>
            <GoldLine />
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Volatilidade Estocástica */}
            <Reveal>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 h-full hover:border-[#C6A85A]/40 transition-colors">
                <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">EGARCH • TGARCH</p>
                <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.stochVol.title", "Volatilidade Estocástica")}</h4>
                <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                  {t("exec.science.stochVol.text", 'Vários papers de 2022 a 2025 confirmam que EGARCH e TGARCH capturam melhor o "efeito alavancagem" em soja, milho e boi gordo no Brasil. Combinamos esses modelos para oferecer um mapa de volatilidade institucional mais preciso que abordagens tradicionais.')}
                </p>
              </div>
            </Reveal>

            {/* Time Series Foundation Models */}
            <Reveal delay={0.1}>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 h-full hover:border-[#C6A85A]/40 transition-colors">
                <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">Wang et al. 2026 • arXiv:2601.06371</p>
                <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.tsfm.title", "Time Series Foundation Models")}</h4>
                <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                  {t("exec.science.tsfm.text", "Combinamos métodos clássicos (ARIMA) com os novíssimos Time Series Foundation Models (2024 a 2026). Os modelos Time-MoE, Chronos e Moirai superaram as previsões oficiais do USDA em 45% a 55% de precisão para milho, soja e trigo. O Time-MoE melhorou 54,9% no trigo e 18,5% no milho em relação aos modelos tradicionais.")}
                </p>
              </div>
            </Reveal>

            {/* Resumo de Performance (Resultados Validados) */}
            <Reveal delay={0.2}>
              <div className="bg-gradient-to-br from-[#0a0a0a] to-[#C6A85A]/5 border border-[#C6A85A]/30 rounded-sm p-6 h-full flex flex-col justify-center">
                <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-4 uppercase text-center">Resultados Validados</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline border-b border-[#C6A85A]/10 pb-2">
                    <span className="text-[10px] text-[#F5F5F5]/50 uppercase tracking-widest">Melhoria USDA (Trigo)</span>
                    <span className="text-xl text-[#C6A85A] font-display">+54,9%</span>
                  </div>
                  <div className="flex justify-between items-baseline border-b border-[#C6A85A]/10 pb-2">
                    <span className="text-[10px] text-[#F5F5F5]/50 uppercase tracking-widest">Melhoria USDA (Milho)</span>
                    <span className="text-xl text-[#C6A85A] font-display">+18,5%</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-[#F5F5F5]/50 uppercase tracking-widest">Redução Custo Hedge</span>
                    <span className="text-xl text-[#C6A85A] font-display">23% a 42%</span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
