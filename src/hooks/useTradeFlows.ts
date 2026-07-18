import { useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";
import type { FlowCardCfg, FlowDirection } from "../lib/flowMapConfig";

/**
 * Fluxo de comercio generico para o Mapa v2 (generaliza o useSojaFlows do
 * piloto). Le trade_flows (nivel de PAIS) de TODOS os codigos da config, nas
 * duas direcoes quando houver, soma os ultimos 12 meses disponiveis por
 * (sub-card, direcao, pais) e junta trade_countries para o ISO.
 */
export type Partner = {
  isoA3: string;
  isoN3: number | null;
  namePt: string;
  kg: number;
  fob: number;
  pct: number; // % do volume (KG) do (sub, direcao)
};

export type TradeSide = { partners: Partner[]; totalKg: number; totalFob: number };
export type SubFlows = { export?: TradeSide; import?: TradeSide };
export type CommodityFlows = {
  subs: Record<string, SubFlows>;
  monthsLabel: string; // ex.: "jul/2025 a jun/2026"
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function fmtMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MESES[Number(m) - 1]}/${y}`;
}

function isoMonthsAgo(months: number): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - months);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

type State = { data: CommodityFlows | null; loading: boolean; error: string | null };

export function useTradeFlows(cfg: FlowCardCfg | undefined, enabled: boolean): State {
  const [state, setState] = useState<State>({ data: null, loading: enabled, error: null });
  // A config e um literal estavel do modulo; a identidade do cfg serve de chave.
  useEffect(() => {
    if (!enabled || !cfg || cfg.mode === "priceOnly") {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;

    async function load() {
      if (supabaseConfigError || !supabase) {
        if (!cancelled) setState({ data: null, loading: false, error: supabaseConfigError });
        return;
      }
      const codes = [
        ...new Set(cfg!.subs.flatMap((s) => [...(s.export ?? []), ...(s.import ?? [])])),
      ];

      const since = isoMonthsAgo(15);
      const flows: any[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("trade_flows")
          .select("product_code,flow,country_code,net_kg,fob_usd,ref_month")
          .in("product_code", codes)
          .not("country_code", "is", null)
          .gte("ref_month", since)
          .range(from, from + 999);
        if (error) {
          if (!cancelled) setState({ data: null, loading: false, error: error.message });
          return;
        }
        flows.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }

      const { data: countries, error: cErr } = await supabase
        .from("trade_countries")
        .select("country_code,iso_a3,iso_n3,name_pt");
      if (cErr) {
        if (!cancelled) setState({ data: null, loading: false, error: cErr.message });
        return;
      }
      const cmap = new Map<number, any>();
      (countries ?? []).forEach((c: any) => cmap.set(c.country_code, c));

      const monthsSet = [...new Set(flows.map((r: any) => String(r.ref_month).slice(0, 7)))].sort();
      const last12 = new Set(monthsSet.slice(-12));
      const recent = flows.filter((r: any) => last12.has(String(r.ref_month).slice(0, 7)));

      const buildSide = (subCodes: string[], dir: FlowDirection): TradeSide | undefined => {
        const m = new Map<number, { kg: number; fob: number }>();
        for (const r of recent) {
          if (r.flow !== dir || !subCodes.includes(r.product_code)) continue;
          const cur = m.get(r.country_code) ?? { kg: 0, fob: 0 };
          cur.kg += Number(r.net_kg) || 0;
          cur.fob += Number(r.fob_usd) || 0;
          m.set(r.country_code, cur);
        }
        const totalKg = [...m.values()].reduce((s, x) => s + x.kg, 0);
        if (totalKg <= 0) return undefined; // sem fluxo real: sem lado (nao inventar)
        const totalFob = [...m.values()].reduce((s, x) => s + x.fob, 0);
        const partners: Partner[] = [...m.entries()]
          .map(([cc, x]) => {
            const c = cmap.get(cc) ?? {};
            return {
              isoA3: c.iso_a3 ?? "",
              isoN3: c.iso_n3 ?? null,
              namePt: c.name_pt ?? "?",
              kg: x.kg,
              fob: x.fob,
              pct: (100 * x.kg) / totalKg,
            };
          })
          .filter((p) => p.kg > 0)
          .sort((a, b) => b.kg - a.kg);
        return { partners, totalKg, totalFob };
      };

      const subs: Record<string, SubFlows> = {};
      for (const s of cfg!.subs) {
        subs[s.key] = {
          export: s.export ? buildSide(s.export, "export") : undefined,
          import: s.import ? buildSide(s.import, "import") : undefined,
        };
      }

      const sorted = [...last12].sort();
      const monthsLabel = sorted.length
        ? `${fmtMonth(sorted[0])} a ${fmtMonth(sorted[sorted.length - 1])}`
        : "";

      if (!cancelled) setState({ data: { subs, monthsLabel }, loading: false, error: null });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [cfg, enabled]);

  return state;
}
