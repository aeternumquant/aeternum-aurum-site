import { useEffect, useRef, useState } from "react";

/**
 * Realce "viajante": indica qual de N elementos esta mais proximo do
 * centro vertical da viewport, para acender (ex: o numeral da etapa).
 *
 * - Um unico IntersectionObserver com uma faixa central (rootMargin),
 *   sem handler de scroll continuo.
 * - Entre os elementos que cruzam a faixa, escolhe o mais perto do centro.
 * - So atualiza o estado quando o ativo muda (rerender minimo).
 * - Respeita prefers-reduced-motion: nao ativa (retorna sempre null).
 *
 * Uso: const { active, setRef } = useTravelingHighlight(n);
 *      <span ref={setRef(i)} className={active === i ? "..." : "..."} />
 */
export function useTravelingHighlight(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intersecting = new Set<number>();

    const pickActive = () => {
      if (intersecting.size === 0) {
        setActive((prev) => (prev === null ? prev : null));
        return;
      }
      const center = window.innerHeight / 2;
      let best: number | null = null;
      let bestDist = Infinity;
      intersecting.forEach((i) => {
        const el = refs.current[i];
        if (!el) return;
        const r = el.getBoundingClientRect();
        const dist = Math.abs(r.top + r.height / 2 - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      setActive((prev) => (prev === best ? prev : best));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = refs.current.indexOf(entry.target as HTMLElement);
          if (idx === -1) return;
          if (entry.isIntersecting) intersecting.add(idx);
          else intersecting.delete(idx);
        });
        pickActive();
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    refs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [count]);

  const setRef = (i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  };

  return { active, setRef };
}
