import { useMemo } from "react";
import { useMarketData, type MarketPoint } from "../../hooks/useMarketData";
import { useTradeFlows, type CommodityFlows } from "../../hooks/useTradeFlows";
import { FLOW_CARDS, type FlowCardCfg } from "../../lib/flowMapConfig";
import { ASSET_SERIES } from "../../config/assets";
import { resolveEscopo, type CommodityEntry } from "./commodityRegistry";

export type SelectedInfo = {
  point: MarketPoint | null;
  secondary: { point: MarketPoint | null; note: string } | null;
  hasSeries: boolean;
  noQuote: string | null;
};

export type WorldStageData = {
  entry: CommodityEntry;              // registry (id canônico)
  selectedAsset: string;             // mapKey (== AssetType) p/ FLOW_CARDS/ASSET_SERIES
  flowCfg: FlowCardCfg | undefined;  // undefined => a commodity não tem carta de fluxo
  flows: CommodityFlows | null;
  flowsLoading: boolean;
  flowsError: string | null;
  bySeries: Map<string, MarketPoint>;
  selectedInfo: SelectedInfo;
  loading: boolean;
};

/**
 * useWorldStage — a lógica de DADO do palco mundo, extraída do GlobalFlowMap
 * (mesmos hooks + derivações), agora dirigida pelo **?escopo** (id canônico do
 * commodityRegistry) em vez do selectedAsset interno. O escopo -> mapKey via o
 * registry (resolveEscopo), NUNCA chave crua.
 *
 * O GlobalFlowMap segue com sua cópia inline (Framework intocado) — dedup futuro
 * faz os dois lerem daqui. A derivação (selectedInfo/bySeries) é idêntica à dele.
 */
export function useWorldStage(escopo: string | null | undefined): WorldStageData {
  const entry = resolveEscopo(escopo);
  const selectedAsset = entry.mapKey;
  const { data: market, loading } = useMarketData();
  const flowCfg = FLOW_CARDS[selectedAsset];
  const tradeFlows = useTradeFlows(flowCfg, !!flowCfg);

  const bySeries = useMemo(() => {
    const m = new Map<string, MarketPoint>();
    (market ?? []).forEach((p) => m.set(p.code, p));
    return m;
  }, [market]);

  const selectedInfo = useMemo<SelectedInfo>(() => {
    const empty: SelectedInfo = { point: null, secondary: null, hasSeries: false, noQuote: null };
    const s = ASSET_SERIES[selectedAsset];
    // guarda de terras raras: sem série de preço (code null) devolve "sem cotação"
    if (!s || s.code == null) return { ...empty, noQuote: s?.noQuote ?? null };
    const secondary = s.secondary
      ? { point: bySeries.get(s.secondary.code) ?? null, note: s.secondary.note }
      : null;
    return { point: bySeries.get(s.code) ?? null, secondary, hasSeries: true, noQuote: null };
  }, [selectedAsset, bySeries]);

  return {
    entry,
    selectedAsset,
    flowCfg,
    flows: tradeFlows.data,
    flowsLoading: tradeFlows.loading,
    flowsError: tradeFlows.error,
    bySeries,
    selectedInfo,
    loading,
  };
}
