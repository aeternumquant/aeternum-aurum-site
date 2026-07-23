/**
 * PriceHistoryChart: historico de preco lendo a observations (Onda 2, Parte 2).
 * Linha simples, X = tempo, Y = preco. PUBLICO: preco historico e informacao de
 * mercado, NAO analise proprietaria. Sem indicadores derivados, sem media movel,
 * sem backtesting (isso e do dashboard de membros).
 *
 * HONESTIDADE DE ALCANCE (a trava): rotula o alcance REAL, a contagem de pontos
 * e o intervalo de datas. Se ha 17 dias, diz "17 dias", nao finge um ano. Serie
 * curta e curta, e isso e informacao. Unidade e fonte coladas, padrao da casa.
 */
import type { PriceHistory } from "../hooks/usePriceHistory";
import { formatDayMonthUTC, formatMonthUTC } from "../lib/marketFormat";

const GOLD = "#C6A85A";
const MIN_POINTS = 3; // abaixo disso nao ha "historico" util: nao renderiza
const valFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function PriceHistoryChart({ history, attribution }: { history: PriceHistory; attribution: string | null }) {
  const pts = history.points;
  if (pts.length < MIN_POINTS) return null; // trava graciosa (igual a curva)

  const mensal = history.frequency === "mensal";
  const fmtDate = mensal ? formatMonthUTC : formatDayMonthUTC;
  const spanDays = Math.max(1, Math.round((new Date(history.lastTs).getTime() - new Date(history.firstTs).getTime()) / 86400000));
  const spanLabel = mensal ? `${Math.max(1, Math.round(spanDays / 30))} meses` : `${spanDays} dias`;
  const unitSuffix = history.unit ? ` ${history.unit}` : "";

  const W = 300, H = 88, ml = 6, mr = 6, mt = 12, mb = 16;
  const pw = W - ml - mr, ph = H - mt - mb;
  const vals = pts.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min) * 0.12 || max * 0.02 || 1;
  const lo = min - pad, hi = max + pad;
  const x = (i: number) => ml + (pts.length === 1 ? pw / 2 : (i / (pts.length - 1)) * pw);
  const y = (v: number) => mt + ph - ((v - lo) / (hi - lo || 1)) * ph;
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1).toFixed(1)},${(mt + ph).toFixed(1)} L${x(0).toFixed(1)},${(mt + ph).toFixed(1)} Z`;
  const first = pts[0], last = pts[pts.length - 1];

  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="font-sans text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>
          Histórico de preço
        </span>
        <span className="font-sans text-[8px]" style={{ color: `${GOLD}bb` }}>
          {pts.length} pontos · {fmtDate(history.firstTs)} a {fmtDate(history.lastTs)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="hist-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GOLD} stopOpacity="0.14" />
            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#hist-fill)" stroke="none" />
        <path d={line} fill="none" stroke={`${GOLD}cc`} strokeWidth={1.3} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(pts.length - 1)} cy={y(last.value)} r={1.9} fill={GOLD} />
        {/* valor da primeira e da ultima observacao (unidade colada na ultima) */}
        <text x={x(0)} y={y(first.value) - 4} textAnchor="start" style={{ fontFamily: "monospace", fontSize: "6px", fill: "rgba(255,255,255,0.55)" }}>
          {valFmt.format(first.value)}
        </text>
        <text x={x(pts.length - 1)} y={y(last.value) - 4} textAnchor="end" style={{ fontFamily: "monospace", fontSize: "6.5px", fill: "rgba(255,255,255,0.8)" }}>
          {valFmt.format(last.value)}
        </text>
        {/* datas dos extremos no eixo X */}
        <text x={ml} y={H - 4} textAnchor="start" style={{ fontFamily: "monospace", fontSize: "5.5px", fill: "rgba(255,255,255,0.4)" }}>
          {fmtDate(history.firstTs)}
        </text>
        <text x={W - mr} y={H - 4} textAnchor="end" style={{ fontFamily: "monospace", fontSize: "5.5px", fill: "rgba(255,255,255,0.4)" }}>
          {fmtDate(history.lastTs)}
        </text>
      </svg>
      <div className="font-sans text-[7px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
        alcance real: {pts.length} pontos · {spanLabel}{unitSuffix ? ` · em${unitSuffix}` : ""}
      </div>
      {attribution && (
        <div className="font-sans text-[6.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>
          fonte: {attribution}
        </div>
      )}
    </div>
  );
}
