import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Curva de futuros (estrutura a termo) de uma commodity B3 — o que a auditoria
 * mandou parar de jogar fora. Le a futures_curve, o trade_date mais recente,
 * os N contratos ordenados por vencimento. O rotulo contango/backwardation e
 * FATO de mercado (com explicacao), nunca recomendacao.
 *
 * Contango  = futuro mais caro que a vista (custo de carrego / expectativa de alta).
 * Backwardation = vista mais cara que o futuro (escassez atual / premio na ponta).
 */
export type CurvePoint = {
  symbol: string;
  expiration: string; // 'YYYY-MM-DD'
  settlement: number | null;
  volume: number | null;
};
export type FuturesCurve = {
  tradeDate: string;
  currency: string;
  points: CurvePoint[];
  shape: "contango" | "backwardation" | "flat";
  frontSettlement: number | null;
  backSettlement: number | null;
  spreadPct: number | null; // (fim - frente) / frente, em %
};

export function useFuturesCurve(seriesCode: string | undefined): { data: FuturesCurve | null; loading: boolean } {
  const [state, setState] = useState<{ data: FuturesCurve | null; loading: boolean }>({ data: null, loading: !!seriesCode });
  useEffect(() => {
    if (!seriesCode || !supabase) {
      setState({ data: null, loading: false });
      return;
    }
    let cancelled = false;
    setState({ data: null, loading: true });
    (async () => {
      const { data: rows, error } = await supabase!
        .from("futures_curve")
        .select("trade_date,contract_symbol,expiration_date,settlement,volume,currency")
        .eq("series_code", seriesCode)
        .order("trade_date", { ascending: false })
        .order("expiration_date", { ascending: true });
      if (cancelled) return;
      if (error || !rows || !rows.length) {
        setState({ data: null, loading: false }); // "curva ainda nao coletada" -> o card trata
        return;
      }
      const tradeDate = rows[0].trade_date; // o mais recente
      const curve = rows
        .filter((r: any) => r.trade_date === tradeDate)
        .map((r: any) => ({ symbol: r.contract_symbol, expiration: r.expiration_date, settlement: r.settlement, volume: r.volume }));
      const withPrice = curve.filter((c: CurvePoint) => c.settlement != null);
      const front = withPrice[0]?.settlement ?? null;
      const back = withPrice.length ? withPrice[withPrice.length - 1].settlement : null;
      let shape: FuturesCurve["shape"] = "flat";
      let spreadPct: number | null = null;
      if (front != null && back != null && front !== 0) {
        spreadPct = (100 * (back - front)) / front;
        shape = spreadPct > 0.3 ? "contango" : spreadPct < -0.3 ? "backwardation" : "flat";
      }
      setState({
        data: {
          tradeDate,
          currency: rows[0].currency ?? "",
          points: curve,
          shape,
          frontSettlement: front,
          backSettlement: back,
          spreadPct,
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
