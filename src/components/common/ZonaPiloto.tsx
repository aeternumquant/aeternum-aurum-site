import { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import GlobalFlowMap from "../maps/GlobalFlowMap";
import { FadeIn } from "./FadeIn";

const zonas = [
  {
    cidade: "Strait of Hormuz",
    tag: "ENERGY CHOKEPOINT",
    desc: "20% do fluxo global de petróleo.",
    accent: true,
  },
  {
    cidade: "CME Group (Chicago)",
    tag: "FUTUROS GLOBAL",
    desc: "Epicentro de precificação Agro e Ouro.",
    accent: false,
  },
  {
    cidade: "Shanghai Port",
    tag: "HUB DE DEMANDA",
    desc: "Absorção primária de commodities minerais e grãos.",
    accent: true,
  },
  {
    cidade: "Genebra",
    tag: "PHYSICAL TRADING",
    desc: "Liquidação de contratos institucionais e clearing.",
    accent: false,
  },
  {
    cidade: "Novi Novorossiysk",
    tag: "GEOPOLÍTICA (MAR NEGRO)",
    desc: "Escoamento e gargalos táticos de grãos.",
    accent: false,
  },
  {
    cidade: "Londres (LME)",
    tag: "METAIS BÁSICOS",
    desc: "Formação de preços de ligas e metais industriais.",
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
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col border-t border-white/5 bg-card/15">
        
        {/* Main Map Area - Full Height */}
        <div className="flex-1 w-full relative overflow-hidden">
          <div className="w-full h-full border border-white/5 bg-[#08090c] relative">
            <GlobalFlowMap scrollProgress={scrollYProgress} />
          </div>

          {/* Top-Left Title Overlay */}
          <div className="absolute top-4 left-4 z-20 max-w-xs">
            <FadeIn>
              <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-2">
                Rede de Liquidez · Infraestrutura
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-primary tracking-widest uppercase">
                Fluxo Macro
              </h2>
            </FadeIn>
          </div>
        </div>

        {/* Bottom Cards - Horizontal Scrollable */}
        <div className="relative h-32 sm:h-40 bg-gradient-to-t from-background via-background/80 to-transparent border-t border-white/5 overflow-x-auto overflow-y-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/2 via-transparent to-transparent pointer-events-none" />
          
          {/* Scrollable container with padding */}
          <div className="flex gap-3 sm:gap-4 h-full p-3 sm:p-4 overflow-x-auto overflow-y-hidden scrollbar-hide">
            {/* Title card for section */}
            <div className="flex-shrink-0 w-48 sm:w-56 h-24 sm:h-32 flex flex-col justify-center">
              <FadeIn>
                <p className="text-[9px] text-primary/70 tracking-widest uppercase mb-1">
                  Principais Centros
                </p>
                <p className="text-muted-foreground text-[10px] font-light leading-relaxed">
                  Trilhões em transações · Gargalos Geopolíticos · Petróleo · Minérios
                </p>
              </FadeIn>
            </div>

            {/* Info Cards */}
            {zonas.map((z, i) => (
              <motion.div
                key={i}
                className={`flex-shrink-0 w-64 sm:w-72 h-24 sm:h-32 p-3 sm:p-4 border transition-colors rounded-sm ${
                  z.accent ? "border-primary/15 bg-primary/[0.03]" : "border-white/5 bg-background"
                }`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i + 1) * 0.1, duration: 0.5 }}
              >
                <h4 className="font-display text-sm text-foreground tracking-wider uppercase mb-1">
                  {z.cidade}
                </h4>
                <p className="text-[8px] text-primary/70 tracking-widest uppercase mb-2">
                  {z.tag}
                </p>
                <p className="text-muted-foreground text-[10px] font-light leading-relaxed">
                  {z.desc}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-primary/40 text-xs"
            >
              →
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
