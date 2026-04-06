import { motion, AnimatePresence } from "framer-motion";
import { useState, useId } from "react";

/* ──────────────────────────────────────────────────────────────────
 * Geographically accurate Goiás outline (MapSVG / Wikimedia source).
 * The path is relative (m/l) and fits a ~80×100 viewBox after offset.
 * ────────────────────────────────────────────────────────────────── */
const GOIAS_PATH = `m 416.97257,334.13114 -0.87,-1.01 0.21,-2.44 0.59,-1.19 -0.06,-2.21 -1.83,-1.98 -11.95,-0.01 -0.38,3.73 -0.92,1.83 0.52,3.26 14.69,0.02 0,0 0,0 0,0 -0.53,1.52 0.31,1.57 -0.68,1.59 -1.04,1.25 -0.41,1.47 0.85,1.21 0.85,0.34 1.42,1.03 1.65,4.56 0,0.6 -2.32,2.71 -3.24,3.01 -0.43,2.14 1.09,1.11 0.9,-0.47 1.58,0.57 0.47,0.61 0.18,1 -0.17,0.71 -0.73,0.9 -0.51,1.89 1.19,3.46 -3.09,2.06 -1.16,0.2 -0.86,0.9 -0.48,1.12 -4.89,2.74 -0.7,-0.77 -4.35,-1.86 -0.55,0.48 -0.58,0.09 -1.75,0.01 -1.48,-0.28 -3.86,0.16 -2.01,-0.89 -4.13,2.64 -2.91,2.92 -0.33,0 -1.31,-1.42 -1.52,-0.3 -3.19,1.64 -3.71,-0.62 -2.48,0.96 -2.23,0.54 -1.41,2.1 -1.21,2.46 0.06,1 -0.84,1.3 -0.82,0.28 -0.84,-0.16 -0.45,0.14 -0.94,0.74 -1.64,2.1 -0.57,1.9 0.56,0.61 -0.01,0.34 -0.36,0.23 -0.86,-0.46 0,0 -0.24,-0.45 -2.66,-2.24 -3.15,-0.61 -1.62,-1.55 -1.9,-0.43 -1.49,-0.04 -3.35,-1.34 -0.68,-0.85 -3.07,-1.56 -0.67,-0.61 -1.44,-0.71 -1.14,-0.17 -2.7,-1.68 -2.78,0.16 -3.8,-0.7 -0.13,-0.33 0.26,-0.84 0.57,-1.17 1.31,-1.76 -0.08,-0.42 -2.25,-0.9 -1.14,0.67 -0.66,-0.19 -0.28,-0.41 -0.23,-1.11 0.26,-2.58 -0.19,-1.77 0,0 -0.95,-2.2 -0.18,-3.43 -1.41,-2.19 -0.16,-0.71 0.4,-3.41 2.55,-3.85 0.38,-2.91 0.7,-0.77 2.02,-0.84 1.92,-1.77 1.25,-2.02 0.33,-1.95 0.5,-1.01 1.28,-1.04 0.82,-1.43 0.08,-1.54 1.75,-0.97 1.4,-2.62 2.65,-0.13 2.72,-0.86 0.32,-0.28 1.98,-4.19 0.71,-0.96 0.64,-4.1 0.38,-0.74 1.92,-1.94 1.65,-1.01 1.07,-0.26 1.23,0.68 1.21,-0.73 1.39,-1.43 0.84,-2.93 1.17,-2.87 -0.01,-0.8 -0.48,-1.14 0.58,-2.74 1.6,-3.09 -0.12,-5.18 1.21,-0.78 1.03,-2.63 2,-3.17 0.39,-1.07 -0.16,-2.72 0.35,-0.9 0.97,-0.86 0.27,-1.13 -0.08,-0.63 0,0 0.34,-0.45 0.2,-1.88 0.66,-1.23 1.81,-2.09 0.56,-0.3 -0.03,1.71 -1.22,1.88 -0.52,2.34 2.4,0.4 2.2,1.03 3.93,0.4 3.09,1.71 4.07,1.43 0.63,-0.23 1.63,-5.94 1.47,-2.39 1.18,-0.97 1.15,1.31 1.04,1.88 1.11,3.71 0.61,3.1 1.14,0.05 0.75,-0.75 0.3,-1 0.56,-0.54 2.76,0.34 4.53,-0.53 0.22,0.74 -0.56,1.56 3.13,1.47 3.35,0.68 0.69,-0.08 0.51,-3.3 0.55,0.03 1.51,2.62 0.46,0.24 1.78,-0.9 2.52,-2.08 4.53,-1 1.55,0 2.56,-1.1 1.74,-1.34 5.36,-1.42 0,0 2.72,2.46 0.02,0.38 -1.43,1.06 -0.48,2.52 0.1,0.33 1.63,0.84 -0.06,0.94 -0.23,0.38 -1.59,1.03 -1.19,3.83 -0.05,1.55 0.62,3.52 1.7,3.46 3.21,2.62 0.05,0.47 -0.72,1.42 -0.1,0.67 0.67,1.72 0.23,1.28 -0.25,0.77 -1.48,1.97 0,0 -1,1.01 -3.23,-0.34 -0.9,-1.76 -2.42,-1.48 -1.17,1.49 0.58,3.77 -0.57,0.54 -0.4,0.13 -2.78,-1.14 -1.17,0.23 -0.37,0.28 -0.72,3.18 0.72,0.1 0.49,1.16 -0.57,0.94 -0.73,0.7 0.04,1.9 0.42,0.61 0.53,0.19 0.69,4.26 -0.53,0.53 -3.36,0.9 -2.29,1.51 z`;

