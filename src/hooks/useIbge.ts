import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Producao brasileira de campo (IBGE), tabela SEPARADA do USDA/Comex. O card
 * apresenta lado a lado onde CONVERSAM (grao vs grao), com eixos de ano
 * DISTINTOS (safra medida IBGE vs projecao USDA) — a divergencia e informacao.
 *
 *  - usePamProduction(slug): producao (var 214) do Brasil (N1) no ano mais
 *    recente + os estados lideres (N3) em %. Valor CRU em TONELADAS (o front
 *    formata; o USDA era 1000 MT — nunca misturar sem converter).
 *  - usePamAbate(species): peso de carcaca do IBGE (abate INSPECIONADO), ano
 *    completo mais recente. E metrica DIFERENTE da producao total do USDA
 *    (rotulo proprio no card).
 */
export type LeaderState = { name: string; pct: number };
export type PamProduction = { year: number; value: number | null; unit: string; states: LeaderState[]; delta5y: number | null };
export type Abate = { year: number; carcassKg: number };

const nf = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 });

/** valor cru em TONELADAS -> texto (Mt / mil t / t). */
export function fmtTon(v: number | null): string {
  if (v == null) return "—";
  if (v >= 1e6) return `${nf.format(v / 1e6)} Mt`;
  if (v >= 1e3) return `${nf.format(v / 1e3)} mil t`;
  return `${nf.format(v)} t`;
}
/** kg de carcaca -> Mt CWE. */
export function fmtCwe(kg: number | null): string {
  if (kg == null) return "—";
  return `${nf.format(kg / 1e9)} Mt`;
}

export function usePamProduction(slug: string | undefined): { data: PamProduction | null } {
  const [data, setData] = useState<PamProduction | null>(null);
  useEffect(() => {
    if (!slug || !supabase) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: rows, error } = await supabase!
        .from("ibge_pam")
        .select("locality_level,locality_name,year,value,unit")
        .eq("product_slug", slug)
        .eq("variable_id", 214);
      if (cancelled || error || !rows) {
        if (!cancelled) setData(null);
        return;
      }
      const n1Years = rows.filter((r: any) => r.locality_level === "N1" && r.value != null).map((r: any) => r.year);
      if (!n1Years.length) {
        setData(null);
        return;
      }
      const year = Math.max(...n1Years);
      const n1 = rows.find((r: any) => r.locality_level === "N1" && r.year === year);
      const total = Number(n1?.value ?? 0);
      const states: LeaderState[] = rows
        .filter((r: any) => r.locality_level === "N3" && r.year === year && r.value != null)
        .map((r: any) => ({ name: r.locality_name as string, pct: total > 0 ? (100 * Number(r.value)) / total : 0 }))
        .sort((a, b) => b.pct - a.pct)
        .slice(0, 3);
      // delta 5 anos: IBGE-hoje vs IBGE de (year-5). Mesmo eixo (campo medido).
      const past = rows.find((r: any) => r.locality_level === "N1" && r.year === year - 5 && r.value != null)?.value ?? null;
      const delta5y = past != null && Number(past) !== 0 ? Math.round((100 * (total - Number(past))) / Number(past)) : null;
      setData({ year, value: n1?.value ?? null, unit: n1?.unit ?? "Toneladas", states, delta5y });
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);
  return { data };
}

export function usePamAbate(species: string | undefined): { data: Abate | null } {
  const [data, setData] = useState<Abate | null>(null);
  useEffect(() => {
    if (!species || !supabase) {
      setData(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: rows, error } = await supabase!
        .from("ibge_abate")
        .select("year,carcass_kg,quarters")
        .eq("species", species)
        .eq("quarters", 4) // so ano COMPLETO (4 trimestres); parcial nao finge ser ano
        .order("year", { ascending: false })
        .limit(1);
      if (cancelled || error || !rows || !rows.length) {
        if (!cancelled) setData(null);
        return;
      }
      setData({ year: rows[0].year, carcassKg: Number(rows[0].carcass_kg) });
    })();
    return () => {
      cancelled = true;
    };
  }, [species]);
  return { data };
}
