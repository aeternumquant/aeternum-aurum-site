import { useEffect, useState } from "react";
import { supabase, supabaseConfigError } from "../lib/supabase";

export type MarketCategory = "grao" | "energia" | "cambio" | "macro" | "rwa";

export type Frequency = "continua" | "diaria" | "mensal";

export type MarketPoint = {
  code: string;
  labelPt: string;
  labelEn: string | null;
  unit: string | null;
  category: MarketCategory;
  frequency: Frequency;
  /** Onde o preco se FORMA (B3, BCB). Distinto de sourceSlug, que ENTREGA. */
  market: string | null;
  sourceSlug: string;
  attribution: string | null;
  ts: string;
  value: number;
  prevValue: number | null;
  prevTs: string | null;
  /** (value - prev) / prev * 100. null quando nao ha ponto anterior valido. */
  changePercent: number | null;
  /** "vs. pregao anterior" etc., derivado de frequency. null se nao ha variacao. */
  changeLabel: string | null;
  isStale: boolean;
  ageInDays: number;
};

/**
 * Limite de defasagem por FREQUENCY (nao por categoria), em dias. A frequencia
 * do dado e que define o que e "velho": um dado mensal nao esta stale com 10
 * dias, e o limite por categoria marcaria stale sempre.
 *
 *  - continua = 2: o RWA e snapshot 2x/dia; passou 2 dias, morreu.
 *  - diaria   = 6: cobre feriado prolongado. Ex.: Carnaval, sexta fecha e volta
 *                  quarta = 5 dias. Com 4 daria FALSO POSITIVO toda quaresma.
 *                  Trade-off aceito: um worker morto de verdade so aparece em 6
 *                  dias, nao 4.
 *  - mensal   = 45: um mes mais o atraso de publicacao (ex.: Pink Sheet).
 */
export const STALE_LIMITS_DAYS: Record<Frequency, number> = {
  continua: 2,
  diaria: 6,
  mensal: 45,
};

/**
 * Rotulo do "anterior", derivado da frequency. Ponto de honestidade: um "▲ 1,2%"
 * sozinho, ao lado de outro que compara meses, mente por omissao.
 */
const CHANGE_LABEL: Record<Frequency, string> = {
  diaria: "vs. pregão anterior",
  mensal: "vs. mês anterior",
  continua: "vs. leitura anterior",
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
 * (value - prev) / prev * 100. null se nao ha prev valido (null/zero/negativo).
 * Ausencia de ponto anterior NAO e variacao zero: e ausencia de variacao.
 */
function changeFrom(value: number, prevValue: number | null): number | null {
  if (prevValue == null || !Number.isFinite(prevValue) || prevValue <= 0) return null;
  if (!Number.isFinite(value)) return null;
  return ((value - prevValue) / prevValue) * 100;
}

/**
 * Le o ultimo ponto de cada serie da view public.series_latest, ja com o ponto
 * anterior (prev_value / prev_ts), a frequency e o market.
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
        .select(
          "code,label_pt,label_en,unit,category,frequency,market,source_slug,attribution,ts,value,prev_value,prev_ts",
        );

      if (cancelled) return;

      if (error) {
        setState({ data: null, loading: false, error: error.message });
        return;
      }

      const now = Date.now();
      const points: MarketPoint[] = (data ?? []).map((r: any) => {
        const category = r.category as MarketCategory;
        const frequency = r.frequency as Frequency;
        const value = Number(r.value);
        const prevValue = r.prev_value != null ? Number(r.prev_value) : null;
        const changePercent = changeFrom(value, prevValue);
        const ageInDays = ageInDaysFrom(r.ts, now);
        const limit = STALE_LIMITS_DAYS[frequency] ?? STALE_LIMITS_DAYS.diaria;
        return {
          code: r.code,
          labelPt: r.label_pt,
          labelEn: r.label_en ?? null,
          unit: r.unit ?? null,
          category,
          frequency,
          market: r.market ?? null,
          sourceSlug: r.source_slug,
          attribution: r.attribution ?? null,
          ts: r.ts,
          value,
          prevValue,
          prevTs: r.prev_ts ?? null,
          changePercent,
          // Nunca um rotulo sem percentual: os dois existem juntos ou nenhum.
          changeLabel: changePercent != null ? CHANGE_LABEL[frequency] ?? null : null,
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
