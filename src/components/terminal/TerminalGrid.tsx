import { useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { COMMANDS, DEFAULT_COMMANDS, isCommand, type CommandSize } from "./commands";
import StocksToUse from "./modules/StocksToUse";
import MapaBrasil from "./modules/MapaBrasil";

/**
 * A GRADE. A URL é o estado do painel (?commands=mapa,stocks&escopo=soja): link
 * compartilhável, preset sem banco, adicionar/remover trivial. Grade fixa nesta
 * versão (drag só quando houver assinante pedindo). Colunas responsivas 2→3→4;
 * o span de cada card vem do tamanho do comando; altura por conteúdo (items-start).
 */
type ModuleProps = { escopo?: string; onRemove?: () => void; onExpand?: () => void };
const RENDER: Record<string, ComponentType<ModuleProps>> = { mapa: MapaBrasil, stocks: StocksToUse };
const SPAN: Record<CommandSize, string> = { "2x2": "sm:col-span-2", "2x1": "sm:col-span-2", "1x1": "" };

export default function TerminalGrid() {
  const [params, setParams] = useSearchParams();
  const escopo = params.get("escopo") ?? "soja";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const commands = useMemo(() => {
    const raw = (params.get("commands") ?? DEFAULT_COMMANDS.join(",")).split(",").map((s) => s.trim()).filter(isCommand);
    return raw.length ? raw : DEFAULT_COMMANDS;
  }, [params]);

  const remove = (id: string) => {
    const next = commands.filter((c) => c !== id);
    const p = new URLSearchParams(params);
    p.set("commands", next.join(","));
    setParams(p, { replace: true });
    if (expandedId === id) setExpandedId(null);
  };

  const shown = expandedId ? commands.filter((c) => c === expandedId) : commands;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
      {shown.map((id) => {
        const C = RENDER[id];
        if (!C) return null;
        return (
          <div key={id} className={expandedId ? "col-span-full" : SPAN[COMMANDS[id].size]}>
            <C escopo={escopo} onRemove={() => remove(id)} onExpand={() => setExpandedId((v) => (v === id ? null : id))} />
          </div>
        );
      })}
      {commands.length === 0 && (
        <p className="col-span-full text-center text-muted-foreground/60 text-sm py-16">
          Nenhum módulo no painel. Adicionar módulos entra numa próxima versão.
        </p>
      )}
    </div>
  );
}
