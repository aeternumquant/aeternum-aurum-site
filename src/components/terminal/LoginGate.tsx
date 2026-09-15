import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";

/**
 * Portão de LOGIN (não de pagamento) — a 2ª camada do terminal: público=palco,
 * logado=dossiê, pago=detalhes premium. Mostrado no lugar do dossiê/grid pra quem
 * não está logado. Pedir login é atrito baixo (gera lead); pedir pagamento pra ver
 * a ESTRUTURA mataria a conversão — a pessoa precisa ver o que existe antes de comprar.
 *
 * `state.from = location` (mesmo padrão do RequireAuth) → o /login volta pra cá,
 * com os search params (a commodity do escopo) preservados.
 */
export default function LoginGate({ titulo, sub }: { titulo: string; sub: string }) {
  const location = useLocation();
  return (
    <div className="rounded-lg bg-[var(--t-s1)] shadow-[var(--t-card)] px-8 py-10 flex flex-col items-center text-center gap-3">
      <Lock className="w-5 h-5" style={{ color: "var(--t-tx-3)" }} />
      <div>
        <p className="font-sans font-[510] text-[15px]" style={{ color: "var(--t-tx-1)" }}>{titulo}</p>
        <p className="font-sans text-[12px] leading-relaxed mt-1.5 max-w-md" style={{ color: "var(--t-tx-2)" }}>{sub}</p>
      </div>
      <div className="flex items-center gap-2.5 mt-2">
        <Link
          to="/login"
          state={{ from: location }}
          className="font-sans text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-md transition-colors"
          style={{ color: "var(--t-gold)", background: "var(--t-gold-btn-bg)", boxShadow: "var(--t-gold-btn-edge)" }}
        >
          Entrar
        </Link>
        <Link
          to="/cadastro"
          state={{ from: location }}
          className="font-sans text-[11px] uppercase tracking-[0.14em] px-4 py-2 rounded-md transition-colors"
          style={{ color: "var(--t-tx-2)" }}
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
