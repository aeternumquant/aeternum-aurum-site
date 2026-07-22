/**
 * CommodityTerminal.tsx — terminal de commodities.
 *
 * FONTE UNICA (conserto do drift): le src/config/assets.ts, a MESMA config do
 * mapa. Antes tinha lista propria de 10 e ficou em 4 de 35 series enquanto o
 * mapa cresceu. Agora: adicionar um ativo em assets.ts o poe nos DOIS.
 *
 * Por setor (Agro/Minerios/Energia/Fertilizantes/Financeiro, alinhado com as
 * abas do mapa). Cada ativo: preco (primario + secundario/referencia) + curva
 * de futuros (so os 5 B3) + editorial OPCIONAL (so onde ja existe). As series
 * sem bolsa (niobio) dizem "sem cotacao", NAO "sob consulta".
 *
 * Honestidade: unidade colada por ativo, data visivel, badge de defasagem,
 * conversao PTAX de referencia, atribuicao exata do banco, virgula pt-BR.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Mountain, Zap, FlaskConical, Landmark } from "lucide-react";
import { useMarketData, type MarketPoint } from "../hooks/useMarketData";
import { useFuturesCurve } from "../hooks/useFuturesCurve";
import FuturesCurveCard from "./FuturesCurveCard";
import { ASSETS, ASSET_CATEGORIES, type AssetDef, type AssetCategory } from "../config/assets";
import {
  PTAX_CODE,
  brlReference,
  formatBRLRef,
  formatDayMonthUTC,
  formatValueUnit,
} from "../lib/marketFormat";

const GOLD = "#C6A85A";
const CAT_ICON: Record<AssetCategory, React.ElementType> = {
  Agro: Sprout,
  Minérios: Mountain,
  Energia: Zap,
  Fertilizantes: FlaskConical,
  Financeiro: Landmark,
};

const changeFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 });

function StaleTag({ ageInDays }: { ageInDays: number }) {
  return (
    <span
      title={`Última atualização há ${Math.floor(ageInDays)} dia(s). O worker roda 2x/dia; a fonte pode ter falhado.`}
      className="ml-2 inline-block align-middle text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border border-[#C6A85A]/40 text-[#C6A85A]/90"
    >
      defasado
    </span>
  );
}

/** Variacao com direcao + rotulo; roll suprime (seria o gap do vencimento). */
function ChangeLine({ point }: { point: MarketPoint }) {
  if (point.isRoll) return <div className="text-[11px] font-mono mt-1 text-[#C6A85A]/80">· contrato rolou (novo vencimento)</div>;
  const pct = point.changePercent;
  if (pct == null) return null;
  const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "▪";
  const color = pct > 0 ? "#10b981" : pct < 0 ? "#ef4444" : "rgba(255,255,255,0.45)";
  return (
    <div className="text-[11px] font-mono mt-1 leading-tight">
      <span style={{ color }}>{arrow} {changeFmt.format(Math.abs(pct))}%</span>{" "}
      <span className="text-muted-foreground/45">{point.changeLabel}</span>
    </div>
  );
}

/** Linha curta de status na sidebar: valor, "sem cotação", skeleton ou indisp. */
function SidebarStatus({ asset, point, loading }: { asset: AssetDef; point: MarketPoint | null; loading: boolean }) {
  if (asset.price.code == null) return <span className="text-muted-foreground/40 uppercase tracking-wider">sem cotação em bolsa</span>;
  if (loading) return <span className="inline-block h-2 w-16 rounded-sm bg-white/5 animate-pulse align-middle" />;
  if (point) return <span className={point.isStale ? "text-[#C6A85A]/70" : "text-muted-foreground/70"}>{formatValueUnit(point)}</span>;
  return <span className="text-muted-foreground/40">indisponível</span>;
}

