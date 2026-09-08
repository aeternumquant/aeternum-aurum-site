import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { WireframeCube } from "../../components/common/WireframeCube";
import { useAuth } from "../../context/AuthContext";
import { RouteSeo } from "../../lib/seo/RouteSeo";

const inputCls =
  "w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans";

export default function RecuperarSenhaPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { resetPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await resetPassword(email);
      // Nao revela se o e-mail existe (anti-enumeracao): sucesso mesmo assim.
      if (!res.success) setError(res.message || "Nao foi possivel enviar o link.");
      else setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-14 min-h-screen flex flex-col">
      <RouteSeo title="Recuperar senha" description="Recupere o acesso a sua conta Aeternum Aurum." path="/recuperar" />
      <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <FadeIn direction="none" className="relative z-10 w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <WireframeCube className="w-10 h-10 mb-6 opacity-60" animate={false} />
            <h1 className="font-display text-2xl text-foreground uppercase tracking-[0.25em] mb-1">Recuperar Senha</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Aeternum Aurum</p>
          </div>

          {sent ? (
            <div className="border border-primary/40 bg-primary/5 p-8 text-center rounded-sm">
              <h3 className="font-display text-lg text-primary uppercase tracking-widest mb-3">Link enviado</h3>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                Se houver conta para <span className="text-primary/80">{email}</span>, enviamos um link para
                redefinir a senha. Verifique tambem o spam.
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
                  <label htmlFor="email" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">E-mail da conta</label>
                  <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className={inputCls} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-glow relative overflow-hidden">
                  <span className="relative z-10">{loading ? "Enviando..." : "Enviar link"}</span>
                </button>
              </form>
              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-muted-foreground/50 tracking-wider">
                  Lembrou?{" "}
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
