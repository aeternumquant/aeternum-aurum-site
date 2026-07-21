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
const PROD_RED = "#c0564c"; // TODOS os produtores, mesmo vermelho discreto (o
                            // destaque da China e o TAMANHO da bolinha, nao a cor)
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
    if (byIso[iso].production > 0) return `${PROD_RED}88`; // produtor (China inclusa, mesmo tom)
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
        const color = c.iso === "BRA" ? AMBER : PROD_RED; // China no mesmo vermelho
        return (
          <Marker key={c.iso} coordinates={centroid}>
            <circle r={r} fill={color} fillOpacity={0.6} stroke={color} strokeWidth={1} />
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
  // Taxa de extracao = producao anual / reserva. Ordena por taxa desc (quem
  // USA o que tem no topo; quem esta SENTADO na reserva no fim). So paises com
  // reserva E producao (senao a taxa nao existe / distorce). O volume absoluto
  // vem SEMPRE ao lado — a taxa sozinha engana sobre magnitude.
  const rates = Object.values(data.byIso)
    .filter((c) => (c.reserve ?? 0) > 0 && c.production > 0)
    .map((c) => ({ ...c, rate: (100 * c.production) / (c.reserve as number) }))
    .sort((a, b) => b.rate - a.rate);
  const maxRate = Math.max(...rates.map((r) => r.rate), 0.0001);
  const fmtRate = (t: number) => `${(t >= 1 ? t.toFixed(1) : t >= 0.1 ? t.toFixed(2) : t.toFixed(3)).replace(".", ",")}%`;

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

      {/* ── Card lateral: o GAP reserva-vs-producao (complemento, com numero) ── */}
      <div className="relative w-full sm:w-72 sm:flex-shrink-0 sm:overflow-y-auto" style={{ backgroundColor: "rgba(6,5,3,0.96)", borderLeft: `1px solid ${GOLD}22` }}>
        <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="font-sans text-[8px] uppercase tracking-[0.22em] mb-0.5" style={{ color: `${GOLD}90` }}>
            Terras raras
          </div>
          <div className="font-display text-base mb-1" style={{ color: GOLD }}>
            Taxa de extração
          </div>
          <div className="font-sans text-[8px] leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
            Quanto da reserva cada país extrai por ano. Os EUA extraem intensamente uma reserva pequena; o Brasil tem a 2ª maior reserva do mundo e extrai 0,01% ao ano. O dado, não uma recomendação.
          </div>
        </div>
        <div className="px-4 py-3 space-y-2.5">
          {rates.map((r) => {
            const w = (r.rate / maxRate) * 100;
            const isBr = r.iso === "BRA";
            return (
              <div key={r.iso}>
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="font-sans text-[9px]" style={{ color: isBr ? GOLD : "rgba(255,255,255,0.8)", fontWeight: isBr ? 600 : 400 }}>
                    {r.name}
                    <span className="ml-1.5 font-sans text-[9px]" style={{ color: isBr ? `${GOLD}dd` : "rgba(255,255,255,0.55)" }}>{fmtRate(r.rate)}</span>
                  </span>
                  <span className="font-sans text-[7.5px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {fmtUsgs(r.production, "metric tons")} de {fmtUsgs(r.reserve, data.unit)}
                  </span>
                </div>
                <div className="relative h-2.5" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                  {/* a barra e a TAXA; min 0,5px p/ o Brasil nao sumir de todo */}
                  <div className="absolute inset-y-0 left-0" style={{ width: `${Math.max(w, 0.5)}%`, backgroundColor: isBr ? AMBER : GREEN }} />
                </div>
              </div>
            );
          })}
          <div className="font-sans text-[7.5px] pt-1 leading-relaxed" style={{ color: "rgba(255,255,255,0.35)" }}>
            Barra = taxa de extração (produção ÷ reserva). O número ao lado é o volume absoluto — a intensidade com a magnitude.
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
