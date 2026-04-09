import { useRef, ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

/*
 * Apple-style scroll-driven section wrapper.
 * Content transforms based on scroll progress within the section.
 *
 * - parallax: content moves at a different rate than scroll
 * - fadeOut: opacity reduces as section scrolls out of view
 * - scaleDown: content scales down slightly as it exits
 * - sticky: content stays pinned while container scrolls
 */

interface ScrollSectionProps {
  children: ReactNode;
  className?: string;
  /** How many viewport heights the sticky container should last */
  stickyHeight?: number;
  /** Enable parallax Y offset on children */
  parallax?: boolean;
  /** Enable fade out as section scrolls away */
  fadeOut?: boolean;
  /** Background slot (particles, gradients, etc.) */
  background?: ReactNode;
  id?: string;
}

export function ScrollSection({
  children,
  className = "",
  stickyHeight,
  parallax = false,
  fadeOut = false,
  background,
  id,
}: ScrollSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", parallax ? "25%" : "0%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6, 1], [1, fadeOut ? 0.3 : 1, fadeOut ? 0 : 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, fadeOut ? 0.95 : 1]);

  if (stickyHeight) {
    return (
      <div ref={ref} id={id} style={{ height: `${stickyHeight}vh` }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {background && <div className="absolute inset-0 z-0">{background}</div>}
          <motion.div style={{ y, opacity, scale }} className={`relative z-10 h-full ${className}`}>
            {children}
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div ref={ref} id={id} className="relative">
      {background && <div className="absolute inset-0 z-0">{background}</div>}
      <motion.div style={{ y, opacity, scale }} className={`relative z-10 ${className}`}>
        {children}
      </motion.div>
    </div>
  );
}

/*
 * Hook to get scroll progress within a container.
 * Used by child components to drive their own animations.
 */
export function useScrollProgress(offset: [string, string] = ["start end", "end start"]) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: offset as any,
  });
  return { ref, scrollYProgress };
}
