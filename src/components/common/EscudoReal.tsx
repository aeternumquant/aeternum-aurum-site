/**
 * EscudoReal.tsx — Seção "O Escudo Real – Commodities & Hedge"
 *
 * 1. Carrossel horizontal automático de commodities (marquee elegante)
 * 2. 3 cards expandidos com 5-7 pontos institucionais cada
 *    Estilo Jim Simons: matemática pura, inevitabilidade, edge institucional
 */
import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

const GOLD = "#C6A85A";

/* ── Commodities para o carrossel ── */
const commodities = [
  "Ouro", "Prata", "Petróleo Brent", "Gás Natural",
  "Metais Industriais", "Soft Commodities",
  "Agronegócio", "Minério de Ferro", "Nióbio",
  "Cobre", "Alumínio", "Café", "Soja", "Milho",
];

/* ── Tríade de risco — estilo institucional quant ── */
const triade = [
  {
    num: "01",
    titulo: "Desvalorização Monetária",
    icone: "◈",
    pontos: [
      "Inflação real sistematicamente subestimada pelos índices oficiais — Hard Assets são o único hedge matemático comprovado.",
      "Correlação inversa ouro/BRL histórica de −0.78 em ciclos de crise: cada 10% de desvalorização do real = +8% de retorno em ouro físico.",
      "Commodities em USD criam um \"dólar sintético\" protegendo poder de compra sem exposição ao sistema bancário.",
      "Backwardation estrutural em metais preciosos sinaliza compressão de oferta — o mercado de futuros te paga para segurar o ativo.",
      "Derivativos lastreados em volumes físicos reais eliminam o risco de contraparte bancária em crises de liquidez.",
      "Capital alocado em Hard Assets historicamente recupera 100% do poder de compra em 18 meses pós-pico inflacionário.",
    ],
  },
  {
    num: "02",
    titulo: "Volatilidade Física",
    icone: "◈",
    pontos: [
      "Modelos de VIX agrícola proprietários detectam compressão de volatilidade implícita em janelas de 48h antes do movimento.",
      "Net Gamma Exposure negativo em commodities agro cria zonas de preço onde os Market Makers são forçados a amplificar movimentos.",
      "Basis Risk entre mercado físico e contratos futuros segue padrões sazonais recorrentes — arbitrável com sizing baseado em volatilidade histórica.",
      "Selling estruturado de volatilidade nas janelas de entressafra gera yield de 12–18% a.a. em condições de mercado normais.",
      "Cross-hedge grãos/proteína captura o crushing spread com Sharpe histórico de 1.4+ em backtests de 23 anos.",
      "Modelos climáticos satelitais privados chegam com 5–7 dias de antecedência vs. relatórios CONAB/USDA — edge informacional puro.",
      "Exposição delta-zero em opções de commodities agrícolas transforma a volatilidade em fonte de retorno em qualquer direção.",
    ],
  },
  {
    num: "03",
    titulo: "Risco Sistêmico",
    icone: "◈",
    pontos: [
      "Correlação de commodities físicas com S&P500 colapsa de +0.6 para −0.3 em situações de crise bancária — descorrelação automática.",
      "Metais estratégicos (ouro, prata, nióbio) mantiveram valor real durante 100% das crises bancárias sistêmicas dos últimos 50 anos.",
      "Modelo CDS soberano + fluxo de capitais globais sinaliza vulnerabilidade sistêmica 6–8 semanas antes do evento de risco.",
      "Posições em commodities físicas fora do sistema financeiro tradicional são inalcançáveis por bail-in bancário ou bloqueio regulatório.",
      "Estratégia de barbell — ouro físico + derivativos de cauda — captura retorno assimétrico: −1% em ambiente normal, +40% em crise.",
      "Clearinghouses de commodities mantiveram liquidez em 100% dos choques sistêmicos dos últimos 30 anos — robustez estrutural.",
    ],
  },
];

