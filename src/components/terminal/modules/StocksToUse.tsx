import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../../lib/supabase";
import { useEntitlements } from "../../../hooks/useEntitlements";
import { COMMANDS, COMMODITIES, REGIOES, type ModuleCommand } from "../commands";
import { ModuleCard, type ModuleState } from "../ModuleCard";

/**
 * Stocks-to-use — barra em SVG puro (sem lib de chart, p/ não puxar recharts pra
 * rota do mapa). Grátis: número + veredito (posiciona a zona). Terminal: o TICK no
 * percentil + tooltip (pctl 10A, Δ1A, Δ5A). REGRA CRÍTICA: sem percentil, sem tick
 * — nada de marcador sem dado por trás (a mentira visual do MenthorQ).
 */
type Publico = { market_year: number; ratio: number; veredito: "Apertado" | "Normal" | "Folgado"; ending_stocks: number; dom_consumption: number; production: number; unidade: string };
type Detalhe = { percentil: number; delta_1a: number | null; delta_5a: number | null; serie: { ano: number; ratio: number }[] };

const ZONES = [
  { key: "Apertado", label: "APERTADO", color: "#f59e0b" }, // âmbar = oferta elevada de preocupação (tight)
  { key: "Normal", label: "NORMAL", color: "#6b7280" },
  { key: "Folgado", label: "FOLGADO", color: "#38bdf8" }, // azul = comprimido/folgado (ample)
] as const;
const VTEXT: Record<string, string> = { Apertado: "text-amber-400", Normal: "text-muted-foreground", Folgado: "text-sky-400" };

const nf1 = (n: number | null | undefined) => (n == null ? "—" : n.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }));
const signed = (n: number | null | undefined) => (n == null ? "—" : (n >= 0 ? "+" : "") + nf1(n));