/* Cities positioned relative to the viewBox — based on real geographic reference */
const cities = [
  { id: "goiania",      name: "Goiânia",       x: 395, y: 335, desc: "Centro financeiro e hub de liquidação",    lx: 3.5, ly: -2.5, anchor: "start" as const },
  { id: "brasilia",     name: "Brasília (DF)",  x: 412, y: 312, desc: "Capital federal · Regulação e governança", lx: 3.5, ly: -2.5, anchor: "start" as const },
  { id: "rioverde",     name: "Rio Verde",      x: 365, y: 355, desc: "Maior polo exportador de soja e milho",   lx: 3,   ly: -2.5, anchor: "start" as const },
  { id: "jatai",        name: "Jataí",          x: 350, y: 360, desc: "Zona estratégica de grãos e proteína",    lx: -3,  ly: -2,   anchor: "end" as const },
  { id: "catalao",      name: "Catalão",        x: 405, y: 360, desc: "Mineração e processamento industrial",    lx: 3.5, ly: -2.5, anchor: "start" as const },
  { id: "camposverdes", name: "Campos Verdes",  x: 375, y: 290, desc: "Polo mundial de esmeraldas",              lx: 3.5, ly: -2,   anchor: "start" as const },
];

const connections = [
  { from: "goiania",  to: "rioverde" },
  { from: "goiania",  to: "catalao" },
  { from: "goiania",  to: "brasilia" },
  { from: "rioverde", to: "jatai" },
  { from: "catalao",  to: "rioverde" },
  { from: "camposverdes", to: "goiania" },
];

function getCity(id: string) {
  return cities.find((c) => c.id === id)!;
}

