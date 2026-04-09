import { motion } from "framer-motion";
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";

const GOLD = "#C6A75C";
const termStructureData = [
  { prazo: "1M", preco: 95 },
  { prazo: "2M", preco: 92 },
  { prazo: "3M", preco: 88 },
  { prazo: "6M", preco: 84 },
  { prazo: "1Y", preco: 81 },
  { prazo: "2Y", preco: 79 },
];

const yieldCurveData = [
  { maturidade: "1M", yieldEUA: 5.4, yieldBR: 10.5 },
  { maturidade: "6M", yieldEUA: 5.1, yieldBR: 10.2 },
  { maturidade: "2Y", yieldEUA: 4.6, yieldBR: 9.9 },
  { maturidade: "5Y", yieldEUA: 4.2, yieldBR: 10.4 },
  { maturidade: "10Y", yieldEUA: 4.3, yieldBR: 10.8 },
];

const zscoreData = [
  { d: "Out", z: -1.2 }, { d: "Nov", z: 0.5 }, { d: "Dez", z: 2.1 },
  { d: "Jan", z: 1.8 }, { d: "Fev", z: -0.5 }, { d: "Mar", z: -2.3 },
  { d: "Abr", z: -0.2 }, { d: "Mai", z: 1.4 }
];

export function TermStructureChart() {
  return (
    <div className="w-full h-48 border border-white/5 bg-black/40 p-4 relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <p className="text-[10px] text-primary/70 tracking-widest uppercase">Term Structure (Normal Backwardation)</p>
        <p className="text-[9px] text-muted-foreground/50 uppercase mt-1">Roll Yield Positivo</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={termStructureData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPreco" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={GOLD} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={GOLD} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="prazo" tick={{ fill: "#8A8A8A", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: "#8A8A8A", fontSize: 9 }} axisLine={false} tickLine={false} />
          <Area type="monotone" dataKey="preco" stroke={GOLD} fillOpacity={1} fill="url(#colorPreco)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function YieldCurveChart() {
  return (
    <div className="w-full h-48 border border-white/5 bg-black/40 p-4 relative overflow-hidden">
       <div className="absolute top-4 left-4 z-10">
        <p className="text-[10px] text-primary/70 tracking-widest uppercase">Spread de Curvas de Juros Soberanos</p>
        <p className="text-[9px] text-[#F44336]/60 uppercase mt-1">EUA (vermelho) vs BRASIL (ouro)</p>
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

export function ZScoreChart() {
  return (
    <div className="w-full h-48 border border-white/5 bg-black/40 p-4 relative overflow-hidden">
       <div className="absolute top-4 left-4 z-10">
        <p className="text-[10px] text-primary/70 tracking-widest uppercase">Z-Score Divergence (Pair Trading)</p>
        <p className="text-[9px] text-muted-foreground/50 uppercase mt-1">Sinalização de Mean Reversion</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={zscoreData} margin={{ top: 40, right: 10, left: -20, bottom: 0 }}>
          <defs>
             <linearGradient id="zGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.2}/>
              <stop offset="50%" stopColor="transparent" stopOpacity={0}/>
              <stop offset="95%" stopColor="#F44336" stopOpacity={0.2}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="d" tick={{ fill: "#8A8A8A", fontSize: 9 }} axisLine={false} tickLine={false} />
          <YAxis domain={[-3, 3]} tick={{ fill: "#8A8A8A", fontSize: 9 }} axisLine={false} tickLine={false} />
          <ReferenceLine y={2} stroke="rgba(244, 67, 54, 0.4)" strokeDasharray="3 3" />
          <ReferenceLine y={-2} stroke="rgba(76, 175, 80, 0.4)" strokeDasharray="3 3" />
          <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.2)" />
          <Area type="monotone" dataKey="z" stroke={GOLD} strokeWidth={1.5} fill="url(#zGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function NodeGraphChart() {
  return (
    <div className="w-full h-48 border border-white/5 bg-black/40 p-4 relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-4 left-4 z-10">
        <p className="text-[10px] text-primary/70 tracking-widest uppercase">Soroban & Stellar Network</p>
        <p className="text-[9px] text-muted-foreground/50 uppercase mt-1">ISO 20022 Liquidação Atômica</p>
      </div>
      
      <div className="relative w-40 h-24 mt-6">
         <motion.div 
           className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-primary/40 bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(198,167,92,0.2)]"
         >
           <span className="text-[8px] text-primary">Dólar</span>
         </motion.div>

         <motion.div 
           className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-[#4CAF50]/40 bg-[#4CAF50]/10 flex items-center justify-center shadow-[0_0_15px_rgba(76,175,80,0.2)]"
         >
           <span className="text-[8px] text-[#4CAF50]">Ativo</span>
         </motion.div>

         <motion.div 
           className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 border border-white/10 flex items-center justify-center rotate-45 bg-[#08090c] z-10"
         >
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

export default function AllocationVisuals({ type }: { type: string }) {
    if (type === "Commodities & Real Assets") return <TermStructureChart />;
    if (type === "Global Macro") return <YieldCurveChart />;
    if (type === "ISO 20022 Assets") return <NodeGraphChart />;
    if (type === "Equities Long/Short") return <ZScoreChart />;
    return null;
}
