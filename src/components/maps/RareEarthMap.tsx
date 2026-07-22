/**
 * RareEarthMap — a aba Terras raras (USGS, sem fluxo bilateral). Tres pecas:
 *  1. MAPA: cor = reserva/papel (Brasil ambar; produtores vermelho discreto),
 *     tamanho da bolinha = PRODUCAO (China gigante, Brasil minusculo = o gap).
 *     Hover acende o pais e mostra o dado (compartilhado com o scatter).
 *  2. SCATTER (card lateral): X = reserva (Mt), Y = producao (mil t). O Brasil
 *     isola no canto inferior-direito (muita reserva, producao ~0). E a
 *     primeira forma quant do site — plano cartesiano, base p/ modelos.
 *  3. TABELA DE OXIDOS (rodape): dado estatico de referencia (NAO do banco;
 *     faixas publicas), rotulado como estimativa — terras raras nao tem bolsa.
 * FATO estrutural, NUNCA recomendacao.
 */
import { useMemo, useState } from "react";
import { ComposableMap, Geography, Marker, useGeographies } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { useRareEarthMap, fmtUsgs, type ReoCountry } from "../../hooks/useUsgs";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const AMBER = "#d9b13b"; // Brasil no mapa (a reserva latente)
const AMBER_BR = "#c98500"; // Brasil no scatter (ponto destacado)
const PROD_RED = "#c0564c"; // produtores (China inclusa; o destaque e o tamanho)
const GREEN = "#1baf7a";

/** iso_a3 -> iso_n3 (o mapa desenha por ISO numerico). So os paises de REO. */
const A3_N3: Record<string, number> = {
  CHN: 156, BRA: 76, AUS: 36, RUS: 643, VNM: 704, USA: 840, GRL: 304, TZA: 834,
  ZAF: 710, CAN: 124, MYS: 458, IND: 356, MDG: 450, MMR: 104, NGA: 566, THA: 764,
};
const N3_A3: Record<number, string> = Object.fromEntries(Object.entries(A3_N3).map(([a, n]) => [n, a]));

const R_PISO = 3;
const R_TETO = 20;
const radiusFor = (prod: number, max: number) => (max <= 0 || prod <= 0 ? 0 : R_PISO + (R_TETO - R_PISO) * Math.sqrt(prod / max));

/** Óxidos de terras raras — REFERENCIA ESTATICA (faixas publicas 2026), nao do
 *  banco. Terras raras nao tem bolsa; o preco real vem de Argus/SMM pagas. A
 *  ordem (valor crescente) conta a historia: abundantes baratos, raros caros. */
const OXIDES: { name: string; abund: string; price: string; note?: string }[] = [
  { name: "Cério", abund: "31%", price: "~US$ 5/kg", note: "o mais comum" },
  { name: "Lantânio", abund: "18%", price: "~US$ 5/kg" },
  { name: "Neodímio", abund: "36%", price: "~US$ 120/kg", note: "comum e caro — o do superímã" },
  { name: "Praseodímio", abund: "7%", price: "~US$ 130/kg" },
  { name: "Disprósio", abund: "2%", price: "~US$ 210/kg" },
  { name: "Térbio", abund: "<1%", price: "~US$ 1.000/kg", note: "o mais raro" },
];

// ── Mapa ────────────────────────────────────────────────────────────────────
function ReoLayer({
  byIso,
  maxProduction,
  hovered,
  setHovered,
}: {
  byIso: Record<string, ReoCountry>;
  maxProduction: number;
  hovered: string | null;
  setHovered: (v: string | null) => void;
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

  const baseFill = (iso: string | undefined): string => {
    if (!iso || !byIso[iso]) return "rgba(255,255,255,0.025)";
    if (iso === "BRA") return `${AMBER}bb`;
    if (byIso[iso].production > 0) return `${PROD_RED}88`;
    return "rgba(255,255,255,0.045)";
  };

  return (
    <>
      {geographies.map((geo: any) => {
        const iso = N3_A3[Number(geo.id)];
        const has = iso && byIso[iso];
        const isHov = has && hovered === iso;
        const fill = isHov ? (iso === "BRA" ? AMBER : PROD_RED) : baseFill(iso);
        return (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill={fill}
            stroke={isHov ? "#fff" : "rgba(255,255,255,0.1)"}
            strokeWidth={isHov ? 0.7 : 0.35}
            onMouseEnter={() => has && setHovered(iso)}
            onMouseLeave={() => setHovered(null)}
            style={{
              default: { outline: "none", transition: "fill 0.2s ease" },
              hover: { outline: "none", cursor: has ? "pointer" : "default" },
              pressed: { outline: "none" },
            }}
          />
        );
      })}
      {Object.values(byIso).map((c) => {
        const n3 = A3_N3[c.iso];
        const centroid = n3 != null ? centroids[n3] : null;
        if (!centroid || c.production <= 0) return null;
        const r = radiusFor(c.production, maxProduction);
        const color = c.iso === "BRA" ? AMBER : PROD_RED;
        const isHov = hovered === c.iso;
        return (
          <Marker key={c.iso} coordinates={centroid}>
            <circle
              r={isHov ? r + 1 : r}
              fill={color}
              fillOpacity={isHov ? 0.85 : 0.6}
              stroke={isHov ? "#fff" : color}
              strokeWidth={isHov ? 1.2 : 1}
              onMouseEnter={() => setHovered(c.iso)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transition: "r 0.15s ease" }}
            />
          </Marker>
        );
      })}
    </>
  );
}

