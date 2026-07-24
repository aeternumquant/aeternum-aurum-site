import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Faixa (min/max) de uma serie nos ultimos N anos, calculada DO BANCO (nao
 * hard-code). Para o dot plot do gas: a barra clara atras do ponto e o alcance
 * de 5 anos daquela praca. Devolve tambem o ts do maximo (para rotular o pico
 * fora de escala: "pico 2022: 70"). Duas queries ordenadas por value (limit 1)
 * por codigo — o indice de observations resolve sem varrer a serie inteira.
 */
export type PriceRange = { min: number; minTs: string; max: number; maxTs: string };

export function usePriceRanges(
  codes: string[],
  years = 5,
): { data: Map<string, PriceRange>; loading: boolean } {
  const key = codes.join(",");
  const [state, setState] = useState<{ data: Map<string, PriceRange>; loading: boolean }>({
    data: new Map(),
    loading: codes.length > 0,
  });
  useEffect(() => {
    if (!codes.length || !supabase) {
      setState({ data: new Map(), loading: false });
      return;
    }
    let cancelled = false;
    setState((s) => ({ data: s.data, loading: true }));
    (async () => {
      const since = new Date();
      since.setFullYear(since.getFullYear() - years);
      const sinceIso = since.toISOString();
      const q = (code: string) =>
        supabase!
          .from("observations")
          .select("ts,value,series!inner(code)")
          .eq("series.code", code)
          .gte("ts", sinceIso);
      const result = new Map<string, PriceRange>();
      await Promise.all(
        codes.map(async (code) => {
          const [minRes, maxRes] = await Promise.all([
            q(code).order("value", { ascending: true }).limit(1),
            q(code).order("value", { ascending: false }).limit(1),
          ]);
          const lo = (minRes.data as any[])?.[0];
          const hi = (maxRes.data as any[])?.[0];
          if (lo && hi && Number.isFinite(Number(lo.value)) && Number.isFinite(Number(hi.value))) {
            result.set(code, { min: Number(lo.value), minTs: lo.ts, max: Number(hi.value), maxTs: hi.ts });
          }
        }),
      );
      if (!cancelled) setState({ data: result, loading: false });
    })();
    return () => {
      cancelled = true;
    };
  }, [key, years]);
  return state;
}
