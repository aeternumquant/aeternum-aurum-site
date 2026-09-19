import { useEffect, useState, useCallback } from "react";
import { NavLink } from "react-router-dom";
import { Sprout, LineChart, FileText, PanelLeft } from "lucide-react";

/**
 * DashboardSidebar — a casca de navegação do app (Fase 1 do PR8/9 do dossiê).
 * Spec MEDIDA (dossiê Linear): expandida 224 · trilho 48 · oculta 0; item 30px,
 * raio 8, tipo 13/20 peso 510; ATIVO = fundo 5,5% + barra dourada 2px×12px à
 * ESQUERDA (nunca fundo dourado); dois níveis; ⌘B/Ctrl+B cicla; auto-colapso
 * <1280px; preferência em localStorage; fronteira = elemento próprio de 1px.
 *
 * Critério: LATERAL = destinos (muda a URL). Parâmetros da vista ficam na barra
 * superior (Fase 2). Aqui só rotas que já existem — URLs preservadas.
 */
type SidebarState = "expanded" | "rail" | "hidden";
const WIDTH: Record<SidebarState, number> = { expanded: 224, rail: 48, hidden: 0 };
const CYCLE: SidebarState[] = ["expanded", "rail", "hidden"];
const LS_KEY = "aa.dash.sidebar";
const GOLD = "#c6a75c";

const NAV: { group: string; items: { to: string; label: string; Icon: typeof Sprout }[] }[] = [
  { group: "Mercado", items: [
    { to: "/terminal-br", label: "Terminal BR", Icon: Sprout },
    { to: "/commodities", label: "Commodities", Icon: LineChart },
  ] },
  { group: "Documentos", items: [
    { to: "/reports", label: "Relatórios", Icon: FileText },
  ] },
];

function readInitial(): SidebarState {
  if (typeof window === "undefined") return "expanded";
  const saved = window.localStorage.getItem(LS_KEY) as SidebarState | null;
  if (saved && saved in WIDTH) return saved;
  return window.innerWidth < 1280 ? "rail" : "expanded"; // auto-colapso inicial
}

export default function DashboardSidebar() {
  const [state, setState] = useState<SidebarState>(readInitial);

  const cycle = useCallback(() => {
    setState((s) => {
      const next = CYCLE[(CYCLE.indexOf(s) + 1) % CYCLE.length];
      window.localStorage.setItem(LS_KEY, next);
      return next;
    });
  }, []);

  // ⌘B / Ctrl+B cicla
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") { e.preventDefault(); cycle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cycle]);

  // auto-colapso <1280px: só força trilho quando cruza pra baixo (não briga com o usuário)
  useEffect(() => {
    let below = window.innerWidth < 1280;
    const onResize = () => {
      const nowBelow = window.innerWidth < 1280;
      if (nowBelow && !below) setState((s) => (s === "expanded" ? "rail" : s));
      below = nowBelow;
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const w = WIDTH[state];
  const showLabels = state === "expanded";

  // botão-âncora sempre visível (inclusive com a barra oculta) — nunca vira armadilha
  const Toggle = (
    <button
      onClick={cycle}
      aria-label="Alternar barra lateral (Ctrl+B)"
      title="Alternar barra lateral · Ctrl/⌘+B"
      className="flex items-center justify-center rounded-md transition-colors"
      style={{ width: 30, height: 30, color: "var(--t-tx-2)" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--t-tx-1)")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--t-tx-2)")}
    >
      <PanelLeft size={16} strokeWidth={1.6} />
    </button>
  );

  // barra oculta: só uma aba fina p/ trazer de volta (âncora de recuperação)
  if (state === "hidden") {
    return (
      <div style={{ position: "sticky", top: "3.5rem", height: "calc(100vh - 3.5rem)", flex: "0 0 auto" }}>
        <div className="pt-3 pl-1">{Toggle}</div>
      </div>
    );
  }

  return (
    <aside
      style={{
        position: "sticky", top: "3.5rem", height: "calc(100vh - 3.5rem)",
        width: w, flex: `0 0 ${w}px`, background: "var(--t-s1)",
        display: "flex", flexDirection: "column",
        transition: "width var(--t-d-panel, .28s) var(--t-e-panel, ease), flex-basis .28s ease",
        overflow: "hidden",
      }}
    >
      {/* topo: toggle */}
      <div className={`flex items-center h-12 shrink-0 ${showLabels ? "px-2 justify-between" : "justify-center"}`}>
        {showLabels && <span className="text-[10px] tracking-[0.2em] uppercase pl-1" style={{ color: "var(--t-tx-3)" }}>Painel</span>}
        {Toggle}
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {NAV.map((grp) => (
          <div key={grp.group} className="mb-1.5">
            {showLabels ? (
              <p className="px-3 mt-2 mb-1 text-[9px] tracking-[0.22em] uppercase" style={{ color: "var(--t-tx-3)" }}>{grp.group}</p>
            ) : (
              <div className="mx-auto my-2" style={{ width: 16, height: 1, background: "var(--t-edge)" }} />
            )}
            {grp.items.map(({ to, label, Icon }) => (
              <NavLink key={to} to={to} title={!showLabels ? label : undefined}
                className="group relative flex items-center mx-1.5"
                style={({ isActive }) => ({
                  height: 30, borderRadius: 8, marginBottom: 2,
                  paddingLeft: showLabels ? 12 : 0,
                  justifyContent: showLabels ? "flex-start" : "center",
                  gap: 10,
                  fontSize: 13, lineHeight: "20px", fontWeight: 510,
                  color: isActive ? "var(--t-tx-1)" : "var(--t-tx-2)",
                  background: isActive ? "rgba(255,255,255,0.055)" : "transparent",
                  textDecoration: "none",
                  transition: "background var(--t-d-color,.1s) ease, color var(--t-d-color,.1s) ease",
                })}
              >
                {({ isActive }) => (
                  <>
                    {/* ATIVO: barra dourada 2px×12px à esquerda (nunca fundo dourado) */}
                    {isActive && (
                      <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 2, height: 12, borderRadius: 1, background: GOLD }} />
                    )}
                    <Icon size={16} strokeWidth={1.6} style={{ flexShrink: 0 }} />
                    {showLabels && <span className="truncate">{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* FRONTEIRA: elemento próprio de 1px (não border do painel) */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, right: 0, width: 1, height: "100%", background: "var(--t-edge)" }} />
    </aside>
  );
}
