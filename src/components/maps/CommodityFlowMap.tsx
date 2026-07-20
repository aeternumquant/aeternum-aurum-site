/**
 * CommodityFlowMap — a lei do Mapa v2 (fechada no piloto da soja), generica
 * para qualquer commodity da FLOW_CARDS. HERDA a calibracao da soja sem
 * mudanca: linha geodesica uniforme 1,6px com dash 5/3,5 correndo (3s), glow,
 * bolinha sqrt (area ~ volume, piso 2 / teto 6,5), piso de 1%, enquadramento
 * mundial fixo, entrada escalonada, hover, reduced-motion.
 *
 * O que a generalizacao adiciona (decisoes do Gabriel):
 *  - DIRECAO: export = linha VERDE Brasilia -> pais; import = linha AMBAR
 *    pais -> Brasilia (o from/to invertido faz o dash correr para dentro).
 *  - PREENCHIMENTO: verde comprador / ambar fornecedor / LISTRADO 45 graus os
 *    dois / vermelho competidor (so lista curada).
 *  - BOLINHA "os dois": miolo verde + anel ambar (listra nao cabe em circulo).
 *  - NOMES RADIAIS: rotulo empurrado para FORA (direcao Brasilia -> pais),
 *    do lado oposto a linha que chega — nao colide, vale para as 19.
 *  - fmtVol com degrau Mt -> kt -> t (ouro exporta ~36 t; "0 kt" era mentira).
 *  - Card: bloco de preco (via prop, com a honestidade de sempre) + totais e
 *    parceiros exatos por direcao + "+N paises". priceNote/flowNote quando
 *    preco e fluxo sao produtos diferentes (carne, cobre, petroleo).
 */
import { useEffect, useMemo, useRef, useState, useId, type ReactNode } from "react";
import { ComposableMap, Geography, Line, Marker, useGeographies } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { motion, useReducedMotion } from "framer-motion";
import type { FlowCardCfg, SubCardCfg } from "../../lib/flowMapConfig";
import type { CommodityFlows, Partner, TradeSide } from "../../hooks/useTradeFlows";
import { TrendingUp, TrendingDown, MapPin } from "lucide-react";
import { usePsdBalance, fmtPsd, type PsdBalance } from "../../hooks/usePsdBalance";
import { usePamProduction, usePamAbate, fmtTon, fmtCwe, type PamProduction, type Abate } from "../../hooks/useIbge";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const GREEN = "#34d399";
const GREEN_GLOW = "rgba(52,211,153,0.9)";
const AMBER = "#d9b13b"; // fornecedor (mais saturado que o GOLD do Brasil)
const AMBER_GLOW = "rgba(217,177,59,0.9)";
const RED = "#c0564c";
const PISO_PCT = 1;
const BRASILIA: [number, number] = [-47.93, -15.78];

/** Raio da bolinha: sqrt (area ~ volume). Herdado da soja, sem recalibracao. */
const R_PISO = 2;
const R_TETO = 6.5;
function radiusFor(kg: number, maxKg: number): number {
  if (maxKg <= 0 || kg <= 0) return R_PISO;
  return R_PISO + (R_TETO - R_PISO) * Math.sqrt(kg / maxKg);
}

const nFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
/** Degrau Mt -> kt -> t: protege commodity pequena (ouro ~36 t != "0 kt"). */
function fmtVol(kg: number): string {
  if (kg >= 1e9) return `${nFmt.format(kg / 1e9)} Mt`;
  if (kg >= 1e6) return `${nFmt.format(kg / 1e6)} kt`;
  return `${nFmt.format(kg / 1e3)} t`;
}
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

type SideEntry = { b: Partner; centroid: [number, number] };

function sideDrawn(side: TradeSide | undefined, centroids: Record<number, [number, number]>): SideEntry[] {
  if (!side) return [];
  return side.partners
    .filter((b) => b.pct >= PISO_PCT && b.isoN3 != null && centroids[b.isoN3!])
    .map((b) => ({ b, centroid: centroids[b.isoN3!] }));
}

