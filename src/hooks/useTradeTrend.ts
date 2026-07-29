import { useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";
import { COSTURA_L2, type SubCardCfg } from "../lib/flowMapConfig";

/**
 * Tendencia L2 de comercio: a serie AGREGADA nacional (trade_flows com
 * country_code null), mes a mes desde 1997, que estava ingerida e nunca foi
 * mostrada. O analogo, para VOLUME, do historico de preco da Onda 2. Le so o
 * banco (zero coleta). Agrega por ANO (30 pontos cabem no card; mensal seria
 * um borrao de 354 pontos).
 *
 * COSTURA: os 4 codigos SH6 que mudaram em 2012 (COSTURA_L2) somam antigo
 * (<=2011) + novo (>=2012) — DISJUNTOS por mes, entao a soma nao duplica e a
 * serie nao tem buraco em 2012.
 *
 * ANOS VAZIOS: dentro do alcance do codigo, ano sem linha = ZERO comercio real
 * (a API so retorna mes com fluxo). Preenchemos com zero em vez de PULAR o ano
 * — pular ligaria os vizinhos (interpolacao). Assim a borracha esparsa pre-2008
 * cai a zero onde nao houve importacao, HONESTO, sem interpolar.
 */
export type TrendPoint = { year: number; exportKg: number; exportFob: number; importKg: number; importFob: number };
export type TradeTrend = {
  points: TrendPoint[];
  firstYear: number;
  lastYear: number;
  lastYearPartial: boolean; // o ano corrente so tem meses ate o ultimo publicado
  lastMonth: string; // "2026-06" (para a data de atualizacao)
  hasExport: boolean;
  hasImport: boolean;
};
type State = { data: TradeTrend | null; loading: boolean; error: string | null };

export function useTradeTrend(sub: SubCardCfg | undefined, enabled: boolean): State {
  const [state, setState] = useState<State>({ data: null, loading: enabled, error: null });
  const expKey = (sub?.export ?? []).join(",");
  const impKey = (sub?.import ?? []).join(",");
  useEffect(() => {
    if (!enabled || !sub || (!sub.export?.length && !sub.import?.length)) {
      setState({ data: null, loading: false, error: null });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    async function load() {
      if (supabaseConfigError || !supabase) {
        if (!cancelled) setState({ data: null, loading: false, error: supabaseConfigError });
        return;
      }
      // codigos do sub + a costura (o antigo alimenta os anos pre-2012)
      const expCodes = new Set(sub!.export ?? []);
      const impCodes = new Set(sub!.import ?? []);
      for (const c of [...expCodes]) if (COSTURA_L2[c]) expCodes.add(COSTURA_L2[c]);
      for (const c of [...impCodes]) if (COSTURA_L2[c]) impCodes.add(COSTURA_L2[c]);
      const allCodes = [...new Set([...expCodes, ...impCodes])];

      const rows: any[] = [];
      for (let from = 0; ; from += 1000) {
        const { data, error } = await supabase
          .from("trade_flows")
          .select("product_code,flow,ref_month,net_kg,fob_usd")
          .is("country_code", null)
          .in("product_code", allCodes)
          .range(from, from + 999);
        if (error) {
          if (!cancelled) setState({ data: null, loading: false, error: error.message });
          return;
        }
        rows.push(...(data ?? []));
        if (!data || data.length < 1000) break;
      }

      const byYear = new Map<number, TrendPoint>();
      let lastMonth = "";
      for (const r of rows) {
        const ym = String(r.ref_month).slice(0, 7);
        if (ym > lastMonth) lastMonth = ym;
        const year = Number(ym.slice(0, 4));
        let p = byYear.get(year);
        if (!p) { p = { year, exportKg: 0, exportFob: 0, importKg: 0, importFob: 0 }; byYear.set(year, p); }
        const kg = Number(r.net_kg) || 0, fob = Number(r.fob_usd) || 0;
        if (r.flow === "export" && expCodes.has(r.product_code)) { p.exportKg += kg; p.exportFob += fob; }
        else if (r.flow === "import" && impCodes.has(r.product_code)) { p.importKg += kg; p.importFob += fob; }
      }
      if (byYear.size === 0) {
        if (!cancelled) setState({ data: null, loading: false, error: null });
        return;
      }
      const yrs = [...byYear.keys()];
      const firstYear = Math.min(...yrs), lastYear = Math.max(...yrs);
      // preenche anos vazios DENTRO do alcance com zero real (sem interpolar)
      const points: TrendPoint[] = [];
      for (let yr = firstYear; yr <= lastYear; yr++) {
        points.push(byYear.get(yr) ?? { year: yr, exportKg: 0, exportFob: 0, importKg: 0, importFob: 0 });
      }
      const hasExport = points.some((p) => p.exportKg > 0);
      const hasImport = points.some((p) => p.importKg > 0);
      const lastYearPartial = lastMonth.slice(5, 7) !== "12";

      if (!cancelled) {
        setState({ data: { points, firstYear, lastYear, lastYearPartial, lastMonth, hasExport, hasImport }, loading: false, error: null });
      }
    }

    void load();
    return () => { cancelled = true; };
  }, [expKey, impKey, enabled]);

  return state;
}
