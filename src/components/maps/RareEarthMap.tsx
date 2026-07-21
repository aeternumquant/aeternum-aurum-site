/**
 * RareEarthMap — a aba Terras raras como MAPA (USGS, sem fluxo bilateral).
 * A cor diz RESERVA/papel, o TAMANHO da bolinha diz PRODUCAO — a diferenca e o
 * GAP, visivel no mapa: o Brasil e AMARELO (2a reserva do mundo) mas a bolinha
 * e minuscula (quase nao produz); a China e VERMELHA ESCURA com bolinha
 * gigante (domina a producao). Sem linhas, sem tracejado (o dado nao tem
 * fluxo — honesto). FATO estrutural, NUNCA recomendacao.
 */
import { useMemo } from "react";
import { ComposableMap, Geography, Marker, useGeographies } from "react-simple-maps";
import { geoCentroid } from "d3-geo";
import { useRareEarthMap, fmtUsgs } from "../../hooks/useUsgs";

const geoUrl = "/data/countries-110m.json";
const GOLD = "#C6A85A";
const AMBER = "#d9b13b"; // Brasil (a reserva latente)
const CHINA_RED = "#8f2019"; // o dominante, tom mais escuro da rampa
const PROD_RED = "#b0463c"; // outros produtores, vermelho mais claro
const GREEN = "#1baf7a"; // a fatia de producao no card de gap

/** iso_a3 -> iso_n3 (o mapa desenha por ISO numerico). So os paises de REO. */
const A3_N3: Record<string, number> = {
  CHN: 156, BRA: 76, AUS: 36, RUS: 643, VNM: 704, USA: 840, GRL: 304, TZA: 834,
  ZAF: 710, CAN: 124, MYS: 458, IND: 356, MDG: 450, MMR: 104, NGA: 566, THA: 764,
};
const N3_A3: Record<number, string> = Object.fromEntries(Object.entries(A3_N3).map(([a, n]) => [n, a]));

const R_PISO = 3;
const R_TETO = 20;
function radiusFor(prod: number, max: number): number {
  if (max <= 0 || prod <= 0) return 0;
  return R_PISO + (R_TETO - R_PISO) * Math.sqrt(prod / max);
}

