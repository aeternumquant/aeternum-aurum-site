import { useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";

/**
 * Fluxo de comercio da SOJA para o mapa v2 (piloto). Le trade_flows (nivel de
 * PAIS, flow='export') dos tres sub-produtos, soma os ultimos 12 meses
 * disponiveis por pais, e junta com trade_countries para o iso_a3/iso_n3 (o
 * mapa desenha por ISO). Nivel de pais so, RLS deixa o anon ler.
 *
 * Grao = 120190 (o 120100 costurado e so para a serie LONGA de preco; o mapa usa
 * os 12 meses recentes, onde so existe 120190). Farelo = 230400. Oleo = 150710 +
 * 150790 (bruto + refinado, o card mostra a soma).
 */
export type SojaSub = "grao" | "farelo" | "oleo";

export type SojaBuyer = {
  isoA3: string;
  isoN3: number | null;
  namePt: string;
  kg: number;
  fob: number;
  pct: number; // % do volume (KG) do sub-produto
};

export type SojaSubData = {
  buyers: SojaBuyer[]; // ordenado por KG desc
  totalKg: number;
  totalFob: number;
};

export type SojaFlows = {
  grao: SojaSubData;
  farelo: SojaSubData;
  oleo: SojaSubData;
  monthsLabel: string; // ex.: "jul/2025 a jun/2026"
};

const CODE_SUB: Record<string, SojaSub> = {
  "120190": "grao",
  "230400": "farelo",
  "150710": "oleo",
  "150790": "oleo",
};
const CODES = Object.keys(CODE_SUB);

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
function fmtMonth(ym: string): string {
  const [y, m] = ym.split("-");
  return `${MESES[Number(m) - 1]}/${y}`;
}

/** Primeiro dia do mes, `months` meses atras (UTC). */
function isoMonthsAgo(months: number): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - months);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

type State = { data: SojaFlows | null; loading: boolean; error: string | null };

/** So busca quando `enabled` (o piloto e ligado apenas na soja). */
export function useSojaFlows(enabled: boolean): State {
  const [state, setState] = useState<State>({ data: null, loading: enabled, error: null });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function load() {
      if (supabaseConfigError || !supabase) {
        if (!cancelled) setState({ data: null, loading: false, error: supabaseConfigError });
        return;
      }

      // Flows (pode passar de 1000 linhas -> pagina). Janela generosa (15m) e
      // depois recorta os ultimos 12 meses PRESENTES no dado (robusto ao atraso).
      const since = isoMonthsAgo(15);
      const flows: any[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("trade_flows")
          .select("product_code,country_code,net_kg,fob_usd,ref_month")
          .eq("flow", "export")
          .in("product_code", CODES)
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

      // Ultimos 12 meses disponiveis.
      const monthsSet = [...new Set(flows.map((r: any) => String(r.ref_month).slice(0, 7)))].sort();
      const last12 = new Set(monthsSet.slice(-12));

      const agg: Record<SojaSub, Map<number, { kg: number; fob: number }>> = {
        grao: new Map(),
        farelo: new Map(),
        oleo: new Map(),
      };
      for (const r of flows) {
        if (!last12.has(String(r.ref_month).slice(0, 7))) continue;
        const sub = CODE_SUB[r.product_code];
        if (!sub) continue;
        const cc = r.country_code as number;
        const cur = agg[sub].get(cc) ?? { kg: 0, fob: 0 };
        cur.kg += Number(r.net_kg) || 0;
        cur.fob += Number(r.fob_usd) || 0;
        agg[sub].set(cc, cur);
      }

      const build = (sub: SojaSub): SojaSubData => {
        const m = agg[sub];
        const totalKg = [...m.values()].reduce((s, x) => s + x.kg, 0);
        const totalFob = [...m.values()].reduce((s, x) => s + x.fob, 0);
        const buyers: SojaBuyer[] = [...m.entries()]
          .map(([cc, x]) => {
            const c = cmap.get(cc) ?? {};
            return {
              isoA3: c.iso_a3 ?? "",
              isoN3: c.iso_n3 ?? null,
              namePt: c.name_pt ?? "?",
              kg: x.kg,
              fob: x.fob,
              pct: totalKg > 0 ? (100 * x.kg) / totalKg : 0,
            };
          })
          .filter((b) => b.kg > 0)
          .sort((a, b) => b.kg - a.kg);
        return { buyers, totalKg, totalFob };
      };

      const sorted = [...last12].sort();
      const monthsLabel = sorted.length
        ? `${fmtMonth(sorted[0])} a ${fmtMonth(sorted[sorted.length - 1])}`
        : "";

      if (!cancelled) {
        setState({
          data: { grao: build("grao"), farelo: build("farelo"), oleo: build("oleo"), monthsLabel },
          loading: false,
          error: null,
        });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return state;
}
