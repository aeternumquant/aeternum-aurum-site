import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Stage from "../Stage";
import CommodityFlowMap from "../../maps/CommodityFlowMap";
import {
  PriceSummary,
  ProductionRankingFooter,
  UsgsRankingFooter,
  CurveOnlyFooter,
  footerCurveCode,
} from "../../maps/GlobalFlowMap";
import { COMMODITIES_REGISTRY, DEFAULT_ESCOPO, type CommodityEntry } from "../commodityRegistry";
import { useWorldStage } from "../useWorldStage";
import type { AssetCategory } from "../../../config/assets";

/**
 * WorldStage — o PALCO MUNDO real (FASE 2, Arranjo 2). Compõe a casca <Stage> com:
 *  - map: CommodityFlowMap chrome="stage" (mapa full-bleed + card de vidro), CRU.
 *  - topLeft: seletor de commodity do commodityRegistry — clicar ESCREVE ?escopo
 *    (o palco DIRIGE o escopo; idFromMapKey nunca entra chave crua no stocks/tabela).
 *  - bottomBand: os footers de ranking reusados do GlobalFlowMap (export), sem reescrever.
 * Dado via useWorldStage(escopo). O escopo NÃO reseta ao trocar de palco (vive na URL).
 */
const GOLD = "#c6a75c";
const CATEGORIES: AssetCategory[] = ["Agro", "Minérios", "Energia", "Fertilizantes"];

export default function WorldStage({ escopo }: { escopo?: string }) {
  const [params, setParams] = useSearchParams();
  const current = escopo ?? params.get("escopo") ?? DEFAULT_ESCOPO;
  const ws = useWorldStage(current);
  const [cat, setCat] = useState<AssetCategory>(
    ws.entry.category === "Financeiro" ? "Agro" : ws.entry.category,
  );

  const setEscopo = (id: string) => {
    const p = new URLSearchParams(params);
    p.set("escopo", id);
    setParams(p, { replace: true });
  };

  // preço COLADO ao sub-produto atual (regra idêntica ao GlobalFlowMap), montado aqui
  const priceBlockFor = (subKey: string) => {
    const sp = ws.flowCfg?.subs.find((s) => s.key === subKey)?.price;
    let point = ws.selectedInfo.point;
    let secondary = ws.selectedInfo.secondary;
    let noQuote = ws.selectedInfo.noQuote;
    let hasSeries = ws.selectedInfo.hasSeries;
    if (sp) {
      if (sp.code == null) {
        point = null; secondary = null; hasSeries = false; noQuote = sp.noQuote;
      } else {
        hasSeries = true; noQuote = null;
        point = ws.bySeries.get(sp.code) ?? null;
        secondary = sp.secondary
          ? { point: ws.bySeries.get(sp.secondary.code) ?? null, note: sp.secondary.note }
          : null;
      }
    }
    return (
      <PriceSummary
        point={point}
        secondary={secondary}
        ptax={ws.bySeries.get("PTAX_USD_VENDA") ?? null}
        hasSeries={hasSeries}
        loading={ws.loading}
        noQuote={noQuote}
      />
    );
  };

  const chips = COMMODITIES_REGISTRY.filter((c) => c.category === cat);
  const curveCode = footerCurveCode(ws.selectedAsset);

  return (
    <Stage
      map={
        ws.flowCfg ? (
          <CommodityFlowMap
            chrome="stage"
            label={ws.flowCfg.cardLabel ?? ws.entry.label}
            cfg={ws.flowCfg}
            flows={ws.flows}
            assetKey={ws.selectedAsset}
            priceBlockFor={priceBlockFor}
          />
        ) : (
          <SemFluxo entry={ws.entry} />
        )
      }
      topLeft={
        <div className="cflow-glass p-3">
          <p className="font-sans text-[10px] tracking-[0.22em] uppercase mb-2" style={{ color: "var(--t-tx-2)" }}>
            Fluxo global · <span className="text-white/85">{ws.entry.label}</span>
          </p>
          <div className="flex gap-2 mb-2 border-b border-white/8 pb-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className="font-sans text-[8px] uppercase tracking-[0.14em] pb-0.5 transition-colors"
                style={{
                  color: cat === c ? GOLD : "rgba(255,255,255,0.35)",
                  borderBottom: cat === c ? `1px solid ${GOLD}` : "1px solid transparent",
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1 max-w-[440px]">
            {chips.map((c) => (
              <button
                key={c.id}
                onClick={() => setEscopo(c.id)}
                className="font-sans text-[8px] uppercase tracking-[0.08em] px-2 py-0.5 rounded-sm border transition-colors"
                style={
                  c.id === ws.entry.id
                    ? { background: GOLD, color: "#050503", borderColor: GOLD }
                    : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)", borderColor: "rgba(255,255,255,0.1)" }
                }
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      }
      bottomBand={
        ws.flowCfg?.psd ? (
          <ProductionRankingFooter code={ws.flowCfg.psd.code} curveCode={curveCode} />
        ) : ws.flowCfg?.usgs ? (
          <UsgsRankingFooter commodity={ws.flowCfg.usgs} />
        ) : curveCode ? (
          <CurveOnlyFooter curveCode={curveCode} />
        ) : undefined
      }
    />
  );
}

/** commodity sem carta de fluxo (FLOW_CARDS): o mapa não desenha rota; mensagem honesta. */
function SemFluxo({ entry }: { entry: CommodityEntry }) {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "#050503" }}>
      <p className="font-sans text-[10px] tracking-[0.2em] uppercase text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
        {entry.label}
        <span className="block text-[8px] tracking-widest mt-1 text-white/20">sem carta de fluxo — só preço</span>
      </p>
    </div>
  );
}
