import { useEffect, useRef, useState } from "react";

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

function parseNumber(val: string): { prefix: string; num: number; suffix: string } {
  const match = val.match(/^([^0-9]*)([0-9]+\.?[0-9]*)(.*)$/);
  if (!match) return { prefix: "", num: 0, suffix: val };
  return { prefix: match[1], num: parseFloat(match[2]), suffix: match[3] };
}

export default function AnimatedCounter({ value, className }: AnimatedCounterProps) {
  const { prefix, num, suffix } = parseNumber(value);
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 2000;
          const startTime = performance.now();

          const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Quintic ease-out for smoother deceleration
            const ease = 1 - Math.pow(1 - progress, 5);
            setDisplay(ease * num);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [num]);

  const formatted =
    Number.isInteger(num) ? Math.round(display).toString() : display.toFixed(2);

  return (
    <div ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </div>
  );
}
