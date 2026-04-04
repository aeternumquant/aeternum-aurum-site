import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import { useState } from "react";

export default function AcessoPage() {
  const [submitted, setSubmitted] = useState(false);
  function handleSubmit(e: React.FormEvent) { e.preventDefault(); setSubmitted(true); }

  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Exclusivo</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Partner Access</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-xl mx-auto">O acesso à plataforma Aeternum Aurum é restrito a investidores profissionais qualificados.</p>
          </FadeIn>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-xl mx-auto">
          {submitted ? (
            <FadeIn direction="none">
              <div className="border border-primary/30 p-10 text-center">
                <div className="w-10 h-10 border border-primary/40 flex items-center justify-center mx-auto mb-6"><span className="text-primary font-display text-lg">✓</span></div>
                <h3 className="font-display text-xl text-foreground uppercase tracking-widest mb-3">Solicitação Recebida</h3>
                <p className="text-muted-foreground text-sm font-light leading-relaxed">Nossa equipe irá analisar sua solicitação em até 5 dias úteis.</p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn>
              <form onSubmit={handleSubmit} className="space-y-5">
                {[
                  { id: "nome", label: "Nome completo", type: "text", placeholder: "Seu nome" },
                  { id: "email", label: "E-mail institucional", type: "email", placeholder: "email@instituicao.com" },
                  { id: "empresa", label: "Empresa / Instituição", type: "text", placeholder: "Nome da instituição" },
                  { id: "patrimonio", label: "Patrimônio investível (USD)", type: "text", placeholder: "Ex: US$ 5.000.000" },
                ].map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">{field.label}</label>
                    <input id={field.id} type={field.type} placeholder={field.placeholder} required className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors font-sans" />
                  </div>
                ))}
                <div>
                  <label htmlFor="mensagem" className="block text-[10px] text-muted-foreground tracking-[0.2em] uppercase mb-2 font-sans">Mensagem (opcional)</label>
                  <textarea id="mensagem" rows={4} placeholder="Descreva brevemente seu perfil..." className="w-full bg-card border border-white/8 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/40 transition-colors resize-none font-sans" />
                </div>
                <p className="text-[10px] text-muted-foreground/40 leading-relaxed">Ao enviar, confirmo ser investidor profissional qualificado nos termos da regulamentação vigente.</p>
                <button type="submit" className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 btn-glow relative overflow-hidden"><span className="relative z-10">Enviar Solicitação</span></button>
              </form>
            </FadeIn>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
