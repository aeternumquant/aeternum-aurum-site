import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/*
 * Redesigned as a minimalist world-map-style network.
 * Points represent global data sources plotted on an abstract coordinate grid.
 * Thin gold dashed lines connect sources to the central AETERNUM AURUM core.
 * Smooth Framer Motion animations for entry + subtle ongoing pulse.
 */

const sources = [
  { id: "markets",    label: "Mercados Financeiros",  x: 50, y: 8,  size: 3 },
  { id: "geopolitics",label: "Geopolítica & Defesa",  x: 12, y: 32, size: 2.5 },
  { id: "macro",      label: "Anúncios Macro",        x: 88, y: 28, size: 2.5 },
  { id: "commodities",label: "Commodities & Supply",   x: 16, y: 72, size: 2.5 },
  { id: "news",       label: "Fluxo de Notícias 24/7", x: 84, y: 72, size: 2.5 },
];

const core = { id: "core", label: "AETERNUM AURUM", x: 50, y: 50, size: 5 };

const connections = [
  { from: "markets",    to: "core" },
  { from: "geopolitics",to: "core" },
  { from: "macro",      to: "core" },
  { from: "commodities",to: "core" },
  { from: "news",       to: "core" },
  { from: "geopolitics",to: "markets" },
  { from: "macro",      to: "markets" },
];

function getPos(id: string) {
  if (id === "core") return core;
  return sources.find((s) => s.id === id)!;
}

function ConnectionLine({ fromId, toId, index }: { fromId: string; toId: string; index: number }) {
  const f = getPos(fromId);
  const t = getPos(toId);
  const isToCore = toId === "core";

  return (
    <g>
      {/* Dashed connection line */}
      <motion.line
        x1={f.x} y1={f.y} x2={t.x} y2={t.y}
        stroke="rgba(198,167,92,0.08)"
        strokeWidth={isToCore ? 0.4 : 0.25}
        strokeDasharray="1.5 3"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.3 + index * 0.15, ease: "easeOut" }}
      />

      {/* Moving dot along path */}
      <circle r={0.6} fill="rgba(198,167,92,0.6)">
        <animateMotion
          dur={`${3 + index * 0.5}s`}
          repeatCount="indefinite"
          begin={`${index * 0.6}s`}
        >
          <mpath href={`#conn-${index}`} />
        </animateMotion>
      </circle>

      <defs>
        <path id={`conn-${index}`} d={`M ${f.x} ${f.y} L ${t.x} ${t.y}`} />
      </defs>
    </g>
  );
}

function SourceNode({ source, index }: { source: typeof sources[0]; index: number }) {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.5 + index * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Outer subtle ring */}
      <circle
        cx={source.x} cy={source.y} r={source.size + 1.5}
        fill="none"
        stroke="rgba(198,167,92,0.06)"
        strokeWidth={0.3}
      />

      {/* Main dot with glow */}
      <circle
        cx={source.x} cy={source.y} r={source.size * 0.4}
        fill="rgba(198,167,92,0.5)"
      />

      {/* Label */}
      <text
        x={source.x}
        y={source.y < 50 ? source.y - source.size - 2.5 : source.y + source.size + 4.5}
        textAnchor="middle"
        fontSize="2.4"
        fill="rgba(198,167,92,0.35)"
        fontFamily="Inter, sans-serif"
        letterSpacing="0.6"
      >
        {source.label.toUpperCase()}
      </text>
    </motion.g>
  );
}

function CoreNode() {
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Outermost pulse ring */}
      <motion.circle
        cx={core.x} cy={core.y} r={8}
        fill="none"
        stroke="rgba(198,167,92,0.06)"
        strokeWidth={0.3}
        animate={{ r: [8, 12, 8], opacity: [0.06, 0, 0.06] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Middle ring */}
      <circle
        cx={core.x} cy={core.y} r={6}
        fill="none"
        stroke="rgba(198,167,92,0.08)"
        strokeWidth={0.3}
      />

      {/* Inner filled dot */}
      <circle
        cx={core.x} cy={core.y} r={2.5}
        fill="rgba(198,167,92,0.12)"
        stroke="rgba(198,167,92,0.5)"
        strokeWidth={0.5}
      />

      {/* Bright center */}
      <motion.circle
        cx={core.x} cy={core.y} r={1}
        fill="rgba(198,167,92,0.8)"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Label */}
      <text
        x={core.x}
        y={core.y + 10}
        textAnchor="middle"
        fontSize="2.8"
        fill="rgba(198,167,92,0.55)"
        fontFamily="'Cormorant Garamond', serif"
        letterSpacing="1.2"
      >
        AETERNUM AURUM
      </text>
    </motion.g>
  );
}

export default function IntelligenceFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className="w-full">
      <div className="text-center mb-6">
        <p className="text-[9px] text-muted-foreground/40 tracking-[0.3em] uppercase">
          Fluxo Global de Inteligência · Tempo Real
        </p>
      </div>

      <svg
        viewBox="0 0 100 90"
        className="w-full max-w-xl mx-auto block"
        style={{ overflow: "visible" }}
      >
        {/* Subtle grid dots background */}
        <defs>
          <pattern id="intel-grid" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="0.15" fill="rgba(198,167,92,0.06)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="90" fill="url(#intel-grid)" />

        {/* Connection lines */}
        {isInView &&
          connections.map((c, i) => (
            <ConnectionLine key={i} fromId={c.from} toId={c.to} index={i} />
          ))}

        {/* Core node */}
        {isInView && <CoreNode />}

        {/* Source nodes */}
        {isInView &&
          sources.map((s, i) => (
            <SourceNode key={s.id} source={s} index={i} />
          ))}
      </svg>
    </div>
  );
}
