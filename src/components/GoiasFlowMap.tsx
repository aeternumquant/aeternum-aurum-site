import { useRef, useState, useEffect, useMemo, useId } from "react";
import { motion, MotionValue, useMotionValueEvent, useTransform, AnimatePresence, useScroll } from "framer-motion";

/*
 * Premium interactive map visualization for the Goiás pilot zone.
 * Uses real SVG geography with fluid scroll-driven animations.
 * Scroll progress controls region highlights and data flow lines.
 */

/* ── Real Goiás SVG path (MapSVG source) ── */
const GOIAS_PATH = `m 416.97257,334.13114 -0.87,-1.01 0.21,-2.44 0.59,-1.19 -0.06,-2.21 -1.83,-1.98 -11.95,-0.01 -0.38,3.73 -0.92,1.83 0.52,3.26 14.69,0.02 0,0 0,0 0,0 -0.53,1.52 0.31,1.57 -0.68,1.59 -1.04,1.25 -0.41,1.47 0.85,1.21 0.85,0.34 1.42,1.03 1.65,4.56 0,0.6 -2.32,2.71 -3.24,3.01 -0.43,2.14 1.09,1.11 0.9,-0.47 1.58,0.57 0.47,0.61 0.18,1 -0.17,0.71 -0.73,0.9 -0.51,1.89 1.19,3.46 -3.09,2.06 -1.16,0.2 -0.86,0.9 -0.48,1.12 -4.89,2.74 -0.7,-0.77 -4.35,-1.86 -0.55,0.48 -0.58,0.09 -1.75,0.01 -1.48,-0.28 -3.86,0.16 -2.01,-0.89 -4.13,2.64 -2.91,2.92 -0.33,0 -1.31,-1.42 -1.52,-0.3 -3.19,1.64 -3.71,-0.62 -2.48,0.96 -2.23,0.54 -1.41,2.1 -1.21,2.46 0.06,1 -0.84,1.3 -0.82,0.28 -0.84,-0.16 -0.45,0.14 -0.94,0.74 -1.64,2.1 -0.57,1.9 0.56,0.61 -0.01,0.34 -0.36,0.23 -0.86,-0.46 0,0 -0.24,-0.45 -2.66,-2.24 -3.15,-0.61 -1.62,-1.55 -1.9,-0.43 -1.49,-0.04 -3.35,-1.34 -0.68,-0.85 -3.07,-1.56 -0.67,-0.61 -1.44,-0.71 -1.14,-0.17 -2.7,-1.68 -2.78,0.16 -3.8,-0.7 -0.13,-0.33 0.26,-0.84 0.57,-1.17 1.31,-1.76 -0.08,-0.42 -2.25,-0.9 -1.14,0.67 -0.66,-0.19 -0.28,-0.41 -0.23,-1.11 0.26,-2.58 -0.19,-1.77 0,0 -0.95,-2.2 -0.18,-3.43 -1.41,-2.19 -0.16,-0.71 0.4,-3.41 2.55,-3.85 0.38,-2.91 0.7,-0.77 2.02,-0.84 1.92,-1.77 1.25,-2.02 0.33,-1.95 0.5,-1.01 1.28,-1.04 0.82,-1.43 0.08,-1.54 1.75,-0.97 1.4,-2.62 2.65,-0.13 2.72,-0.86 0.32,-0.28 1.98,-4.19 0.71,-0.96 0.64,-4.1 0.38,-0.74 1.92,-1.94 1.65,-1.01 1.07,-0.26 1.23,0.68 1.21,-0.73 1.39,-1.43 0.84,-2.93 1.17,-2.87 -0.01,-0.8 -0.48,-1.14 0.58,-2.74 1.6,-3.09 -0.12,-5.18 1.21,-0.78 1.03,-2.63 2,-3.17 0.39,-1.07 -0.16,-2.72 0.35,-0.9 0.97,-0.86 0.27,-1.13 -0.08,-0.63 0,0 0.34,-0.45 0.2,-1.88 0.66,-1.23 1.81,-2.09 0.56,-0.3 -0.03,1.71 -1.22,1.88 -0.52,2.34 2.4,0.4 2.2,1.03 3.93,0.4 3.09,1.71 4.07,1.43 0.63,-0.23 1.63,-5.94 1.47,-2.39 1.18,-0.97 1.15,1.31 1.04,1.88 1.11,3.71 0.61,3.1 1.14,0.05 0.75,-0.75 0.3,-1 0.56,-0.54 2.76,0.34 4.53,-0.53 0.22,0.74 -0.56,1.56 3.13,1.47 3.35,0.68 0.69,-0.08 0.51,-3.3 0.55,0.03 1.51,2.62 0.46,0.24 1.78,-0.9 2.52,-2.08 4.53,-1 1.55,0 2.56,-1.1 1.74,-1.34 5.36,-1.42 0,0 2.72,2.46 0.02,0.38 -1.43,1.06 -0.48,2.52 0.1,0.33 1.63,0.84 -0.06,0.94 -0.23,0.38 -1.59,1.03 -1.19,3.83 -0.05,1.55 0.62,3.52 1.7,3.46 3.21,2.62 0.05,0.47 -0.72,1.42 -0.1,0.67 0.67,1.72 0.23,1.28 -0.25,0.77 -1.48,1.97 0,0 -1,1.01 -3.23,-0.34 -0.9,-1.76 -2.42,-1.48 -1.17,1.49 0.58,3.77 -0.57,0.54 -0.4,0.13 -2.78,-1.14 -1.17,0.23 -0.37,0.28 -0.72,3.18 0.72,0.1 0.49,1.16 -0.57,0.94 -0.73,0.7 0.04,1.9 0.42,0.61 0.53,0.19 0.69,4.26 -0.53,0.53 -3.36,0.9 -2.29,1.51 z`;

