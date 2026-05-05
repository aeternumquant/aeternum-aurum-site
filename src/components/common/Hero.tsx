import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { WireframeCube } from "./WireframeCube";
import { ArrowRight, Zap } from "lucide-react";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax transforms
  const titleY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  const stats = [
    { number: "+30", label: "Indicadores Quantitativos" },
    { number: "4", label: "Mercados Cobertos" },
    { number: "24/7", label: "Monitoramento em Tempo Real" },
    { number: "23+", label: "Anos de Track Record" },
  ];

  return (
    <section
      ref={ref}
      className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden bg-black pt-14"
    >
      {/* Premium background */}
      <div
        className="absolute inset-0 z-0 opacity-60"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 z-1 bg-gradient-to-b from-black/30 via-transparent to-black/60" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-5xl mx-auto">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-primary/30 rounded-full bg-primary/5">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-display uppercase tracking-widest text-primary">
              Plataforma Institucional
            </span>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.div style={{ y: titleY, opacity: contentOpacity }}>
          <div className="overflow-hidden mb-4">
            <motion.h1
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-[0.15em] text-foreground font-light leading-tight"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              Inteligência Quantitativa
            </motion.h1>
          </div>
          <div className="overflow-hidden">
            <motion.h2
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl uppercase tracking-[0.15em] text-primary font-light leading-tight mb-6"
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              Institucional
            </motion.h2>
          </div>
        </motion.div>

        {/* Subheadline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="mb-8"
          style={{ opacity: contentOpacity }}
        >
          <p className="font-sans text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-3xl mb-6">
            Dados que movem o Agro. Inteligência quantitativa institucional, feita para quem produz e protege capital no Brasil.
          </p>

          <div className="w-16 h-px bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />

          <p className="font-sans text-sm sm:text-base text-muted-foreground/90 leading-relaxed max-w-3xl">
            <span className="text-primary font-semibold">Todo ângulo. Uma única plataforma.</span>
            <br />
            Todos os nossos modelos são quantitativos. Sem opiniões. Sem narrativa. Apenas dados puros, matemática e machine learning aplicados à estrutura de mercado. O mesmo rigor usado por mesas institucionais, agora acessível ao produtor, empresário e investidor brasileiro.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 my-12 w-full"
          style={{ opacity: contentOpacity }}
        >
          {stats.map((stat, i) => (
            <div
              key={i}
              className="border border-primary/20 bg-primary/5 p-4 sm:p-6 rounded-sm hover:border-primary/40 transition-colors"
            >
              <div className="font-display text-2xl sm:text-3xl text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
          style={{ opacity: contentOpacity }}
        >
          <button
            onClick={() => navigate("/acesso")}
            className="px-8 py-4 bg-primary text-background font-display uppercase tracking-widest text-sm font-bold rounded-sm hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 flex items-center justify-center gap-2 group"
          >
            Solicitar Acesso
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/framework")}
            className="px-8 py-4 border border-primary/40 text-primary font-display uppercase tracking-widest text-sm font-bold rounded-sm hover:bg-primary/10 transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Conheça a Plataforma
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate("/commodities")}
            className="px-8 py-4 border border-white/15 text-muted-foreground font-display uppercase tracking-widest text-sm font-bold rounded-sm hover:border-white/30 hover:text-foreground transition-all duration-300 flex items-center justify-center gap-2 group"
          >
            Ver Indicadores
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.0, duration: 1 }}
        style={{ opacity: contentOpacity }}
      >
        <p className="text-[10px] tracking-widest text-muted-foreground/60 uppercase">
          Explore
        </p>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary/40"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
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
