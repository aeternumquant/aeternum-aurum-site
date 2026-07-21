import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { fmtPsd } from "./usePsdBalance";

/**
 * Ranking mundial de PRODUCAO por commodity (USDA PSD) — o competidor de
 * producao para o rodape do mapa. ZERO coleta nova: o psd_balances ja tem TODOS
 * os paises (o card so lia o Brasil). Le attr 28 (Production) do market_year
 * mais recente, todos os paises com iso_a3 nao nulo (exclui World/regioes
 * agregadas), ordena desc, top 5 + a posicao do Brasil.
 *
 * MESMA fonte, MESMO eixo: todos os paises no MESMO market_year e MESMA unidade
 * (unit_id da commodity). Nao mistura com IBGE nem Comex.
 */
export type RankRow = { iso: string; name: string; value: number | null; rank: number; isBrazil: boolean };
export type PsdRanking = {
  safraLabel: string;
  unitId: number | null;
  top: RankRow[];
  brazilOutside: RankRow | null; // Brasil fora do top 5 (mostrar "... Brasil Nº")
};

/**
 * Nomes pt dos produtores. Curado (nao o trade_countries): la 12 iso_a3 colidem
 * com territorios — a Ilha Wake herda "USA", a Ilha de Jersey herda "GBR" — e a
 * heuristica erra. Estes 25+ cobrem o top-8 das 9 commodities; fallback = iso.
 */
const ISO_PT: Record<string, string> = {
  BRA: "Brasil", USA: "Estados Unidos", ARG: "Argentina", CHN: "China", IND: "Índia",
  RUS: "Rússia", UKR: "Ucrânia", CAN: "Canadá", AUS: "Austrália", PRY: "Paraguai",
  MEX: "México", IDN: "Indonésia", THA: "Tailândia", VNM: "Vietnã", TUR: "Turquia",
  PAK: "Paquistão", BGD: "Bangladesh", MMR: "Mianmar", PHL: "Filipinas", UZB: "Uzbequistão",
  COL: "Colômbia", ETH: "Etiópia", HND: "Honduras", UGA: "Uganda", ZAF: "África do Sul",
  NGA: "Nigéria", EGY: "Egito", KAZ: "Cazaquistão", PER: "Peru", GTM: "Guatemala",
  CIV: "Costa do Marfim", GHA: "Gana", IRN: "Irã", FRA: "França", DEU: "Alemanha",
  KOR: "Coreia do Sul", JPN: "Japão", NZL: "Nova Zelândia", SAU: "Arábia Saudita",
  URY: "Uruguai", BOL: "Bolívia", CHL: "Chile", ESP: "Espanha", ITA: "Itália",
};
function ptName(iso: string): string {
  return ISO_PT[iso] ?? iso;
}

export function usePsdRanking(commodityCode: string | undefined): { data: PsdRanking | null } {
  const [data, setData] = useState<PsdRanking | null>(null);
  useEffect(() => {
    if (!commodityCode || !supabase) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      // anos recentes (o mais novo e projecao ~2026/27); leve, sem varrer 60 anos
      const sinceYear = new Date().getUTCFullYear() - 4;
      const { data: rows, error } = await supabase!
        .from("psd_balances")
        .select("market_year,iso_a3,value,unit_id")
        .eq("commodity_code", commodityCode)
        .eq("attribute_id", 28)
        .not("iso_a3", "is", null)
        .gte("market_year", sinceYear);
      if (cancelled || error || !rows) {
        if (!cancelled) setData(null);
        return;
      }
      const withVal = rows.filter((r: any) => r.value != null);
      if (!withVal.length) {
        setData(null);
        return;
      }
      const my = Math.max(...withVal.map((r: any) => Number(r.market_year)));
      const yr = withVal
        .filter((r: any) => Number(r.market_year) === my)
        .sort((a: any, b: any) => Number(b.value) - Number(a.value));
      const unitId = yr[0]?.unit_id ?? null;
      const ranked: RankRow[] = yr.map((r: any, i: number) => ({
        iso: r.iso_a3,
        name: ptName(r.iso_a3),
        value: r.value,
        rank: i + 1,
        isBrazil: r.iso_a3 === "BRA",
      }));
      const top = ranked.slice(0, 5);
      const brIdx = ranked.findIndex((r) => r.isBrazil);
      const brazilOutside = brIdx >= 5 ? ranked[brIdx] : null;
      setData({
        safraLabel: `${my}/${String((my + 1) % 100).padStart(2, "0")}`,
        unitId,
        top,
        brazilOutside,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [commodityCode]);
  return { data };
}

export { fmtPsd };
