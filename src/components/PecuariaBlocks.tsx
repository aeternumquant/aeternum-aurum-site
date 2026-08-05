/**
 * PecuariaBlocks — os blocos publicos do par pecuario (IBGE), so o SIMPLES:
 *   - LeitePrecoChart: a serie trimestral do preco AO PRODUTOR (R$/litro), com
 *     o hover reusavel. Rotula "ao produtor", trimestral, fonte IBGE.
 *   - RebanhoBlock: o numero-vitrine nacional (efetivo bovino / rebanho leiteiro)
 *     + o ranking por UF. Enxuto (publico), no espirito "oceanos vazios = respiro".
 *
 * CAMADA DE MEMBRO (NAO construir aqui — so o GANCHO). O leite fala com o publico
 * INTERNO (produtor/cooperativa/laticinio), o mesmo cliente da frente de colateral
 * pecuario (RWA). A vitrine de CONVERSAO desse cliente e de membro (blur real
 * precisa de paywall real), construida junto do dashboard de membros:
 *   - custo de producao (milho+soja, que ja temos) vs a receita do leite = a
 *     MARGEM do produtor (o numero que converte);
 *   - o valor do plantel (rebanho x preco), base do colateral;
 *   - modelos entre ativos, sazonalidade modelada, preco por estado detalhado;
 *   - serie densa por UF (1974-2024), vacas ordenhadas x efetivo (especializacao).
 * Aqui e so a VITRINE publica (preco, evolucao, volume) — a isca, com respiro.
 */
import type { LeitePreco, LeiteUf, Rebanho } from "../hooks/useIbge";
import ChartHoverLayer, { type HoverColumn } from "./charts/ChartHover";

const GOLD = "#C6A85A";
const TRI = ["1º", "2º", "3º", "4º"];
export const triLabel = (y: number, q: number) => `${TRI[q - 1] ?? q + "º"} tri/${y}`;

const nf2 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf1 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
const nfInt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const fmtReaisLitro = (v: number) => `R$ ${nf2.format(v)}`;
/** Cabecas -> "238,2 mi" / "1,2 mil". */
function fmtCabecas(v: number): string {
  if (v >= 1e6) return `${nf1.format(v / 1e6)} mi`;
  if (v >= 1e3) return `${nf1.format(v / 1e3)} mil`;
  return `${nfInt.format(v)}`;
}
/** valor em MIL litros -> "35,7 bi litros". */
function fmtLitros(milLitros: number): string {
  const l = milLitros * 1000;
  if (l >= 1e9) return `${nf1.format(l / 1e9)} bi litros`;
  if (l >= 1e6) return `${nf1.format(l / 1e6)} mi litros`;
  return `${nfInt.format(l)} litros`;
}

/** A serie trimestral do preco ao produtor (2019Q1+), linha unica + hover. */
export function LeitePrecoChart({ leite }: { leite: LeitePreco }) {
  const pts = leite.points;
  if (pts.length < 3) return null;
  const W = 256, H = 82, padL = 3, padR = 3, padT = 8, padB = 3;
  const vals = pts.map((p) => p.value);
  const min = Math.min(...vals), max = Math.max(...vals);
  const pad = (max - min) * 0.12 || max * 0.02 || 0.1;
  const lo = min - pad, hi = max + pad;
  const x = (i: number) => padL + (pts.length === 1 ? (W - padL - padR) / 2 : (i / (pts.length - 1)) * (W - padL - padR));
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo || 1)) * (H - padT - padB);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const cols: HoverColumn[] = pts.map((p, i) => ({
    x: x(i), markers: [{ y: y(p.value), color: GOLD }],
    title: triLabel(p.year, p.quarter), rows: [{ value: `${fmtReaisLitro(p.value)}/litro` }],
  }));
  const first = pts[0], last = pts[pts.length - 1];
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="font-sans text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>Preço ao produtor · trimestral</span>
        <span className="font-sans text-[8px]" style={{ color: `${GOLD}bb` }}>{triLabel(first.year, first.quarter)} a {triLabel(last.year, last.quarter)}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block", overflow: "visible" }}>
        <path d={line} fill="none" stroke={`${GOLD}cc`} strokeWidth={1.3} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={x(pts.length - 1)} cy={y(last.value)} r={1.9} fill={GOLD} />
        <ChartHoverLayer columns={cols} w={W} h={H} plotBottom={H - padB} />
      </svg>
      <div className="font-sans text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>R$/litro · {pts.length} trimestres · receita na porteira (não atacado/hub)</div>
      <div className="font-sans text-[6.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>fonte: IBGE, Pesquisa Trimestral do Leite (preço médio pago ao produtor)</div>
    </div>
  );
}

