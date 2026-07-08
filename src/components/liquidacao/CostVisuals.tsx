/**
 * CostVisuals.tsx - visualizações copiadas de AllocationVisuals (Alocações)
 * para a página de Liquidação, sem criar dependência da página antiga.
 * Alocações permanece intacta; isto é uma cópia local do necessário.
 */
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GOLD = "#C6A85A";

const yieldCurveData = [
  { maturidade: "1M", yieldEUA: 5.4, yieldBR: 10.5 },
  { maturidade: "6M", yieldEUA: 5.1, yieldBR: 10.2 },
  { maturidade: "2Y", yieldEUA: 4.6, yieldBR: 9.9 },
  { maturidade: "5Y", yieldEUA: 4.2, yieldBR: 10.4 },
  { maturidade: "10Y", yieldEUA: 4.3, yieldBR: 10.8 },
];

export function YieldCurveChart() {
  return (
    <div className="w-full h-48 border border-white/5 bg-black/40 p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <p className="text-[10px] text-primary/70 tracking-widest uppercase">
          Spread de curvas de juros soberanos
        </p>
        <p className="text-[9px] text-[#F44336]/60 uppercase mt-1">
          EUA (vermelho) vs Brasil (ouro)
        </p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={yieldCurveData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="maturidade" tick={{ fill: "#8A8A8A", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "#8A8A8A", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Line type="monotone" dataKey="yieldBR" stroke={GOLD} strokeWidth={2} dot={{ r: 2, fill: GOLD }} />
          <Line type="monotone" dataKey="yieldEUA" stroke="#F44336" strokeWidth={1} strokeDasharray="4 4" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NodeGraphChart() {
  return (
    <div className="w-full h-48 border border-white/5 bg-black/40 p-4 relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-4 left-4 z-10">
        <p className="text-[10px] text-primary/70 tracking-widest uppercase">
          Liquidação atômica on-chain
        </p>
        <p className="text-[9px] text-muted-foreground/50 uppercase mt-1">
          DvP em um único passo (ISO 20022)
        </p>
      </div>

      <div className="relative w-40 h-24 mt-6">
        <motion.div className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(198,167,92,0.2)]">
          <span className="text-[8px] text-primary">Dólar</span>
        </motion.div>

        <motion.div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#4CAF50]/40 bg-[#4CAF50]/10 flex items-center justify-center shadow-[0_0_15px_rgba(76,175,80,0.2)]">
          <span className="text-[8px] text-[#4CAF50]">Ativo</span>
        </motion.div>

        <motion.div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-white/10 flex items-center justify-center rotate-45 bg-[#08090c] z-10">
          <div className="w-full h-full border border-primary/20 -rotate-45 flex items-center justify-center">
            <span className="text-[10px] text-primary/80 font-display">DEX</span>
          </div>
        </motion.div>

        {/* Connection lines */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-r from-primary/40 to-white/10" />
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-[1px] bg-gradient-to-l from-[#4CAF50]/40 to-white/10" />

        {/* Data packets */}
        <motion.div
          className="absolute left-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-primary rounded-full"
          animate={{ left: ["20%", "40%", "20%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute right-8 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#4CAF50] rounded-full"
          animate={{ right: ["20%", "40%", "20%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.7 }}
        />
      </div>
    </div>
  );
}
