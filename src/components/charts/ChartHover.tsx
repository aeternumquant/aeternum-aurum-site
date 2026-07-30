/**
 * ChartHover — camada de hover REUSAVEL das series do terminal (historico de
 * preco, tendencia L2 e, onde couber, a curva). UMA implementacao: cada grafico
 * monta as COLUNAS (x em coord. do viewBox + os pontos a marcar + o texto do
 * balao) e esta camada cuida do resto — linha vertical que segue o cursor,
 * marcador nos pontos e o balao com valor + data.
 *
 * Desktop: o mouse mostra, sair esconde. Mobile (sem cursor): o TOQUE mostra o
 * ponto mais proximo e PERSISTE (nao ha "sair"); outro toque move. Assim o
 * celular nunca fica sem o valor. `touch-action: pan-y` preserva o scroll
 * vertical da pagina — o toque no grafico nao sequestra a rolagem.
 *
 * HONESTIDADE (as travas seguem no balao): o titulo carrega a data/ano e, quando
 * o ponto e especial, o rotulo — "roll" (troca de contrato, nao mercado) no
 * historico de preco, "parcial" no ano corrente da tendencia. O valor exibido e
 * sempre o REAL (a costura L2 ja vem somada do hook).
 */
import { useState, type PointerEvent as ReactPointerEvent } from "react";

export type HoverColumn = {
  /** x da coluna em coordenadas do viewBox */
  x: number;
  /** pontos a destacar nesse x (uma serie = 1; a tendencia tem exp+imp = 2) */
  markers: { y: number; color: string }[];
  /** linha de cima do balao (data ou ano, com o rotulo de trava se houver) */
  title: string;
  /** valores exibidos (cada um pode ter cor da propria serie) */
  rows: { label?: string; value: string; color?: string }[];
};

const CHAR_W = 3.25; // largura aproximada do monospace ~6px (p/ dimensionar o balao)

export default function ChartHoverLayer({
  columns,
  w,
  h,
  plotBottom,
}: {
  columns: HoverColumn[];
  w: number;
  h: number;
  /** y onde a linha vertical termina (default: base do viewBox) */
  plotBottom?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  if (columns.length === 0) return null;

  const pick = (e: ReactPointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    const vbX = ((e.clientX - rect.left) / rect.width) * w;
    let best = 0;
    for (let i = 1; i < columns.length; i++) {
      if (Math.abs(columns[i].x - vbX) < Math.abs(columns[best].x - vbX)) best = i;
    }
    setActive(best);
  };
  // so o mouse "sai"; no toque o valor persiste (nao ha cursor para esconder).
  const onLeave = (e: ReactPointerEvent<SVGRectElement>) => {
    if (e.pointerType === "mouse") setActive(null);
  };

  const col = active != null ? columns[active] : null;
  const bottom = plotBottom ?? h;

  // balao: largura pelo maior texto, ancorado acima do marcador mais alto e
  // preso dentro de [0, w]; se nao couber em cima, cai para baixo do ponto.
  let box: { x: number; y: number; w: number; h: number; lines: { text: string; color: string; size: number }[] } | null = null;
  if (col) {
    const lines = [
      { text: col.title, color: "rgba(255,255,255,0.5)", size: 5.5 },
      ...col.rows.map((r) => ({ text: r.label ? `${r.label} ${r.value}` : r.value, color: r.color ?? "rgba(255,255,255,0.9)", size: 6.5 })),
    ];
    const padX = 3, lineH = 7.5;
    const boxW = Math.max(...lines.map((l) => l.text.length)) * CHAR_W + padX * 2;
    const boxH = lines.length * lineH + 4;
    const topY = Math.min(...col.markers.map((m) => m.y));
    const botY = Math.max(...col.markers.map((m) => m.y));
    let bx = col.x - boxW / 2;
    bx = Math.max(1, Math.min(bx, w - boxW - 1));
    let by = topY - boxH - 5;
    if (by < 1) by = botY + 6; // nao cabe em cima -> abaixo do ponto
    box = { x: bx, y: by, w: boxW, h: boxH, lines };
  }

  return (
    <g>
      {col && box && (
        <g pointerEvents="none">
          <line x1={col.x} y1={2} x2={col.x} y2={bottom} stroke="rgba(255,255,255,0.28)" strokeWidth={0.6} strokeDasharray="2 2" />
          {col.markers.map((m, i) => (
            <circle key={i} cx={col.x} cy={m.y} r={2.2} fill="#08090c" stroke={m.color} strokeWidth={1.2} />
          ))}
          <rect x={box.x} y={box.y} width={box.w} height={box.h} rx={1.5} fill="rgba(8,9,12,0.96)" stroke="rgba(255,255,255,0.14)" strokeWidth={0.5} />
          {box.lines.map((l, i) => (
            <text
              key={i}
              x={box!.x + 3}
              y={box!.y + 4 + (i + 1) * 7.5 - 2}
              style={{ fontFamily: "monospace", fontSize: `${l.size}px`, fill: l.color }}
            >
              {l.text}
            </text>
          ))}
        </g>
      )}
      {/* captura de eventos: rect transparente por cima da area toda */}
      <rect
        x={0}
        y={0}
        width={w}
        height={h}
        fill="transparent"
        style={{ cursor: "crosshair", touchAction: "pan-y" }}
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={onLeave}
        onPointerCancel={() => setActive(null)}
      />
    </g>
  );
}
