import Stage from "../Stage";
import { COMMODITIES_REGISTRY, resolveEscopo } from "../commodityRegistry";

/**
 * MOCK da casca <Stage> (Arranjo 2) — placeholders rotulados em cada slot, pra
 * VALIDAR o layout (proporção 2.14:1, reserva de 220px, slots de vidro) ANTES de
 * fiar o CommodityFlowMap cru + o chrome real. Ver via ?commands=palco.
 * Não persiste, não busca dado — é andaime.
 */
const GOLD = "#c6a75c";

export default function WorldStageMock({ escopo }: { escopo?: string }) {
  const sel = resolveEscopo(escopo);
  const agro = COMMODITIES_REGISTRY.filter((c) => c.category === "Agro").slice(0, 8);

  return (
    <Stage
      map={<MapPlaceholder />}
      topLeft={
        <div className="bg-black/45 backdrop-blur-md border border-white/10 rounded-sm p-3">
          <p className="font-display text-[10px] tracking-[0.25em] uppercase mb-2" style={{ color: `${GOLD}c0` }}>
            Fluxo global · <span className="text-white/80">{sel.label}</span>
          </p>
          <div className="flex flex-wrap gap-1">
            {agro.map((c) => (
              <span
                key={c.id}
                className="font-sans text-[8px] uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm border"
                style={
                  c.id === sel.id
                    ? { background: GOLD, color: "#050503", borderColor: GOLD }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.5)", borderColor: "rgba(255,255,255,0.1)" }
                }
              >
                {c.label}
              </span>
            ))}
          </div>
          <p className="text-[8px] text-white/25 mt-2 uppercase tracking-widest">slot: topLeft — seletor + título</p>
        </div>
      }
      sidePanel={
        <div className="h-full bg-black/45 backdrop-blur-md border border-white/10 rounded-sm p-3 flex flex-col">
          <p className="font-display text-[9px] tracking-[0.2em] uppercase mb-1" style={{ color: `${GOLD}c0` }}>Preço</p>
          <p className="font-display text-2xl text-white/90 tabular-nums leading-none">—</p>
          <p className="text-[9px] text-white/40 mt-1">{sel.seriesCode ?? sel.noQuote ?? "—"}</p>
          <div className="mt-auto text-[8px] text-white/25 uppercase tracking-widest">slot: sidePanel — {220}px de reserva</div>
        </div>
      }
      bottomBand={
        <div className="bg-black/45 backdrop-blur-md border border-white/10 rounded-sm px-3 py-2">
          <p className="font-sans text-[9px] tracking-[0.2em] uppercase" style={{ color: `${GOLD}c0` }}>Ranking de produção · footers</p>
          <p className="text-[8px] text-white/25 mt-1 uppercase tracking-widest">slot: bottomBand — faixa inferior (à esquerda do painel)</p>
        </div>
      }
    />
  );
}

/** placeholder do mapa: grade dourada sutil (como o GlobalFlowMap) + rótulo. */
function MapPlaceholder() {
  return (
    <div className="w-full h-full relative" style={{ backgroundColor: "#050503" }}>
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(${GOLD}40 1px, transparent 1px), linear-gradient(90deg, ${GOLD}40 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-sans text-[10px] tracking-[0.3em] uppercase" style={{ color: "rgba(255,255,255,0.28)" }}>
          slot: map — CommodityFlowMap (cru)
        </span>
      </div>
    </div>
  );
}
