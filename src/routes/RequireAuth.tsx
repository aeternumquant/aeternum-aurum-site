import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Rota-layout de protecao (react-router v7). Le a sessao e devolve <Outlet/>
 * (segue pra rota filha) ou redireciona pro /login guardando de onde veio, para
 * o login mandar de volta (state.from).
 *
 * NAO e a defesa: a RLS ja filtra no servidor. Isto so evita renderizar UI
 * privada pra quem nao esta logado.
 */
export default function RequireAuth() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-primary font-mono text-[10px] tracking-[0.2em] uppercase">
        <span className="animate-pulse">Verificando acesso…</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
