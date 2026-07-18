/**
 * SojaFlowMap — piloto da gramatica nova do mapa (Mapa v2), SO na soja.
 *
 * BASE: a linha bonita do mapa antigo, ligada ao dado real. NAO reconstruida —
 * reaproveitada:
 *  - <Line> do react-simple-maps: curva GEODESICA (great-circle), a geometria
 *    decide o arco. from = Brasilia (uma origem, como o antigo).
 *  - animacao flow-line: keyframe anima stroke-dashoffset 60->0, o TRACO CORRE
 *    do Brasil ao destino. Por linha, o VOLUME regula densidade (dasharray) e
 *    velocidade (animation-duration): mais volume = mais denso e rapido. A
 *    GROSSURA fica constante nesta volta (entra depois, regulada).
 *  - glow: feGaussianBlur + feFlood(verde) + feComposite + feMerge (halo).
 *  - <Marker> nos centroides reais: anel pulsante + ponto + NOME.
 *
 * DESTINOS: centroides dos paises reais do trade_flows (>=1%), no lugar dos 25
 * baseMarkers. Enquadramento mundial fixo. Preenchimento verde/vermelho.
 * Entrada: linhas surgem escalonadas do Brasil. reduced-motion: sem flow, sem
 * anel, sem fade (estatico; a informacao esta nas linhas/nomes/preenchimento).
 * As outras 18 commodities nao passam por aqui.
 */
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { ComposableMap, Geography, Line, Marker, useGeographies } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { motion, useReducedMotion } from "framer-motion";
import type { SojaFlows, SojaSub, SojaBuyer } from "../../hooks/useSojaFlows";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const GREEN = "#34d399";
const GREEN_GLOW = "rgba(52,211,153,0.9)";
const RED = "#c0564c";
const COMPETIDORES_N3 = new Set([840, 32]); // EUA, Argentina
const PISO_PCT = 1;
const BRASILIA: [number, number] = [-47.93, -15.78];

const SUBS: { key: SojaSub; label: string }[] = [
  { key: "grao", label: "Grão" },
  { key: "farelo", label: "Farelo" },
  { key: "oleo", label: "Óleo" },
];

const ktFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
function fmtVol(kg: number): string {
  const mt = kg / 1e9;
  if (mt >= 1) return `${ktFmt.format(mt)} Mt`;
  return `${ktFmt.format(kg / 1e6)} kt`;
}
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type Drawn = { b: SojaBuyer; centroid: [number, number] };

