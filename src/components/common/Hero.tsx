import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { WireframeCube } from "./WireframeCube";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax preservado: conteúdo desliza e desbota enquanto o usuário rola,
  // criando transição suave para a próxima seção (ManifestoSection).
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      id="hero"
      ref={ref}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden bg-[#0a0a0a] pt-14"
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay (atenua a textura no centro vertical, onde fica o wordmark) */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-black/55 to-black/70" />

      {/* Conteúdo da capa: cubo, wordmark, subtitle, shimmer divider */}
      <motion.div
        style={{ y, opacity }}
        className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full"
      >
        {/* WireframeCube, assinatura visual da marca */}
        <motion.div
          className="mb-10 pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <WireframeCube className="w-[120px] h-[130px] sm:w-[140px] sm:h-[154px] md:w-[160px] md:h-[176px]" />
        </motion.div>

        {/* Wordmark linha 1: AETERNUM AURUM (branco) */}
        <div className="overflow-hidden mb-0">
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] text-foreground font-light leading-none"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Aeternum Aurum
          </motion.h1>
        </div>

        {/* Wordmark linha 2: PARTNERS (dourado) */}
        <div className="overflow-hidden mb-6">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] font-light leading-none"
              style={{ color: "rgba(198, 168, 90, 0.90)" }}
            >
              Partners
            </span>
          </motion.div>
        </div>

        {/* Subtitle: eyebrow institucional em caixa-alta */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="font-sans text-[10px] sm:text-xs tracking-[0.3em] text-muted-foreground uppercase mb-0"
        >
          Inteligência quantitativa para quem move a economia real.
        </motion.p>

        {/* Shimmer divider, fecha visualmente a capa antes do scroll indicator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-24 sm:w-32 h-[1px] shimmer-line my-8"
        />
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        style={{ opacity }}
      >
        <p className="text-[9px] tracking-widest uppercase text-white/30">Scroll</p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="text-[#C6A85A]/50"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