// ── Scatter (a primeira forma quant) ────────────────────────────────────────
function Scatter({ rows, hovered, setHovered }: { rows: ReoCountry[]; hovered: string | null; setHovered: (v: string | null) => void }) {
  const W = 260, H = 210, ml = 30, mr = 40, mt = 16, mb = 26;
  const pw = W - ml - mr, ph = H - mt - mb;
  const maxRes = Math.max(...rows.map((r) => r.reserve ?? 0), 1) * 1.12;
  const maxProd = Math.max(...rows.map((r) => r.production), 1) * 1.12;
  const x = (res: number) => ml + (res / maxRes) * pw;
  const y = (prod: number) => mt + ph - (prod / maxProd) * ph;
  const midX = ml + pw * 0.5, midY = mt + ph * 0.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
      {/* quadrantes (linhas faint) */}
      <line x1={midX} y1={mt} x2={midX} y2={mt + ph} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
      <line x1={ml} y1={midY} x2={ml + pw} y2={midY} stroke="rgba(255,255,255,0.06)" strokeDasharray="2 2" />
      {/* rotulos de quadrante (muted) */}
      <text x={ml + pw} y={mt + 7} textAnchor="end" style={{ fontFamily: "monospace", fontSize: "5px", fill: "rgba(255,255,255,0.22)" }}>domina os dois</text>
      <text x={ml + 2} y={mt + 7} textAnchor="start" style={{ fontFamily: "monospace", fontSize: "5px", fill: "rgba(255,255,255,0.22)" }}>extrai muito de pouca reserva</text>
      <text x={ml + pw} y={mt + ph - 3} textAnchor="end" style={{ fontFamily: "monospace", fontSize: "5px", fill: `${GOLD}66` }}>reserva alta, produção baixa</text>
      {/* eixos */}
      <line x1={ml} y1={mt} x2={ml} y2={mt + ph} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
      <line x1={ml} y1={mt + ph} x2={ml + pw} y2={mt + ph} stroke="rgba(255,255,255,0.2)" strokeWidth={0.5} />
      <text x={ml + pw / 2} y={H - 2} textAnchor="middle" style={{ fontFamily: "monospace", fontSize: "6px", fill: "rgba(255,255,255,0.4)" }}>reserva (Mt) →</text>
      <text x={4} y={mt + ph / 2} textAnchor="middle" transform={`rotate(-90 4 ${mt + ph / 2})`} style={{ fontFamily: "monospace", fontSize: "6px", fill: "rgba(255,255,255,0.4)" }}>produção (mil t) →</text>
      {/* pontos */}
      {rows.map((c) => {
        const isBr = c.iso === "BRA";
        const cx = x(c.reserve ?? 0), cy = y(c.production);
        const isHov = hovered === c.iso;
        const anchor = cx > ml + pw * 0.7 ? "end" : "start";
        const dx = anchor === "end" ? -(isBr ? 6 : 5) : isBr ? 6 : 5;
        return (
          <g key={c.iso} onMouseEnter={() => setHovered(c.iso)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
            <circle cx={cx} cy={cy} r={isBr ? (isHov ? 6 : 5) : isHov ? 4.5 : 3.5} fill={isBr ? AMBER_BR : PROD_RED} fillOpacity={isHov ? 1 : 0.85} stroke={isHov ? "#fff" : "none"} strokeWidth={isHov ? 1 : 0} />
            <text x={cx + dx} y={cy + 2} textAnchor={anchor} style={{ fontFamily: "monospace", fontSize: isBr ? "6.5px" : "6px", fontWeight: isBr ? 700 : 400, fill: isBr ? AMBER_BR : "rgba(255,255,255,0.6)" }}>
              {c.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function RareEarthMap() {
  const { data } = useRareEarthMap();
  const [hovered, setHovered] = useState<string | null>(null);
  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>carregando…</span>
      </div>
    );
  }
  // pontos do scatter: os relevantes (reserva >= 1 Mt OU producao >= 2 mil t)
  const scatterRows = Object.values(data.byIso)
    .filter((c) => (c.reserve ?? 0) >= 1e6 || c.production >= 2000)
    .sort((a, b) => (b.reserve ?? 0) - (a.reserve ?? 0));
  const hov = hovered ? data.byIso[hovered] : null;

  return (
    <div className="w-full h-full flex flex-col" style={{ backgroundColor: "#050503" }}>
      <div className="flex-1 flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden min-h-0">
        {/* ── Mapa ── */}
        <div className="relative w-full h-[38vh] flex-shrink-0 sm:h-full sm:flex-1 overflow-hidden">
          <ComposableMap projection="geoMercator" projectionConfig={{ scale: 132, center: [25, 8] }} width={900} height={470} style={{ width: "100%", height: "100%", outline: "none" }}>
            <ReoLayer byIso={data.byIso} maxProduction={data.maxProduction} hovered={hovered} setHovered={setHovered} />
          </ComposableMap>

          {/* tooltip do hover (o dado do pais aceso) */}
          {hov && (
            <div className="absolute top-3 left-3 z-20 px-3 py-1.5" style={{ backgroundColor: "rgba(5,5,3,0.92)", border: `1px solid ${hov.iso === "BRA" ? `${AMBER}66` : `${PROD_RED}66`}` }}>
              <div className="font-sans text-[9px]" style={{ color: hov.iso === "BRA" ? GOLD : "#fff" }}>{hov.name}</div>
              <div className="font-sans text-[7.5px]" style={{ color: "rgba(255,255,255,0.5)" }}>
                produção {fmtUsgs(hov.production, "metric tons")} · reserva {fmtUsgs(hov.reserve, data.unit)}
                {hov.iso === "BRA" && hov.reserve ? ` · extrai ${((100 * hov.production) / hov.reserve).toFixed(2).replace(".", ",")}%/ano` : ""}
              </div>
            </div>
          )}

          {/* legenda (cor = reserva/papel; tamanho = producao) */}
          <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 px-3 py-2" style={{ backgroundColor: "rgba(5,5,3,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5" style={{ backgroundColor: `${PROD_RED}88` }} />
              <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.55)" }}>produz terras raras (China domina — ver o tamanho)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5" style={{ backgroundColor: `${AMBER}bb` }} />
              <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.55)" }}>Brasil: tem reserva, não escalou produção</span>
            </span>
            <span className="flex items-center gap-1.5 mt-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 3 }}>
              <span className="rounded-full flex-shrink-0" style={{ width: 9, height: 9, backgroundColor: "rgba(255,255,255,0.3)" }} />
              <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.4)" }}>tamanho = produção anual</span>
            </span>
          </div>
        </div>

        {/* ── Card lateral: o SCATTER ── */}
        <div className="relative w-full sm:w-72 sm:flex-shrink-0 sm:overflow-y-auto" style={{ backgroundColor: "rgba(6,5,3,0.96)", borderLeft: `1px solid ${GOLD}22` }}>
          <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="font-sans text-[8px] uppercase tracking-[0.22em] mb-0.5" style={{ color: `${GOLD}90` }}>Terras raras</div>
            <div className="font-display text-base mb-1" style={{ color: GOLD }}>Reserva × produção</div>
            <div className="font-sans text-[8px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Cada país é um ponto. O Brasil isola no canto: 2ª maior reserva do mundo, produção quase nula. A distância entre ter no solo e extrair — o dado, não uma recomendação.
            </div>
          </div>
          <div className="px-3 py-3">
            <Scatter rows={scatterRows} hovered={hovered} setHovered={setHovered} />
          </div>
          <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.22)" }}>
              Fonte: USGS Mineral Commodity Summaries 2026 · reserva e produção {data.year} · toneladas de óxido (REO)
            </div>
          </div>
        </div>
      </div>

      {/* ── Rodape: tabela de OXIDOS (referencia estatica, rotulada) ── */}
      <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${GOLD}18`, backgroundColor: "rgba(5,5,3,0.98)" }}>
        <div className="flex items-baseline gap-2 mb-1.5">
          <span className="font-sans text-[8px] uppercase tracking-[0.2em]" style={{ color: `${GOLD}90` }}>Óxidos de terras raras · por valor</span>
          <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.3)" }}>
            valores estimados de referência · não cotação de mercado · fontes públicas 2026
          </span>
        </div>
        <div className="flex items-stretch gap-2 overflow-x-auto pb-0.5">
          {OXIDES.map((o) => (
            <span key={o.name} className="flex-shrink-0 flex flex-col px-2.5 py-1" style={{ backgroundColor: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="font-sans text-[9px]" style={{ color: "rgba(255,255,255,0.8)" }}>
                {o.name} <span style={{ color: "rgba(255,255,255,0.4)" }}>· {o.abund}</span>
              </span>
              <span className="font-sans text-[8.5px]" style={{ color: `${GOLD}cc` }}>{o.price}</span>
              {o.note && <span className="font-sans text-[6.5px]" style={{ color: "rgba(255,255,255,0.3)" }}>{o.note}</span>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