function SojaLayer({
  buyers,
  maxKg,
  hovered,
  setHovered,
  reduced,
  revealed,
  glowId,
}: {
  buyers: SojaBuyer[];
  maxKg: number;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  reduced: boolean;
  revealed: boolean;
  glowId: string;
}) {
  const { geographies } = useGeographies({ geography: geoUrl });

  const centroids = useMemo(() => {
    const m: Record<number, [number, number]> = {};
    for (const geo of geographies) {
      const n3 = Number(geo.id);
      if (Number.isFinite(n3)) m[n3] = geoCentroid(geo) as [number, number];
    }
    return m;
  }, [geographies]);

  const drawn: Drawn[] = buyers
    .filter((b) => b.pct >= PISO_PCT && b.isoN3 != null && centroids[b.isoN3!])
    .map((b) => ({ b, centroid: centroids[b.isoN3!] }));
  const buyerN3 = new Set(drawn.map((d) => d.b.isoN3!));

  return (
    <>
      {/* Canal 2 — preenchimento */}
      {geographies.map((geo: any) => {
        const n3 = Number(geo.id);
        const isBuyer = buyerN3.has(n3);
        const isComp = !isBuyer && COMPETIDORES_N3.has(n3);
        const fill = isBuyer ? `${GREEN}40` : isComp ? `${RED}55` : "rgba(255,255,255,0.025)";
        const hoverFill = isBuyer ? `${GREEN}60` : isComp ? `${RED}77` : "rgba(255,255,255,0.045)";
        return (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill={fill}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.35}
            style={{
              default: { outline: "none", transition: "fill 0.4s ease" },
              hover: { outline: "none", fill: hoverFill },
              pressed: { outline: "none" },
            }}
          />
        );
      })}

      {/* Canal 1 — linhas: geodesica + dash correndo + glow */}
      {drawn.map(({ b, centroid }, i) => {
        const ratio = maxKg > 0 ? b.kg / maxKg : 0;
        const dashLen = (3 + 4 * (1 - ratio)).toFixed(1);
        const gap = (2.5 + 3 * (1 - ratio)).toFixed(1);
        const dur = (2.0 + 2.8 * (1 - ratio)).toFixed(2); // + volume => + rapido
        const isHov = hovered === b.isoA3;
        return (
          <Line
            key={b.isoA3}
            from={BRASILIA}
            to={centroid}
            stroke={GREEN}
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeDasharray={`${dashLen} ${gap}`}
            className={reduced ? undefined : "soja-flow"}
            filter={`url(#${glowId})`}
            onMouseEnter={() => setHovered(b.isoA3)}
            onMouseLeave={() => setHovered(null)}
            style={{
              opacity: reduced ? 0.82 : revealed ? (isHov ? 1 : 0.78) : 0,
              animationDuration: `${dur}s`,
              transition: `opacity 0.6s ease ${i * 0.04}s`,
              cursor: "pointer",
            }}
          />
        );
      })}

      {/* Marcadores nos centroides reais: anel + ponto + nome */}
      {drawn.map(({ b, centroid }, i) => {
        const isHov = hovered === b.isoA3;
        return (
          <Marker key={`m-${b.isoA3}`} coordinates={centroid}>
            <motion.g
              initial={reduced ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: reduced ? 0 : 0.15 + i * 0.03, duration: 0.35 }}
              onMouseEnter={() => setHovered(b.isoA3)}
              onMouseLeave={() => setHovered(null)}
            >
              {isHov && !reduced && (
                <circle cx={0} cy={0} r={8} fill="rgba(255,255,255,0.05)">
                  <animate attributeName="r" values="4;16" dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.7;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle cx={0} cy={0} r={isHov ? 2.6 : 2} fill={GREEN} filter={`url(#${glowId})`} style={{ transition: "r 0.2s ease" }} />
              <text
                x={0}
                y={-4.5}
                textAnchor="middle"
                style={{
                  fontFamily: "monospace",
                  fontSize: "6.5px",
                  fontWeight: 500,
                  fill: isHov ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.6)",
                  letterSpacing: "0.3px",
                  pointerEvents: "none",
                }}
              >
                {b.namePt}
              </text>
            </motion.g>
          </Marker>
        );
      })}

      {/* Brasil (origem unica, em Brasilia) */}
      <Marker coordinates={BRASILIA}>
        {!reduced && (
          <circle cx={0} cy={0} r={10} fill={`${GOLD}15`}>
            <animate attributeName="r" values="3;20" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx={0} cy={0} r={3.5} fill={GOLD} filter={`url(#${glowId}-gold)`} />
        <text
          x={0}
          y={11}
          textAnchor="middle"
          style={{ fontFamily: "monospace", fontSize: "7px", fontWeight: 600, fill: GOLD, pointerEvents: "none" }}
        >
          Brasil
        </text>
      </Marker>
    </>
  );
}

export default function SojaFlowMap({ flows }: { flows: SojaFlows }) {
  const [sub, setSub] = useState<SojaSub>("grao");
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const glowId = `soja-glow-${uid}`;

  // Entrada: as linhas surgem escalonadas (opacidade 0 -> alvo) no load e na
  // troca de carta. reduced-motion: aparece pronto.
  const [revealed, setRevealed] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)));
    return () => cancelAnimationFrame(id);
  }, [sub, reduced]);

  const data = flows[sub];
  const buyers = data.buyers;
  const maxKg = buyers[0]?.kg ?? 1;
  const drawn = buyers.filter((b) => b.pct >= PISO_PCT);
  const resto = buyers.filter((b) => b.pct < PISO_PCT);
  const restoPct = resto.reduce((s, b) => s + b.pct, 0);

  return (
    <div
      className="relative w-full h-full flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden"
      style={{ backgroundColor: "#050503" }}
    >
      {/* ── Mapa: mundial fixo ── */}
      <div className="relative w-full h-[44vh] flex-shrink-0 sm:h-full sm:flex-1 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 132, center: [25, 8] }}
          width={900}
          height={470}
          style={{ width: "100%", height: "100%", outline: "none" }}
        >
          <defs>
            {/* glow verde (linhas + pontos) */}
            <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feFlood floodColor={GREEN_GLOW} result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* glow dourado (Brasil) */}
            <filter id={`${glowId}-gold`} x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feFlood floodColor={GOLD} result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* o TRACO que corre do Brasil ao destino (dashoffset 60 -> 0) */}
            <style>{`
              @keyframes soja-flow-run { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
              .soja-flow { animation-name: soja-flow-run; animation-timing-function: linear; animation-iteration-count: infinite; }
            `}</style>
          </defs>
          <SojaLayer
            buyers={buyers}
            maxKg={maxKg}
            hovered={hovered}
            setHovered={setHovered}
            reduced={reduced}
            revealed={revealed}
            glowId={glowId}
          />
        </ComposableMap>

        {/* Legenda */}
        <div
          className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5"
          style={{ backgroundColor: "rgba(5,5,3,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5" style={{ backgroundColor: GREEN }} />
            <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
              Comprador
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: `${RED}88` }} />
            <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
              Competidor
            </span>
          </span>
        </div>
      </div>

      {/* ── Card ── */}
      <div
        className="relative w-full sm:w-72 sm:flex-shrink-0 sm:overflow-y-auto"
        style={{ backgroundColor: "rgba(6,5,3,0.96)", borderLeft: `1px solid ${GOLD}22` }}
      >
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[8px] uppercase tracking-[0.22em] mb-0.5" style={{ color: `${GOLD}90` }}>
            Fluxo de exportação
          </div>
          <div className="font-display text-base mb-2" style={{ color: GOLD }}>
            Soja
          </div>
          <div className="flex gap-1">
            {SUBS.map((s) => (
              <button
                key={s.key}
                onClick={() => setSub(s.key)}
                className="font-sans text-[9px] uppercase tracking-wider px-2.5 py-1 transition-all"
                style={
                  sub === s.key
                    ? { backgroundColor: GOLD, color: "#050503", border: `1px solid ${GOLD}` }
                    : {
                        backgroundColor: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.5)",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>
            Volume exportado ({flows.monthsLabel})
          </div>
          <div className="font-display text-lg text-white">{fmtVol(data.totalKg)}</div>
        </div>

        <div className="px-4 py-3">
          <div className="font-sans text-[7px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
            Destinos
          </div>
          <div className="space-y-1">
            {drawn.map((b) => {
              const isHov = hovered === b.isoA3;
              return (
                <div
                  key={b.isoA3}
                  onMouseEnter={() => setHovered(b.isoA3)}
                  onMouseLeave={() => setHovered(null)}
                  className="flex items-center justify-between px-2 py-1 cursor-pointer"
                  style={{
                    backgroundColor: isHov ? `${GREEN}14` : "rgba(255,255,255,0.02)",
                    border: `1px solid ${isHov ? `${GREEN}44` : "rgba(255,255,255,0.05)"}`,
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="font-sans text-[9px] text-white/75">{b.namePt}</span>
                  <span className="font-sans text-[8px]" style={{ color: `${GOLD}cc` }}>
                    {fmtVol(b.kg)} · {pctFmt.format(b.pct)}%
                  </span>
                </div>
              );
            })}
          </div>
          {resto.length > 0 && (
            <div className="font-sans text-[8px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
              + {resto.length} {resto.length === 1 ? "país" : "países"} ({pctFmt.format(restoPct)}% do total)
            </div>
          )}
        </div>

        <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Fonte: MDIC/Secex (Comex Stat) · nível de país
          </div>
        </div>
      </div>
    </div>
  );
}
