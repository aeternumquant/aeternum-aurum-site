/**
 * SojaFlowMap — piloto da gramatica nova do mapa (Mapa v2), SO na soja.
 *
 * Dois canais independentes:
 *  - LINHA: verde (Brasil EXPORTA), espessura = volume em escala LOG 2-14px
 *    relativa a carta atual (maior parceiro = 14px). Seta estatica na ponta.
 *  - PREENCHIMENTO: verde comprador (tem linha), vermelho competidor (lista
 *    curada EUA/Argentina, sem linha). Soja e exportacao pura: sem amarelo.
 *
 * Enquadramento reativo a carta (grao->Asia, farelo->Europa, oleo->India) via
 * ZoomableGroup: center/zoom animados por tween (rAF), drag manual TRAVADO
 * (filterZoomEvent=>false). prefers-reduced-motion: corte seco, sem pulso.
 *
 * As outras 18 commodities NAO passam por aqui (GlobalFlowMap so monta este
 * componente quando a soja esta selecionada).
 */
import { useEffect, useMemo, useRef, useState, useId } from "react";
import {
  ComposableMap,
  ZoomableGroup,
  Geography,
  useGeographies,
  useMapContext,
} from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { motion, useReducedMotion } from "framer-motion";
import type { SojaFlows, SojaSub, SojaBuyer } from "../../hooks/useSojaFlows";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const GREEN = "#34d399"; // comprador / exportacao
const RED = "#c0564c"; // competidor (vermelho sobrio, Sistema A)
const BR_N3 = 76; // Brasil ISO 3166-1 numerico
const COMPETIDORES_N3 = new Set([840, 32]); // EUA (840), Argentina (032)
const PISO_PCT = 1; // so desenha linha para pais com >=1% do volume da carta

const SUBS: { key: SojaSub; label: string }[] = [
  { key: "grao", label: "Grão" },
  { key: "farelo", label: "Farelo" },
  { key: "oleo", label: "Óleo" },
];

// Enquadramento por carta (center [lng,lat] + zoom do ZoomableGroup). Destino
// enfatizado, mas o Brasil (origem, ~-50 lng) fica na borda esquerda para as
// linhas terem origem visivel. Valores de PRIMEIRA versao — precisam de ajuste
// fino visual (pnpm dev): o quadro tem que conter Brasil + o grosso do destino.
const FRAME: Record<SojaSub, { center: [number, number]; zoom: number }> = {
  grao: { center: [35, 8], zoom: 1.5 }, // Brasil (esq) -> China (dir), Asia em foco
  farelo: { center: [-8, 42], zoom: 2.0 }, // Brasil (esq) -> Europa (centro)
  oleo: { center: [14, 8], zoom: 1.55 }, // Brasil (esq) -> India (dir)
};

/** Escala log: maior parceiro (ratio 1) -> 14px; 1% do maior -> 2px. */
function widthFor(kg: number, maxKg: number): number {
  if (maxKg <= 0 || kg <= 0) return 2;
  return Math.max(2, Math.min(14, 14 + 6 * Math.log10(kg / maxKg)));
}

const ktFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
/** KG -> "85,3 Mt" ou "1,96 Mt" / "740 kt". */
function fmtVol(kg: number): string {
  const mt = kg / 1e9;
  if (mt >= 1) return `${ktFmt.format(mt)} Mt`;
  return `${ktFmt.format(kg / 1e6)} kt`;
}
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Camada interna (dentro do ZoomableGroup): tem projecao + geometria. */
function SojaLayer({
  buyers,
  maxKg,
  hovered,
  setHovered,
  reduced,
  arrowId,
}: {
  buyers: SojaBuyer[];
  maxKg: number;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  reduced: boolean;
  arrowId: string;
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
      {/* Canal 2 — preenchimento dos paises */}
      {geographies.map((geo: any) => {
        const n3 = Number(geo.id);
        const isBuyer = buyerN3.has(n3);
        const isComp = !isBuyer && COMPETIDORES_N3.has(n3);
        const fill = isBuyer ? `${GREEN}44` : isComp ? `${RED}55` : "rgba(255,255,255,0.025)";
        const hoverFill = isBuyer ? `${GREEN}66` : isComp ? `${RED}77` : `${GOLD}0f`;
        return (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill={fill}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth={0.35}
            vectorEffect="non-scaling-stroke"
            style={{
              default: { outline: "none", transition: "fill 0.4s ease" },
              hover: { outline: "none", fill: hoverFill },
              pressed: { outline: "none" },
            }}
          />
        );
      })}

      {/* Canal 1 — linhas (verde, export) por centroide, escala log, seta na ponta */}
      {br &&
        drawn.map((b) => {
          const dst = projection(centroids[b.isoN3!]) as [number, number] | null;
          if (!dst) return null;
          const [x1, y1] = br;
          const [x2, y2] = dst;
          const d = `M${x1},${y1} L${x2},${y2}`;
          const w = widthFor(b.kg, maxKg);
          const isHov = hovered === b.isoA3;
          return (
            <g key={b.isoA3}>
              <path
                d={d}
                fill="none"
                stroke={GREEN}
                strokeWidth={w}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                markerEnd={`url(#${arrowId})`}
                opacity={isHov ? 1 : 0.82}
                onMouseEnter={() => setHovered(b.isoA3)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: "pointer", transition: "opacity 0.25s ease" }}
              />
              {/* Pulso: uma vez, do Brasil ao comprador (direcao da seta). Sem loop. */}
              {isHov && !reduced && (
                <motion.circle
                  r={Math.max(2.2, w * 0.5)}
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
      {br && (
        <circle cx={br[0]} cy={br[1]} r={4.5} fill={GOLD} stroke="#050503" strokeWidth={1} />
      )}
    </>
  );
}

export default function SojaFlowMap({ flows }: { flows: SojaFlows }) {
  const [sub, setSub] = useState<SojaSub>("grao");
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const arrowId = `soja-arrow-${uid}`;

  const data = flows[sub];
  const buyers = data.buyers;
  const maxKg = buyers[0]?.kg ?? 1;
  const drawn = buyers.filter((b) => b.pct >= PISO_PCT);
  const resto = buyers.filter((b) => b.pct < PISO_PCT);
  const restoPct = resto.reduce((s, b) => s + b.pct, 0);

  // Enquadramento reativo: tween de center+zoom na troca de carta (corte seco em reduced).
  const [frame, setFrame] = useState(FRAME.grao);
  const frameRef = useRef(frame);
  frameRef.current = frame;
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const target = FRAME[sub];
    if (reduced) {
      setFrame(target);
      return;
    }
    const start = frameRef.current;
    const t0 = performance.now();
    const dur = 750;
    const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      const e = ease(p);
      setFrame({
        center: [
          start.center[0] + (target.center[0] - start.center[0]) * e,
          start.center[1] + (target.center[1] - start.center[1]) * e,
        ],
        zoom: start.zoom + (target.zoom - start.zoom) * e,
      });
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [sub, reduced]);

  return (
    <div className="w-full h-full flex flex-col sm:flex-row" style={{ backgroundColor: "#050503" }}>
      {/* ── Mapa (desktop ~68% esquerda / mobile em cima) ── */}
      <div className="relative flex-1 min-h-[280px] sm:min-h-0 overflow-hidden">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 150 }}
          width={820}
          height={520}
          style={{ width: "100%", height: "100%", outline: "none" }}
        >
          <defs>
            <marker
              id={arrowId}
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M0,0 L10,5 L0,10 z" fill={GREEN} />
            </marker>
          </defs>
          <ZoomableGroup
            center={frame.center}
            zoom={frame.zoom}
            minZoom={1}
            maxZoom={8}
            filterZoomEvent={() => false}
          >
            <SojaLayer
              buyers={buyers}
              maxKg={maxKg}
              hovered={hovered}
              setHovered={setHovered}
              reduced={reduced}
              arrowId={arrowId}
            />
          </ZoomableGroup>
        </ComposableMap>

        {/* Legenda + carta atual */}
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

      {/* ── Card (desktop ~32% direita / mobile embaixo, largura cheia) ── */}
      <div
        className="w-full sm:w-72 sm:flex-shrink-0 overflow-y-auto"
        style={{ backgroundColor: "rgba(6,5,3,0.96)", borderLeft: `1px solid ${GOLD}22` }}
      >
        {/* Cabecalho + sub-produtos (a carta manda no mapa) */}
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

        {/* Total da carta */}
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>
            Volume exportado ({flows.monthsLabel})
          </div>
          <div className="font-display text-lg text-white">{fmtVol(data.totalKg)}</div>
        </div>

        {/* Compradores (>= piso) */}
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

        {/* Atribuicao */}
        <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Fonte: MDIC/Secex (Comex Stat) · nível de país
          </div>
        </div>
      </div>
    </div>
  );
}
