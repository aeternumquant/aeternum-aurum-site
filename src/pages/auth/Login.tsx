import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { NavLink } from "react-router-dom";
import { useState } from "react";
import { WireframeCube } from "../../components/common/WireframeCube";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setLoading(true); setTimeout(() => setLoading(false), 1500); }

  return (
    <main className="pt-14 min-h-screen flex flex-col">
      <section className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <FadeIn direction="none" className="relative z-10 w-full max-w-sm">
          <div className="flex flex-col items-center mb-10">
            <WireframeCube className="w-10 h-10 mb-6 opacity-60" animate={false} />
            <h1 className="font-display text-2xl text-foreground uppercase tracking-[0.25em] mb-1">Acesso Restrito</h1>
            <p className="text-[10px] text-muted-foreground tracking-widest uppercase">Aeternum Aurum Partners</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">E-mail</label>
              <input id="email" type="email" placeholder="seu@email.com" required className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans" />
            </div>
            <div>
              <label htmlFor="password" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">Senha</label>
              <input id="password" type="password" placeholder="••••••••" required className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans" />
            </div>
            <div className="flex justify-end">
              <button type="button" className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground tracking-wider font-sans transition-colors">Esqueci minha senha</button>
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2 btn-glow relative overflow-hidden">
              <span className="relative z-10">{loading ? "Autenticando..." : "Entrar"}</span>
            </button>
          </form>
          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-[10px] text-muted-foreground/50 tracking-wider">Ainda não tem acesso?{" "}<NavLink to="/acesso" className="text-primary/70 hover:text-primary transition-colors underline-offset-4 hover:underline">Solicitar acesso</NavLink></p>
          </div>
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}
