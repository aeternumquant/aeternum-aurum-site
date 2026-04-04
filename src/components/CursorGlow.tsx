import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const trail = trailRef.current;
    if (!glow || !trail) return;

    let raf: number;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x, cy = y;
    let tx = x, ty = y;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    const animate = () => {
      // Main glow - smooth follow
      cx += (x - cx) * 0.045;
      cy += (y - cy) * 0.045;
      glow.style.transform = `translate(${cx - 500}px, ${cy - 500}px)`;

      // Trail - slightly delayed
      tx += (x - tx) * 0.02;
      ty += (y - ty) * 0.02;
      trail.style.transform = `translate(${tx - 350}px, ${ty - 350}px)`;

      raf = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      {/* Primary glow */}
      <div
        ref={glowRef}
        className="pointer-events-none fixed top-0 left-0 z-0"
        style={{
          width: 1000,
          height: 1000,
          background:
            "radial-gradient(circle at center, rgba(198,167,92,0.06) 0%, rgba(198,167,92,0.025) 25%, rgba(198,167,92,0.008) 50%, transparent 70%)",
          filter: "blur(20px)",
          willChange: "transform",
        }}
      />
      {/* Trailing glow - more diffuse, slower */}
      <div
        ref={trailRef}
        className="pointer-events-none fixed top-0 left-0 z-0"
        style={{
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle at center, rgba(198,167,92,0.03) 0%, rgba(198,167,92,0.01) 40%, transparent 65%)",
          filter: "blur(40px)",
          willChange: "transform",
        }}
      />
    </>
  );
}