/* Cities with coordinates fitting the viewBox */
const cities = [
  { id: "goiania",      name: "Goiânia",       x: 395, y: 335, tag: "HUB FINANCEIRO",      value: "R$ 12B PIB",   lx: 3, ly: -2, anchor: "start" as const },
  { id: "brasilia",     name: "Brasília",       x: 412, y: 312, tag: "CAPITAL FEDERAL",      value: "Governança",   lx: 3, ly: -2, anchor: "start" as const },
  { id: "rioverde",     name: "Rio Verde",      x: 365, y: 355, tag: "SOJA · MILHO",         value: "US$ 4.2B exp", lx: 3, ly: -2, anchor: "start" as const },
  { id: "jatai",        name: "Jataí",          x: 350, y: 360, tag: "GRÃOS · PROTEÍNA",     value: "Top 10 Agro",  lx: -3, ly: -2, anchor: "end" as const },
  { id: "catalao",      name: "Catalão",        x: 405, y: 360, tag: "NIÓBIO · MINERAÇÃO",   value: "CMOC/Niobras", lx: 3, ly: -2, anchor: "start" as const },
  { id: "camposverdes", name: "Campos Verdes",  x: 375, y: 290, tag: "ESMERALDAS",           value: "Polo mundial", lx: 3, ly: -2, anchor: "start" as const },
];

const routes = [
  { from: "rioverde",     to: "goiania",      label: "Soja → Hub" },
  { from: "jatai",        to: "rioverde",     label: "Grãos → Exportação" },
  { from: "catalao",      to: "goiania",      label: "Nióbio → Processamento" },
  { from: "camposverdes", to: "goiania",      label: "Gemas → Capital" },
  { from: "goiania",      to: "brasilia",     label: "Fluxo → Regulação" },
];

function getCity(id: string) {
  return cities.find((c) => c.id === id)!;
}

interface GoiasFlowMapProps {
  scrollProgress?: MotionValue<number>;
}

