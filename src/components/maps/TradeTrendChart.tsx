/**
 * TradeTrendChart — a serie L2 longa de comercio (1997->hoje) numa linha unica.
 * REUSAVEL (um so componente p/ os 52 codigos, como o PriceHistoryChart da Onda
 * 2). X = ano; Y = volume (net_kg) OU valor (fob_usd), com toggle. Verde =
 * exportacao, ambar = importacao (mesmas cores das linhas do mapa).
 *
 * HONESTIDADE:
 *  - ano corrente PARCIAL: ultimo trecho tracejado + ponto aberto + rotulo
 *    "AAAA parcial" (o ultimo ponto nao pode parecer queda de mercado);
 *  - anos vazios ja vem como ZERO real do hook (sem interpolar) — borracha
 *    esparsa cai a zero onde nao houve importacao;
 *  - alcance REAL rotulado ("serie 1997-2026" ou o inicio real do codigo);
 *  - unidade colada, fonte MDIC/Secex, mes da ultima atualizacao.
 */
import { useState } from "react";
import type { TradeTrend, TrendPoint } from "../../hooks/useTradeTrend";
import ChartHoverLayer, { type HoverColumn } from "../charts/ChartHover";

const GREEN = "#34d399";
const AMBER = "#d9b13b";

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
function fmtVol(kg: number): string {
  if (kg >= 1e9) return `${nf.format(kg / 1e9)} Mt`;
  if (kg >= 1e6) return `${nf.format(kg / 1e6)} kt`;
  if (kg >= 1e3) return `${nf.format(kg / 1e3)} t`;
  return `${nf.format(kg)} kg`;
}
function fmtUsd(v: number): string {
  if (v >= 1e9) return `US$ ${nf.format(v / 1e9)} bi`;
  if (v >= 1e6) return `US$ ${nf.format(v / 1e6)} mi`;
  if (v >= 1e3) return `US$ ${nf.format(v / 1e3)} mil`;
  return `US$ ${nf.format(v)}`;
}
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const mesAno = (ym: string) => `${MESES[Number(ym.slice(5, 7)) - 1]}/${ym.slice(0, 4)}`;

