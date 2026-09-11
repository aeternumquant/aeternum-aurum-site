import { useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { COMMANDS, DEFAULT_LAYOUT, isCommand, commandWidth, type CommandMeta } from "./commands";
import StocksToUse from "./modules/StocksToUse";
import MapaBrasil from "./modules/MapaBrasil";
import MapaMundial from "./modules/MapaMundial";
import WorldStage from "./modules/WorldStage";
import MetricsTable from "./table/MetricsTable";

/**
 * O dashboard. A URL é o estado: ?commands=tabela-agro,mapa;tabela-macro,cflow;stocks
 *   ';' separa LINHAS · ',' põe comandos LADO A LADO na mesma linha.
 * A adjacência é ESTADO (URL), não catálogo (registry) — emparelhar é editar a
 * string, zero toque no registry. Cada linha é flex-wrap: itens proporcionais à
 * largura intrínseca (commandWidth); quando não cabem, quebram e empilham (sem
 * breakpoint mágico). Remover um do par deixa o outro sozinho (grupo mole, sem
 * ponteiro órfão). Expandir foca um comando em largura cheia.
 */
type ModuleProps = { escopo?: string; expanded?: boolean; onRemove?: () => void; onExpand?: () => void };
const MODULE_RENDER: Record<string, ComponentType<ModuleProps>> = { mapa: MapaBrasil, stocks: StocksToUse, cflow: MapaMundial, palco: WorldStage };

export default function TerminalGrid() {
  const [params, setParams] = useSearchParams();
  const escopo = params.get("escopo") ?? "soja";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const rows = useMemo<string[][]>(() => {
    const raw = params.get("commands") ?? DEFAULT_LAYOUT;
    return raw.split(";").map((r) => r.split(",").map((s) => s.trim()).filter(isCommand)).filter((r) => r.length);
  }, [params]);

  const remove = (id: string) => {
    const next = rows.map((r) => r.filter((c) => c !== id)).filter((r) => r.length);
    const p = new URLSearchParams(params);
    p.set("commands", next.map((r) => r.join(",")).join(";"));
    setParams(p, { replace: true });
    if (expandedId === id) setExpandedId(null);
  };
  const toggleExpand = (id: string) => setExpandedId((v) => (v === id ? null : id));

  const renderCmd = (id: string, expanded: boolean) => {
    const cmd = COMMANDS[id];
    if (cmd.kind === "table") return <TableBlock cmd={cmd} onRemove={() => remove(id)} onExpand={() => toggleExpand(id)} />;
    const C = MODULE_RENDER[id];
    return C ? <C escopo={escopo} expanded={expanded} onRemove={() => remove(id)} onExpand={() => toggleExpand(id)} /> : null;
  };

  // expandido: um comando só, largura cheia
  if (expandedId && isCommand(expandedId)) {
    return <div className="w-full">{renderCmd(expandedId, true)}</div>;
  }

  return (
    <div className="space-y-6">
      {rows.map((row, ri) => (
        <div key={ri} className="flex flex-wrap gap-4 items-start">
          {row.map((id) => (
            <div key={id} style={{ flexGrow: commandWidth(COMMANDS[id]), flexBasis: 0, minWidth: 0 }}>
              {renderCmd(id, false)}
            </div>
          ))}
        </div>
      ))}
      {rows.length === 0 && <p className="text-center text-muted-foreground/60 text-sm py-16">Nenhum comando no painel.</p>}
    </div>
  );
}

/** bloco de uma tabela dentro de uma linha: rótulo + fonte + a MetricsTable. */
function TableBlock({ cmd, onRemove, onExpand }: { cmd: Extract<CommandMeta, { kind: "table" }>; onRemove: () => void; onExpand: () => void }) {
  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-2">
        <h2 className="font-display text-sm text-primary uppercase tracking-[0.18em]">{cmd.label}</h2>
        <span className="text-[10px] text-muted-foreground/55 font-light text-right max-w-[22rem] hidden md:block">{cmd.descricao}</span>
      </div>
      <MetricsTable config={cmd.config} />
    </section>
  );
}
