import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * USGS Mineral Commodity Summaries — producao/reserva de minerais por pais (o
 * "USDA dos minerios"). Duas vistas:
 *  - useUsgsRanking(commodity): ranking mundial de PRODUCAO (rodape da aba
 *    Minerios; niobio -> Brasil ~93%, o espelho da soja).
 *  - useRareEarthGap(): reserva vs producao por pais (o infografico da aba
 *    Terras raras — o GAP do Brasil: 2a reserva, producao ~0. FATO estrutural,
 *    nunca recomendacao).
 * Unidade por linha (metric tons, thousand metric tons, kilograms) — fmtUsgs
 * normaliza. Ponte iso curada; country_iso null (World/agregado) excluido.
 */
export type UsgsRow = { iso: string; name: string; value: number | null; rank: number; isBrazil: boolean };
export type UsgsRanking = { year: number; top: UsgsRow[]; brazilOutside: UsgsRow | null; unit: string };
export type GapRow = { iso: string; name: string; reserve: number | null; production: number | null };
export type RareEarthGap = { year: number; unit: string; rows: GapRow[] };

/** iso_a3 -> pt para os produtores de minerais (mais amplo que o agricola). */
const ISO_PT: Record<string, string> = {
  BRA: "Brasil", USA: "Estados Unidos", CHN: "China", AUS: "Austrália", RUS: "Rússia",
  IND: "Índia", CAN: "Canadá", ARG: "Argentina", CHL: "Chile", PER: "Peru",
  COD: "Rep. Dem. Congo", GIN: "Guiné", ZAF: "África do Sul", KAZ: "Cazaquistão", MMR: "Mianmar",
  MYS: "Malásia", MDG: "Madagascar", MOZ: "Moçambique", GHA: "Gana", IDN: "Indonésia",
  PHL: "Filipinas", NCL: "Nova Caledônia", GAB: "Gabão", MEX: "México", TUR: "Turquia",
  VNM: "Vietnã", THA: "Tailândia", UKR: "Ucrânia", UZB: "Uzbequistão", ZMB: "Zâmbia",
  ZWE: "Zimbábue", TZA: "Tanzânia", NAM: "Namíbia", BWA: "Botsuana", MRT: "Mauritânia",
  MLI: "Mali", BFA: "Burkina Faso", COL: "Colômbia", BOL: "Bolívia", VEN: "Venezuela",
  NOR: "Noruega", FIN: "Finlândia", SWE: "Suécia", ESP: "Espanha", POL: "Polônia",
  DEU: "Alemanha", FRA: "França", GRL: "Groenlândia", IRN: "Irã", SAU: "Arábia Saudita",
  PNG: "Papua-Nova Guiné", LAO: "Laos", RWA: "Ruanda", BDI: "Burundi", NGA: "Nigéria",
  EGY: "Egito", MAR: "Marrocos", DZA: "Argélia", JAM: "Jamaica", GUY: "Guiana",
  TUN: "Tunísia", KOR: "Coreia do Sul", JPN: "Japão", NZL: "Nova Zelândia",
};
const ptName = (iso: string) => ISO_PT[iso] ?? iso;

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });
/** valor + unidade USGS -> texto, normalizando para toneladas. */
export function fmtUsgs(value: number | null, unit: string): string {
  if (value == null) return "—";
  const u = (unit || "").toLowerCase();
  let t = value;
  if (u.includes("thousand metric ton")) t = value * 1000;
  else if (u.includes("kilogram")) t = value / 1000;
  // "metric tons" (e REO) ficam como estao
  if (t >= 1e6) return `${nf.format(t / 1e6)} Mt`;
  if (t >= 1e3) return `${nf.format(t / 1e3)} mil t`;
  return `${nf.format(t)} t`;
}

async function fetchProd(commodity: string): Promise<any[] | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("usgs_minerals")
    .select("country_iso,statistic,value,unit,year")
    .eq("commodity", commodity)
    .eq("statistic", "Production")
    .not("country_iso", "is", null);
  return error ? null : (data ?? []);
}