export default function StocksToUse({ escopo, onRemove, onExpand }: { escopo?: string; onRemove?: () => void; onExpand?: () => void }) {
  const cmd = COMMANDS.stocks as ModuleCommand;
  const { isPaid } = useEntitlements();
  const [commodity, setCommodity] = useState(() => (escopo && COMMODITIES[escopo] ? escopo : "soja"));
  const [regiao, setRegiao] = useState("WORLD");
  const [pub, setPub] = useState<Publico | null>(null);
  const [det, setDet] = useState<Detalhe | null>(null);
  const [state, setState] = useState<ModuleState>("loading");
  const [errorMsg, setErrorMsg] = useState<string>();

  const load = useCallback(async () => {
    if (!supabase) { setState("error"); setErrorMsg("Supabase indisponível."); return; }
    setState("loading"); setDet(null);
    const code = COMMODITIES[commodity]?.code;
    const reg = REGIOES[regiao]?.code ?? "WORLD";
    const { data, error } = await supabase.rpc("stocks_to_use_publico", { p_commodity: code, p_regiao: reg });
    if (error) { setState("error"); setErrorMsg(error.message); return; }
    const row: Publico | undefined = Array.isArray(data) ? data[0] : data;
    if (!row || row.ratio == null) { setPub(null); setState("empty"); return; }
    setPub(row); setState("ready");
    // detalhe (percentil/tick) só p/ pagante; a RPC ainda barra no servidor.
    if (isPaid) {
      const { data: dd } = await supabase.rpc("stocks_to_use_detalhe", { p_commodity: code, p_regiao: reg });
      const drow: Detalhe | undefined = Array.isArray(dd) ? dd[0] : dd;
      if (drow && drow.percentil != null) setDet(drow);
    }
  }, [commodity, regiao, isPaid]);

  useEffect(() => { load(); }, [load]);

  const emptyMsg = `Sem balanço de ${COMMODITIES[commodity]?.label?.toLowerCase() ?? "?"} para ${REGIOES[regiao]?.label ?? "?"} no PSD do USDA. Troque a commodity ou a região no seletor.`;
  const my = pub?.market_year;
  const dataDate = my ? `safra ${my}/${String(my + 1).slice(2)}` : null;

  return (
    <ModuleCard command={cmd} state={state} dataDate={dataDate} emptyMsg={emptyMsg} errorMsg={errorMsg}
      onRemove={onRemove} onExpand={onExpand} onRefresh={load}>
      {pub && (
        <div className="px-4 py-4">
          {/* seletores commodity × região (escopo parametrizável) + safra/projeção */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Selector value={commodity} onChange={setCommodity} options={Object.entries(COMMODITIES).map(([k, v]) => [k, v.label])} />
              <Selector value={regiao} onChange={setRegiao} options={Object.entries(REGIOES).map(([k, v]) => [k, v.label])} />
            </div>
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground/60 text-right leading-relaxed flex-shrink-0">
              safra {pub.market_year}/{String(pub.market_year + 1).slice(2)}
              <span className="block text-amber-400/70">projeção USDA</span>
            </span>
          </div>

          {/* veredito | número */}
          <div className="flex items-baseline justify-between mb-3">
            <span className={`font-display text-lg uppercase tracking-wider ${VTEXT[pub.veredito]}`}>{pub.veredito}</span>
            <span className="font-display text-3xl text-foreground tabular-nums tracking-tight">{nf1(pub.ratio)}<span className="text-lg text-muted-foreground">%</span></span>
          </div>

          <Bar veredito={pub.veredito} percentil={det?.percentil ?? null} isPaid={isPaid} det={det} />

          {/* insumos do cálculo */}
          <dl className="mt-5 space-y-1.5">
            <Row k="Estoque final" v={`${nf1(pub.ending_stocks)} Mt`} />
            <Row k="Consumo" v={`${nf1(pub.dom_consumption)} Mt`} />
            <Row k="Produção" v={`${nf1(pub.production)} Mt`} />
          </dl>
        </div>
      )}
    </ModuleCard>
  );
}

/** A barra: zonas em SVG, veredito sombreia a zona; tick só com percentil (terminal). */
function Bar({ veredito, percentil, isPaid, det }: { veredito: string; percentil: number | null; isPaid: boolean; det: Detalhe | null }) {
  const [hover, setHover] = useState(false);
  const W = 300, H = 46;
  const zoneIdx = ZONES.findIndex((z) => z.key === veredito);
  const tickX = percentil != null ? (percentil / 100) * W : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" className="block" style={{ overflow: "visible" }}>
        {/* zonas */}
        {ZONES.map((z, i) => (
          <rect key={z.key} x={(i * W) / 3} y={14} width={W / 3 - 1.5} height={9}
            fill={z.color} fillOpacity={i === zoneIdx ? 0.85 : 0.18} rx={1} />
        ))}
        {/* rótulos das zonas (9px, caixa alta) */}
        {ZONES.map((z, i) => (
          <text key={z.key} x={(i * W) / 3 + W / 6} y={38} textAnchor="middle"
            fontSize={9} letterSpacing={1} fill={i === zoneIdx ? z.color : "#6b7280"}
            style={{ textTransform: "uppercase", fontWeight: i === zoneIdx ? 600 : 400 }}>{z.label}</text>
        ))}
        {/* TICK — só com percentil real (terminal). Afordância visível: haste + losango. */}
        {tickX != null && (
          <g onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ cursor: "pointer" }}>
            <line x1={tickX} y1={8} x2={tickX} y2={25} stroke="#e5e7eb" strokeWidth={1.5} />
            <path d={`M ${tickX} 3 L ${tickX - 4} 9 L ${tickX + 4} 9 Z`} fill="#e5e7eb" />
            <circle cx={tickX} cy={18.5} r={9} fill="transparent" />
          </g>
        )}
      </svg>

      {/* tooltip do tick (terminal) */}
      {hover && tickX != null && det && (
        <div className="absolute -top-1 z-10 -translate-x-1/2 -translate-y-full bg-card border border-white/15 rounded-sm px-3 py-2 shadow-xl whitespace-nowrap"
          style={{ left: `${percentil}%` }}>
          <TT k="PCTL 10A" v={`${det.percentil}%`} />
          <TT k="Δ 1A" v={`${signed(det.delta_1a)} pp`} />
          <TT k="Δ 5A" v={`${signed(det.delta_5a)} pp`} />
        </div>
      )}

      {/* free: sem tick. Sinaliza que o percentil exato é do Terminal (sem marcador falso). */}
      {!isPaid && (
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground/50 mt-1.5 text-right">Percentil exato no Terminal</p>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between text-[12px]">
      <dt className="text-muted-foreground/70">{k}</dt>
      <dd className="text-foreground tabular-nums">{v}</dd>
    </div>
  );
}
function TT({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[10px]">
      <span className="uppercase tracking-wider text-muted-foreground/60">{k}</span>
      <span className="text-foreground tabular-nums">{v}</span>
    </div>
  );
}
function Selector({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="bg-card border border-white/10 text-[11px] text-foreground px-2 py-1 rounded-sm focus:outline-none focus:border-primary/40 appearance-none cursor-pointer">
      {options.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
    </select>
  );
}
