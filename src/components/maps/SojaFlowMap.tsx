/**
 * SojaFlowMap — piloto da gramatica nova do mapa (Mapa v2), SO na soja.
 *
 * Canal 1 — LINHA AFILADA CURVA (poligono, nao stroke): bezier quadratica do
 * Brasil a cada destino, cada uma com curvatura propria (bend por rank angular)
 * para o leque abrir e as linhas da Europa nao se fundirem. Nasce ~0,7px no
 * Brasil e engrossa ate a espessura-log (2-14px) no comprador. O afilamento da
 * a direcao; um triangulo PEQUENO na ponta larga e o carimbo de chegada (nao
 * carrega a direcao sozinho). Tres variantes em teste (toggle): solida
 * translucida / contorno da forma / tracejada em segmentos — todas curvas.
 *
 * Canal 2 — PREENCHIMENTO: verde comprador, vermelho competidor (curado:
 * EUA/Argentina, sem linha). Ressalva aceita pelo Gabriel: a Franca inclui a
 * Guiana Francesa no countries-110m (e Franca juridicamente).
 *
 * ANIMACAO DE ENTRADA: no first load e na troca de carta as linhas se
 * DESENHAM do Brasil ao destino (progress 0->1, ~700ms, uma vez) e o
 * triangulo percorre junto. Hover: um pulso unico ao longo da curva.
 * prefers-reduced-motion: tudo aparece pronto, nada se move.
 *
 * ROTULOS: so os paises desenhados (>=1%): bolinha discreta no centroide;
 * nome cinza pequeno so nos grandes (>=5% da carta), a nordeste do ponto
 * (as linhas chegam de sudoeste, entao o nome nao cruza a linha).
 *
 * Enquadramento MUNDIAL FIXO. Sem ZoomableGroup: sem pan/zoom manual.
 * As outras 18 commodities nao passam por aqui.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { ComposableMap, Geography, useGeographies, useMapContext } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { useReducedMotion } from "framer-motion";
import type { SojaFlows, SojaSub, SojaBuyer } from "../../hooks/useSojaFlows";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const GREEN = "#34d399";
const RED = "#c0564c";
const BR_N3 = 76;
const COMPETIDORES_N3 = new Set([840, 32]); // EUA, Argentina
const PISO_PCT = 1; // linha so para >=1% do volume da carta
const NOME_PCT = 5; // nome so para >=5% (os pequenos ficam com a bolinha)

type LineStyle = "solida" | "contorno" | "tracejada";

const SUBS: { key: SojaSub; label: string }[] = [
  { key: "grao", label: "Grão" },
  { key: "farelo", label: "Farelo" },
  { key: "oleo", label: "Óleo" },
];

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

// ── Geometria da cunha curva ──────────────────────────────────────────────
type Pt = { x: number; y: number; nx: number; ny: number; t: number };

/**
 * Amostra a bezier quadratica P0->P2 (controle deslocado pela normal em
 * `bend` px) com N pontos, devolvendo ponto + normal unitaria + t.
 */
function sampleCurve(x1: number, y1: number, x2: number, y2: number, bend: number, N = 26): Pt[] {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = -dy / len; // normal unitaria da corda
  const uy = dx / len;
  const cx = mx + ux * bend;
  const cy = my + uy * bend;
  const pts: Pt[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) * (1 - t);
    const b = 2 * (1 - t) * t;
    const c = t * t;
    const x = a * x1 + b * cx + c * x2;
    const y = a * y1 + b * cy + c * y2;
    // tangente da bezier
    const tx = 2 * (1 - t) * (cx - x1) + 2 * t * (x2 - cx);
    const ty = 2 * (1 - t) * (cy - y1) + 2 * t * (y2 - cy);
    const tl = Math.hypot(tx, ty) || 1;
    pts.push({ x, y, nx: -ty / tl, ny: tx / tl, t });
  }
  return pts;
}

