import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { Frequency } from "./useMarketData";

/**
 * Historico de preco de uma serie, lendo a `observations` (que ja tem meses de
 * dado). ZERO coleta nova: so exibe o que ja esta no banco. A observations e
 * indexada por series_id; filtramos por `series.code` via embedding do PostgREST
 * (join inner), sem lookup de id separado.
 *
 * HONESTIDADE DE ALCANCE: devolve os pontos REAIS (primeira e ultima data, a
 * contagem). Serie curta e curta, e isso e informacao, nao defeito a esconder,
 * quem desenha rotula o alcance de verdade. Sem indicadores derivados, sem media
 * movel, sem backtesting: isso e do dashboard de membros, nao do terminal.
 */
export type HistoryPoint = { ts: string; value: number };
export type PriceHistory = {
  points: HistoryPoint[];
  firstTs: string;
  lastTs: string;
  count: number;
  unit: string | null;
  frequency: Frequency;
};

export function usePriceHistory(seriesCode: string | null | undefined): { data: PriceHistory | null; loading: boolean } {
  const [state, setState] = useState<{ data: PriceHistory | null; loading: boolean }>({
    data: null,
    loading: !!seriesCode,
  });
  useEffect(() => {
    if (!seriesCode || !supabase) {
      setState({ data: null, loading: false });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true });
    (async () => {
      const { data: rows, error } = await supabase!
        .from("observations")
        .select("ts,value,series!inner(code,unit,frequency)")
        .eq("series.code", seriesCode)
        .order("ts", { ascending: true });
      if (cancelled) return;
      if (error || !rows || !rows.length) {
        setState({ data: null, loading: false }); // "sem historico" -> o grafico trata
        return;
      }
      const points = rows
        .map((r: any) => ({ ts: r.ts as string, value: Number(r.value) }))
        .filter((p) => Number.isFinite(p.value));
      if (points.length < 2) {
        setState({ data: null, loading: false });
        return;
      }
      const series = (rows[0] as any).series;
      setState({
        data: {
          points,
          firstTs: points[0].ts,
          lastTs: points[points.length - 1].ts,
          count: points.length,
          unit: series?.unit ?? null,
          frequency: (series?.frequency ?? "diaria") as Frequency,
        },
        loading: false,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [seriesCode]);
  return state;
}
