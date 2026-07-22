/**
 * FuturesCurveCard: "Preco por data de entrega" (compartilhado entre o mapa e o
 * terminal). X = data de vencimento, Y = settlement; a linha liga os contratos.
 * O titulo diz o que o eixo X e (datas de entrega) antes do jargao. A forma:
 * contango (sobe) = entrega futura mais cara; backwardation (desce) = entrega
 * proxima mais cara. FATO de mercado com a explicacao, NUNCA recomendacao.
 */
import type { FuturesCurve } from "../hooks/useFuturesCurve";

const HELP =
  "Cada ponto é um contrato futuro com sua data de vencimento. A linha mostra quanto o mercado cobra para entregar em cada data. Se sobe, a entrega futura é mais cara (contango); se desce, a próxima é mais cara (backwardation).";

const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export default function FuturesCurveCard({ curve }: { curve: FuturesCurve }) {
  const pts = curve.points.filter((p) => p.settlement != null) as { symbol: string; expiration: string; settlement: number; volume: number | null }[];
  if (pts.length < 2) return null;
  const W = 244, H = 96, ml = 4, mr = 6, mt = 16;
  const pw = W - ml - mr, ph = H - mt - 16;
  const vals = pts.map((p) => p.settlement);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min) * 0.15 || max * 0.02 || 1;
  const lo = min - pad, hi = max + pad;
  const x = (i: number) => ml + (pts.length === 1 ? pw / 2 : (i / (pts.length - 1)) * pw);
  const y = (v: number) => mt + ph - ((v - lo) / (hi - lo || 1)) * ph;
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.settlement).toFixed(1)}`).join(" ");
  const up = curve.shape === "contango";
  const back = curve.shape === "backwardation";
  const color = up ? "#1baf7a" : back ? "#c0564c" : "rgba(255,255,255,0.5)";
  // significado PRIMEIRO, o termo tecnico entre parenteses
  const shapeLabel = up
    ? "Entrega futura mais cara (contango)"
    : back
    ? "Entrega próxima mais cara (backwardation)"
    : "Entrega em linha (curva plana)";
  const explain = up
    ? "a entrega futura custa mais que a próxima, sinal de custo de carrego ou oferta confortável"
    : back
    ? "a entrega próxima custa mais que a futura, sinal de escassez agora"
    : "a entrega próxima e a futura custam quase o mesmo";
  const mesAno = (d: string) => `${d.slice(5, 7)}/${d.slice(2, 4)}`;
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="font-sans text-[8px] uppercase tracking-wider inline-flex items-center gap-1" style={{ color: "rgba(255,255,255,0.55)" }}>
          Preço por data de entrega
          <span title={HELP} className="cursor-help font-sans text-[8px] rounded-full px-1" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)" }}>?</span>
        </span>
        {curve.spreadPct != null && (
          <span className="font-sans text-[8px]" style={{ color }}>{curve.spreadPct > 0 ? "+" : ""}{pctFmt.format(curve.spreadPct)}%</span>
        )}
      </div>
      <div className="font-sans text-[8px] mb-1" style={{ color }}>{shapeLabel}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <path d={line} fill="none" stroke={color} strokeWidth={1.4} strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={p.symbol}>
            <circle cx={x(i)} cy={y(p.settlement)} r={1.8} fill={color} />
            {(i === 0 || i === pts.length - 1) && (
              <text x={x(i)} y={y(p.settlement) - 4} textAnchor={i === 0 ? "start" : "end"} style={{ fontFamily: "monospace", fontSize: "6px", fill: "rgba(255,255,255,0.65)" }}>
                {pctFmt.format(p.settlement)}
              </text>
            )}
            {(i === 0 || i === pts.length - 1 || i === Math.floor((pts.length - 1) / 2)) && (
              <text x={x(i)} y={H - 4} textAnchor={i === 0 ? "start" : i === pts.length - 1 ? "end" : "middle"} style={{ fontFamily: "monospace", fontSize: "5.5px", fill: "rgba(255,255,255,0.4)" }}>
                {mesAno(p.expiration)}
              </text>
            )}
          </g>
        ))}
      </svg>
      <div className="font-sans text-[7px] mt-0.5 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>{explain}</div>
      <div className="font-sans text-[6.5px] mt-1" style={{ color: "rgba(255,255,255,0.22)" }}>
        {pts.length} vencimentos · settlement (ajuste) em {curve.currency} · B3 via brapi · {curve.tradeDate.split("-").reverse().join("/")}
      </div>
      {/* item 3: o eixo X sao datas de entrega; o titulo ja diz isso */}
    </div>
  );
}