export function useUsgsRanking(commodity: string | undefined): { data: UsgsRanking | null } {
  const [data, setData] = useState<UsgsRanking | null>(null);
  useEffect(() => {
    if (!commodity) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const rows = await fetchProd(commodity);
      if (cancelled) return;
      const withVal = (rows ?? []).filter((r: any) => r.value != null);
      if (!withVal.length) {
        setData(null);
        return;
      }
      const year = Math.max(...withVal.map((r: any) => Number(r.year)));
      // Um pais pode ter VARIAS linhas de Production (ex.: minerio de ferro tem
      // "usable ore" E "iron content"); agrega por pais tomando o MAIOR (o
      // numero-manchete), senao o pais duplica no ranking. Unidade unica.
      const byIso = new Map<string, { value: number; unit: string }>();
      for (const r of withVal) {
        if (Number(r.year) !== year) continue;
        const cur = byIso.get(r.country_iso);
        if (!cur || Number(r.value) > cur.value) byIso.set(r.country_iso, { value: Number(r.value), unit: r.unit });
      }
      const ranked: UsgsRow[] = [...byIso.entries()]
        .sort((a, b) => b[1].value - a[1].value)
        .map(([iso, v], i) => ({ iso, name: ptName(iso), value: v.value, rank: i + 1, isBrazil: iso === "BRA" }));
      const unit0 = ranked.length ? byIso.get(ranked[0].iso)!.unit : "";
      const brIdx = ranked.findIndex((r) => r.isBrazil);
      setData({
        year,
        unit: unit0,
        top: ranked.slice(0, 5),
        brazilOutside: brIdx >= 5 ? ranked[brIdx] : null,
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [commodity]);
  return { data };
}

export function useRareEarthGap(): { data: RareEarthGap | null } {
  const [data, setData] = useState<RareEarthGap | null>(null);
  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    (async () => {
      const { data: rows, error } = await supabase!
        .from("usgs_minerals")
        .select("country_iso,statistic,value,unit,year")
        .eq("commodity", "Rare Earths")
        .in("statistic", ["Production", "Reserves"])
        .not("country_iso", "is", null);
      if (cancelled || error || !rows) {
        if (!cancelled) setData(null);
        return;
      }
      // reserva: ano mais recente; producao: ano mais recente
      const res = rows.filter((r: any) => r.statistic === "Reserves" && r.value != null);
      const prod = rows.filter((r: any) => r.statistic === "Production" && r.value != null);
      if (!res.length) {
        setData(null);
        return;
      }
      const resYear = Math.max(...res.map((r: any) => Number(r.year)));
      const prodYear = prod.length ? Math.max(...prod.map((r: any) => Number(r.year))) : resYear;
      const resByIso = new Map<string, number>();
      res.filter((r: any) => Number(r.year) === resYear).forEach((r: any) => resByIso.set(r.country_iso, Number(r.value)));
      const prodByIso = new Map<string, number>();
      prod.filter((r: any) => Number(r.year) === prodYear).forEach((r: any) => prodByIso.set(r.country_iso, Number(r.value)));
      // ordenar por reserva desc; top paises + garantir Brasil
      const isos = [...new Set([...resByIso.keys()])].sort((a, b) => (resByIso.get(b) ?? 0) - (resByIso.get(a) ?? 0));
      const top = isos.slice(0, 6);
      if (!top.includes("BRA") && resByIso.has("BRA")) top.push("BRA");
      const gapRows: GapRow[] = top.map((iso) => ({
        iso,
        name: ptName(iso),
        reserve: resByIso.get(iso) ?? null,
        production: prodByIso.get(iso) ?? null,
      }));
      setData({ year: resYear, unit: res[0]?.unit ?? "metric tons", rows: gapRows });
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return { data };
}
