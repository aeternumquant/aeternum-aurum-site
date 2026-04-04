import { FadeIn } from "@/components/FadeIn";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const allocations = [
  { label: "Commodities & Real Assets", pct: 35, note: "Agro, energia, metais preciosos e índices globais" },
  { label: "Global Macro", pct: 25, note: "Câmbio, macro ciclos e soberanos globais" },
  { label: "Volatilidade & Derivativos", pct: 20, note: "Proteção e geração de alfa" },
  { label: "ISO 20022 Assets", pct: 12, note: "Ativos tokenizados e protocolos digitais" },
  { label: "Equities Long/Short", pct: 8, note: "Mercados desenvolvidos e emergentes" },
];

function AnimatedBar({ pct, delay }: { pct: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <div ref={ref} className="flex-1 h-[2px] bg-white/5 relative overflow-hidden">
      <motion.div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary/70 to-primary/30"
        initial={{ width: 0 }}
        animate={isInView ? { width: `${pct}%` } : {}}
        transition={{ duration: 1.2, delay, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* Shimmer on the bar */}
      <motion.div
        className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        initial={{ x: "-100%" }}
        animate={isInView ? { x: `${pct * 4}%` } : {}}
        transition={{ duration: 1.8, delay: delay + 0.5, ease: "easeOut" }}
      />
    </div>
  );
}

export default function Allocation() {
  return (
    <section id="alocacao" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-background">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-3xl sm:text-4xl text-primary text-center mb-4 tracking-widest uppercase">
            Alocação Estratégica
          </h2>
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase mb-16">
            Portfólio Referência · Sujeito a ajustes táticos
          </p>
        </FadeIn>

        <div className="space-y-6">
          {allocations.map((a, i) => (
            <FadeIn key={i} delay={i * 0.12}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 group">
                <div className="sm:w-56 shrink-0">
                  <span className="font-display text-sm text-foreground tracking-wide group-hover:text-primary/90 transition-colors">{a.label}</span>
                  <p className="text-[10px] text-muted-foreground/60 tracking-wider mt-0.5">{a.note}</p>
                </div>
                <div className="flex-1 flex items-center gap-4">
                  <AnimatedBar pct={a.pct} delay={i * 0.12} />
                  <span className="font-display text-2xl text-primary tabular-nums w-14 text-right">
                    {a.pct}%
                  </span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.7}>
          <p className="mt-12 text-[10px] text-muted-foreground/40 tracking-wider text-center leading-relaxed max-w-xl mx-auto">
            Alocações ilustrativas para fins de referência. Carteiras individuais são estruturadas conforme perfil, horizonte e objetivos de cada investidor.
          </p>
        </FadeIn>
      </div>
    </section>
  );
}
