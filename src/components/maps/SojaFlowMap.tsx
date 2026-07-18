/**
 * SojaFlowMap — piloto da gramatica nova do mapa (Mapa v2), SO na soja.
 *
 * Dois canais independentes:
 *  - LINHA AFILADA (poligono, nao stroke): nasce FINA no Brasil (~0,7px) e
 *    ENGROSSA ate o destino (espessura log 2-14px relativa a carta). O
 *    afilamento E a seta: a ponta larga no comprador comunica a direcao.
 *    Sem cabeca de flecha. Tres variantes em teste (solida translucida,
 *    contorno, tracejada) com toggle no canto — o Gabriel escolhe uma.
 *  - PREENCHIMENTO: verde comprador (tem linha), vermelho competidor (lista
 *    curada EUA/Argentina, sem linha). Soja e exportacao pura: sem amarelo.
 *
 * Enquadramento MUNDIAL FIXO (decisao do Gabriel: o zoom reativo cortava
 * paises; a carta muda as LINHAS, nao o quadro). Sem ZoomableGroup: sem
 * pan/zoom manual por construcao.
 *
 * Hover: UM pulso viaja do Brasil ao comprador e para. prefers-reduced-motion:
 * sem pulso, nada se move (a direcao esta no afilamento, nao no movimento).
 *
 * Ressalva de geometria (reportada): no countries-110m a Franca inclui a
 * Guiana Francesa no mesmo MultiPolygon; quando a Franca pinta (farelo), a
 * Guiana pinta junto. Limitacao da fonte Natural Earth, nao do join.
 */
import { useMemo, useState, useId } from "react";
import { ComposableMap, Geography, useGeographies, useMapContext } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { motion, useReducedMotion } from "framer-motion";
import type { SojaFlows, SojaSub, SojaBuyer } from "../../hooks/useSojaFlows";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const GREEN = "#34d399";
const RED = "#c0564c";
const BR_N3 = 76;
const COMPETIDORES_N3 = new Set([840, 32]); // EUA, Argentina
const PISO_PCT = 1;

type LineStyle = "solida" | "contorno" | "tracejada";

const SUBS: { key: SojaSub; label: string }[] = [
  { key: "grao", label: "Grão" },
  { key: "farelo", label: "Farelo" },
  { key: "oleo", label: "Óleo" },
];

/** Escala log: maior parceiro -> 14px; 1% do maior -> 2px. */
function widthFor(kg: number, maxKg: number): number {
  if (maxKg <= 0 || kg <= 0) return 2;
  return Math.max(2, Math.min(14, 14 + 6 * Math.log10(kg / maxKg)));
}

const ktFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
function fmtVol(kg: number): string {
  const mt = kg / 1e9;
  if (mt >= 1) return `${ktFmt.format(mt)} Mt`;
  return `${ktFmt.format(kg / 1e6)} kt`;
}
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/**
 * Poligono afilado reto: largura total ~0,7px na origem (Brasil) e `w` px no
 * destino. As ~dezenas de linhas convergem finas no Brasil sem virar borrao.
 */
function taperPath(x1: number, y1: number, x2: number, y2: number, w: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const w0 = 0.35; // metade da largura na origem
  const w1 = w / 2; // metade da largura no destino
  return (
    `M${x1 + px * w0},${y1 + py * w0} ` +
    `L${x2 + px * w1},${y2 + py * w1} ` +
    `L${x2 - px * w1},${y2 - py * w1} ` +
    `L${x1 - px * w0},${y1 - py * w0} Z`
  );
}

/** Variante tracejada: o afilado cortado em segmentos com vao (dash de poligono). */
function taperDashes(x1: number, y1: number, x2: number, y2: number, w: number, n = 9, duty = 0.6): string[] {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len;
  const py = dx / len;
  const wAt = (t: number) => 0.35 + (w / 2 - 0.35) * t;
  const at = (t: number): [number, number] => [x1 + dx * t, y1 + dy * t];
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = t0 + duty / n;
    const [ax, ay] = at(t0);
    const [bx, by] = at(Math.min(t1, 1));
    const wa = wAt(t0);
    const wb = wAt(Math.min(t1, 1));
    out.push(
      `M${ax + px * wa},${ay + py * wa} L${bx + px * wb},${by + py * wb} ` +
        `L${bx - px * wb},${by - py * wb} L${ax - px * wa},${ay - py * wa} Z`,
    );
  }
  return out;
}

