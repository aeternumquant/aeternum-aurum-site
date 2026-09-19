import { Outlet } from "react-router-dom";
import DashboardSidebar from "./DashboardSidebar";
import "../terminal/tokens.css"; // tokens Linear (--t-*) para a casca

/**
 * DashboardLayout — a casca de app (Fase 1). Envolve as rotas de APP
 * (/terminal-br, /commodities, /reports) numa fileira [sidebar][conteúdo].
 * As rotas de MARKETING seguem fora daqui (SEO/header público intactos).
 * A sidebar é sticky abaixo do Header global (3.5rem); o conteúdo é a rota atual.
 */
export default function DashboardLayout() {
  return (
    <div className="tbr" style={{ display: "flex", alignItems: "flex-start", minHeight: "100vh", background: "var(--t-s0)" }}>
      <DashboardSidebar />
      <div style={{ flex: "1 1 0%", minWidth: 0 }}>
        <Outlet />
      </div>
    </div>
  );
}
