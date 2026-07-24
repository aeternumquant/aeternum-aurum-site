/**
 * ReferenceDotPlot — dot plot horizontal de referencias numa escala unica.
 *
 * Para o card de gas do terminal: cada praca (Henry Hub, JKM, TTF, e o slot do
 * Brasil/ANP) vira uma linha. Em cada linha: FAIXA clara (min/max dos ultimos 5
 * anos, do banco via usePriceRanges) + PONTO cheio no valor de HOJE + o numero
 * ao lado + a data/janela propria da praca. Numero solto ("+441%") nao explica;
 * o ponto na regua com a faixa atras conta onde a praca esta hoje E onde ja
 * negociou.
 *
 * GENERICO: recebe `pracas` (o references[] e generico); outra commodity com N
 * pracas reusa o mesmo componente. Suporta as tres travas do Brasil SEM
 * refatorar: `approx` ("~" no valor, conversao PTAX nao e tempo real), `note`
 * (rotulo "inclui tributos"), `outlined` (ponto vazado, natureza distinta) e a
 * data propria de cada serie.
 *
 * PICO FORA DE ESCALA: o eixo util vai a `axisMax` (~20 no gas). Onde a faixa
 * estoura (TTF a ~70 em 2022), a barra vai ate a borda e um rotulo CLARO marca
 * "pico 2022: 70" — nao so uma seta.
 */
import type { MarketPoint } from "../hooks/useMarketData";
import { usePriceRanges, type PriceRange } from "../hooks/usePriceRanges";
import { formatMonthUTC, formatDayMonthUTC } from "../lib/marketFormat";

export type Praca = {
  code: string;
  label: string; // "Estados Unidos · Henry Hub"
  source: string; // "EIA · diário"
  color: string; // hex
  outlined?: boolean; // ponto vazado (natureza distinta — Brasil)
  approx?: boolean; // "~" no valor (conversao PTAX nao e tempo real)
  note?: string; // "inclui tributos (ICMS, PIS, Cofins)"
  isBase?: boolean; // praca base do multiplo (Henry Hub)
};

const valFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const oneFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const intFmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

const whenLabel = (p: MarketPoint) => (p.frequency === "mensal" ? formatMonthUTC(p.ts) : formatDayMonthUTC(p.ts));

/** Multiplo vs base: acima de 100% o multiplo comunica melhor que o percentual. */
function relToBase(today: number, base: number): string {
  const mult = today / base;
  if (mult >= 2) return `${oneFmt.format(mult)} vezes o preço dos EUA`;
  const pct = (mult - 1) * 100;
  return `${pct >= 0 ? "+" : ""}${intFmt.format(pct)}% vs EUA`;
}

export default function ReferenceDotPlot({
  pracas,
  bySeries,
  unit,
  axisMax,
  story,
}: {
  pracas: Praca[];
  bySeries: Map<string, MarketPoint>;
  unit: string; // "USD/MMBtu"
  axisMax: number; // eixo util (~20 no gas)
  story: string; // a linha que explica POR QUE existe a diferenca
}) {
  const { data: ranges } = usePriceRanges(pracas.map((p) => p.code));
  const base = pracas.find((p) => p.isBase);
  const basePoint = base ? bySeries.get(base.code) ?? null : null;

  // so pracas com valor de HOJE (Brasil sem ingestao = ausente, pulado; sem inventar)
  type Row = { p: Praca; point: MarketPoint; range: PriceRange | null };
  const rows: Row[] = [];
  for (const p of pracas) {
    const point = bySeries.get(p.code);
    if (!point) continue;
    rows.push({ p, point, range: ranges.get(p.code) ?? null });
  }
  if (!rows.length) return null;

  const pct = (v: number) => (Math.max(0, Math.min(v, axisMax)) / axisMax) * 100;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * axisMax);
  const LABEL_W = "9.5rem";

  return (
    <div className="mb-6 border border-white/8 rounded-sm bg-white/[0.015] p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground/50 mb-3">
        Preço do gás por praça · <span className="text-muted-foreground/70">{unit}</span> · faixa dos últimos 5 anos
      </div>

      <div className="space-y-3.5">
        {rows.map(({ p, point, range }) => {
          const today = point.value;
          const overflow = !!range && range.max > axisMax;
          const left = range ? pct(range.min) : pct(today);
          const right = range ? (overflow ? 100 : pct(range.max)) : pct(today);
          const width = Math.max(right - left, 1.2);
          const rel = base && basePoint && !p.isBase && basePoint.value > 0 ? relToBase(today, basePoint.value) : null;
          return (
            <div key={p.code} className="flex items-center gap-3">
              {/* rotulo + fonte/data + multiplo|tributo */}
              <div className="shrink-0" style={{ width: LABEL_W }}>
                <div className="text-[11px] font-mono leading-tight" style={{ color: p.color }}>{p.label}</div>
                <div className="text-[8px] font-mono text-muted-foreground/40 mt-0.5">{p.source} · {whenLabel(point)}</div>
                {(p.note ?? rel) && (
                  <div className="text-[8px] font-mono text-muted-foreground/45 mt-0.5">{p.note ?? rel}</div>
                )}
              </div>

              {/* trilha */}
              <div className="relative flex-1 h-6">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-white/8" />
                {/* faixa dos 5 anos */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-2 rounded-sm"
                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: `${p.color}26` }}
                />
                {/* valor ao lado do ponto */}
                <span
                  className="absolute -translate-x-1/2 text-[9px] font-mono whitespace-nowrap"
                  style={{ left: `${pct(today)}%`, top: -2, color: p.color }}
                >
                  {p.approx ? "~" : ""}{valFmt.format(today)}
                </span>
                {/* ponto de HOJE (cheio, ou vazado p/ Brasil) */}
                <span
                  className="absolute top-1/2 rounded-full"
                  style={{
                    left: `${pct(today)}%`,
                    transform: "translate(-50%,-50%)",
                    width: 10,
                    height: 10,
                    backgroundColor: p.outlined ? "#08090c" : p.color,
                    border: `1.5px solid ${p.color}`,
                  }}
                />
                {/* pico fora de escala: rotulo CLARO, nao so seta */}
                {overflow && range && (
                  <span
                    className="absolute right-0 text-[8px] font-mono px-1 rounded-sm whitespace-nowrap"
                    style={{ bottom: -3, color: p.color, backgroundColor: "#08090c", border: `1px solid ${p.color}44` }}
                  >
                    pico {range.maxTs.slice(0, 4)}: {intFmt.format(range.max)} →
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* eixo com ticks (alinhado com a trilha) */}
      <div className="flex items-center gap-3 mt-2">
        <div className="shrink-0" style={{ width: LABEL_W }} />
        <div className="relative flex-1 h-3">
          {ticks.map((t, i) => (
            <span
              key={i}
              className="absolute text-[8px] font-mono text-muted-foreground/30 -translate-x-1/2"
              style={{ left: `${pct(t)}%` }}
            >
              {intFmt.format(t)}
            </span>
          ))}
        </div>
      </div>

      <p className="text-[10px] leading-relaxed text-muted-foreground/55 mt-3 border-t border-white/5 pt-2">
        {story}
      </p>
    </div>
  );
}