function SojaLayer({
  buyers,
  maxKg,
  hovered,
  setHovered,
  reduced,
  lineStyle,
}: {
  buyers: SojaBuyer[];
  maxKg: number;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  reduced: boolean;
  lineStyle: LineStyle;
}) {
  const { projection } = useMapContext() as any;
  const { geographies } = useGeographies({ geography: geoUrl });

  const centroids = useMemo(() => {
    const m: Record<number, [number, number]> = {};
    for (const geo of geographies) {
      const n3 = Number(geo.id);
      if (Number.isFinite(n3)) m[n3] = geoCentroid(geo) as [number, number];
    }
    return m;
  }, [geographies]);

  const drawn = buyers.filter((b) => b.pct >= PISO_PCT && b.isoN3 != null && centroids[b.isoN3!]);
  const buyerN3 = new Set(drawn.map((b) => b.isoN3!));
  const br = centroids[BR_N3] ? (projection(centroids[BR_N3]) as [number, number] | null) : null;

  return (
    <>
      {/* Canal 2 — preenchimento */}
      {geographies.map((geo: any) => {
        const n3 = Number(geo.id);
        const isBuyer = buyerN3.has(n3);
        const isComp = !isBuyer && COMPETIDORES_N3.has(n3);
        const fill = isBuyer ? `${GREEN}44` : isComp ? `${RED}55` : "rgba(255,255,255,0.025)";
        const hoverFill = isBuyer ? `${GREEN}66` : isComp ? `${RED}77` : "rgba(255,255,255,0.045)";
        return (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill={fill}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.35}
            style={{
              default: { outline: "none", transition: "fill 0.4s ease" },
              hover: { outline: "none", fill: hoverFill },
              pressed: { outline: "none" },
            }}
          />
        );
      })}

      {/* Canal 1 — linhas afiladas (finas no Brasil, largas no comprador) */}
      {br &&
        drawn.map((b) => {
          const dst = projection(centroids[b.isoN3!]) as [number, number] | null;
          if (!dst) return null;
          const [x1, y1] = br;
          const [x2, y2] = dst;
          const w = widthFor(b.kg, maxKg);
          const isHov = hovered === b.isoA3;
          const baseOpacity = isHov ? 0.95 : 0.55;
          return (
            <g key={b.isoA3}>
              {lineStyle === "solida" && (
                <path d={taperPath(x1, y1, x2, y2, w)} fill={GREEN} fillOpacity={baseOpacity} stroke="none" />
              )}
              {lineStyle === "contorno" && (
                <path
                  d={taperPath(x1, y1, x2, y2, w)}
                  fill="none"
                  stroke={GREEN}
                  strokeWidth={isHov ? 1.3 : 0.9}
                  strokeOpacity={isHov ? 1 : 0.8}
                />
              )}
              {lineStyle === "tracejada" &&
                taperDashes(x1, y1, x2, y2, w).map((d, i) => (
                  <path key={i} d={d} fill={GREEN} fillOpacity={baseOpacity} stroke="none" />
                ))}

              {/* hit area invisivel (o afilado e fino demais perto do Brasil) */}
              <path
                d={`M${x1},${y1} L${x2},${y2}`}
                fill="none"
                stroke="transparent"
                strokeWidth={Math.max(10, w)}
                onMouseEnter={() => setHovered(b.isoA3)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer" }}
              />

              {/* pulso: uma vez, Brasil -> comprador */}
              {isHov && !reduced && (
                <motion.circle
                  r={Math.max(2, w * 0.4)}
                  fill="#ffffff"
                  initial={{ cx: x1, cy: y1, opacity: 0.9 }}
                  animate={{ cx: x2, cy: y2, opacity: [0.9, 0.9, 0] }}
                  transition={{ duration: 0.95, ease: "easeOut", times: [0, 0.85, 1] }}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          );
        })}

      {/* Brasil (origem) */}
      {br && <circle cx={br[0]} cy={br[1]} r={4} fill={GOLD} stroke="#050503" strokeWidth={1} />}
    </>
  );
}

export default function SojaFlowMap({ flows }: { flows: SojaFlows }) {
  const [sub, setSub] = useState<SojaSub>("grao");
  const [hovered, setHovered] = useState<string | null>(null);
  const [lineStyle, setLineStyle] = useState<LineStyle>("solida");
  const reduced = !!useReducedMotion();
  useId(); // mantem ids estaveis em SSR/strict

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
      {/* ── Mapa: mundial fixo (a carta muda as linhas, nao o quadro) ── */}
      <div className="relative w-full h-[44vh] flex-shrink-0 sm:h-full sm:flex-1 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 132, center: [25, 8] }}
          width={900}
          height={470}
          style={{ width: "100%", height: "100%", outline: "none" }}
        >
          <SojaLayer
            buyers={buyers}
            maxKg={maxKg}
            hovered={hovered}
            setHovered={setHovered}
            reduced={reduced}
            lineStyle={lineStyle}
          />
        </ComposableMap>

        {/* Legenda + toggle de estilo (teste do piloto; sai quando o Gabriel escolher) */}
        <div
          className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 px-3 py-1.5"
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
          <span className="flex items-center gap-1" style={{ borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: 8 }}>
            {(["solida", "contorno", "tracejada"] as LineStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setLineStyle(s)}
                className="font-sans text-[7px] uppercase tracking-wide px-1.5 py-0.5"
                style={{
                  color: lineStyle === s ? "#050503" : "rgba(255,255,255,0.45)",
                  backgroundColor: lineStyle === s ? GOLD : "transparent",
                  border: `1px solid ${lineStyle === s ? GOLD : "rgba(255,255,255,0.15)"}`,
                }}
              >
                {s}
              </button>
            ))}
          </span>
        </div>
      </div>

      {/* ── Card: desktop direita / mobile embaixo com TODO o conteudo ── */}
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
