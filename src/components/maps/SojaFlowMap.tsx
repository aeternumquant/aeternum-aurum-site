/**
 * SojaFlowMap — piloto da gramatica nova do mapa (Mapa v2), SO na soja.
 *
 * SAIDAS COSTEIRAS (a solucao do no do Brasil): as linhas NAO saem de um
 * ponto unico — saem de FAIXAS da costa conforme o rumo (bearing) do destino,
 * como o fluxo real escoa:
 *   rumo N  (Caribe/Am. Central)  -> costa Norte (~Belem/Itaqui)
 *   rumo NE (Europa/Africa)       -> Nordeste (~Fortaleza/Recife)
 *   rumo L  (Asia)                -> Sudeste (~Vitoria/Santos)
 *   rumo S  (Cone Sul/Africa Sul) -> Sul (~Paranagua/Rio Grande)
 * Interpolacao continua DENTRO da faixa (bearing -> ponto da costa), entao
 * duas linhas nunca nascem no mesmo pixel. Sutil: sem porto nomeado, sem
 * bolinha na saida — a linha simplesmente emerge do litoral.
 * O rotulo "Brasil" vai em BRASILIA (centro geografico), longe das saidas.
 *
 * LINHA: tracejada com BRILHO (glow suave), stroke com espessura-log 2-10px
 * relativa a carta (maior parceiro = 10px). Curva quadratica SUAVE (as saidas
 * espalhadas ja separam; bend 10-17%), arco por cima. Sem triangulo, sem
 * cunha (descartados). A direcao vem da animacao de entrada (a linha se
 * desenha do litoral ao destino) e das saidas costeiras.
 *
 * PREENCHIMENTO: verde comprador, vermelho competidor (curado EUA/Argentina).
 * ROTULOS: TODOS os desenhados (>=1%) com nome (6,5px) + bolinha.
 * Hover: pulso unico ao longo da curva. reduced-motion: pronto, nada se move.
 * Enquadramento mundial fixo. As outras 18 commodities nao passam por aqui.
 */
import { useEffect, useMemo, useRef, useState, useId } from "react";
import { ComposableMap, Geography, useGeographies, useMapContext } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import type { SojaFlows, SojaSub, SojaBuyer } from "../../hooks/useSojaFlows";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const GREEN = "#34d399";
const RED = "#c0564c";
const COMPETIDORES_N3 = new Set([840, 32]); // EUA, Argentina
const PISO_PCT = 1;

const BRASILIA: [number, number] = [-47.93, -15.78];
// Faixas da costa (lng, lat), Norte -> Sul.
const COAST = {
  belem: [-48.3, -1.2] as [number, number],
  fortaleza: [-38.6, -3.8] as [number, number],
  recife: [-34.9, -8.2] as [number, number],
  vitoria: [-40.3, -20.3] as [number, number],
  santos: [-46.3, -23.95] as [number, number],
  paranagua: [-48.5, -25.5] as [number, number],
  rioGrande: [-52.1, -32.1] as [number, number],
};

const SUBS: { key: SojaSub; label: string }[] = [
  { key: "grao", label: "Grão" },
  { key: "farelo", label: "Farelo" },
  { key: "oleo", label: "Óleo" },
];

/** Escala log 2-10px: maior parceiro -> 10px; 1% do maior -> 2px. */
function widthFor(kg: number, maxKg: number): number {
  if (maxKg <= 0 || kg <= 0) return 2;
  return Math.max(2, Math.min(10, 10 + 4 * Math.log10(kg / maxKg)));
}

/**
 * Ponto de saida na costa pelo bearing (graus; 0 = leste, 90 = norte, tela).
 * Interpola dentro da faixa: bearings vizinhos saem de pontos vizinhos.
 */
function exitFor(phi: number): [number, number] {
  const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
  if (phi > 70) return COAST.belem; // norte (Caribe; e oeste via Amazonia)
  if (phi > 35) return lerp(COAST.fortaleza, COAST.recife, (70 - phi) / 35); // nordeste (Europa/Africa)
  if (phi > 0) return lerp(COAST.vitoria, COAST.santos, (35 - phi) / 35); // sudeste (Asia)
  return lerp(COAST.paranagua, COAST.rioGrande, Math.min(1, -phi / 40)); // sul
}

const ktFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
function fmtVol(kg: number): string {
  const mt = kg / 1e9;
  if (mt >= 1) return `${ktFmt.format(mt)} Mt`;
  return `${ktFmt.format(kg / 1e6)} kt`;
}
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ── Geometria ─────────────────────────────────────────────────────────────
type Pt = { x: number; y: number; t: number };

/** Bezier quadratica amostrada, arco por cima (apice ao norte). */
function sampleCurve(x1: number, y1: number, x2: number, y2: number, bend: number, N = 26): Pt[] {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  let ux = -dy / len;
  let uy = dx / len;
  if (uy > 0) {
    ux = -ux;
    uy = -uy; // apice sempre para cima (tela: y cresce para baixo)
  }
  const cx = mx + ux * bend;
  const cy = my + uy * bend;
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    pts.push({ x: a * x1 + b * cx + c * x2, y: a * y1 + b * cy + c * y2, t });
  }
  return pts;
}

/** Polyline ate tEnd (animacao de entrada: a linha se desenha). */
function pathUpTo(pts: Pt[], tEnd: number): string {
  const upto = pts.filter((p) => p.t <= tEnd);
  if (upto.length < 2) return "";
  return `M${upto[0].x},${upto[0].y} ${upto.slice(1).map((p) => `L${p.x},${p.y}`).join(" ")}`;
}

