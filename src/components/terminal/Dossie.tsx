import WorldStage from "./modules/WorldStage";
import { resolveEscopo } from "./commodityRegistry";

/**
 * <Dossie> — o DEFAULT do terminal-br (Arranjo 2): palco no topo + o dossiê da
 * commodity ativa abaixo. NÃO é "outros módulos" — é tudo o que a casa tem sobre
 * ESTA commodity, em slots equilibrados, montando SÓ os cobertos (registry).
 *
 * Ordem aprovada (prioridade): séries > gregas/vol > Brasil/ZARC > stocks > research.
 * "Primeiro o que TODA commodity tem (séries), depois o EXCLUSIVO nosso (gregas),
 * depois o que o assinante paga (ZARC), por fim contexto (stocks) e leitura (research)."
 *
 * ESQUELETO: por ora os 5 slots são PLACEHOLDERS rotulados — o objetivo é provar a
 * ordem e a adaptação nos extremos (soja 5/5 × minério 1/5) ANTES de encher.
 */
const GOLD = "#c6a75c";

export default function Dossie({ escopo }: { escopo?: string }) {
  const e = resolveEscopo(escopo);

  // séries é SEMPRE presente (garante que nenhuma commodity fica vazia; carrega o
  // "existe aqui" pra quem tem só preço). Os demais entram por cobertura declarada.
  const seriesHint = e.seriesCode
    ? `preço ${e.seriesCode}${e.relatedSeries.length ? ` · +${e.relatedSeries.length} relacionadas` : ""}`
    : (e.noQuote ?? "sem cotação pública");
  const extras = [
    { key: "gregas", show: e.temOpcoes, title: "Gregas & volatilidade", hint: "skew · term structure · IV rank", gated: true },
    { key: "brasil", show: e.temBrasil, title: "Brasil · ZARC", hint: "janela de plantio por município" },
    { key: "stocks", show: e.temStocks, title: "Stocks-to-use", hint: "aperto da oferta mundial · PSD" },
    { key: "research", show: !!e.researchId, title: "Research", hint: e.researchId ?? "" },
  ].filter((s) => s.show);
  const total = 1 + extras.length;

  return (
    <div className="space-y-6">
      {/* palco (real) */}
      <WorldStage escopo={escopo} />

      {/* dossiê da commodity ativa */}
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-sans text-sm uppercase tracking-[0.2em]" style={{ color: GOLD }}>
            Dossiê · {e.label}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/35">
            {total} {total === 1 ? "slot coberto" : "slots cobertos"}
          </span>
        </div>

        {/* séries: full-width (é o primário; sozinho quando só há preço) */}
        <SlotBox i={0} title="Séries" hint={seriesHint} full />

        {/* extras cobertos: grade equilibrada 2 colunas, na ordem de prioridade */}
        {extras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {extras.map((s, i) => (
              <SlotBox key={s.key} i={i + 1} title={s.title} hint={s.hint} gated={s.gated} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** placeholder de um slot do dossiê (esqueleto) — título + o que vai vir + ordem. */
function SlotBox({ i, title, hint, full, gated }: { i: number; title: string; hint: string; full?: boolean; gated?: boolean }) {
  return (
    <div
      className={`rounded-sm bg-[var(--t-s1)] shadow-[var(--t-edge)] p-4 ${full ? "" : "min-h-[140px]"}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: `${GOLD}b0` }}>
          {i + 1}. {title}
        </span>
        {gated && (
          <span className="font-mono text-[8px] uppercase tracking-widest text-amber-400/70">
            license-gated · não publicado
          </span>
        )}
      </div>
      <p className="font-mono text-[11px] text-white/55 mt-2">{hint}</p>
      <p className="font-mono text-[8px] uppercase tracking-widest text-white/20 mt-3">slot a preencher</p>
    </div>
  );
}
