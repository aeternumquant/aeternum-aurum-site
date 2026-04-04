import { useEffect, useRef } from "react";

const ROWS = 14;
const COLS = 20;
const GOLD = "rgba(198,167,92,";

function getHeight(r: number, c: number, t: number): number {
  const u = c / COLS;
  const v = r / ROWS;
  const base = Math.sin(u * Math.PI * 1.6 + t * 0.4) * 0.5 + Math.cos(v * Math.PI * 2.2 - t * 0.3) * 0.3;
  const smile = (u - 0.5) * (u - 0.5) * 1.4 + (v - 0.3) * 0.6;
  return (base + smile) * 0.5;
}

export default function VolatilitySurface() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t = 0;

    const draw = () => {
      const W = canvas.offsetWidth;
      const H = canvas.offsetHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, W, H);

      const cellW = W / COLS;
      const cellH = (H * 0.55) / ROWS;
      const depthX = 14;
      const depthY = 10;
      const baseY = H * 0.82;

      const project = (c: number, r: number, h: number) => {
        const iso_x = (c - r * 0.5) * cellW + W * 0.5 - (COLS * cellW) / 2 + r * depthX;
        const iso_y = baseY - r * depthY - h * H * 0.28;
        return { x: iso_x, y: iso_y };
      };

      // Draw horizontal grid lines
      for (let r = ROWS; r >= 0; r--) {
        ctx.beginPath();
        for (let c = 0; c <= COLS; c++) {
          const h = getHeight(r, c, t);
          const p = project(c, r, h);
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const alpha = 0.06 + (r / ROWS) * 0.12;
        ctx.strokeStyle = GOLD + alpha + ")";
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Draw vertical grid lines
      for (let c = 0; c <= COLS; c++) {
        ctx.beginPath();
        for (let r = ROWS; r >= 0; r--) {
          const h = getHeight(r, c, t);
          const p = project(c, r, h);
          if (r === ROWS) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        const alpha = 0.04 + (c / COLS) * 0.08;
        ctx.strokeStyle = GOLD + alpha + ")";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Glowing peak dots
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const h = getHeight(r, c, t);
          if (h > 0.6) {
            const p = project(c + 0.5, r + 0.5, h);
            const intensity = (h - 0.6) / 0.4;
            const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6 + intensity * 10);
            grad.addColorStop(0, GOLD + (0.7 * intensity) + ")");
            grad.addColorStop(1, "transparent");
            ctx.beginPath();
            ctx.arc(p.x, p.y, 6 + intensity * 10, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
          }
        }
      }

      // Axis labels
      ctx.font = "9px Inter, sans-serif";
      ctx.fillStyle = "rgba(198,167,92,0.3)";
      ctx.fillText("STRIKE / MONEYNESS →", W * 0.55, H * 0.94);
      ctx.save();
      ctx.translate(W * 0.08, H * 0.5);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("← VENCIMENTO", 0, 0);
      ctx.restore();
      ctx.fillText("VOL. IMPL. ↑", W * 0.5, H * 0.12);

      t += 0.006;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div className="w-full relative">
      <div className="text-center mb-4">
        <p className="text-[9px] text-muted-foreground/40 tracking-[0.3em] uppercase">Superfície de Volatilidade Implícita</p>
      </div>
      <canvas ref={canvasRef} className="w-full" style={{ height: 280, display: "block" }} />
    </div>
  );
}