export default function CommodityTerminal() {
  const { data, loading, error } = useMarketData();
  const [activeKey, setActiveKey] = useState<string>("Soja");

  const bySeries = useMemo(() => {
    const m = new Map<string, MarketPoint>();
    for (const p of data ?? []) m.set(p.code, p);
    return m;
  }, [data]);

  const active = ASSETS.find((a) => a.key === activeKey) ?? ASSETS[0];
  const pointFor = (a: AssetDef): MarketPoint | null => (a.price.code ? bySeries.get(a.price.code) ?? null : null);

  const activePoint = pointFor(active);
  const activeSecondary =
    active.price.code != null && active.price.secondary ? bySeries.get(active.price.secondary.code) ?? null : null;
  const ptax = bySeries.get(PTAX_CODE) ?? null;
  const activeBrlRef = activePoint ? brlReference(activePoint, ptax) : null;
  const { data: curve } = useFuturesCurve(active.curveCode);

  // secoes por categoria; dentro, com-cotacao primeiro, sem-bolsa ao fim.
  const groups = useMemo(
    () =>
      ASSET_CATEGORIES.map((cat) => ({
        cat,
        items: ASSETS.filter((a) => a.category === cat).sort((a, b) => (a.price.code ? 0 : 1) - (b.price.code ? 0 : 1)),
      })),
    [],
  );

  // atribuicao das fontes exibidas no ativo ativo (string exata do banco).
  const attributions = useMemo(() => {
    const set = new Set<string>();
    for (const p of [activePoint, activeSecondary]) if (p?.attribution) set.add(p.attribution);
    return [...set];
  }, [activePoint, activeSecondary]);

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-6xl">
        {error && (
          <div className="mb-3 text-xs text-[#C6A85A]/90 border border-[#C6A85A]/25 bg-[#C6A85A]/[0.03] px-3 py-2 rounded-sm">
            Não foi possível carregar os dados de mercado agora. A estrutura segue visível; os valores voltam quando a fonte responder.
          </div>
        )}

        <div className="flex flex-col md:flex-row border border-white/10 bg-[#08090c] rounded-sm overflow-hidden shadow-2xl shadow-black/60">
          {/* ── Sidebar por setor ── */}
          <div className="md:w-60 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-black/30 md:overflow-y-auto md:max-h-[640px] custom-scrollbar-hide">
            {groups.map((g) => {
              const Icon = CAT_ICON[g.cat];
              return (
                <div key={g.cat}>
                  <div className="flex items-center gap-1.5 px-4 pt-3 pb-1.5 sticky top-0 bg-[#08090c]/95 backdrop-blur-sm z-10">
                    <Icon className="w-3 h-3" style={{ color: `${GOLD}80` }} />
                    <span className="font-sans text-[9px] uppercase tracking-[0.2em]" style={{ color: `${GOLD}90` }}>{g.cat}</span>
                    <span className="font-mono text-[8px] text-muted-foreground/30 ml-auto">{g.items.length}</span>
                  </div>
                  {g.items.map((a) => {
                    const isActive = a.key === activeKey;
                    const point = pointFor(a);
                    return (
                      <button
                        key={a.key}
                        onClick={() => setActiveKey(a.key)}
                        className={`w-full text-left px-4 py-2.5 relative transition-all duration-150 ${isActive ? "bg-primary/5" : "hover:bg-white/4"}`}
                      >
                        {isActive && <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary" />}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-display tracking-wider text-[12px] uppercase ${isActive ? "text-primary" : "text-muted-foreground/60"}`}>
                            {a.label}
                          </span>
                        </div>
                        <div className="text-[9px] font-mono mt-0.5 min-h-[12px]">
                          <SidebarStatus asset={a} point={point} loading={loading} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* ── Painel de detalhe ── */}
          <div className="flex-1 p-6 sm:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div key={active.key} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}>
                {/* Header: nome + preco (ou "sem cotacao") */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-5 border-b border-white/5">
                  <div className="min-w-0">
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.25em] mb-1">{active.category}</p>
                    <h3 className="font-display text-3xl sm:text-4xl text-foreground uppercase tracking-widest">{active.label}</h3>
                    {activePoint && <p className="text-xs text-muted-foreground/70 mt-1.5 font-light">{activePoint.labelPt}</p>}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    {active.price.code == null ? (
                      <div className="font-mono text-sm text-muted-foreground/70 uppercase tracking-wider max-w-[220px]">{active.price.noQuote}</div>
                    ) : loading ? (
                      <div className="h-7 w-32 rounded-sm bg-white/5 animate-pulse ml-auto" />
                    ) : activePoint ? (
                      <>
                        <div className="font-mono text-2xl text-foreground leading-tight">{formatValueUnit(activePoint)}</div>
                        <ChangeLine point={activePoint} />
                        <div className="text-xs font-mono text-muted-foreground/60 mt-1">
                          em {formatDayMonthUTC(activePoint.ts)}
                          {activePoint.isStale && <StaleTag ageInDays={activePoint.ageInDays} />}
                        </div>
                        {activeBrlRef && (
                          <div className="text-[11px] font-mono text-muted-foreground/45 mt-1">
                            ≈ {formatBRLRef(activeBrlRef.brl)} · conversão PTAX de {activeBrlRef.ptaxDate}
                          </div>
                        )}
                        {/* secundario (referencia): valor menor + a nota */}
                        {activeSecondary && active.price.code != null && active.price.secondary && (
                          <div className="text-[11px] font-mono text-muted-foreground/55 mt-1.5 pt-1.5 border-t border-white/5">
                            {formatValueUnit(activeSecondary)} <span className="text-muted-foreground/35">· {active.price.secondary.note}</span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="font-mono text-sm text-muted-foreground/70">dado indisponível</div>
                    )}
                  </div>
                </div>

                {/* Estrutura a termo (so os 5 futuros B3; spot/WB nao tem curva) */}
                {curve && (
                  <div className="mb-6 max-w-md border border-white/8 rounded-sm bg-white/[0.015]">
                    <FuturesCurveCard curve={curve} />
                  </div>
                )}

                {/* Editorial OPCIONAL: so onde existe (nao forcar nas novas) */}
                {active.editorial ? (
                  <>
                    {active.editorial.insight && (
                      <div className="mb-6 px-4 py-3 border-l-2 text-xs leading-relaxed italic" style={{ borderColor: GOLD, backgroundColor: "rgba(198,168,90,0.04)", color: "rgba(198,168,90,0.75)" }}>
                        {active.editorial.insight}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="border border-[#ef4444]/15 bg-[#ef4444]/[0.025] p-5 rounded-sm flex flex-col">
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 pb-2 border-b border-[#ef4444]/15" style={{ color: "#ef4444" }}>{active.editorial.fearTitle}</h4>
                        <ul className="space-y-3 flex-1">
                          {active.editorial.fear.map((f, i) => (
                            <li key={i} className="flex gap-2.5"><span className="text-[#ef4444]/50 text-xs shrink-0 mt-0.5">▪</span><p className="text-muted-foreground/80 text-xs leading-relaxed font-light">{f}</p></li>
                          ))}
                        </ul>
                      </div>
                      <div className="border border-[#10b981]/15 bg-[#10b981]/[0.025] p-5 rounded-sm flex flex-col">
                        <h4 className="text-[10px] uppercase tracking-widest mb-4 pb-2 border-b border-[#10b981]/15" style={{ color: "#10b981" }}>{active.editorial.greedTitle}</h4>
                        <ul className="space-y-3 flex-1">
                          {active.editorial.greed.map((g, i) => (
                            <li key={i} className="flex gap-2.5"><span className="text-[#10b981]/50 text-xs shrink-0 mt-0.5">▪</span><p className="text-white/80 text-xs leading-relaxed font-light">{g}</p></li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                ) : (
                  activePoint && (
                    <div className="text-[11px] text-muted-foreground/40 italic">
                      Cotação e estrutura de mercado. Análise editorial em breve.
                    </div>
                  )
                )}

                {/* Rodape: atribuicao das fontes (string exata do banco) */}
                {attributions.length > 0 && (
                  <div className="mt-7 pt-4 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {attributions.map((a) => <span key={a} className="text-[10px] text-muted-foreground/50">{a}</span>)}
                    <span className="text-[10px] text-muted-foreground/35">Cache Aeternum, atualizado 2x/dia.</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
