import WorldStage from "./modules/WorldStage";
import GregasSlot from "./modules/GregasSlot";
import SeriesSlot from "./modules/SeriesSlot";
import StocksToUse from "./modules/StocksToUse";
import MapaBrasil from "./modules/MapaBrasil";
import { ModuleCard } from "./ModuleCard";
import LoginGate from "./LoginGate";
import { COMMANDS, type ModuleCommand } from "./commands";
import { resolveEscopo } from "./commodityRegistry";
import { useAuth } from "../../context/AuthContext";

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
};

export default function Dossie({ escopo }: { escopo?: string }) {
  const e = resolveEscopo(escopo);

  // séries é SEMPRE presente (garante que nenhuma commodity fica vazia; carrega o
  // "existe aqui" pra quem tem só preço). Os demais entram por cobertura declarada.
  const extras = [
    e.temOpcoes && { cmd: SLOT_META.gregas, msg: "license-gated: construído, não publicado — a preencher" },
    e.temBrasil && { cmd: COMMANDS.mapa as ModuleCommand, msg: "janela de plantio ZARC por município — a preencher" },
    e.temStocks && { cmd: COMMANDS.stocks as ModuleCommand, msg: "aperto da oferta mundial (PSD) — a preencher" },
  ].filter(Boolean) as { cmd: ModuleCommand; msg: string }[];
  // research não é 5º card: é o link discreto no rodapé do slot de séries (composição "existe aqui").
  const total = 1 + extras.length;
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="space-y-6">
      {/* palco (real) — PÚBLICO (a isca de conversão) */}
      <WorldStage escopo={escopo} />

      {/* dossiê — LOGADO (2ª camada). loading não pisca o gate antes da sessão resolver. */}
      {loading ? (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-center py-8" style={{ color: "var(--t-tx-3)" }}>Verificando acesso…</p>
      ) : !isAuthenticated ? (
        <LoginGate titulo="Entre para ver o dossiê" sub={`O palco acima é livre. Séries, ZARC, cobertura de estoque e mais sobre ${e.label} são de quem entra — sem custo para começar.`} />
      ) : (
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
        <SeriesSlot cmd={SLOT_META.series} entry={e} />

        {/* extras cobertos: grade equilibrada 2 colunas, na ordem de prioridade */}
        {extras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {extras.map(({ cmd, msg }) => (
              <div key={cmd.id}>
                {cmd.id === "gregas" ? (
                  <GregasSlot cmd={cmd} />
                ) : cmd.id === "stocks" ? (
                  <StocksToUse escopo={escopo} dossie />
                ) : cmd.id === "mapa" ? (
                  <MapaBrasil escopo={escopo} dossie />
                ) : (
                  <ModuleCard command={cmd} state="empty" emptyMsg={msg} />
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      )}
    </div>
  );
}
