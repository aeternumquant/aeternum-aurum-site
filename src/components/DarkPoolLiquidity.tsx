import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { FadeIn } from "./common/FadeIn";

const darkPoolData = [
  { strike: "115", volume: 200, type: "put" },
  { strike: "120", volume: 1500, type: "put" },
  { strike: "125", volume: 8500, type: "putWall" },
  { strike: "130", volume: 3200, type: "neutral" },
  { strike: "135", volume: 12000, type: "darkPool" },
  { strike: "140", volume: 6400, type: "neutral" },
  { strike: "145", volume: 15000, type: "callWall" },
  { strike: "150", volume: 4100, type: "call" },
  { strike: "155", volume: 900, type: "call" }
];

export default function DarkPoolLiquidity() {
  return (
    <div className="w-full h-full min-h-[400px] border border-white/5 bg-[#08090C] p-6 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="flex justify-between items-start mb-8">
        <div>
           <p className="text-[10px] text-primary/70 tracking-widest uppercase mb-1">Indicador Proprietário TRL 7+</p>
           <h3 className="font-display text-xl text-foreground uppercase tracking-widest">Dark Pool & Liquidity Matrix</h3>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Squeeze Metric (DEX)</p>
           <p className="font-display text-lg text-[#F44336]">82.4%</p>
        </div>
      </div>

      <div className="h-[250px] w-full">
         <ResponsiveContainer width="100%" height="100%">
            <BarChart data={darkPoolData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
               <XAxis dataKey="strike" tick={{ fill: "#8A8A8A", fontSize: 10 }} axisLine={false} tickLine={false} />
               <YAxis tick={false} axisLine={false} tickLine={false} />
               <Tooltip 
                  cursor={{ fill: "rgba(255,255,255,0.02)" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-black/90 border border-white/10 p-3 shadow-xl">
                        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mb-1">Strike {payload[0].payload.strike}</p>
                        <p className="font-display text-white text-lg">{payload[0].value} <span className="text-[10px] text-primary">Contratos</span></p>
                        <p className="text-[9px] text-primary/70 uppercase mt-1">{payload[0].payload.type}</p>
                      </div>
                    )
                  }}
               />
               <Bar dataKey="volume" radius={[2, 2, 0, 0]}>
                  {darkPoolData.map((entry, index) => {
                     let color = "rgba(255,255,255,0.1)"; // neutral
                     if (entry.type === "putWall") color = "#F44336";
                     if (entry.type === "callWall") color = "#4CAF50";
                     if (entry.type === "darkPool") color = "#C6A75C"; // Gold for dark pool
                     if (entry.type === "put") color = "rgba(244,67,54,0.3)";
                     if (entry.type === "call") color = "rgba(76,175,80,0.3)";
                     return <Cell key={`cell-${index}`} fill={color} />;
                  })}
               </Bar>
            </BarChart>
         </ResponsiveContainer>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-2">
         <div className="p-3 border border-white/5 bg-background text-center flex flex-col items-center justify-center">
            <div className="w-3 h-1 bg-[#F44336] mb-2" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Put Support</span>
            <span className="text-xs text-white font-display mt-1">125.00</span>
         </div>
         <div className="p-3 border border-white/5 bg-background text-center flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/10 animate-pulse" />
            <div className="w-3 h-1 bg-primary relative z-10 mb-2 shadow-[0_0_8px_rgba(198,167,92,0.8)]" />
            <span className="text-[9px] text-primary/80 uppercase tracking-widest relative z-10">Dark Node</span>
            <span className="text-xs text-primary font-display mt-1 relative z-10">135.00</span>
         </div>
         <div className="p-3 border border-white/5 bg-background text-center flex flex-col items-center justify-center">
            <div className="w-3 h-1 bg-[#4CAF50] mb-2" />
            <span className="text-[9px] text-muted-foreground uppercase tracking-widest">Call Wall</span>
            <span className="text-xs text-white font-display mt-1">145.00</span>
         </div>
      </div>
    </div>
  );
}