/** Numero-vitrine + ranking por UF. mode 'bovino' (efetivo) ou 'leite' (dairy). */
export function RebanhoBlock({ rebanho, mode }: { rebanho: Rebanho; mode: "bovino" | "leite" }) {
  const border = "1px solid rgba(255,255,255,0.06)";
  const Rank = ({ rows, fmt }: { rows: Rebanho["efetivoRanking"]; fmt: (v: number) => string }) =>
    rows.length ? (
      <div className="mt-2 space-y-1">
        {rows.map((s) => (
          <div key={s.name} className="flex items-center justify-between">
            <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.55)" }}>{s.name}</span>
            <span className="font-sans text-[8px]" style={{ color: `${GOLD}cc` }}>{fmt(s.value)} · {pctFmt.format(s.pct)}%</span>
          </div>
        ))}
      </div>
    ) : null;

  if (mode === "bovino") {
    if (rebanho.efetivoBovino == null) return null;
    return (
      <div className="px-4 py-3" style={{ borderBottom: border }}>
        <div className="flex items-baseline justify-between mb-1.5">
          <span className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Rebanho bovino · Brasil</span>
          <span className="font-sans text-[7px]" style={{ color: `${GOLD}99` }}>{rebanho.year} · IBGE (PPM)</span>
        </div>
        <div className="font-display leading-none text-white" style={{ fontSize: "22px" }}>
          {fmtCabecas(rebanho.efetivoBovino)} <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.4)" }}>cabeças</span>
        </div>
        <Rank rows={rebanho.efetivoRanking} fmt={(v) => `${fmtCabecas(v)} cab.`} />
        <div className="font-sans text-[6.5px] mt-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>fonte: IBGE, Pesquisa da Pecuária Municipal · efetivo de rebanho</div>
      </div>
    );
  }
  if (rebanho.producaoLeite == null && rebanho.vacasOrdenhadas == null) return null;
  return (
    <div className="px-4 py-3" style={{ borderBottom: border }}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-sans text-[7px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.25)" }}>Rebanho leiteiro · Brasil</span>
        <span className="font-sans text-[7px]" style={{ color: `${GOLD}99` }}>{rebanho.year} · IBGE (PPM)</span>
      </div>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        {rebanho.producaoLeite != null && <span className="font-display text-white" style={{ fontSize: "20px" }}>{fmtLitros(rebanho.producaoLeite)}</span>}
        {rebanho.vacasOrdenhadas != null && <span className="font-sans text-[8px]" style={{ color: "rgba(255,255,255,0.5)" }}>{fmtCabecas(rebanho.vacasOrdenhadas)} vacas ordenhadas</span>}
      </div>
      <Rank rows={rebanho.leiteRanking} fmt={fmtLitros} />
      <div className="font-sans text-[6.5px] mt-1.5" style={{ color: "rgba(255,255,255,0.22)" }}>fonte: IBGE, Pesquisa da Pecuária Municipal · produção de leite e vacas ordenhadas</div>
    </div>
  );
}

/** Variacao com seta + cor (verde sobe / vermelho cai), reusavel. */
export function ChangeArrow({ pct, suffix }: { pct: number; suffix: string }) {
  const arrow = pct > 0 ? "▲" : pct < 0 ? "▼" : "▪";
  const color = pct > 0 ? "#10b981" : pct < 0 ? "#ef4444" : "rgba(255,255,255,0.45)";
  return (
    <span className="font-mono text-[11px]">
      <span style={{ color }}>{arrow} {nf1.format(Math.abs(pct))}%</span>{" "}
      <span style={{ color: "rgba(255,255,255,0.45)" }}>{suffix}</span>
    </span>
  );
}

/** Preco por UF no ultimo trimestre: top estados por preco + a faixa. O produtor
 *  usa para negociar com o laticinio (quanto o estado dele recebe vs os outros). */
export function LeiteUfPrices({ leite }: { leite: LeitePreco }) {
  const ufs: LeiteUf[] = leite.ufLatest;
  if (ufs.length < 2) return null;
  const top = ufs.slice(0, 6);
  const hi = ufs[0], lo = ufs[ufs.length - 1];
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="flex items-baseline justify-between mb-1.5">
        <span className="font-sans text-[8px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.55)" }}>Preço por estado · ao produtor</span>
        <span className="font-sans text-[8px]" style={{ color: `${GOLD}bb` }}>{triLabel(leite.latest.year, leite.latest.quarter)}</span>
      </div>
      <div className="space-y-1">
        {top.map((s) => (
          <div key={s.name} className="flex items-center justify-between">
            <span className="font-sans text-[8.5px]" style={{ color: "rgba(255,255,255,0.6)" }}>{s.name}</span>
            <span className="font-sans text-[8.5px]" style={{ color: `${GOLD}cc` }}>{fmtReaisLitro(s.value)}/litro</span>
          </div>
        ))}
      </div>
      <div className="font-sans text-[7px] mt-1.5" style={{ color: "rgba(255,255,255,0.4)" }}>
        {ufs.length} UFs · faixa {fmtReaisLitro(lo.value)} ({lo.name}) a {fmtReaisLitro(hi.value)} ({hi.name})
      </div>
      <div className="font-sans text-[6.5px] mt-0.5" style={{ color: "rgba(255,255,255,0.28)" }}>fonte: IBGE, Pesquisa Trimestral do Leite · preço ao produtor por UF</div>
    </div>
  );
}

/** Bloco COMPACTO do "leite comum" para o card do MAPA: preco ao produtor +
 *  variacao + enquadramento de mercado INTERNO (nao exportacao). Enxuto. */
export function LeiteMapBlock({ leite, producaoLeite }: { leite: LeitePreco; producaoLeite: number | null }) {
  return (
    <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="font-sans text-[8px] uppercase tracking-wider mb-1" style={{ color: "rgba(255,255,255,0.55)" }}>Preço ao produtor</div>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-display text-white" style={{ fontSize: "22px" }}>{fmtReaisLitro(leite.latest.value)}</span>
        <span className="font-sans text-[9px]" style={{ color: "rgba(255,255,255,0.5)" }}>/litro</span>
        {leite.changePct != null && <ChangeArrow pct={leite.changePct} suffix="vs. tri anterior" />}
      </div>
      <div className="font-sans text-[7.5px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
        {triLabel(leite.latest.year, leite.latest.quarter)} · IBGE, Pesquisa Trimestral do Leite
      </div>
      <div className="font-sans text-[7.5px] mt-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
        Mercado INTERNO{producaoLeite != null ? `: produção nacional ${fmtLitros(producaoLeite)}/ano` : ""}. Consumo interno, não é pauta de exportação (o mapa fica sem linhas de fluxo).
      </div>
    </div>
  );
}
