/**
 * RevealSection.tsx
 * Wrapper de seção com animação de entrada scroll-triggered.
 * Usa framer-motion useInView para detectar quando entra na viewport.
 *
 * GoldCard: card glass com borda dourada elegante.
 * Cor dourada atualizada: hsl(38,42%,50%) ≈ #C6A85A
 */
import { useRef } from "react";
import { motion, useInView } from "framer-motion";

/* Dourado elegante da marca */
const GOLD = "#C6A85A";

/* ─── Reveal Section ─── */
interface RevealSectionProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}

export function RevealSection({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const directionMap = {
    up:    { y: 40, x: 0 },
    left:  { y: 0,  x: -40 },
    right: { y: 0,  x: 40 },
    none:  { y: 0,  x: 0 },
  };

  const initial = { opacity: 0, ...directionMap[direction] };
  const animate = isInView ? { opacity: 1, y: 0, x: 0 } : initial;

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{ duration: 0.85, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Gold Card ─── */
interface GoldCardProps {
  children: React.ReactNode;
  className?: string;
  glowIntensity?: "low" | "medium" | "high";
  style?: React.CSSProperties;
}

export function GoldCard({
  children,
  className = "",
  glowIntensity = "low",
  style,
}: GoldCardProps) {
  const glowMap = {
    low:    `0 0 20px ${GOLD}0a`,
    medium: `0 0 40px ${GOLD}18`,
    high:   `0 0 60px ${GOLD}28`,
  };

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{
        border: `1px solid ${GOLD}28`,
        backgroundColor: "rgba(10,8,4,0.55)",
        boxShadow: glowMap[glowIntensity],
        ...style,
      }}
      whileHover={{
        borderColor: `${GOLD}55`,
        boxShadow: `0 0 36px ${GOLD}18`,
        y: -2,
        transition: { duration: 0.28 },
      }}
    >
      {/* Linha dourada sutil no topo */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${GOLD}55, transparent)`,
        }}
      />
      {children}
    </motion.div>
  );
}
