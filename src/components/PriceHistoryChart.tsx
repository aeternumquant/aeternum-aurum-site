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
import ChartHoverLayer, { type HoverColumn } from "./charts/ChartHover";

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
  // ROLL de contrato: onde o `contract` muda entre pontos consecutivos, a linha
  // QUEBRA. O degrau ali e troca de referencia (ICFN26->ICFU26), nao mercado —
  // a mesma logica da costura L2. Mostra os settlements REAIS, so rotula a
  // descontinuidade; NAO back-ajusta (isso sumiria com os valores reais).
  const rolls: { i: number; from: string; to: string }[] = [];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1].contract, b = pts[i].contract;
    if (a && b && a !== b) rolls.push({ i, from: a, to: b });
  }
  const rollAt = new Set(rolls.map((r) => r.i));
  // linha solida QUEBRADA nos rolls (o "M" reinicia o subpath apos cada roll)
  const solid = pts.map((p, i) => `${i === 0 || rollAt.has(i) ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  // segmento TRACEJADO ligando o ultimo do contrato antigo ao primeiro do novo
  const rollDash = rolls
    .map((r) => `M${x(r.i - 1).toFixed(1)},${y(pts[r.i - 1].value).toFixed(1)} L${x(r.i).toFixed(1)},${y(pts[r.i].value).toFixed(1)}`)
    .join(" ");
  // a area de preenchimento fica continua (subtil); so a LINHA visivel quebra
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts.length - 1).toFixed(1)},${(mt + ph).toFixed(1)} L${x(0).toFixed(1)},${(mt + ph).toFixed(1)} Z`;
  const first = pts[0], last = pts[pts.length - 1];

  // HOVER (reusavel): valor + data por ponto. O titulo carrega o contrato e
  // marca o roll (o degrau ali e troca de contrato, nao mercado — a mesma trava
  // da linha quebrada). Valor sempre o settlement REAL, unidade colada.
  const hoverCols: HoverColumn[] = pts.map((p, i) => ({
    x: x(i),
    markers: [{ y: y(p.value), color: GOLD }],
    title: `${fmtDate(p.ts)}${p.contract ? ` · ${p.contract}` : ""}${rollAt.has(i) ? " · roll" : ""}`,
    rows: [{ value: `${valFmt.format(p.value)}${unitSuffix}` }],
  }));

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
        <path d={solid} fill="none" stroke={`${GOLD}cc`} strokeWidth={1.3} strokeLinejoin="round" strokeLinecap="round" />
        {rollDash && <path d={rollDash} fill="none" stroke={`${GOLD}55`} strokeWidth={1} strokeDasharray="2 2" />}
        {rolls.map((r) => (
          <circle key={r.i} cx={x(r.i)} cy={y(pts[r.i].value)} r={1.7} fill="#08090c" stroke={`${GOLD}aa`} strokeWidth={0.8} />
        ))}
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
        <ChartHoverLayer columns={hoverCols} w={W} h={H} plotBottom={mt + ph} />
      </svg>
      <div className="font-sans text-[7px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
        alcance real: {pts.length} pontos · {spanLabel}{unitSuffix ? ` · em${unitSuffix}` : ""}
      </div>
      {rolls.length > 0 && (
        <div className="font-sans text-[6.5px] mt-0.5" style={{ color: `${GOLD}99` }}>
          {rolls.length === 1
            ? `roll de contrato · ${fmtDate(pts[rolls[0].i].ts)} · ${rolls[0].from}→${rolls[0].to} (o degrau é troca de contrato, não mercado)`
            : `${rolls.length} rolls de contrato marcados (o degrau é troca de contrato, não mercado)`}
        </div>
      )}
      {attribution && (
        <div className="font-sans text-[6.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>
          fonte: {attribution}
        </div>
      )}
    </div>
  );
}
