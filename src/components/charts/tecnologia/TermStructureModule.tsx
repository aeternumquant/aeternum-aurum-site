import { useState } from "react";
import { useFuturesCurve } from "../../../hooks/useFuturesCurve";
import FuturesCurveCard from "../../FuturesCurveCard";
import "../../terminal/tokens.css";

/**
 * Estrutura a termo REAL da /tecnologia — o primeiro módulo com dado de verdade.
 * Reusa o padrão que já funciona no Terminal (useFuturesCurve + FuturesCurveCard):
 * settlement como fonte da linha, moeda no rótulo, contango/backwardation como
 * FATO com explicação. Seletor entre as 5 séries reais (adeus "GOLD FUTURES").
 *
 * Procedência NA TELA: "série própria desde 21/07/2026" — é frescor da NOSSA
 * coleta, não idade do contrato (a série do contrato é bem mais antiga).
 */
const SERIES: { code: string; label: string }[] = [
  { code: "SOJA_FUT", label: "Soja" },
  { code: "MILHO_FUT", label: "Milho" },
  { code: "BOI_FUT", label: "Boi gordo" },
  { code: "CAFE_FUT", label: "Café" },
  { code: "ETANOL_FUT", label: "Etanol" },
];
const GOLD = "#c6a75c";

export default function TermStructureModule() {
  const [sel, setSel] = useState("SOJA_FUT");
  const { data, loading } = useFuturesCurve(sel);

  return (
    <div className="tbr" style={{ background: "var(--t-s1)", boxShadow: "var(--t-card)", borderRadius: 8, overflow: "hidden" }}>
      {/* seletor de série — destinos de dado, não parâmetro inventado */}
      <div className="flex flex-wrap gap-1 p-2" style={{ borderBottom: "1px solid var(--t-edge)" }}>
        {SERIES.map((s) => {
          const active = s.code === sel;
          return (
            <button
              key={s.code}
              onClick={() => setSel(s.code)}
              className="text-[11px] tracking-wide rounded-md transition-colors"
              style={{
                padding: "4px 10px", fontWeight: active ? 590 : 510,
                color: active ? "var(--t-tx-1)" : "var(--t-tx-2)",
                background: active ? "rgba(255,255,255,0.055)" : "transparent",
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      {/* CONCLUSÃO em palavras, acima do gráfico (só com dado real; gerada da forma) */}
      {data && data.points.filter((p) => p.settlement != null).length >= 2 && (
        <p className="px-4 pt-3 text-sm leading-snug" style={{ color: "var(--t-tx-1)", fontWeight: 510 }}>
          {data.shape === "contango"
            ? "Curva em contango: o vencimento distante está mais caro que o próximo."
            : data.shape === "backwardation"
              ? "Curva em backwardation: o vencimento próximo está mais caro que o distante."
              : "Curva plana: os vencimentos custam quase o mesmo."}
        </p>
      )}

      {/* corpo: reusa o FuturesCurveCard do Terminal (settlement, moeda, forma) */}
      <div style={{ minHeight: 168 }}>
        {loading ? (
          <div className="flex items-center justify-center" style={{ height: 168, color: "var(--t-tx-3)", fontSize: 11 }}>
            <span className="animate-pulse">carregando curva…</span>
          </div>
        ) : data && data.points.filter((p) => p.settlement != null).length >= 2 ? (
          <FuturesCurveCard curve={data} />
        ) : (
          <div className="flex items-center justify-center px-4 text-center" style={{ height: 168, color: "var(--t-tx-3)", fontSize: 11 }}>
            Curva ainda não coletada para esta série.
          </div>
        )}
      </div>

      {/* PROCEDÊNCIA na tela: frescor da coleta ≠ idade do contrato */}
      <div className="px-4 py-2 leading-relaxed" style={{ borderTop: "1px solid var(--t-edge)", color: "var(--t-tx-3)", fontSize: 10 }}>
        Série própria desde 21/07/2026: frescor da nossa coleta, não idade do contrato.
        Histórico próprio: ~39 pregões. Comparação com períodos além disso não existe (não devolvemos a curva mais antiga fingindo ser a pedida).
      </div>
    </div>
  );
}