export default function TradeTrendChart({ trend, productLabel }: { trend: TradeTrend; productLabel?: string }) {
  const [metric, setMetric] = useState<"kg" | "usd">("kg");
  const { points, firstYear, lastYear, lastYearPartial, lastMonth, hasExport, hasImport } = trend;
  const fmt = metric === "kg" ? fmtVol : fmtUsd;
  const val = (p: TrendPoint, dir: "export" | "import") =>
    metric === "kg" ? (dir === "export" ? p.exportKg : p.importKg) : (dir === "export" ? p.exportFob : p.importFob);

  const W = 256, H = 82, padL = 3, padR = 3, padT = 6, padB = 3;
  const span = lastYear - firstYear || 1;
  const vals: number[] = [];
  for (const p of points) { if (hasExport) vals.push(val(p, "export")); if (hasImport) vals.push(val(p, "import")); }
  const maxV = Math.max(...vals, 1);
  const x = (year: number) => padL + ((year - firstYear) / span) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / maxV) * (H - padT - padB);

  // trecho solido (ate o ultimo ano completo) + trecho tracejado (ano parcial)
  const solid = (dir: "export" | "import") => {
    const pts = lastYearPartial && points.length > 1 ? points.slice(0, -1) : points;
    return pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(p.year).toFixed(1)},${y(val(p, dir)).toFixed(1)}`).join(" ");
  };
  const dash = (dir: "export" | "import") => {
    if (!lastYearPartial || points.length < 2) return "";
    const a = points[points.length - 2], b = points[points.length - 1];
    return `M${x(a.year).toFixed(1)},${y(val(a, dir)).toFixed(1)} L${x(b.year).toFixed(1)},${y(val(b, dir)).toFixed(1)}`;
  };

  const last = points[points.length - 1];
  // legenda mostra o ultimo ano COMPLETO (nao o parcial, que pareceria queda)
  const legend = lastYearPartial && points.length > 1 ? points[points.length - 2] : last;
  const dirs: ["export" | "import", string, boolean][] = [
    ["export", GREEN, hasExport],
    ["import", AMBER, hasImport],
  ];

  // HOVER (reusavel): por ano, o valor de exp e/ou imp (cor da propria serie).
  // O ano corrente vem rotulado "parcial" (nao pode parecer queda de mercado);
  // o valor e o REAL (a costura L2 ja soma antigo+novo no hook, sem duplicar).
  const hoverCols: HoverColumn[] = points.map((p) => {
    const markers: { y: number; color: string }[] = [];
    const rows: { label?: string; value: string; color?: string }[] = [];
    if (hasExport) { markers.push({ y: y(val(p, "export")), color: GREEN }); rows.push({ label: "exp", value: fmt(val(p, "export")), color: GREEN }); }
    if (hasImport) { markers.push({ y: y(val(p, "import")), color: AMBER }); rows.push({ label: "imp", value: fmt(val(p, "import")), color: AMBER }); }
    const partial = lastYearPartial && p.year === lastYear;
    return { x: x(p.year), markers, title: `${p.year}${partial ? " · parcial" : ""}`, rows };
  });

  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>
          Comércio ao longo do tempo{productLabel ? ` · ${productLabel}` : ""}
        </span>
        <div className="flex gap-1">
          {(["kg", "usd"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className="font-sans text-[7px] uppercase tracking-wide px-1.5 py-0.5"
              style={
                metric === m
                  ? { backgroundColor: "rgba(198,168,90,0.18)", color: "#C6A85A", border: "1px solid rgba(198,168,90,0.4)" }
                  : { color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }
              }
            >
              {m === "kg" ? "volume" : "valor"}
            </button>
          ))}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        {dirs.map(([dir, color, show]) =>
          show ? (
            <g key={dir}>
              <path d={solid(dir)} fill="none" stroke={color} strokeWidth={1.2} strokeLinejoin="round" strokeLinecap="round" />
              {lastYearPartial && <path d={dash(dir)} fill="none" stroke={color} strokeWidth={1.2} strokeDasharray="2 2" />}
              {/* ponto do ano parcial: aberto (miolo escuro) para destacar */}
              <circle
                cx={x(last.year)}
                cy={y(val(last, dir))}
                r={1.9}
                fill={lastYearPartial ? "#08090c" : color}
                stroke={color}
                strokeWidth={1}
              />
            </g>
          ) : null,
        )}
        <ChartHoverLayer columns={hoverCols} w={W} h={H} plotBottom={H - padB} />
      </svg>

      <div className="flex justify-between mt-0.5">
        <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.3)" }}>{firstYear}</span>
        <span className="font-sans text-[7px]" style={{ color: "rgba(255,255,255,0.3)" }}>{lastYear}</span>
      </div>

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 mt-1.5">
        {hasExport && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 flex-shrink-0" style={{ backgroundColor: GREEN }} />
            <span className="font-sans text-[7.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Exportação {legend.year}: <span className="text-white/80">{fmt(val(legend, "export"))}</span>
            </span>
          </span>
        )}
        {hasImport && (
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 flex-shrink-0" style={{ backgroundColor: AMBER }} />
            <span className="font-sans text-[7.5px]" style={{ color: "rgba(255,255,255,0.55)" }}>
              Importação {legend.year}: <span className="text-white/80">{fmt(val(legend, "import"))}</span>
            </span>
          </span>
        )}
      </div>

      <div className="font-sans text-[7px] mt-1" style={{ color: "rgba(255,255,255,0.28)" }}>
        série {firstYear}–{lastYear} · MDIC/Secex · atualizado {mesAno(lastMonth)}
        {lastYearPartial ? ` · ${lastYear} parcial (tracejado)` : ""}
      </div>
    </div>
  );
}
