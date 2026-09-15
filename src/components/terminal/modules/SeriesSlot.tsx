import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ModuleCard } from "../ModuleCard";
import { useMarketData, type MarketPoint } from "../../../hooks/useMarketData";
import { usePriceHistory, type HistoryPoint } from "../../../hooks/usePriceHistory";
import type { CommodityEntry } from "../commodityRegistry";
import type { ModuleCommand } from "../commands";

/**
 * SeriesSlot — o slot SEMPRE presente. Garante que nenhuma commodity fica vazia e
 * carrega o "existe aqui" de quem tem só preço (minério, fertilizante): o vazio de
 * ESCOPO vira conteúdo afirmativo — preço real + a camada onde vive, não desculpa.
 *
 * Ordem aprovada: preço grande primeiro → sparkline → séries relacionadas
 * (sub-produtos, profundidade real) → link de Research por último e discreto.
 * SVG puro (recharts fora do bundle). Cor de direção verde/vermelho (2 eixos).
 */
const CAT_LABEL: Record<string, string> = {
  Agro: "agro", "Minérios": "metais", Energia: "energia", Fertilizantes: "fertilizantes", Financeiro: "financeiro",
};
const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export default function SeriesSlot({ cmd, entry }: { cmd: ModuleCommand; entry: CommodityEntry }) {
  const { data: market } = useMarketData();
  const byCode = useMemo(() => {
    const m = new Map<string, MarketPoint>();
    (market ?? []).forEach((p) => m.set(p.code, p));
    return m;
  }, [market]);
  const primary = entry.seriesCode ? byCode.get(entry.seriesCode) ?? null : null;
  const related = entry.relatedSeries.map((c) => byCode.get(c)).filter(Boolean) as MarketPoint[];
  const { data: hist } = usePriceHistory(entry.seriesCode);

  const cp = primary?.changePercent ?? null;
  const changeColor = cp == null ? "var(--t-tx-3)" : cp > 0 ? "var(--t-pos)" : cp < 0 ? "var(--t-neg)" : "var(--t-tx-2)";

  return (
    <ModuleCard command={cmd} state="ready">
      <div className="p-4">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em]" style={{ color: "var(--t-tx-3)" }}>
          camada {CAT_LABEL[entry.category] ?? "—"}
        </span>

        {/* preço — grande, primeiro */}
        {primary ? (
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-mono font-[590] tabular-nums text-[26px] leading-none" style={{ color: "var(--t-tx-1)" }}>
              {nf.format(primary.value)}
            </span>
            {primary.unit && <span className="font-mono text-[11px]" style={{ color: "var(--t-tx-3)" }}>{primary.unit}</span>}
            {cp != null && (
              <span className="font-mono tabular-nums text-[12px] ml-auto" style={{ color: changeColor }}>
                {cp > 0 ? "+" : ""}{nf.format(cp)}%
              </span>
            )}
          </div>
        ) : (
          <div className="font-sans text-[13px] mt-1" style={{ color: "var(--t-tx-2)" }}>{entry.noQuote ?? "sem cotação pública"}</div>
        )}
        {primary?.changeLabel && <div className="font-mono text-[9px] mt-0.5" style={{ color: "var(--t-tx-3)" }}>{primary.changeLabel}</div>}

        {hist && hist.points.length > 1 && <Sparkline points={hist.points} />}

        {/* séries relacionadas (sub-produtos) */}
        {related.length > 0 && (
          <dl className="mt-3 space-y-1">
            {related.map((r) => (
              <div key={r.code} className="flex items-baseline justify-between gap-3 text-[11px]">
                <dt className="font-sans truncate" style={{ color: "var(--t-tx-2)" }}>{r.labelPt}</dt>
                <dd className="font-mono tabular-nums flex-shrink-0" style={{ color: "var(--t-tx-1)" }}>
                  {nf.format(r.value)}{r.unit ? ` ${r.unit}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {/* research — último e discreto (convite, não conteúdo) */}
        {entry.researchId && (
          <Link to={`/research/${entry.researchId}`}
            className="mt-3 inline-flex items-center gap-1 font-sans text-[10px] uppercase tracking-wider transition-colors"
            style={{ color: "var(--t-tx-2)" }}>
            Ler a análise <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>
    </ModuleCard>
  );
}

/** sparkline SVG puro do histórico real (observations); cor pela direção do período. */
function Sparkline({ points }: { points: HistoryPoint[] }) {
  const W = 240, H = 30;
  const vals = points.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const span = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * W;
      const y = H - ((p.value - min) / span) * (H - 3) - 1.5;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const up = vals[vals.length - 1] >= vals[0];
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-2.5 block" aria-hidden="true">
      <path d={d} fill="none" stroke={up ? "var(--t-pos)" : "var(--t-neg)"} strokeWidth="1.25" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