/* ─── Animated pulse ring around each city ─── */
function PulseDot({ city, active }: { city: (typeof cities)[0]; active: boolean }) {
  return (
    <g>
      {/* Outer expanding ring */}
      {active && (
        <motion.circle
          cx={city.x}
          cy={city.y}
          fill="none"
          stroke="rgba(198,167,92,0.35)"
          strokeWidth={0.4}
          initial={{ r: 1.5, opacity: 0.7 }}
          animate={{ r: 5, opacity: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      {/* Glow */}
      <circle
        cx={city.x}
        cy={city.y}
        r={2.5}
        fill="rgba(198,167,92,0.08)"
        filter={active ? "url(#cityGlow)" : undefined}
      />
      {/* Static ring */}
      <motion.circle
        cx={city.x}
        cy={city.y}
        r={1.4}
        fill="none"
        stroke="rgba(198,167,92,0.4)"
        strokeWidth={0.3}
        animate={{ stroke: active ? "rgba(198,167,92,0.8)" : "rgba(198,167,92,0.3)" }}
        transition={{ duration: 0.4 }}
      />
      {/* Center dot */}
      <motion.circle
        cx={city.x}
        cy={city.y}
        r={0.7}
        animate={{
          fill: active ? "rgba(198,167,92,0.95)" : "rgba(198,167,92,0.35)",
          r: active ? 0.9 : 0.7,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </g>
  );
}

/* ─── Animated particle flowing along a connection ─── */
function FlowParticle({ from, to, delay, dur }: { from: string; to: string; delay: number; dur: number }) {
  const f = getCity(from);
  const t = getCity(to);
  const pathId = `flow-${from}-${to}`;

  return (
    <>
      <defs>
        <path
          id={pathId}
          d={`M ${f.x} ${f.y} C ${(f.x + t.x) / 2 + (Math.random() - 0.5) * 6} ${(f.y + t.y) / 2 + (Math.random() - 0.5) * 6}, ${(f.x + t.x) / 2 + (Math.random() - 0.5) * 6} ${(f.y + t.y) / 2 + (Math.random() - 0.5) * 6}, ${t.x} ${t.y}`}
          fill="none"
        />
      </defs>
      {/* Dashed connection line */}
      <path
        d={`M ${f.x} ${f.y} L ${t.x} ${t.y}`}
        stroke="rgba(198,167,92,0.07)"
        strokeWidth={0.3}
        strokeDasharray="1.5 2"
        fill="none"
      />
      {/* Moving particle */}
      <circle r={0.5} fill="rgba(198,167,92,0.7)">
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay}s`}>
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
      {/* Trailing glow particle */}
      <circle r={0.3} fill="rgba(198,167,92,0.3)">
        <animateMotion dur={`${dur}s`} repeatCount="indefinite" begin={`${delay + 0.3}s`}>
          <mpath href={`#${pathId}`} />
        </animateMotion>
      </circle>
    </>
  );
}

export default function GoiasMap() {
  const [hovered, setHovered] = useState<string | null>(null);
  const active = hovered ?? "goiania";
  const uid = useId();

  return (
    <div className="w-full h-full relative">
      {/* Title */}
      <div className="text-center mb-4">
        <p className="text-[9px] text-muted-foreground/40 tracking-[0.3em] uppercase mb-1">
          Zona Piloto
        </p>
        <h4 className="font-display text-xl text-primary uppercase tracking-widest">
          Estado de Goiás
        </h4>
      </div>

      {/* SVG Map */}
      <div className="relative w-full max-w-md mx-auto">
        <svg
          viewBox="338 278 86 108"
          className="w-full drop-shadow-lg"
          style={{ overflow: "visible" }}
        >
          <defs>
            {/* Glow filter for active cities */}
            <filter id="cityGlow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feFlood floodColor="rgba(198,167,92,0.5)" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Subtle grid pattern */}
            <pattern id={`grid-${uid}`} width="4" height="4" patternUnits="userSpaceOnUse">
              <path d="M 4 0 L 0 0 0 4" fill="none" stroke="rgba(198,167,92,0.03)" strokeWidth="0.15" />
            </pattern>
            {/* Radial gradient for the state fill */}
            <radialGradient id={`fillGrad-${uid}`} cx="50%" cy="40%">
              <stop offset="0%" stopColor="rgba(198,167,92,0.08)" />
              <stop offset="100%" stopColor="rgba(198,167,92,0.01)" />
            </radialGradient>
          </defs>

          {/* State outline — draw animation on mount */}
          <motion.path
            d={GOIAS_PATH}
            fill={`url(#fillGrad-${uid})`}
            stroke="rgba(198,167,92,0.25)"
            strokeWidth={0.5}
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />

          {/* Grid overlay */}
          <path d={GOIAS_PATH} fill={`url(#grid-${uid})`} />

          {/* Inner glow on the border */}
          <motion.path
            d={GOIAS_PATH}
            fill="none"
            stroke="rgba(198,167,92,0.06)"
            strokeWidth={2}
            strokeLinejoin="round"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
          />

          {/* Flow particles along connections */}
          {connections.map((conn, i) => (
            <FlowParticle
              key={i}
              from={conn.from}
              to={conn.to}
              delay={i * 0.8}
              dur={3 + i * 0.5}
            />
          ))}

          {/* City markers */}
          {cities.map((city) => (
            <g
              key={city.id}
              style={{ cursor: "pointer" }}
              onMouseEnter={() => setHovered(city.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <PulseDot city={city} active={active === city.id} />
              {/* City label */}
              <motion.text
                x={city.x + city.lx}
                y={city.y + city.ly}
                textAnchor={city.anchor}
                fontSize="2.2"
                fontFamily="Inter, sans-serif"
                letterSpacing="0.4"
                fill="rgba(198,167,92,0.4)"
                animate={{
                  fill: active === city.id ? "rgba(198,167,92,0.9)" : "rgba(198,167,92,0.4)",
                }}
                transition={{ duration: 0.3 }}
              >
                {city.name.toUpperCase()}
              </motion.text>
            </g>
          ))}
        </svg>

        {/* City info tooltip */}
        <div className="mt-3 min-h-[40px] text-center">
          <AnimatePresence mode="wait">
            {cities
              .filter((c) => c.id === active)
              .map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <p className="font-display text-base text-primary">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground/60 tracking-wider">{c.desc}</p>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