/** Cunha afilada ao longo da curva, truncada em tEnd (animacao de desenho). */
function taperCurvePath(pts: Pt[], w1: number, tEnd: number): string {
  const w0 = 0.35; // metade da largura na origem
  const half = (t: number) => w0 + (w1 / 2 - w0) * t;
  const upto = pts.filter((p) => p.t <= tEnd);
  if (upto.length < 2) return "";
  const left = upto.map((p) => `${p.x + p.nx * half(p.t)},${p.y + p.ny * half(p.t)}`);
  const right = upto.map((p) => `${p.x - p.nx * half(p.t)},${p.y - p.ny * half(p.t)}`).reverse();
  return `M${left.join(" L")} L${right.join(" L")} Z`;
}

/** Variante tracejada: segmentos de cunha com vao, na mesma curva. */
function taperCurveDashes(pts: Pt[], w1: number, tEnd: number, n = 10, duty = 0.62): string[] {
  const w0 = 0.35;
  const half = (t: number) => w0 + (w1 / 2 - w0) * t;
  const at = (t: number): Pt => {
    const i = Math.min(pts.length - 1, Math.max(0, Math.round(t * (pts.length - 1))));
    return pts[i];
  };
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    const t0 = i / n;
    const t1 = Math.min(t0 + duty / n, 1);
    if (t0 >= tEnd) break;
    const te = Math.min(t1, tEnd);
    const a = at(t0);
    const m = at((t0 + te) / 2);
    const b = at(te);
    const seg = [a, m, b];
    const left = seg.map((p) => `${p.x + p.nx * half(p.t)},${p.y + p.ny * half(p.t)}`);
    const right = seg.map((p) => `${p.x - p.nx * half(p.t)},${p.y - p.ny * half(p.t)}`).reverse();
    out.push(`M${left.join(" L")} L${right.join(" L")} Z`);
  }
  return out;
}

/** Triangulo-carimbo na ponta (pequeno, proporcional; nao carrega a direcao). */
function tipTriangle(pts: Pt[], w1: number, tEnd: number): string {
  const i = Math.min(pts.length - 1, Math.max(1, Math.round(tEnd * (pts.length - 1))));
  const p = pts[i];
  const q = pts[i - 1];
  let tx = p.x - q.x;
  let ty = p.y - q.y;
  const tl = Math.hypot(tx, ty) || 1;
  tx /= tl;
  ty /= tl;
  const base = Math.max(3, w1 * 0.9);
  const lenT = base * 1.05;
  const bx = p.x;
  const by = p.y;
  return (
    `M${bx + p.nx * (base / 2)},${by + p.ny * (base / 2)} ` +
    `L${bx + tx * lenT},${by + ty * lenT} ` +
    `L${bx - p.nx * (base / 2)},${by - p.ny * (base / 2)} Z`
  );
}

