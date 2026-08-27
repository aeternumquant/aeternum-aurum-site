import type { ReactNode } from "react";
import { CHART_META, type ChartKind } from "../config/chartMeta";

/**
 * ChartSection — o "continente" de cada grafico no terminal: da RESPIRO e
 * SEPARACAO a cada bloco, sem caixa pesada. O grafico (children) ja traz seu
 * titulo discreto e as notas de honestidade (fonte, roll, ano parcial); aqui
 * acrescentamos so o MICRO-TEXTO (o que o grafico mostra e como ler, POR TIPO via
 * CHART_META, sobrescrevivel por commodity) e o espaco entre blocos.
 *
 * Sem borda/caixa: o proprio grafico ja tem seu hairline inferior (o divisor
 * chega colado ao dado); o respiro entre blocos e o separador sutil. Menos
 * poluido, nao mais.
 *
 * COMPLIANCE: o micro explica O QUE o dado mostra, nunca recomendacao/previsao.
 */
export default function ChartSection({
  type,
  microOverride,
  children,
}: {
  type: ChartKind;
  microOverride?: string;
  children: ReactNode;
}) {
  const micro = microOverride ?? CHART_META[type].micro;
  return (
    <section className="mb-7 max-w-md">
      {children}
      {micro && (
        <p className="px-4 pt-2 text-[10px] leading-relaxed text-muted-foreground/45">{micro}</p>
      )}
    </section>
  );
}