// ── Camada do mapa ────────────────────────────────────────────────────────
function SojaLayer({
  buyers,
  maxKg,
  hovered,
  setHovered,
  reduced,
  progress,
  glowId,
}: {
  buyers: SojaBuyer[];
  maxKg: number;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  reduced: boolean;
  progress: number;
  glowId: string;
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
  const bsb = projection(BRASILIA) as [number, number] | null;

  // Saida costeira pelo bearing + curva suave escalonada pelo rank angular.
  const lines = useMemo(() => {
    if (!bsb) return [];
    const [x0, y0] = bsb;
    const raw = drawn
      .map((b) => {
        const dst = projection(centroids[b.isoN3!]) as [number, number] | null;
        if (!dst) return null;
        const phi = (Math.atan2(-(dst[1] - y0), dst[0] - x0) * 180) / Math.PI;
        return { b, dst, phi };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, z) => a.phi - z.phi);
    const n = Math.max(1, raw.length - 1);
    return raw.map((r, i) => {
      const exit = projection(exitFor(r.phi)) as [number, number];
      const len = Math.hypot(r.dst[0] - exit[0], r.dst[1] - exit[1]);
      const bend = len * (0.1 + 0.07 * (i / n)); // suave: as saidas ja separam
      const w = widthFor(r.b.kg, maxKg);
      const pts = sampleCurve(exit[0], exit[1], r.dst[0], r.dst[1], bend);
      return { b: r.b, dst: r.dst, w, pts };
    });
  }, [drawn, bsb, centroids, maxKg, projection]);

  const tEnd = Math.max(0.04, progress);

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

      {/* Canal 1 — linhas tracejadas com brilho, saindo da costa */}
      {lines.map(({ b, w, pts }) => {
        const isHov = hovered === b.isoA3;
        const d = pathUpTo(pts, tEnd);
        return (
          <g key={b.isoA3}>
            <path
              d={d}
              fill="none"
              stroke={GREEN}
              strokeWidth={w}
              strokeLinecap="round"
              strokeDasharray="7 4.5"
              opacity={isHov ? 1 : 0.72}
              filter={`url(#${glowId})`}
              style={{ transition: "opacity 0.25s ease" }}
            />
            {/* hit area (curva inteira, largura generosa) */}
            <path
              d={pathUpTo(pts, 1)}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(12, w + 6)}
              onMouseEnter={() => setHovered(b.isoA3)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            />
            {isHov && !reduced && <HoverPulse pts={pts} w={w} />}
          </g>
        );
      })}

      {/* Rotulos: TODOS os desenhados — nome + bolinha */}
      {lines.map(({ b, dst }) => (
        <g key={`lbl-${b.isoA3}`} opacity={Math.min(1, progress * 1.4)} style={{ pointerEvents: "none" }}>
          <circle cx={dst[0]} cy={dst[1]} r={1.9} fill={GREEN} fillOpacity={0.95} />
          <text
            x={dst[0] + 4.5}
            y={dst[1] - 3.5}
            textAnchor="start"
            style={{
              fontFamily: "monospace",
              fontSize: "6.5px",
              fontWeight: 500,
              fill: "rgba(255,255,255,0.62)",
              letterSpacing: "0.3px",
            }}
          >
            {b.namePt}
          </text>
        </g>
      ))}

      {/* "Brasil" em Brasilia (centro geografico; as saidas estao na costa) */}
      {bsb && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx={bsb[0]} cy={bsb[1]} r={2.2} fill={GOLD} />
          <text
            x={bsb[0]}
            y={bsb[1] + 9}
            textAnchor="middle"
            style={{ fontFamily: "monospace", fontSize: "6.5px", fontWeight: 600, fill: GOLD }}
          >
            Brasil
          </text>
        </g>
      )}
    </>
  );
}

/** Pulso unico viajando ao longo da curva (rAF; morre sozinho). */
function HoverPulse({ pts, w }: { pts: Pt[]; w: number }) {
  const [i, setI] = useState(0);
  const raf = useRef<number | null>(null);
  useEffect(() => {
    const t0 = performance.now();
    const dur = 900;
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setI(Math.round(p * (pts.length - 1)));
      if (p < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [pts]);
  const p = pts[Math.min(i, pts.length - 1)];
  const done = i >= pts.length - 1;
  return done ? null : (
    <circle cx={p.x} cy={p.y} r={Math.max(2.2, w * 0.55)} fill="#ffffff" opacity={0.9} style={{ pointerEvents: "none" }} />
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function SojaFlowMap({ flows }: { flows: SojaFlows }) {
  const [sub, setSub] = useState<SojaSub>("grao");
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");
  const glowId = `soja-glow-${uid}`;

  // Animacao de entrada (first load e troca de carta): a linha se desenha.
  const [progress, setProgress] = useState(reduced ? 1 : 0);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    if (reduced) {
      setProgress(1);
      return;
    }
    setProgress(0);
    const t0 = performance.now();
    const dur = 700;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const p = Math.min(1, (now - t0) / dur);
      setProgress(easeOut(p));
      if (p < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
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
            {/* brilho suave das linhas (verde) */}
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor={GREEN} floodOpacity="0.55" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <SojaLayer
            buyers={buyers}
            maxKg={maxKg}
            hovered={hovered}
            setHovered={setHovered}
            reduced={reduced}
            progress={progress}
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

      {/* ── Card: desktop direita / mobile embaixo ── */}
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