// ── Camada do mapa ────────────────────────────────────────────────────────
function SojaLayer({
  buyers,
  maxKg,
  hovered,
  setHovered,
  reduced,
  lineStyle,
  progress,
}: {
  buyers: SojaBuyer[];
  maxKg: number;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  reduced: boolean;
  lineStyle: LineStyle;
  progress: number; // 0..1 animacao de entrada
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

  // Curvatura propria por rank angular: vizinhos de angulo ganham bends
  // diferentes e o leque abre (Europa deixa de fundir as linhas).
  const lines = useMemo(() => {
    if (!br) return [];
    const [x1, y1] = br;
    const raw = drawn
      .map((b) => {
        const dst = projection(centroids[b.isoN3!]) as [number, number] | null;
        if (!dst) return null;
        const ang = Math.atan2(dst[1] - y1, dst[0] - x1);
        return { b, dst, ang };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, z) => a.ang - z.ang);
    const n = Math.max(1, raw.length - 1);
    return raw.map((r, i) => {
      const len = Math.hypot(r.dst[0] - x1, r.dst[1] - y1);
      const bend = len * (0.08 + 0.1 * (i / n)); // arco cresce atraves do leque
      const w = widthFor(r.b.kg, maxKg);
      const pts = sampleCurve(x1, y1, r.dst[0], r.dst[1], bend);
      return { b: r.b, dst: r.dst, w, pts };
    });
  }, [drawn, br, centroids, maxKg, projection]);

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

      {/* Canal 1 — cunhas curvas + carimbo, desenhadas ate tEnd */}
      {lines.map(({ b, w, pts }) => {
        const isHov = hovered === b.isoA3;
        const alpha = isHov ? 0.95 : 0.55;
        const tri = tipTriangle(pts, w, tEnd);
        return (
          <g key={b.isoA3}>
            {lineStyle === "solida" && (
              <path d={taperCurvePath(pts, w, tEnd)} fill={GREEN} fillOpacity={alpha} stroke="none" />
            )}
            {lineStyle === "contorno" && (
              <path
                d={taperCurvePath(pts, w, tEnd)}
                fill="none"
                stroke={GREEN}
                strokeWidth={isHov ? 1.2 : 0.85}
                strokeOpacity={isHov ? 1 : 0.85}
              />
            )}
            {lineStyle === "tracejada" &&
              taperCurveDashes(pts, w, tEnd).map((d, i) => (
                <path key={i} d={d} fill={GREEN} fillOpacity={alpha} stroke="none" />
              ))}

            {/* carimbo de chegada (percorre com a animacao, para no destino) */}
            <path d={tri} fill={GREEN} fillOpacity={isHov ? 1 : 0.85} stroke="none" />

            {/* hit area na curva (a cunha e fina demais perto do Brasil) */}
            <path
              d={`M${pts[0].x},${pts[0].y} ${pts.slice(1).map((p) => `L${p.x},${p.y}`).join(" ")}`}
              fill="none"
              stroke="transparent"
              strokeWidth={Math.max(10, w)}
              onMouseEnter={() => setHovered(b.isoA3)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer" }}
            />

            {/* pulso do hover: uma vez, ao longo da curva */}
            {isHov && !reduced && <HoverPulse pts={pts} w={w} />}
          </g>
        );
      })}

      {/* Rotulos: bolinha em todo desenhado; nome so nos grandes (>=5%) */}
      {lines.map(({ b, dst }) => (
        <g key={`lbl-${b.isoA3}`} opacity={Math.min(1, progress * 1.4)} style={{ pointerEvents: "none" }}>
          <circle cx={dst[0]} cy={dst[1]} r={1.8} fill={GREEN} fillOpacity={0.9} />
          {b.pct >= NOME_PCT && (
            <text
              x={dst[0] + 4}
              y={dst[1] - 3}
              textAnchor="start"
              style={{
                fontFamily: "monospace",
                fontSize: "5.5px",
                fontWeight: 500,
                fill: "rgba(255,255,255,0.55)",
                letterSpacing: "0.3px",
              }}
            >
              {b.namePt}
            </text>
          )}
        </g>
      ))}

      {/* Brasil (origem) */}
      {br && (
        <g>
          <circle cx={br[0]} cy={br[1]} r={4} fill={GOLD} stroke="#050503" strokeWidth={1} />
          <text
            x={br[0]}
            y={br[1] + 10}
            textAnchor="middle"
            style={{ fontFamily: "monospace", fontSize: "6px", fontWeight: 600, fill: GOLD, pointerEvents: "none" }}
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
    <circle cx={p.x} cy={p.y} r={Math.max(2, w * 0.4)} fill="#ffffff" opacity={0.9} style={{ pointerEvents: "none" }} />
  );
}

// ── Componente principal ──────────────────────────────────────────────────
export default function SojaFlowMap({ flows }: { flows: SojaFlows }) {
  const [sub, setSub] = useState<SojaSub>("grao");
  const [hovered, setHovered] = useState<string | null>(null);
  const [lineStyle, setLineStyle] = useState<LineStyle>("solida");
  const reduced = !!useReducedMotion();

  // Animacao de entrada: desenha as linhas no first load e na troca de carta.
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
            progress={progress}
          />
        </ComposableMap>

        {/* Legenda + toggle de estilo (teste do piloto) */}
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
          <span
            className="flex items-center gap-1"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.12)", paddingLeft: 8 }}
          >
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
