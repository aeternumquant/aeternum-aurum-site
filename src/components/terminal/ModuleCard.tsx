import { useState, useRef, useEffect, type ReactNode } from "react";
import { MoreVertical, Maximize2, RefreshCw, BookOpen, X, Lock, AlertTriangle, Loader2 } from "lucide-react";
import type { ModuleCommand } from "./commands";

/**
 * <ModuleCard> — o invólucro que TODO módulo usa. Chrome (título + frase + menu ⋮)
 * sempre visível; o corpo muda pelos SEIS estados. Altura POR CONTEÚDO (nunca fixa).
 * Menu ⋮: Expandir · Atualizar (COM A DATA DO DADO) · Ler a fonte · Remover.
 * A ação "Ler a fonte" é a diferenciação — nenhum concorrente tem.
 */
export type ModuleState = "loading" | "ready" | "empty" | "error" | "locked" | "stale";

function fmtDate(d?: string | Date | null): string {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  if (isNaN(dt.getTime())) return typeof d === "string" ? d : "";
  return dt.toLocaleDateString("pt-BR");
}

export function ModuleCard({
  command, state, dataDate, emptyMsg, lockedReason, errorMsg,
  onRefresh, onRemove, onExpand, children,
}: {
  command: ModuleCommand;
  state: ModuleState;
  dataDate?: string | Date | null;
  emptyMsg?: string;
  lockedReason?: string;
  errorMsg?: string;
  onRefresh?: () => void;
  onRemove?: () => void;
  onExpand?: () => void;
  children?: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!menu) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setMenu(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [menu]);

  const dim = state === "loading" || state === "locked";

  return (
    <section className="w-full h-full border border-white/8 bg-card/40 rounded-sm flex flex-col overflow-hidden">
      {/* HEADER — sempre visível (não some em nenhum estado) */}
      <header className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-3 border-b border-white/5">
        <div className={dim ? "opacity-40 transition-opacity" : "transition-opacity"}>
          <h3 className="font-display text-[13px] text-primary uppercase tracking-[0.18em] leading-tight">{command.label}</h3>
          <p className="text-[11px] text-muted-foreground/70 font-light leading-snug mt-1 max-w-md">{command.descricao}</p>
        </div>
        <div className="relative flex-shrink-0" ref={ref}>
          <button onClick={() => setMenu((v) => !v)} aria-label="Ações do módulo"
            className="text-muted-foreground/60 hover:text-primary transition-colors p-1 -mr-1">
            <MoreVertical className="w-4 h-4" />
          </button>
          {menu && (
            <div className="absolute right-0 top-7 z-20 w-60 bg-card border border-white/10 rounded-sm shadow-xl py-1 text-left">
              <MenuItem icon={<Maximize2 className="w-3.5 h-3.5" />} onClick={() => { setMenu(false); onExpand?.(); }}>Expandir</MenuItem>
              <MenuItem icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={() => { setMenu(false); onRefresh?.(); }}
                sub={dataDate ? `dado de ${fmtDate(dataDate)}` : undefined}>Atualizar</MenuItem>
              <a href={command.fonte.link} target="_blank" rel="noreferrer" onClick={() => setMenu(false)}
                className="flex items-start gap-2.5 px-3 py-2 text-[11px] text-foreground hover:bg-primary/10 transition-colors">
                <BookOpen className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <span className="leading-tight">Ler a fonte<span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-0.5">{command.fonte.titulo}</span></span>
              </a>
              <MenuItem icon={<X className="w-3.5 h-3.5" />} onClick={() => { setMenu(false); onRemove?.(); }}>Remover do painel</MenuItem>
            </div>
          )}
        </div>
      </header>

      {/* CORPO — pelos seis estados */}
      <div className="flex-1 min-h-0">
        {state === "loading" && (
          <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-primary/60 animate-spin" /></div>
        )}
        {state === "error" && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <AlertTriangle className="w-5 h-5 text-red-400/80" />
            <p className="text-[11px] text-red-400/80">{errorMsg || "Não foi possível carregar este módulo."}</p>
            {onRefresh && <button onClick={onRefresh} className="text-[10px] uppercase tracking-wider text-primary/70 hover:text-primary mt-1">Tentar de novo</button>}
          </div>
        )}
        {state === "empty" && (
          <div className="flex items-center justify-center py-10 px-6 text-center">
            <p className="text-[11px] text-muted-foreground/70 leading-relaxed">{emptyMsg || "Sem dado para esta combinação."}</p>
          </div>
        )}
        {state === "locked" && (
          <div className="relative">
            <div className="blur-[3px] opacity-30 pointer-events-none select-none">{children}</div>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
              <Lock className="w-4 h-4 text-primary/70" />
              <p className="text-[11px] text-muted-foreground leading-relaxed max-w-xs">{lockedReason || "Este detalhe é do Terminal."}</p>
            </div>
          </div>
        )}
        {(state === "ready" || state === "stale") && (
          // FASE 1.5 (reduzida): rola por DENTRO quando o card recebe altura limitada
          // (a FASE 2 dá altura aos palcos). h-full só resolve com pai limitado; hoje
          // (altura por conteúdo) fica inerte — sem regressão, com durabilidade.
          <div className="relative h-full overflow-y-auto">
            {state === "stale" && (
              <span className="absolute right-3 top-2 z-10 text-[9px] uppercase tracking-wider text-amber-400/70 flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-400/70" /> {fmtDate(dataDate)}
              </span>
            )}
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

function MenuItem({ icon, children, sub, onClick }: { icon: ReactNode; children: ReactNode; sub?: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-start gap-2.5 px-3 py-2 text-[11px] text-foreground hover:bg-primary/10 transition-colors text-left">
      <span className="text-primary flex-shrink-0 mt-0.5">{icon}</span>
      <span className="leading-tight">{children}{sub && <span className="block text-[9px] uppercase tracking-wider text-muted-foreground/60 mt-0.5">{sub}</span>}</span>
    </button>
  );
}
