import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { WireframeCube } from "../../components/common/WireframeCube";
import { useAuth } from "../../context/AuthContext";
import { RouteSeo } from "../../lib/seo/RouteSeo";

const inputCls =
  "w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans";

export default function CadastroPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("A senha precisa de ao menos 8 caracteres.");
    if (password !== confirm) return setError("As senhas nao coincidem.");
    setLoading(true);
    try {
      const res = await signUp(email, password);
      if (!res.success) setError(res.message || "Nao foi possivel criar a conta.");
      else if (res.needsConfirmation) setSent(true);
      else navigate("/reports", { replace: true });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-14 min-h-screen flex flex-col">
      <RouteSeo title="Criar conta" description="Crie sua conta na plataforma Aeternum Aurum." path="/cadastro" />
      <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <FadeIn direction="none" className="relative z-10 w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <WireframeCube className="w-10 h-10 mb-6 opacity-60" animate={false} />
            <h1 className="font-display text-2xl text-foreground uppercase tracking-[0.25em] mb-1">Criar Conta</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Aeternum Aurum</p>
          </div>

          {sent ? (
            <div className="border border-primary/40 bg-primary/5 p-8 text-center rounded-sm">
              <h3 className="font-display text-lg text-primary uppercase tracking-widest mb-3">Confira seu e-mail</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Enviamos um link de confirmacao para <span className="text-primary/80">{email}</span>. Clique nele
                para ativar a conta e entrar.
              </p>
              <NavLink to="/login" className="inline-block mt-6 text-[10px] text-primary/70 hover:text-primary tracking-wider uppercase underline-offset-4 hover:underline">
                Voltar ao login
              </NavLink>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-500/80 text-[11px] tracking-wide text-center bg-red-500/10 border border-red-500/20 py-2 rounded-sm">{error}</div>}
                <div>
                  <label htmlFor="email" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">E-mail</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className={inputCls} />
                </div>
                <div>
                  <label htmlFor="password" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">Senha</label>
                  <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="minimo 8 caracteres" required className={inputCls} />
                </div>
                <div>
                  <label htmlFor="confirm" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">Confirmar senha</label>
                  <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" required className={inputCls} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-glow relative overflow-hidden">
                  <span className="relative z-10">{loading ? "Criando..." : "Criar conta"}</span>
                </button>
              </form>
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-muted-foreground/50 tracking-wider">
                  Ja tem conta?{" "}
                  <NavLink to="/login" className="text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline">Entrar</NavLink>
                </p>
              </div>
            </>
          )}
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}
