import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WireframeCube } from "@/components/WireframeCube";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const subtitleY = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const cubeScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.7]);
  const cubeOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden bg-black"
    >
      {/* AI-generated premium background */}
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
        {/* Wireframe cube with scale/fade on scroll */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          style={{ scale: cubeScale, opacity: cubeOpacity }}
        >
          <WireframeCube className="w-24 h-28 sm:w-32 sm:h-36 mb-12" />
        </motion.div>

        {/* Title with parallax Y */}
        <motion.div style={{ y: titleY, opacity: contentOpacity }}>
          <div className="overflow-hidden">
            <motion.h1
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] text-foreground font-light"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Aeternum Aurum
            </motion.h1>
          </div>
          <div className="overflow-hidden mb-6">
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 1.0, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] text-primary/90 font-light">
                Partners
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Subtitle with slower parallax */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="flex flex-col items-center"
          style={{ y: subtitleY, opacity: contentOpacity }}
        >
          <p className="font-sans text-[10px] sm:text-xs tracking-[0.3em] text-muted-foreground uppercase">
            Plataforma Privada de Inteligência de Capital
          </p>

          <div className="w-24 sm:w-32 h-[1px] shimmer-line my-8" />

          <p className="font-sans text-[9px] sm:text-[10px] tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
            <span>Global Macro</span>
            <span className="text-primary/40">|</span>
            <span>Event-Driven</span>
            <span className="text-primary/40">|</span>
            <span>Quantitative Risk</span>
          </p>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 1 }}
        style={{ opacity: contentOpacity }}
      >
        <motion.div
          className="w-[1px] h-12 bg-gradient-to-b from-primary/50 to-transparent"
          animate={{ scaleY: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}
