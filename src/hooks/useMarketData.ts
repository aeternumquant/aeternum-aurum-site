import { useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";

export type MarketCategory = "grao" | "energia" | "cambio" | "macro" | "rwa";

export type MarketPoint = {
  code: string;
  labelPt: string;
  labelEn: string | null;
  unit: string | null;
  category: MarketCategory;
  sourceSlug: string;
  attribution: string | null;
  ts: string;
  value: number;
  isStale: boolean;
  ageInDays: number;
};

/**
 * Limite de defasagem por categoria, em dias. Acima disso o ponto e marcado
 * isStale. Fica aqui, nomeado, para ser facil de ajustar.
 *
 *  - grao / energia / cambio: 4 dias (cobre fim de semana + feriado)
 *  - rwa: 1 dia (snapshot, deveria renovar todo dia)
 */
export const STALE_LIMITS_DAYS: Record<MarketCategory, number> = {
  grao: 4,
  energia: 4,
  cambio: 4,
  macro: 4,
  rwa: 1,
};

type MarketDataState = {
  data: MarketPoint[] | null;
  loading: boolean;
  error: string | null;
};

function ageInDaysFrom(ts: string, now: number): number {
  const t = new Date(ts).getTime();
  if (!Number.isFinite(t)) return Infinity;
  return (now - t) / (1000 * 60 * 60 * 24);
}

/**
 * Le o ultimo ponto de cada serie da view public.series_latest.
 *
 * Nao filtra por visibility: o RLS ja decide o que o anon enxerga (7 series
 * publicas, nunca a interna RWA_TVL_TOTAL). Confiamos no banco, nao no cliente.
 *
 * Busca uma vez por mount (o dado muda 2x/dia; sem polling nem realtime).
 */
export function useMarketData(): MarketDataState {
  const [state, setState] = useState<MarketDataState>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (supabaseConfigError || !supabase) {
        if (!cancelled) {
          setState({ data: null, loading: false, error: supabaseConfigError });
        }
        return;
      }

      const { data, error } = await supabase
        .from("series_latest")
        .select("code,label_pt,label_en,unit,category,source_slug,attribution,ts,value");

      if (cancelled) return;

      if (error) {
        setState({ data: null, loading: false, error: error.message });
        return;
      }

      const now = Date.now();
      const points: MarketPoint[] = (data ?? []).map((r: any) => {
        const category = r.category as MarketCategory;
        const ageInDays = ageInDaysFrom(r.ts, now);
        const limit = STALE_LIMITS_DAYS[category] ?? 4;
        return {
          code: r.code,
          labelPt: r.label_pt,
          labelEn: r.label_en ?? null,
          unit: r.unit ?? null,
          category,
          sourceSlug: r.source_slug,
          attribution: r.attribution ?? null,
          ts: r.ts,
          value: Number(r.value),
          ageInDays,
          isStale: ageInDays > limit,
        };
      });

      setState({ data: points, loading: false, error: null });
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
