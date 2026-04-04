import { NavLink } from "react-router-dom";
import { FadeIn } from "@/components/FadeIn";
import { motion } from "framer-motion";

export default function CTA() {
  return (
    <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-background relative overflow-hidden">
      {/* Top gradient line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px shimmer-line" />
      
      {/* Background spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(198,167,92,0.04)_0%,transparent_60%)] pointer-events-none" />

      <FadeIn direction="none">
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="font-display text-3xl sm:text-4xl text-foreground tracking-widest uppercase mb-6">
            Acesso Restrito
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-10 font-light max-w-md mx-auto">
            A plataforma Aeternum Aurum é exclusiva para investidores profissionais qualificados. Solicitações são avaliadas individualmente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavLink
              to="/acesso"
              className="px-8 py-3 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase font-sans hover:bg-primary hover:text-background transition-all duration-300 btn-glow relative overflow-hidden"
            >
              <span className="relative z-10">Solicitar Acesso</span>
            </NavLink>
            <NavLink
              to="/reports"
              className="px-8 py-3 border border-white/10 text-muted-foreground text-[10px] tracking-[0.25em] uppercase font-sans hover:border-white/25 hover:text-foreground transition-all duration-300"
            >
              Ver Reports
            </NavLink>
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
