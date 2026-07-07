import { type ReactNode } from "react";
import { useScrollReveal } from "../../hooks/useScrollReveal";

/**
 * Reveal de entrada no scroll (opacity + translateY apenas).
 * Usa useScrollReveal (IntersectionObserver puro) + easing --ease-respira.
 * `delay` em segundos (mantem a mesma assinatura do antigo FadeIn).
 * `direction` aceito por compatibilidade, mas o movimento e sempre subida sobria.
 *
 * Compartilhado entre a Solucoes e a Pesquisa (Sistema A).
 */
export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: "opacity 700ms var(--ease-respira), transform 700ms var(--ease-respira)",
        transitionDelay: `${delay * 1000}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
