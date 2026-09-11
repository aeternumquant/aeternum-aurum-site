import { useMemo, useState, type ComponentType } from "react";
import { useSearchParams } from "react-router-dom";
import { COMMANDS, DEFAULT_COMMANDS, isCommand, type CommandSize } from "./commands";
import StocksToUse from "./modules/StocksToUse";
import MapaBrasil from "./modules/MapaBrasil";
import MetricsTable from "./table/MetricsTable";

/**
 * O dashboard. A URL é o estado (?commands=tabela-agro,tabela-macro,mapa,stocks).
 * Particiona por kind: TABELAS empilhadas em cima ("como está o mercado"), MÓDULOS
 * na grade embaixo ("o que acontece em cada coisa"). Renderer por kind — uma tabela
 * nova é config, não código; um módulo novo é uma entrada no mapa abaixo.
 */
type ModuleProps = { escopo?: string; onRemove?: () => void; onExpand?: () => void };
const MODULE_RENDER: Record<string, ComponentType<ModuleProps>> = { mapa: MapaBrasil, stocks: StocksToUse };
const SPAN: Record<CommandSize, string> = { "2x2": "sm:col-span-2", "2x1": "sm:col-span-2", "1x1": "" };
const EYEBROW = "text-[10px] text-muted-foreground/70 tracking-[0.2em] uppercase font-mono";

export default function TerminalGrid() {
  const [params, setParams] = useSearchParams();
  const escopo = params.get("escopo") ?? "soja";
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ids = useMemo(() => {
    const raw = (params.get("commands") ?? DEFAULT_COMMANDS.join(",")).split(",").map((s) => s.trim()).filter(isCommand);
    return raw.length ? raw : DEFAULT_COMMANDS;
  }, [params]);

  const tables = ids.filter((id) => COMMANDS[id].kind === "table");
  const modules = ids.filter((id) => COMMANDS[id].kind === "module");

  const remove = (id: string) => {
    const next = ids.filter((c) => c !== id);
    const p = new URLSearchParams(params);
    p.set("commands", next.join(","));
    setParams(p, { replace: true });
    if (expandedId === id) setExpandedId(null);
  };
  const shownModules = expandedId ? modules.filter((c) => c === expandedId) : modules;

  return (
    <>
      {tables.length > 0 && (
        <>
          <p className={`${EYEBROW} mb-3`}>Mercado · variação e aperto</p>
          <div className="space-y-6 mb-14">
            {tables.map((id) => {
              const cmd = COMMANDS[id];
              if (cmd.kind !== "table") return null;
              return (
                <section key={id}>
                  <div className="flex items-baseline justify-between gap-4 mb-2">
                    <h2 className="font-display text-sm text-primary uppercase tracking-[0.18em]">{cmd.label}</h2>
                    <span className="text-[10px] text-muted-foreground/60 font-light text-right max-w-sm hidden sm:block">{cmd.descricao}</span>
                  </div>
                  <MetricsTable config={cmd.config} />
                </section>
              );
            })}
          </div>
        </>
      )}

      {modules.length > 0 && (
        <>
          <p className={`${EYEBROW} mb-3`}>Módulos</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
            {shownModules.map((id) => {
              const cmd = COMMANDS[id];
              if (cmd.kind !== "module") return null;
              const C = MODULE_RENDER[id];
              if (!C) return null;
              return (
                <div key={id} className={expandedId ? "col-span-full" : SPAN[cmd.size]}>
                  <C escopo={escopo} onRemove={() => remove(id)} onExpand={() => setExpandedId((v) => (v === id ? null : id))} />
                </div>
              );
            })}
          </div>
        </>
      )}

      {ids.length === 0 && <p className="col-span-full text-center text-muted-foreground/60 text-sm py-16">Nenhum comando no painel.</p>}
    </>
  );
}