export default function EscudoReal() {
  return (
    <div className="relative border border-white/5 overflow-hidden">
      {/* Grade sutil de fundo */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* ── Header ── */}
      <div className="relative z-10 px-8 pt-10 pb-8 border-b border-white/5">
        <FadeIn>
          <p className="text-[9px] tracking-[0.35em] uppercase mb-3" style={{ color: "rgba(198,168,90,0.45)" }}>
            Proteção Patrimonial
          </p>
          <h2 className="font-display text-3xl sm:text-4xl uppercase tracking-widest leading-tight" style={{ color: GOLD }}>
            O Escudo Real
          </h2>
          <p className="font-display text-xl uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
            Commodities &amp; Hedge
          </p>
        </FadeIn>
      </div>

      {/* ── Carrossel de Commodities (marquee horizontal automático) ── */}
      <FadeIn delay={0.1}>
        <div
          className="relative border-b border-white/5 overflow-hidden"
          style={{ backgroundColor: "rgba(198,168,90,0.03)" }}
        >
          {/* Keyframe marquee */}
          <style>{`
            @keyframes escudo-marquee {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .escudo-marquee-track {
              display: flex;
              width: max-content;
              animation: escudo-marquee 30s linear infinite;
            }
            .escudo-marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          {/* Fade nas bordas */}
          <div
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              background: "linear-gradient(to right, rgba(5,5,3,0.95) 0%, transparent 8%, transparent 92%, rgba(5,5,3,0.95) 100%)",
            }}
          />

          <div className="escudo-marquee-track py-3">
            {/* Duas voltas para loop perfeito */}
            {[...commodities, ...commodities].map((c, i) => (
              <div key={i} className="flex items-center gap-0 shrink-0">
                <span
                  className="font-display text-sm uppercase tracking-widest px-5 cursor-default transition-colors"
                  style={{ color: "rgba(198,168,90,0.75)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(198,168,90,0.75)")}
                >
                  {c}
                </span>
                <span style={{ color: "rgba(198,168,90,0.2)", fontSize: "0.6rem" }}>◆</span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>

      {/* ── Sub-header "Proteção contra a Tríade de Risco" ── */}
      <div className="relative z-10 px-8 pt-8 pb-2">
        <FadeIn delay={0.15}>
          <p className="text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
            Proteção contra a Tríade de Risco
          </p>
        </FadeIn>
      </div>

      {/* ── Grid dos 3 cards expandidos ── */}
      <div className="relative z-10 px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {triade.map((item, i) => (
            <FadeIn key={i} delay={0.18 + i * 0.1}>
              <motion.div
                whileHover={{ borderColor: "rgba(198,168,90,0.28)" }}
                className="group relative p-6 border border-white/5 bg-card/40 hover:bg-card/70 transition-all duration-500 cursor-default flex flex-col"
              >
                {/* Cantos dourados no hover */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/0 group-hover:border-primary/25 transition-colors duration-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/0 group-hover:border-primary/25 transition-colors duration-500" />

                {/* Número + linha */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display text-xs tracking-widest" style={{ color: `${GOLD}40` }}>{item.num}</span>
                  <div className="h-px flex-1 bg-white/5" />
                  <span style={{ color: `${GOLD}35`, fontSize: "0.7rem" }}>{item.icone}</span>
                </div>

                {/* Título */}
                <p className="font-display text-base tracking-wide leading-snug mb-4" style={{ color: GOLD }}>
                  {item.titulo}
                </p>

                {/* Pontos institucionais */}
                <ul className="space-y-2.5 flex-1">
                  {item.pontos.map((p, j) => (
                    <li key={j} className="flex gap-2.5">
                      <span className="text-[8px] mt-1.5 flex-shrink-0" style={{ color: `${GOLD}50` }}>▪</span>
                      <span className="text-[11px] leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.52)" }}>
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Linha dourada inferior no hover */}
                <motion.div
                  className="absolute inset-x-0 bottom-0 h-px"
                  style={{ background: `linear-gradient(to right, transparent, ${GOLD}35, transparent)` }}
                  initial={{ opacity: 0, scaleX: 0 }}
                  whileHover={{ opacity: 1, scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