function FlowLayer({
  cfg,
  exp,
  imp,
  hovered,
  setHovered,
  reduced,
  revealed,
  uid,
}: {
  cfg: FlowCardCfg;
  exp: TradeSide | undefined;
  imp: TradeSide | undefined;
  hovered: string | null;
  setHovered: (v: string | null) => void;
  reduced: boolean;
  revealed: boolean;
  uid: string;
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

  const expDrawn = sideDrawn(exp, centroids);
  const impDrawn = sideDrawn(imp, centroids);
  const buyerN3 = new Set(expDrawn.map((d) => d.b.isoN3!));
  const supplierN3 = new Set(impDrawn.map((d) => d.b.isoN3!));
  const competitors = new Set(cfg.competitorsN3 ?? []);

  // Caso 2: pais nos DOIS conjuntos ganha linhas PARALELAS (offset
  // perpendicular em graus; sign +1 = lado da verde, -1 = lado da ambar).
  // Pais de uma direcao so: sem offset (linha direta ao centroide).
  const PAR_OFF = 1.0; // graus ≈ 2,3px no scale 132 (≈4,6px entre as duas)
  const parallelFor = (n3: number, centroid: [number, number], sign: 1 | -1) => {
    if (!(buyerN3.has(n3) && supplierN3.has(n3))) return { a: BRASILIA, b: centroid };
    const dx = centroid[0] - BRASILIA[0];
    const dy = centroid[1] - BRASILIA[1];
    const len = Math.hypot(dx, dy) || 1;
    const px = (-dy / len) * PAR_OFF * sign;
    const py = (dx / len) * PAR_OFF * sign;
    return {
      a: [BRASILIA[0] + px, BRASILIA[1] + py] as [number, number],
      b: [centroid[0] + px, centroid[1] + py] as [number, number],
    };
  };

  // Bolinha por pais (uma so, mesmo nos dois): raio pelo volume TOTAL do sub.
  const markers = useMemo(() => {
    const m = new Map<number, { b: Partner; centroid: [number, number]; kg: number; both: boolean; dir: "export" | "import" }>();
    for (const { b, centroid } of expDrawn) m.set(b.isoN3!, { b, centroid, kg: b.kg, both: false, dir: "export" });
    for (const { b, centroid } of impDrawn) {
      const prev = m.get(b.isoN3!);
      if (prev) {
        prev.kg += b.kg;
        prev.both = true;
      } else m.set(b.isoN3!, { b, centroid, kg: b.kg, both: false, dir: "import" });
    }
    return [...m.values()];
  }, [expDrawn, impDrawn]);
  const maxMarkerKg = markers.reduce((s, x) => Math.max(s, x.kg), 0);

  return (
    <>
      {/* Canal 2 — preenchimento: verde / ambar / listrado / vermelho */}
      {geographies.map((geo: any) => {
        const n3 = Number(geo.id);
        const isBuyer = buyerN3.has(n3);
        const isSupplier = supplierN3.has(n3);
        const isComp = !isBuyer && !isSupplier && competitors.has(n3);
        const fill =
          isBuyer && isSupplier
            ? `url(#both-${uid})`
            : isBuyer
            ? `${GREEN}40`
            : isSupplier
            ? `${AMBER}44`
            : isComp
            ? `${RED}55`
            : "rgba(255,255,255,0.025)";
        const hoverFill =
          isBuyer && isSupplier
            ? `url(#both-${uid})`
            : isBuyer
            ? `${GREEN}60`
            : isSupplier
            ? `${AMBER}66`
            : isComp
            ? `${RED}77`
            : "rgba(255,255,255,0.045)";
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

      {/* Canal 1 — linhas uniformes finas, dash correndo. Verde sai; ambar entra.
          Pais que faz OS DOIS (Caso 2): as duas linhas em PARALELAS com offset
          perpendicular (~1 grau ≈ 2,3px por lado no scale 132) — verde de um
          lado, ambar do outro, cada dash correndo no seu sentido. Sobrepor
          viraria sopa verde-ambar. */}
      {expDrawn.map(({ b, centroid }, i) => (
        <Line
          key={`e-${b.isoA3}`}
          from={parallelFor(b.isoN3!, centroid, 1).a}
          to={parallelFor(b.isoN3!, centroid, 1).b}
          stroke={GREEN}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray="5 3.5"
          className={reduced ? undefined : "cflow-run"}
          filter={`url(#glow-g-${uid})`}
          onMouseEnter={() => setHovered(b.isoA3)}
          onMouseLeave={() => setHovered(null)}
          style={{
            opacity: reduced ? 0.82 : revealed ? (hovered === b.isoA3 ? 1 : 0.78) : 0,
            animationDuration: "3s",
            transition: `opacity 0.6s ease ${i * 0.04}s`,
            cursor: "pointer",
          }}
        />
      ))}
      {impDrawn.map(({ b, centroid }, i) => (
        <Line
          key={`i-${b.isoA3}`}
          from={parallelFor(b.isoN3!, centroid, -1).b}
          to={parallelFor(b.isoN3!, centroid, -1).a}
          stroke={AMBER}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeDasharray="5 3.5"
          className={reduced ? undefined : "cflow-run"}
          filter={`url(#glow-a-${uid})`}
          onMouseEnter={() => setHovered(b.isoA3)}
          onMouseLeave={() => setHovered(null)}
          style={{
            opacity: reduced ? 0.82 : revealed ? (hovered === b.isoA3 ? 1 : 0.78) : 0,
            animationDuration: "3s",
            transition: `opacity 0.6s ease ${(expDrawn.length + i) * 0.04}s`,
            cursor: "pointer",
          }}
        />
      ))}

      {/* Marcadores: bolinha (raio sqrt) + anel(hover) + NOME RADIAL para fora */}
      {markers.map(({ b, centroid, kg, both, dir }, i) => {
        const isHov = hovered === b.isoA3;
        const r = radiusFor(kg, maxMarkerKg);
        const core = dir === "import" && !both ? AMBER : GREEN;
        // rotulo radial: empurrado na direcao Brasilia -> pais (fora da linha).
        const dxg = centroid[0] - BRASILIA[0];
        const dyg = -(centroid[1] - BRASILIA[1]); // tela: y cresce para baixo
        const len = Math.hypot(dxg, dyg) || 1;
        const ox = (dxg / len) * (r + 4);
        const oy = (dyg / len) * (r + 4);
        const anchor = ox >= 0 ? "start" : "end";
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
                <circle cx={0} cy={0} r={r} fill="rgba(255,255,255,0.05)">
                  <animate attributeName="r" values={`${r.toFixed(1)};${(r + 11).toFixed(1)}`} dur="1.8s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.6;0" dur="1.8s" repeatCount="indefinite" />
                </circle>
              )}
              <circle
                cx={0}
                cy={0}
                r={isHov ? r + 0.6 : r}
                fill={core}
                fillOpacity={0.92}
                stroke={both ? AMBER : "none"}
                strokeWidth={both ? 1.2 : 0}
                filter={`url(#glow-${core === AMBER ? "a" : "g"}-${uid})`}
                style={{ transition: "r 0.2s ease" }}
              />
              <text
                x={ox}
                y={oy + 2}
                textAnchor={anchor}
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

      {/* Brasil (origem/destino, em Brasilia) */}
      <Marker coordinates={BRASILIA}>
        {!reduced && (
          <circle cx={0} cy={0} r={10} fill={`${GOLD}15`}>
            <animate attributeName="r" values="3;20" dur="2.4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
          </circle>
        )}
        <circle cx={0} cy={0} r={3.5} fill={GOLD} filter={`url(#glow-o-${uid})`} />
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

const GREEN_EXP = "#1baf7a";
const GRAY_USE = "var(--border-strong, rgba(255,255,255,0.28))"; // --border-strong ainda nao existe no CSS
const DELTA_UP = "#1d9e75";
const DELTA_DOWN = "#c0564c";

/** Delta de 5 anos: SEMPRE com "em 5 anos" (nunca parecer anual). null = oculto. */
function Delta({ pct }: { pct: number | null }) {
  if (pct == null) return null;
  const up = pct >= 0;
  const Icon = up ? TrendingUp : TrendingDown;
  return (
    <span className="inline-flex items-center gap-0.5" style={{ color: up ? DELTA_UP : DELTA_DOWN }}>
      <Icon className="w-2.5 h-2.5" />
      <span className="font-sans text-[9px] font-semibold">{up ? "+" : ""}{pct}%</span>
      <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.35)" }}>em 5 anos</span>
    </span>
  );
}

/** So o anel (proporcao exporta/consome). */
function DonutRing({ expFrac, domPct, verb }: { expFrac: number; domPct: number; verb: string }) {
  const R = 18;
  const C = 2 * Math.PI * R;
  return (
    <svg width={54} height={54} viewBox="0 0 48 48" className="flex-shrink-0">
      <circle cx={24} cy={24} r={R} fill="none" stroke={GRAY_USE} strokeWidth={6} />
      <circle cx={24} cy={24} r={R} fill="none" stroke={GREEN_EXP} strokeWidth={6}
        strokeDasharray={`${expFrac * C} ${C}`} transform="rotate(-90 24 24)" />
      <text x={24} y={23} textAnchor="middle" style={{ fontFamily: "var(--font-display, serif)", fontSize: "12px", fontWeight: 700, fill: "#fff" }}>{domPct}%</text>
      <text x={24} y={31} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: "5.5px", fill: "rgba(255,255,255,0.5)", letterSpacing: "0.5px" }}>{verb}</text>
    </svg>
  );
}

/**
 * BalanceBlock — hierarquia (um protagonista por nivel). Deltas de 5 anos
 * SEMPRE no proprio eixo (USDA vs USDA; IBGE vs IBGE) e rotulados "em 5 anos".
 *  A (conversam): donut USDA + HEROI producao USDA (+delta) + exporta(+delta)/
 *    consumo + rodape IBGE (validacao, pin) + regioes.
 *  B (so USDA): igual A, sem rodape IBGE nem regioes (o IBGE deles fica no banco).
 *  C (so IBGE): sem donut USDA; o HEROI e a producao IBGE (+delta) + regioes.
 * Mostra a relacao producao-exportacao (o contraste dos deltas); NUNCA afirma causa.
 */
function BalanceBlock({ psd, pam, abate, cfg }: { psd: PsdBalance | null; pam: PamProduction | null; abate: Abate | null; cfg: FlowCardCfg }) {
  const hasUsda = !!cfg.psd && !!psd && (psd.exportt != null || psd.consumption != null);
  const border = "1px solid rgba(255,255,255,0.06)";

  if (hasUsda && psd && cfg.psd) {
    const exp = psd.exportt ?? 0;
    const cons = psd.consumption ?? 0;
    const tot = exp + cons;
    const expFrac = tot > 0 ? exp / tot : 0;
    const exportDom = exp >= cons;
    const domPct = exportDom ? Math.round(expFrac * 100) : 100 - Math.round(expFrac * 100);
    const verb = exportDom ? "exporta" : cfg.psd.consumoLabel === "Uso interno" ? "usa" : "consome";
    return (
      <div className="px-4 py-3" style={{ borderBottom: border }}>
        <div className="flex items-baseline justify-between mb-2">
          <span className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Balanço interno</span>
          <span className="font-sans text-[7px]" style={{ color: `${GOLD}99` }}>safra {psd.safraLabel} · projeção USDA</span>
        </div>

        {/* donut + HEROI producao */}
        <div className="flex items-center gap-3">
          <DonutRing expFrac={expFrac} domPct={domPct} verb={verb} />
          <div className="flex-1 min-w-0">
            <div className="font-display leading-none text-white" style={{ fontSize: "22px" }}>{fmtPsd(psd.production, psd.unitId)}</div>
            <div className="flex flex-wrap items-center gap-x-1.5 mt-1">
              <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>produção</span>
              <Delta pct={psd.productionDelta5y} />
            </div>
          </div>
        </div>

        {/* exporta (delta) / consumo */}
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 flex-wrap">
              <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: GREEN_EXP }} />
              <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.6)" }}>Exporta</span>
              <Delta pct={psd.exportDelta5y} />
            </span>
            <span className="font-sans text-[8.5px] text-white/85">{fmtPsd(psd.exportt, psd.unitId)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.28)" }} />
              <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.6)" }}>{cfg.psd.consumoLabel}</span>
            </span>
            <span className="font-sans text-[8.5px] text-white/85">{fmtPsd(psd.consumption, psd.unitId)}</span>
          </div>
        </div>

        {/* rodape IBGE (validacao: campo medido vs projecao) */}
        {pam && (
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: border }}>
            <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              <MapPin className="w-2.5 h-2.5" />
              <span className="font-sans text-[7.5px]">campo · IBGE {pam.year}</span>
            </span>
            <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.62)" }}>{fmtTon(pam.value)}</span>
          </div>
        )}

        {/* abate: metrica PROPRIA (inspecionado), nunca a producao total */}
        {abate && (
          <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: border }}>
            <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.4)" }}>
              <MapPin className="w-2.5 h-2.5" />
              <span className="font-sans text-[7.5px]">abate insp. · IBGE {abate.year}</span>
            </span>
            <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.62)" }}>{fmtCwe(abate.carcassKg)} carcaça</span>
          </div>
        )}

        {/* regioes lideres (contexto publico, N3) */}
        {pam && pam.states.length > 0 && (
          <div className="font-sans text-[7.5px] mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            {pam.states.map((s) => `${s.name} ${pctFmt.format(s.pct)}%`).join(" · ")}
          </div>
        )}

        <div className="font-sans text-[6.5px] mt-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>
          Balanço: USDA PSD{pam ? " · campo: IBGE (PAM)" : ""}{abate ? " · abate: IBGE (só inspecionado, SIF/SIE/SIM)" : ""}
        </div>
      </div>
    );
  }

  // Variante C: so IBGE (o USDA nao tem) — o HEROI e a producao IBGE.
  if (pam) {
    return (
      <div className="px-4 py-3" style={{ borderBottom: border }}>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Produção · Brasil</span>
          <span className="font-sans text-[7px]" style={{ color: `${GOLD}99` }}>safra {pam.year} · IBGE (PAM)</span>
        </div>
        <div className="font-display leading-none text-white" style={{ fontSize: "22px" }}>{fmtTon(pam.value)}</div>
        <div className="flex flex-wrap items-center gap-x-1.5 mt-1">
          <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.35)" }}>produção</span>
          <Delta pct={pam.delta5y} />
        </div>
        {pam.states.length > 0 && (
          <div className="font-sans text-[7.5px] mt-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            {pam.states.map((s) => `${s.name} ${pctFmt.format(s.pct)}%`).join(" · ")}
          </div>
        )}
      </div>
    );
  }

  // so abate (carne/frango sem PSD nao ocorre hoje, mas por seguranca)
  if (abate) {
    return (
      <div className="px-4 py-3" style={{ borderBottom: border }}>
        <div className="flex items-baseline justify-between">
          <span className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Abate inspecionado · IBGE</span>
          <span className="font-sans text-[7px]" style={{ color: `${GOLD}99` }}>{abate.year}</span>
        </div>
        <div className="font-display mt-0.5 text-white" style={{ fontSize: "18px" }}>{fmtCwe(abate.carcassKg)} <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.4)" }}>peso carcaça</span></div>
      </div>
    );
  }
  return null;
}

