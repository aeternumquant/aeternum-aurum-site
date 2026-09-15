import WorldStage from "./modules/WorldStage";
import { ModuleCard } from "./ModuleCard";
import { COMMANDS, type ModuleCommand } from "./commands";
import { resolveEscopo } from "./commodityRegistry";

/**
 * <Dossie> — o DEFAULT do terminal-br (Arranjo 2): palco no topo + o dossiê da
 * commodity ativa abaixo. NÃO é "outros módulos" — é tudo o que a casa tem sobre
 * ESTA commodity, em slots equilibrados, montando SÓ os cobertos (registry).
 *
 * Ordem aprovada (prioridade): séries > gregas/vol > Brasil/ZARC > stocks > research.
 *
 * Cada slot usa o <ModuleCard> (contrato: título + frase rebaixada + menu ⋮ com as
 * quatro ações), mesmo VAZIO — o andaime já tem o chrome certo; encher vira trocar
 * o corpo (state="ready" com o conteúdo), não refazer a moldura. Brasil e stocks
 * reusam a metadata dos comandos existentes; séries/gregas/research têm a sua.
 */

// metadata dos slots que ainda não são comandos próprios (séries/gregas/research)
const SLOT_META: Record<string, ModuleCommand> = {
  series: {
    id: "series", label: "Séries", planoMinimo: "free", kind: "module", size: "2x1", width: 760,
    descricao: "Preço, sub-produtos e referências relacionadas desta commodity.",
    fonte: { titulo: "World Bank Pink Sheet · B3 · séries do banco", tipo: "Base oficial", link: "https://www.worldbank.org/en/research/commodity-markets" },
  },
  gregas: {
    id: "gregas", label: "Gregas & volatilidade", planoMinimo: "terminal", kind: "module", size: "2x1", width: 380,
    descricao: "Skew, term structure e IV rank do futuro B3 — indicador derivado.",
    fonte: { titulo: "brapi Pro — opções sobre futuros B3", tipo: "Base (uso derivado)", link: "https://brapi.dev" },
  },
  research: {
    id: "research", label: "Research", planoMinimo: "free", kind: "module", size: "2x1", width: 380,
    descricao: "O paper ou artigo da casa sobre esta commodity.",
    fonte: { titulo: "Aeternum Research", tipo: "Editorial", link: "/research" },
  },
};

export default function Dossie({ escopo }: { escopo?: string }) {
  const e = resolveEscopo(escopo);

  // séries é SEMPRE presente (garante que nenhuma commodity fica vazia; carrega o
  // "existe aqui" pra quem tem só preço). Os demais entram por cobertura declarada.
  const seriesHint = e.seriesCode
    ? `${e.seriesCode}${e.relatedSeries.length ? ` · +${e.relatedSeries.length} relacionadas` : ""} — a preencher`
    : `${e.noQuote ?? "sem cotação pública"} — a preencher`;
  const extras = [
    e.temOpcoes && { cmd: SLOT_META.gregas, msg: "license-gated: construído, não publicado — a preencher" },
    e.temBrasil && { cmd: COMMANDS.mapa as ModuleCommand, msg: "janela de plantio ZARC por município — a preencher" },
    e.temStocks && { cmd: COMMANDS.stocks as ModuleCommand, msg: "aperto da oferta mundial (PSD) — a preencher" },
    e.researchId && { cmd: SLOT_META.research, msg: `${e.researchId} — a preencher` },
  ].filter(Boolean) as { cmd: ModuleCommand; msg: string }[];
  const total = 1 + extras.length;

  return (
    <div className="space-y-6">
      {/* palco (real) */}
      <WorldStage escopo={escopo} />

      {/* dossiê da commodity ativa */}
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-sans font-[590] text-sm uppercase tracking-[0.2em]" style={{ color: "var(--t-tx-1)" }}>
            Dossiê · {e.label}
          </h2>
          <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--t-tx-3)" }}>
            {total} {total === 1 ? "slot coberto" : "slots cobertos"}
          </span>
        </div>

        {/* séries: full-width (é o primário; sozinho quando só há preço) */}
        <ModuleCard command={SLOT_META.series} state="empty" emptyMsg={seriesHint} />

        {/* extras cobertos: grade equilibrada 2 colunas, na ordem de prioridade */}
        {extras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {extras.map(({ cmd, msg }) => (
              <div key={cmd.id} className="min-h-[160px]">
                <ModuleCard command={cmd} state="empty" emptyMsg={msg} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
