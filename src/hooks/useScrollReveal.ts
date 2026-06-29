import { useEffect, useRef, useState } from "react";

/**
 * Reveal-on-scroll com IntersectionObserver puro (sem biblioteca).
 *
 * - Marca `visible = true` quando ~15% do elemento entra na viewport.
 * - Desconecta apos revelar: anima uma vez so, nao re-anima ao rolar de volta.
 * - Respeita prefers-reduced-motion: ja inicia visivel (sem animacao).
 *
 * Retorna { ref, visible } para o componente aplicar opacity/transform.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);

  return { ref, visible };
}