export default function CommodityFlowMap({
  label,
  cfg,
  flows,
  priceBlockFor,
}: {
  label: string;
  cfg: FlowCardCfg;
  flows: CommodityFlows | null;
  /** preco COLADO ao sub-produto atual (regra do rotulo), montado pelo pai */
  priceBlockFor?: (subKey: string) => ReactNode;
}) {
  const [subKey, setSubKey] = useState(cfg.subs[0]?.key ?? "");
  const [hovered, setHovered] = useState<string | null>(null);
  const reduced = !!useReducedMotion();
  const uid = useId().replace(/:/g, "");

  // Entrada escalonada no load e na troca de carta.
  const [revealed, setRevealed] = useState(reduced);
  useEffect(() => {
    if (reduced) {
      setRevealed(true);
      return;
    }
    setRevealed(false);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)));
    return () => cancelAnimationFrame(id);
  }, [subKey, reduced]);

  const sub: SubCardCfg | undefined = cfg.subs.find((s) => s.key === subKey) ?? cfg.subs[0];
  const subFlows = flows?.subs[sub?.key ?? ""] ?? {};
  const exp = subFlows.export;
  const imp = subFlows.import;

  const sideRows = (side: TradeSide | undefined) => {
    if (!side) return { drawn: [] as Partner[], resto: [] as Partner[], restoPct: 0 };
    const drawn = side.partners.filter((b) => b.pct >= PISO_PCT);
    const resto = side.partners.filter((b) => b.pct < PISO_PCT);
    return { drawn, resto, restoPct: resto.reduce((s, b) => s + b.pct, 0) };
  };
  const expRows = sideRows(exp);
  const impRows = sideRows(imp);

  const hasImport = cfg.subs.some((s) => s.import?.length);
  const hasExport = cfg.subs.some((s) => s.export?.length);

  // Balanco interno USDA PSD (so as 9 com psd na config). Eixo de tempo PROPRIO
  // (safra), distinto do fluxo (12m civil). Tabela separada — nao cruza.
  const { data: psd } = usePsdBalance(cfg.psd);

  // IBGE (campo brasileiro): producao do card OU do sub atual (ex.: laranja-
  // fruta so no sub 'fruta'). Abate na carne/frango. Tabelas separadas.
  const pamSlug = cfg.ibge?.slug ?? sub?.ibge?.slug;
  const { data: pam } = usePamProduction(pamSlug);
  const { data: abate } = usePamAbate(cfg.abate?.species);

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
            {(
              [
                ["g", GREEN_GLOW],
                ["a", AMBER_GLOW],
                ["o", GOLD],
              ] as [string, string][]
            ).map(([k, color]) => (
              <filter key={k} id={`glow-${k}-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.2" result="blur" />
                <feFlood floodColor={color} result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
            {/* listrado 45 graus verde+ambar: pais que compra E fornece */}
            <pattern id={`both-${uid}`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="6" height="6" fill={`${GREEN}38`} />
              <rect width="3" height="6" fill={`${AMBER}44`} />
            </pattern>
            <style>{`
              @keyframes cflow-run-kf { from { stroke-dashoffset: 60; } to { stroke-dashoffset: 0; } }
              .cflow-run { animation-name: cflow-run-kf; animation-timing-function: linear; animation-iteration-count: infinite; }
            `}</style>
          </defs>
          <FlowLayer
            cfg={cfg}
            exp={exp}
            imp={imp}
            hovered={hovered}
            setHovered={setHovered}
            reduced={reduced}
            revealed={revealed}
            uid={uid}
          />
        </ComposableMap>

        {/* Legenda (so o que existe nesta carta; priceOnly nao tem legenda) */}
        {(hasExport || hasImport || cfg.competitorsN3?.length) ? (
        <div
          className="absolute bottom-3 left-3 z-10 flex items-center gap-3 px-3 py-1.5"
          style={{ backgroundColor: "rgba(5,5,3,0.85)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {hasExport && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5" style={{ backgroundColor: GREEN }} />
              <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                Comprador
              </span>
            </span>
          )}
          {hasImport && (
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-0.5" style={{ backgroundColor: AMBER }} />
              <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                Fornecedor
              </span>
            </span>
          )}
          {cfg.competitorsN3?.length ? (
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5" style={{ backgroundColor: `${RED}88` }} />
              <span className="font-sans text-[7px] uppercase tracking-wide" style={{ color: "rgba(255,255,255,0.4)" }}>
                Competidor
              </span>
            </span>
          ) : null}
        </div>
        ) : null}
      </div>

      {/* ── Card ── */}
      <div
        className="relative w-full sm:w-72 sm:flex-shrink-0 sm:overflow-y-auto"
        style={{ backgroundColor: "rgba(6,5,3,0.96)", borderLeft: `1px solid ${GOLD}22` }}
      >
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[8px] uppercase tracking-[0.22em] mb-0.5" style={{ color: `${GOLD}90` }}>
            {hasImport && !hasExport
              ? "Fluxo de importação"
              : hasImport
              ? "Fluxo de comércio"
              : hasExport
              ? "Fluxo de exportação"
              : "Referência de preço"}
          </div>
          <div className="font-display text-base mb-2" style={{ color: GOLD }}>
            {label}
          </div>
          {cfg.subs.length > 1 && (
            <div className="flex gap-1 flex-wrap">
              {cfg.subs.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setSubKey(s.key)}
                  className="font-sans text-[9px] uppercase tracking-wider px-2.5 py-1 transition-all"
                  style={
                    (sub?.key ?? "") === s.key
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
          )}
        </div>

        {/* Preco do PRODUTO atual (colado ao sub, nunca solto no card) */}
        {priceBlockFor?.(sub?.key ?? "")}

        {/* Nota de honestidade do sub (ex.: laranja-fruta) */}
        {sub?.note && (
          <div className="px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="font-sans text-[7.5px] leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
              {sub.note}
            </div>
          </div>
        )}

        {/* Notas de honestidade: preco e fluxo como produtos diferentes */}
        {(cfg.priceNote || cfg.flowNote) && (
          <div className="px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {cfg.priceNote && (
              <div className="font-sans text-[7.5px]" style={{ color: "rgba(255,255,255,0.38)" }}>
                {cfg.priceNote}
              </div>
            )}
            {cfg.flowNote && (
              <div className="font-sans text-[7.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.38)" }}>
                {cfg.flowNote}
              </div>
            )}
          </div>
        )}

        {/* Fluxo Comex: SUBTITULO discreto (outro eixo, civil) — fora do balanco
            para nao competir com a exportacao USDA (que e safra). */}
        {(exp || imp) && (
          <div className="px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            {exp && (
              <div className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                Exportação <span className="text-white/85">{fmtVol(exp.totalKg)}</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}> · 12 meses · MDIC</span>
              </div>
            )}
            {imp && (
              <div className="font-sans text-[8px] mt-0.5" style={{ color: "rgba(255,255,255,0.5)" }}>
                Importação <span style={{ color: AMBER }}>{fmtVol(imp.totalKg)}</span>
                <span style={{ color: "rgba(255,255,255,0.3)" }}> · 12 meses · MDIC</span>
              </div>
            )}
          </div>
        )}

        {/* Balanco: hierarquia (donut + HEROI producao + deltas 5a + rodape IBGE
            + regioes). Variantes A/B/C conforme USDA e/ou IBGE. So no card. */}
        <BalanceBlock psd={psd} pam={pam} abate={abate} cfg={cfg} />

        {/* Parceiros por direcao */}
        {([
          ["Destinos", expRows, GREEN],
          ["Origens", impRows, AMBER],
        ] as [string, ReturnType<typeof sideRows>, string][]).map(
          ([title, rows, color]) =>
            rows.drawn.length > 0 && (
              <div key={title} className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div className="font-sans text-[7px] uppercase tracking-wider mb-2" style={{ color: "rgba(255,255,255,0.25)" }}>
                  {title}
                </div>
                <div className="space-y-1">
                  {rows.drawn.map((b) => {
                    const isHov = hovered === b.isoA3;
                    return (
                      <div
                        key={b.isoA3}
                        onMouseEnter={() => setHovered(b.isoA3)}
                        onMouseLeave={() => setHovered(null)}
                        className="flex items-center justify-between px-2 py-1 cursor-pointer"
                        style={{
                          backgroundColor: isHov ? `${color}14` : "rgba(255,255,255,0.02)",
                          border: `1px solid ${isHov ? `${color}44` : "rgba(255,255,255,0.05)"}`,
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
                {rows.resto.length > 0 && (
                  <div className="font-sans text-[8px] mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
                    + {rows.resto.length} {rows.resto.length === 1 ? "país" : "países"} ({pctFmt.format(rows.restoPct)}% do total)
                  </div>
                )}
              </div>
            ),
        )}

        {(hasExport || hasImport) && (
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.22)" }}>
              Fonte: MDIC/Secex (Comex Stat) · nível de país
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