function ReoLayer({ byIso, maxProduction }: { byIso: Record<string, any>; maxProduction: number }) {
  const { geographies } = useGeographies({ geography: geoUrl });
  const centroids = useMemo(() => {
    const m: Record<number, [number, number]> = {};
    for (const geo of geographies) {
      const n3 = Number(geo.id);
      if (Number.isFinite(n3)) m[n3] = geoCentroid(geo) as [number, number];
    }
    return m;
  }, [geographies]);

  const fillFor = (iso: string | undefined): string => {
    if (!iso || !byIso[iso]) return "rgba(255,255,255,0.025)";
    if (iso === "BRA") return `${AMBER}bb`; // reserva latente, mesmo produzindo ~0
    if (iso === "CHN") return CHINA_RED;
    if (byIso[iso].production > 0) return `${PROD_RED}cc`; // produtor
    return "rgba(255,255,255,0.045)"; // tem reserva mas nao produz (neutro suave)
  };

  return (
    <>
      {geographies.map((geo: any) => {
        const iso = N3_A3[Number(geo.id)];
        return (
          <Geography
            key={geo.rsmKey}
            geography={geo}
            fill={fillFor(iso)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={0.35}
            style={{ default: { outline: "none" }, hover: { outline: "none" }, pressed: { outline: "none" } }}
          />
        );
      })}
      {/* bolinhas por PRODUCAO (o gap: China gigante, Brasil minuscula) */}
      {Object.values(byIso).map((c: any) => {
        const n3 = A3_N3[c.iso];
        const centroid = n3 != null ? centroids[n3] : null;
        if (!centroid || c.production <= 0) return null;
        const r = radiusFor(c.production, maxProduction);
        const color = c.iso === "BRA" ? AMBER : c.iso === "CHN" ? CHINA_RED : PROD_RED;
        return (
          <Marker key={c.iso} coordinates={centroid}>
            <circle r={r} fill={color} fillOpacity={0.55} stroke={color} strokeWidth={0.8} />
          </Marker>
        );
      })}
    </>
  );
}

export default function RareEarthMap() {
  const { data } = useRareEarthMap();
  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <span className="font-sans text-[9px] uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
          carregando…
        </span>
      </div>
    );
  }
  const maxRes = Math.max(...data.gap.map((r) => r.reserve ?? 0), 1);

  return (
    <div className="relative w-full h-full flex flex-col sm:flex-row overflow-y-auto sm:overflow-hidden" style={{ backgroundColor: "#050503" }}>
      {/* ── Mapa ── */}
      <div className="relative w-full h-[44vh] flex-shrink-0 sm:h-full sm:flex-1 overflow-hidden">
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 132, center: [25, 8] }} width={900} height={470} style={{ width: "100%", height: "100%", outline: "none" }}>
          <ReoLayer byIso={data.byIso} maxProduction={data.maxProduction} />
        </ComposableMap>

        {/* Legenda propria desta aba (cor = reserva/papel; tamanho = producao) */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-col gap-1 px-3 py-2" style={{ backgroundColor: "rgba(5,5,3,0.88)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: CHINA_RED }} />
            <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.55)" }}>China domina a produção</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5" style={{ backgroundColor: `${PROD_RED}cc` }} />
            <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.55)" }}>produz terras raras</span>
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

      {/* ── Card lateral: o GAP reserva-vs-producao (complemento, com numero) ── */}
      <div className="relative w-full sm:w-72 sm:flex-shrink-0 sm:overflow-y-auto" style={{ backgroundColor: "rgba(6,5,3,0.96)", borderLeft: `1px solid ${GOLD}22` }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[8px] uppercase tracking-[0.22em] mb-0.5" style={{ color: `${GOLD}90` }}>
            Terras raras
          </div>
          <div className="font-display text-base mb-1" style={{ color: GOLD }}>
            Reserva no solo vs produção
          </div>
          <div className="font-sans text-[8px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            O Brasil tem a 2ª maior reserva mundial e extrai quase nada. A China domina os dois lados. É a distância entre ter no solo e produzir — o dado, não uma recomendação.
          </div>
        </div>
        <div className="px-4 py-3 space-y-3">
          {data.gap.map((r) => {
            const resW = ((r.reserve ?? 0) / maxRes) * 100;
            const prodW = r.reserve ? ((r.production ?? 0) / (r.reserve || 1)) * resW : 0;
            const isBr = r.iso === "BRA";
            return (
              <div key={r.iso}>
                <div className="flex items-baseline justify-between mb-1">
                  <span className="font-sans text-[9px]" style={{ color: isBr ? GOLD : "rgba(255,255,255,0.8)", fontWeight: isBr ? 600 : 400 }}>{r.name}</span>
                  <span className="font-sans text-[7.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    res. {fmtUsgs(r.reserve, data.unit)} · prod. {fmtUsgs(r.production, "metric tons")}
                  </span>
                </div>
                <div className="relative h-3" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                  <div className="absolute inset-y-0 left-0" style={{ width: `${resW}%`, backgroundColor: isBr ? `${AMBER}55` : "rgba(255,255,255,0.14)" }} />
                  <div className="absolute inset-y-0 left-0" style={{ width: `${Math.max(prodW, r.production ? 0.6 : 0)}%`, backgroundColor: GREEN }} />
                </div>
              </div>
            );
          })}
          <div className="flex items-center gap-3 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2" style={{ backgroundColor: "rgba(255,255,255,0.14)" }} />
              <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.45)" }}>reserva</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-2" style={{ backgroundColor: GREEN }} />
              <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.45)" }}>produção/ano</span>
            </span>
          </div>
        </div>
        <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.22)" }}>
            Fonte: USGS Mineral Commodity Summaries 2026 · reserva e produção {data.year} · toneladas de óxido (REO)
          </div>
        </div>
      </div>
    </div>
  );
}
