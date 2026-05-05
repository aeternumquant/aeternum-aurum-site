/**
 * ParallaxCards.tsx
 * Cards com borda dourada, rotação 3D suave e glow surgindo
 * da esquerda/direita durante o scroll — efeito cinematográfico.
 * Usa Framer Motion useScroll + useTransform.
 */
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Card {
  label: string;
  title: string;
  desc: string;
  route: string;
  side: "left" | "right";
}

const CARDS: Card[] = [
  {
    label: "Framework",
    title: "Inteligência Institucional",
    desc: "Modelos com o mesmo rigor de mesas proprietárias em Nova York e Chicago.",
    route: "/framework",
    side: "left",
  },
  {
    label: "Tecnologia",
    title: "Modelos Quantitativos",
    desc: "Machine learning, análise de opções e estrutura de mercado — Sharpe 0.94+.",
    route: "/tecnologia",
    side: "right",
  },
  {
    label: "Execução",
    title: "Padrão ISO 20022",
    desc: "Infraestrutura compatível com o novo padrão global de mensageria financeira.",
    route: "/execucao",
    side: "left",
  },
  {
    label: "Alocações",
    title: "Proteção Assimétrica",
    desc: "Estratégias que protegem capital produtivo de choques macro e de commodity.",
    route: "/alocacoes",
    side: "right",
  },
];

/** Card individual com parallax lateral e perspectiva 3D */
function ParallaxCard({ card, index }: { card: Card; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Slide lateral: esquerda ou direita dependendo do lado
  const xRaw = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    card.side === "left" ? [-80, 0, 0, -20] : [80, 0, 0, 20]
  );
  const x = useSpring(xRaw, { stiffness: 80, damping: 24 });

  // Opacidade fade in/out
  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);

  // Rotação 3D suave no eixo Y
  const rotateY = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    card.side === "left" ? [-8, 0, 0, 4] : [8, 0, 0, -4]
  );

  // Escala leve
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.92, 1, 1, 0.95]);

  return (
    <div ref={ref} className="relative h-[280px] sm:h-[240px] flex items-center">
      <motion.div
        style={{ x, opacity, rotateY, scale, perspective: 1000 }}
        className={`w-full max-w-sm ${card.side === "right" ? "ml-auto" : ""}`}
      >
        {/* Card */}
        <motion.div
          className="relative border border-[#C6A85A]/20 bg-black/50 backdrop-blur-sm rounded-sm overflow-hidden p-6 cursor-pointer group"
          whileHover={{
            borderColor: "rgba(198,168,90,0.5)",
            boxShadow: "0 0 40px rgba(198,168,90,0.18), inset 0 0 20px rgba(198,168,90,0.03)",
            y: -4,
            transition: { duration: 0.3 },
          }}
          onClick={() => navigate(card.route)}
        >
          {/* Linha dourada no topo */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C6A85A]/60 to-transparent" />

          {/* Glow de canto */}
          <div
            className={`absolute top-0 ${card.side === "left" ? "left-0" : "right-0"} w-24 h-24 rounded-full blur-3xl bg-[#C6A85A]/6 pointer-events-none`}
          />

          {/* Label tag */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-px bg-[#C6A85A]/60" />
            <span className="font-sans text-[9px] uppercase tracking-[0.3em] text-[#C6A85A]/70">
              {card.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-display text-xl sm:text-2xl text-[#C6A85A] uppercase tracking-wide mb-3 leading-tight">
            {card.title}
          </h3>

          {/* Desc */}
          <p className="font-sans text-sm text-white/50 leading-relaxed mb-5">{card.desc}</p>

          {/* CTA */}
          <div className="flex items-center gap-2 text-[#C6A85A]/60 group-hover:text-[#C6A85A] transition-colors">
            <span className="font-sans text-[10px] uppercase tracking-[0.25em]">
              Explorar
            </span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>

          {/* Linha decorativa lateral */}
          <div
            className={`absolute top-8 bottom-8 ${card.side === "left" ? "-left-px" : "-right-px"} w-px bg-gradient-to-b from-transparent via-[#C6A85A]/40 to-transparent`}
          />
        </motion.div>
      </motion.div>

      {/* Número do card, flutuante */}
      <motion.div
        style={{ opacity }}
        className={`absolute top-1/2 -translate-y-1/2 ${
          card.side === "left" ? "right-4" : "left-4"
        } font-display text-6xl text-[#C6A85A]/5 select-none pointer-events-none leading-none`}
      >
        0{index + 1}
      </motion.div>
    </div>
  );
}

/** Componente exportado — seção completa de Parallax Cards */
export default function ParallaxCards() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-2 sm:space-y-0">
      {CARDS.map((card, i) => (
        <ParallaxCard key={card.route} card={card} index={i} />
      ))}
    </div>
  );
}
