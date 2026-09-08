import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import { WireframeCube } from "../../components/common/WireframeCube";
import { useAuth } from "../../context/AuthContext";
import { RouteSeo } from "../../lib/seo/RouteSeo";

const inputCls =
  "w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans";

/**
 * Tela de retorno dos links por e-mail (detectSessionInUrl consome o code na
 * inicializacao do client). Dois modos:
 *  - ?tipo=recovery  -> formulario de nova senha (updatePassword)
 *  - (confirmacao)   -> "conta confirmada", segue pro /reports
 */
export default function ConfirmarPage() {
  const [params] = useSearchParams();
  const recovery = params.get("tipo") === "recovery";
  const urlError = params.get("error_description") || params.get("error");

  const navigate = useNavigate();
  const { updatePassword, isAuthenticated, loading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("A senha precisa de ao menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas nao coincidem.");
    setBusy(true);
    try {
      const res = await updatePassword(password);
      if (!res.success) setError(res.message || "Nao foi possivel redefinir a senha.");
      else navigate("/reports", { replace: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="pt-14 min-h-screen flex flex-col">
      <RouteSeo title="Confirmacao" description="Confirmacao de conta Aeternum Aurum." path="/confirmar" />
      <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <FadeIn direction="none" className="relative z-10 w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <WireframeCube className="w-10 h-10 mb-6 opacity-60" animate={false} />
            <h1 className="font-display text-2xl text-foreground uppercase tracking-[0.25em] mb-1">
              {recovery ? "Nova Senha" : "Confirmacao"}
            </h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Aeternum Aurum</p>
          </div>

          {urlError ? (
            <div className="border border-red-500/30 bg-red-500/5 p-8 text-center rounded-sm">
              <p className="text-red-500 text-xs uppercase tracking-wider mb-2">Link invalido ou expirado</p>
              <p className="text-[12px] text-muted-foreground">{urlError}</p>
              <NavLink to="/login" className="inline-block mt-6 text-[10px] text-primary/70 hover:text-primary tracking-wider uppercase underline-offset-4 hover:underline">Voltar ao login</NavLink>
            </div>
          ) : recovery ? (
            <form onSubmit={handleReset} className="space-y-4">
              {error && <div className="text-red-500/80 text-[11px] tracking-wide text-center bg-red-500/10 border border-red-500/20 py-2 rounded-sm">{error}</div>}
              <div>
                <label htmlFor="password" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">Nova senha</label>
                <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="minimo 8 caracteres" required className={inputCls} />
              </div>
              <div>
                <label htmlFor="confirm" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">Confirmar</label>
                <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className={inputCls} />
              </div>
              <button type="submit" disabled={busy} className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-glow relative overflow-hidden">
                <span className="relative z-10">{busy ? "Salvando..." : "Redefinir senha"}</span>
              </button>
            </form>
          ) : (
            <div className="border border-primary/40 bg-primary/5 p-8 text-center rounded-sm">
              <h3 className="font-display text-lg text-primary uppercase tracking-widest mb-3">
                {loading ? "Confirmando…" : isAuthenticated ? "Conta confirmada" : "Confirmacao recebida"}
              </h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                {loading
                  ? "Validando seu link…"
                  : isAuthenticated
                    ? "Sua conta esta ativa e voce ja esta logado."
                    : "Sua conta foi confirmada. Faca login para entrar."}
              </p>
              <NavLink
                to={isAuthenticated ? "/reports" : "/login"}
                className="inline-block mt-6 text-[10px] text-primary/70 hover:text-primary tracking-wider uppercase underline-offset-4 hover:underline"
              >
                {isAuthenticated ? "Ir para os relatorios" : "Ir para o login"}
              </NavLink>
            </div>
          )}
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}
