import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import GoiasFlowMap from "@/components/GoiasFlowMap";
import { FadeIn } from "@/components/FadeIn";

const zonas = [
  {
    cidade: "Goiânia",
    tag: "HUB FINANCEIRO",
    desc: "Centro de liquidação e capital.",
    accent: true,
  },
  {
    cidade: "Brasília",
    tag: "CAPITAL FEDERAL",
    desc: "Regulação e governança.",
    accent: true,
  },
  {
    cidade: "Rio Verde",
    tag: "SOJA · MILHO",
    desc: "US$ 4.2B em exportações.",
    accent: false,
  },
  {
    cidade: "Jataí",
    tag: "GRÃOS · PROTEÍNA",
    desc: "Top 10 municípios agro.",
    accent: false,
  },
  {
    cidade: "Catalão",
    tag: "NIÓBIO",
    desc: "CMOC International (Niobras)",
    accent: false,
  },
  {
    cidade: "Campos Verdes",
    tag: "ESMERALDAS",
    desc: "Polo mundial de gemas.",
    accent: false,
  },
];

export default function ZonaPiloto() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll progress for the 400vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section ref={containerRef} className="relative h-[400vh] bg-background">
      {/* Sticky container that stays on screen while scrolling */}
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center border-t border-white/5 bg-card/15">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-primary/3 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-8 lg:gap-12 py-12 h-full lg:h-auto">
          
          {/* Text & Cards (Left side) */}
          <div className="flex-1 w-full flex flex-col justify-center">
            <FadeIn>
              <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">
                Zona Piloto · Operação Brasil
              </p>
              <h2 className="font-display text-4xl sm:text-5xl text-primary mb-4 tracking-widest uppercase">
                Goiás
              </h2>
              <p className="text-muted-foreground text-xs tracking-widest uppercase mb-10 leading-relaxed">
                Multi-bilhões em exportações <br className="hidden sm:block" /> 
                Minerais · Soja · Proteína Animal · Esmeraldas · Nióbio
              </p>
            </FadeIn>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 max-w-lg">
              {zonas.map((z, i) => (
                <motion.div
                  key={i}
                  className={`p-4 border transition-colors ${
                    z.accent ? "border-primary/15 bg-primary/[0.03]" : "border-white/5 bg-background"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <h4 className="font-display text-sm text-foreground tracking-wider uppercase mb-1">{z.cidade}</h4>
                  <p className="text-[9px] text-primary/70 tracking-widest uppercase mb-2">{z.tag}</p>
                  <p className="text-muted-foreground text-[11px] font-light leading-relaxed">{z.desc}</p>
                </motion.div>
              ))}
            </div>
            
            <motion.p 
              className="mt-8 text-primary/40 text-[10px] font-light max-w-lg leading-relaxed tracking-wider"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.8 }}
            >
              ↓ Role para explorar o fluxo econômico da região
            </motion.p>
          </div>

          {/* Map/Video (Right side) */}
          <div className="flex-1 w-full h-[40vh] lg:h-[70vh] min-h-[300px]">
             <div className="w-full h-full border border-white/5 bg-[#08090c] p-2 sm:p-4 rounded-sm shadow-2xl relative">
                <GoiasFlowMap scrollProgress={scrollYProgress} />
             </div>
          </div>

        </div>
      </div>
    </section>
  );
}
