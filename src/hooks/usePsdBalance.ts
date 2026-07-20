import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import type { PsdCfg } from "../lib/flowMapConfig";

/**
 * Balanco interno do Brasil (USDA PSD) para o card. Le a producao (attr 28) e o
 * consumo (o(s) attribute_id do PsdCfg, que varia por commodity) do marketYear
 * mais recente com producao. Valor CRU em milhares + unitId (o front formata; a
 * unidade varia por commodity: 1000 MT, sacas, fardos, MT CWE).
 *
 * Tabela SEPARADA do trade_flows — este hook NAO cruza com o fluxo; o card
 * apresenta os dois lado a lado, cada um com seu eixo de tempo.
 */
export type PsdBalance = {
  marketYear: number;
  safraLabel: string; // "2024/25"
  production: number | null;
  consumption: number | null;
  exportt: number | null; // export do PSD (attr 88) — MESMO eixo do balanco (safra)
  unitId: number | null;
  productionDelta5y: number | null; // % arredondado, USDA vs USDA de 5 anos atras; null se serie curta
  exportDelta5y: number | null; // idem para export (attr 88)
};

/** delta % de 5 anos, arredondado; null se nao ha valor de 5 anos atras. */
function delta5(now: number | null | undefined, past: number | null | undefined): number | null {
  if (now == null || past == null || past === 0) return null;
  return Math.round((100 * (now - past)) / past);
}

const nfmt = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** valor CRU (milhares) + unitId -> texto. value/1000 = milhoes da unidade base. */
export function fmtPsd(value: number | null, unitId: number | null): string {
  if (value == null) return "—";
  const mi = value / 1000;
  const suf: Record<number, string> = {
    8: "Mt", // (1000 MT)
    21: "Mt", // (MT) — raro; ainda milhares na base
    7: "Mt eq. carcaça", // (1000 MT CWE)
    2: "Mi sacas (60 kg)", // (1000 60 KG BAGS)
    27: "Mi fardos (480 lb)", // 1000 480 lb Bales
    6: "Mi hL", // (1000 HL)
  };
  return `${nfmt.format(mi)} ${suf[unitId ?? -1] ?? "(mil, un. PSD)"}`;
}

export function usePsdBalance(cfg: PsdCfg | undefined): { data: PsdBalance | null } {
  const [data, setData] = useState<PsdBalance | null>(null);

  useEffect(() => {
    if (!cfg || !supabase) {
      setData(null);
      return;
    }
    let cancelled = false;
    const consumo = cfg.consumoAttrs;

    (async () => {
      const attrs = [28, 88, ...consumo]; // 28 producao, 88 export (mesmo eixo safra)
      const { data: rows, error } = await supabase!
        .from("psd_balances")
        .select("market_year,attribute_id,value,unit_id")
        .eq("commodity_code", cfg.code)
        .eq("country_code", "BR")
        .in("attribute_id", attrs);
      if (cancelled || error || !rows) {
        if (!cancelled) setData(null);
        return;
      }
      const prodYears = rows.filter((r: any) => r.attribute_id === 28 && r.value != null).map((r: any) => r.market_year);
      if (!prodYears.length) {
        setData(null);
        return;
      }
      const my = Math.max(...prodYears);
      const inYear = rows.filter((r: any) => r.market_year === my);
      const prodRow = inYear.find((r: any) => r.attribute_id === 28);
      const expRow = inYear.find((r: any) => r.attribute_id === 88);
      const consRows = inYear.filter((r: any) => consumo.includes(r.attribute_id) && r.value != null);
      const consumption = consRows.length ? consRows.reduce((s: number, r: any) => s + Number(r.value), 0) : null;

      // delta de 5 anos: USDA-hoje vs USDA de (my-5). NUNCA misturar com IBGE.
      const at = (yr: number, attr: number) => rows.find((r: any) => r.market_year === yr && r.attribute_id === attr)?.value ?? null;
      const productionDelta5y = delta5(prodRow?.value, at(my - 5, 28));
      const exportDelta5y = delta5(expRow?.value, at(my - 5, 88));

      setData({
        marketYear: my,
        safraLabel: `${my}/${String((my + 1) % 100).padStart(2, "0")}`,
        production: prodRow?.value ?? null,
        consumption,
        exportt: expRow?.value ?? null,
        unitId: prodRow?.unit_id ?? null,
        productionDelta5y,
        exportDelta5y,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [cfg]);

  return { data };
}