/* ─── Animated flow line between two cities ─── */
function AnimatedRoute({ from, to, index, progress }: {
  from: string;
  to: string;
  index: number;
  progress: number;
}) {
  const f = getCity(from);
  const t = getCity(to);

  // Curve the path slightly for visual interest
  const midX = (f.x + t.x) / 2 + (index % 2 === 0 ? 4 : -4);
  const midY = (f.y + t.y) / 2 + (index % 2 === 0 ? -3 : 3);

  const pathD = `M ${f.x} ${f.y} Q ${midX} ${midY} ${t.x} ${t.y}`;
  const pathId = `route-${from}-${to}`;

  // Each route appears at a different scroll stage
  const stageStart = index * 0.12;
  const lineProgress = Math.max(0, Math.min(1, (progress - stageStart) / 0.25));

  return (
    <g style={{ opacity: lineProgress > 0 ? 1 : 0 }}>
      <defs>
        <path id={pathId} d={pathD} fill="none" />
        <linearGradient id={`grad-${pathId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(198,167,92,0.6)" />
          <stop offset="100%" stopColor="rgba(198,167,92,0.1)" />
        </linearGradient>
      </defs>

      {/* Background dashed line */}
      <path
        d={pathD}
        fill="none"
        stroke="rgba(198,167,92,0.05)"
        strokeWidth={0.4}
        strokeDasharray="1 2"
      />

      {/* Animated solid line */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={`url(#grad-${pathId})`}
        strokeWidth={0.35}
        strokeLinecap="round"
        style={{
          pathLength: lineProgress,
          opacity: lineProgress,
        }}
      />

      {/* Flowing particles on this route */}
      {lineProgress > 0.3 && (
        <>
          <circle r={0.45} fill="rgba(198,167,92,0.8)">
            <animateMotion dur={`${2.5 + index * 0.3}s`} repeatCount="indefinite" begin={`${index * 0.4}s`}>
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
          <circle r={0.25} fill="rgba(198,167,92,0.4)">
            <animateMotion dur={`${2.5 + index * 0.3}s`} repeatCount="indefinite" begin={`${index * 0.4 + 0.6}s`}>
              <mpath href={`#${pathId}`} />
            </animateMotion>
          </circle>
        </>
      )}
    </g>
  );
}

export default function GoiasFlowMap({ scrollProgress }: GoiasFlowMapProps) {
  const [progress, setProgress] = useState(0);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const uid = useId();

  // Listen to scroll progress
  const { scrollYProgress } = useScroll();
  const activeProgress = scrollProgress || scrollYProgress;

  useMotionValueEvent(activeProgress, "change", (latest: number) => {
    if (typeof latest === "number" && !isNaN(latest)) {
      setProgress(latest);
    }
  });

  // Derive which cities are visible based on scroll
  const visibleCities = useMemo(() => {
    const count = Math.floor(progress * cities.length * 1.8) + 1;
    return cities.slice(0, Math.min(count, cities.length));
  }, [progress]);

  // Map outline opacity driven by scroll
  const outlineOpacity = Math.min(1, progress * 4);
  const fillOpacity = Math.min(0.08, progress * 0.2);

  return (
    <div className="w-full h-full relative bg-[#060709] overflow-hidden flex items-center justify-center">
      {/* Ambient background effects */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at ${50 + progress * 20}% ${40 + progress * 15}%, rgba(198,167,92,${0.03 + progress * 0.04}) 0%, transparent 60%)`,
          transition: "background 0.6s ease-out",
        }}
      />

      {/* SVG Map */}
      <svg
        viewBox="338 278 86 108"
        className="w-full h-full max-w-none"
        style={{ overflow: "visible" }}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* City glow filter */}
          <filter id={`glow-${uid}`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feFlood floodColor="rgba(198,167,92,0.4)" result="color" />
            <feComposite in="color" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Subtle grid pattern */}
          <pattern id={`flowgrid-${uid}`} width="3" height="3" patternUnits="userSpaceOnUse">
            <path d="M 3 0 L 0 0 0 3" fill="none" stroke="rgba(198,167,92,0.02)" strokeWidth="0.1" />
          </pattern>

          {/* Radial fill gradient driven by scroll */}
          <radialGradient id={`stateGrad-${uid}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={`rgba(198,167,92,${fillOpacity * 2})`} />
            <stop offset="70%" stopColor={`rgba(198,167,92,${fillOpacity * 0.5})`} />
            <stop offset="100%" stopColor={`rgba(198,167,92,${fillOpacity * 0.1})`} />
          </radialGradient>
        </defs>

        {/* State outline with draw-in animation */}
        <motion.path
          d={GOIAS_PATH}
          fill={`url(#stateGrad-${uid})`}
          stroke={`rgba(198,167,92,${0.1 + outlineOpacity * 0.2})`}
          strokeWidth={0.4}
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: outlineOpacity, opacity: outlineOpacity }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Grid overlay */}
        <motion.path
          d={GOIAS_PATH}
          fill={`url(#flowgrid-${uid})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: outlineOpacity * 0.7 }}
          transition={{ duration: 0.5 }}
        />

        {/* Inner border glow */}
        <motion.path
          d={GOIAS_PATH}
          fill="none"
          stroke={`rgba(198,167,92,${0.02 + progress * 0.03})`}
          strokeWidth={1.5}
          strokeLinejoin="round"
          initial={{ opacity: 0 }}
          animate={{ opacity: outlineOpacity * 0.5 }}
        />

        {/* Animated routes */}
        {routes.map((route, i) => (
          <AnimatedRoute
            key={i}
            from={route.from}
            to={route.to}
            index={i}
            progress={progress}
          />
        ))}

        {/* City markers — appear progressively */}
        {visibleCities.map((city, i) => {
          const isActive = activeCity === city.id;
          const appear = Math.min(1, (progress - i * 0.08) * 5);

          return (
            <g
              key={city.id}
              style={{ cursor: "pointer", opacity: Math.max(0, appear) }}
              onMouseEnter={() => setActiveCity(city.id)}
              onMouseLeave={() => setActiveCity(null)}
            >
              {/* Pulse ring */}
              {(isActive || i === 0) && (
                <motion.circle
                  cx={city.x}
                  cy={city.y}
                  fill="none"
                  stroke="rgba(198,167,92,0.25)"
                  strokeWidth={0.3}
                  initial={{ r: 1, opacity: 0.5 }}
                  animate={{ r: 5, opacity: 0 }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                />
              )}

              {/* Outer halo */}
              <circle
                cx={city.x}
                cy={city.y}
                r={2}
                fill={`rgba(198,167,92,${isActive ? 0.08 : 0.03})`}
                style={{ transition: "fill 0.3s ease" }}
              />

              {/* Ring */}
              <circle
                cx={city.x}
                cy={city.y}
                r={1.2}
                fill="none"
                stroke={`rgba(198,167,92,${isActive ? 0.7 : 0.3})`}
                strokeWidth={0.25}
                style={{ transition: "stroke 0.3s ease" }}
              />

              {/* Center dot */}
              <circle
                cx={city.x}
                cy={city.y}
                r={isActive ? 0.8 : 0.55}
                fill={`rgba(198,167,92,${isActive ? 0.95 : 0.5})`}
                filter={isActive ? `url(#glow-${uid})` : undefined}
                style={{ transition: "all 0.3s ease" }}
              />

              {/* City name label */}
              <text
                x={city.x + city.lx}
                y={city.y + city.ly}
                textAnchor={city.anchor}
                fontSize="2"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.35"
                fill={`rgba(198,167,92,${isActive ? 0.9 : 0.35})`}
                style={{ transition: "fill 0.3s ease" }}
              >
                {city.name.toUpperCase()}
              </text>

              {/* Tag label (appears on hover) */}
              {isActive && (
                <text
                  x={city.x + city.lx}
                  y={city.y + city.ly + 3}
                  textAnchor={city.anchor}
                  fontSize="1.3"
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.3"
                  fill="rgba(198,167,92,0.45)"
                >
                  {city.tag}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* HUD overlays */}
      <div className="absolute top-3 left-3 pointer-events-none">
        <p className="text-[8px] text-primary/20 tracking-[0.2em] uppercase font-mono">
          AETERNUM AURUM · ZONA PILOTO
        </p>
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none text-right">
        <p className="text-[8px] text-primary/20 tracking-[0.15em] uppercase font-mono">
          GOIÁS · BRASIL
        </p>
      </div>

      {/* Progress indicator */}
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <div className="w-12 h-[1px] bg-white/5 relative overflow-hidden">
          <motion.div
            className="h-full bg-primary/40"
            style={{ width: `${progress * 100}%`, transition: "width 0.3s ease-out" }}
          />
        </div>
      </div>

      {/* Active city info card */}
      <AnimatePresence>
        {activeCity && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm border border-primary/15 px-4 py-2 pointer-events-none"
          >
            <p className="text-[9px] text-primary/60 tracking-widest uppercase font-mono">
              {getCity(activeCity).tag}
            </p>
            <p className="font-display text-sm text-primary tracking-wider">
              {getCity(activeCity).name}
            </p>
            <p className="text-[9px] text-muted-foreground/50 tracking-wider">
              {getCity(activeCity).value}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
