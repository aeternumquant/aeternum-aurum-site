import { useRef, useState, useId } from "react";
import { motion, MotionValue, useMotionValueEvent, useScroll } from "framer-motion";

/*
 * Global Flow Map
 * Replaces the local Goiás map with a global scale visualization.
 */

// A highly simplified low-poly path of the prominent world continents for a "Tech Grid" look.
const WORLD_PATH = 
  "M 330 180 L 370 170 L 410 130 L 460 135 L 500 110 L 450 70 L 370 70 L 290 100 L 250 80 L 190 70 L 150 110 L 170 160 L 210 200 L 250 240 L 270 290 L 330 180 Z " + // Americas approx
  "M 450 200 L 510 170 L 560 190 L 610 160 L 670 190 L 730 200 L 760 270 L 710 330 L 640 310 L 580 340 L 520 290 L 480 250 Z " + // Eurasisa / Africa approx
  "M 790 350 L 830 310 L 880 330 L 850 380 L 800 390 Z"; // Oceania approx

export interface GlobalFlowMapProps {
  scrollProgress?: MotionValue<number>;
}

// Nós globais estratégicos (Destinos de Exportação / Hedge)
const globalNodes = [
  { id: "BR", label: "BRASIL (Matriz)", cx: 310, cy: 230, primary: true },
  { id: "US", label: "CME GROUP (Chicago)", cx: 210, cy: 140, primary: false },
  { id: "CH", label: "ÁSIA (Demanda)", cx: 720, cy: 230, primary: false },
  { id: "EU", label: "EUROPA (Regulação)", cx: 520, cy: 160, primary: false },
];

export default function GlobalFlowMap({ scrollProgress }: GlobalFlowMapProps) {
  const [progress, setProgress] = useState(0);
  const uid = useId();

  const { scrollYProgress } = useScroll();
  const activeProgress = scrollProgress || scrollYProgress;

  useMotionValueEvent(activeProgress, "change", (latest: number) => {
    if (typeof latest === "number" && !isNaN(latest)) {
      setProgress(latest);
    }
  });

  const pathDrawProgress = Math.min(1, progress * 2.5);

  return (
    <div className="w-full h-full relative bg-[#060709] overflow-hidden flex items-center justify-center">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: `translateY(${progress * 20}px)`
        }}
      />
      
      {/* Glow Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 35% 55%, rgba(198,167,92,${0.05 + progress * 0.1}) 0%, transparent 60%)`,
          transition: "background 0.6s ease-out",
        }}
      />

      {/* SVG Container */}
      <svg
        viewBox="100 50 800 400"
        className="w-full h-full max-w-none"
        style={{ overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id={`glow-${uid}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feFlood floodColor="rgba(198,167,92,0.6)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Abstract World Path */}
        <motion.path
          d={WORLD_PATH}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: pathDrawProgress }}
        />

        {/* Trade / Flow Lines Config */}
        {globalNodes.map((node, i) => {
          if (node.primary) return null;
          const matrixNode = globalNodes.find(n => n.primary);
          if (!matrixNode) return null;

          // Curva Bezier conectando Brasil ao Mundo
          const midX = (matrixNode.cx + node.cx) / 2;
          const midY = Math.min(matrixNode.cy, node.cy) - 100; // Curva por cima
          const pathD = `M ${matrixNode.cx} ${matrixNode.cy} Q ${midX} ${midY} ${node.cx} ${node.cy}`;

          return (
            <g key={`flow-${i}`}>
              <motion.path
                d={pathD}
                fill="none"
                stroke="rgba(198,167,92,0.3)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                style={{ pathLength: Math.max(0, (progress - 0.2) * 2) }}
              />
              {/* Particle Flowing */}
              {progress > 0.3 && (
                <circle r="3" fill="#C6A75C" filter={`url(#glow-${uid})`}>
                  <animateMotion dur={`${2 + i}s`} repeatCount="indefinite" begin={`${i * 0.5}s`}>
                    <mpath href={`#path-${uid}-${i}`} />
                  </animateMotion>
                </circle>
              )}
              {/* Invisibile path for animation reference */}
              <path id={`path-${uid}-${i}`} d={pathD} fill="none" stroke="none" />
            </g>
          );
        })}

        {/* Render Nodes */}
        {globalNodes.map((node, i) => (
          <motion.g 
            key={`node-${i}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: progress > 0.1 ? 1 : 0, scale: progress > 0.1 ? 1 : 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* Ping animation for primary node */}
            {node.primary && (
              <circle cx={node.cx} cy={node.cy} r="15" fill="rgba(198,167,92,0.2)">
                <animate attributeName="r" values="5; 40" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1; 0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle 
              cx={node.cx} cy={node.cy} 
              r={node.primary ? "6" : "4"} 
              fill={node.primary ? "#C6A75C" : "rgba(255,255,255,0.8)"}
              filter={node.primary ? `url(#glow-${uid})` : ""}
            />
            <text
              x={node.cx} y={node.cy + 15}
              fill={node.primary ? "#C6A75C" : "rgba(255,255,255,0.5)"}
              fontSize="10"
              fontFamily="monospace"
              textAnchor="middle"
              letterSpacing="1"
            >
              {node.label}
            </text>
          </motion.g>
        ))}
      </svg>
      
      {/* Overlay Information */}
      <div className="absolute top-6 left-6 z-10 pointers-events-none">
        <h3 className="text-primary text-[10px] tracking-[0.2em] uppercase font-display mb-1 flex items-center gap-2">
          Modelos Assinatura Aeternum
        </h3>
        <p className="text-white/40 font-light text-[8px] tracking-widest uppercase">
          Escoamento logístico & Operações de Trava
        </p>
      </div>
    </div>
  );
}
