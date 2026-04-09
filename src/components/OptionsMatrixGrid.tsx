import { useState } from "react";
import { motion } from "framer-motion";

const ctaData = [
  { asset: "Gold", today: 1.40, yesterday: 1.41, monthAgo: 2.54, p1M: 0.52, p3M: 0.17, p1Y: 0.09, zScore: -1.15 },
  { asset: "Silver", today: 1.35, yesterday: 1.33, monthAgo: 1.90, p1M: 0.57, p3M: 0.19, p1Y: 0.22, zScore: -0.90 },
  { asset: "Palladium", today: 0.34, yesterday: 0.36, monthAgo: 0.56, p1M: 0.81, p3M: 0.27, p1Y: 0.17, zScore: -0.97 },
  { asset: "Brent", today: 2.89, yesterday: 2.84, monthAgo: 2.80, p1M: 0.29, p3M: 0.76, p1Y: 0.94, zScore: 1.13 },
  { asset: "Natural Gas", today: -0.92, yesterday: -0.91, monthAgo: -0.19, p1M: 0.05, p3M: 0.02, p1Y: 0.16, zScore: -1.59 },
  { asset: "Copper", today: 1.38, yesterday: 1.33, monthAgo: 1.31, p1M: 0.90, p3M: 0.33, p1Y: 0.57, zScore: -0.71 },
  { asset: "Aluminum", today: 2.57, yesterday: 2.52, monthAgo: 2.43, p1M: 0.67, p3M: 0.52, p1Y: 0.86, zScore: 0.10 },
  { asset: "Soybean", today: 1.13, yesterday: 1.29, monthAgo: 2.75, p1M: 0.24, p3M: 0.43, p1Y: 0.64, zScore: -0.45 },
  { asset: "Corn", today: 1.06, yesterday: 0.96, monthAgo: 1.06, p1M: 0.43, p3M: 0.48, p1Y: 0.71, zScore: -0.12 },
  { asset: "Wheat", today: 1.62, yesterday: 1.40, monthAgo: 2.17, p1M: 0.43, p3M: 0.75, p1Y: 0.94, zScore: 0.73 },
  { asset: "PETR4 (Proxy)", today: 2.51, yesterday: 2.13, monthAgo: 0.44, p1M: 1.00, p3M: 1.00, p1Y: 1.00, zScore: 2.69 },
  { asset: "VALE3 (Proxy)", today: -3.59, yesterday: -3.25, monthAgo: -2.49, p1M: 0.05, p3M: 0.02, p1Y: 0.04, zScore: -1.50 },
];

function getColorForValue(val: number, isPercentile: boolean = false) {
  if (isPercentile) {
    if (val >= 0.8) return "bg-[#4CAF50] text-black";
    if (val >= 0.5) return "bg-[#a5d6a7] text-black";
    if (val >= 0.2) return "bg-[#ffcc80] text-black";
    return "bg-[#ef5350] text-white";
  }
  
  if (val > 2) return "bg-[#4CAF50] text-black";
  if (val > 0) return "bg-[#a5d6a7] text-black";
  if (val > -1) return "bg-[#ffcc80] text-black";
  return "bg-[#ef5350] text-white";
}

export default function OptionsMatrixGrid() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="w-full h-full border border-white/5 bg-[#08090c] p-6 relative">
      <div className="flex justify-between items-end mb-6">
        <div>
          <p className="text-[10px] text-primary/70 tracking-widest uppercase mb-1">Fundamentos Quantitativos</p>
          <h3 className="font-display text-xl text-foreground uppercase tracking-widest">CTA Position Matrix</h3>
        </div>
        <div className="text-[9px] text-muted-foreground uppercase tracking-wider hidden sm:block">Modelagem MenthorQ</div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10">Underlying</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">CTA Position Today</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">CTA Yesterday</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">CTA 1 Month Ago</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">1M Percentile</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">3M Percentile</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">1Y Percentile</th>
              <th className="bg-[#0b1324] text-white text-[10px] font-medium tracking-widest uppercase py-3 px-3 border border-white/10 text-center">3M Z Score</th>
            </tr>
          </thead>
          <tbody>
            {ctaData.map((row, idx) => (
              <tr 
                key={idx} 
                className={`transition-all duration-150 ${hoveredRow === idx ? "opacity-100 scale-[1.01] shadow-2xl z-10 relative" : "opacity-90"}`}
                onMouseEnter={() => setHoveredRow(idx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                <td className="bg-[#0b1324] text-white text-xs font-display tracking-widest py-2 px-3 border border-white/10">{row.asset}</td>
                <td className={`text-center text-xs font-mono py-2 px-3 border border-white/10 ${getColorForValue(row.today)}`}>{row.today > 0 ? "+" : ""}{row.today.toFixed(2)}%</td>
                <td className={`text-center text-xs font-mono py-2 px-3 border border-white/10 ${getColorForValue(row.yesterday)}`}>{row.yesterday > 0 ? "+" : ""}{row.yesterday.toFixed(2)}%</td>
                <td className={`text-center text-xs font-mono py-2 px-3 border border-white/10 ${getColorForValue(row.monthAgo)}`}>{row.monthAgo > 0 ? "+" : ""}{row.monthAgo.toFixed(2)}%</td>
                
                <td className={`text-center text-xs font-mono py-2 px-3 border border-white/10 ${getColorForValue(row.p1M, true)}`}>{row.p1M.toFixed(2)}</td>
                <td className={`text-center text-xs font-mono py-2 px-3 border border-white/10 ${getColorForValue(row.p3M, true)}`}>{row.p3M.toFixed(2)}</td>
                <td className={`text-center text-xs font-mono py-2 px-3 border border-white/10 ${getColorForValue(row.p1Y, true)}`}>{row.p1Y.toFixed(2)}</td>
                
                <td className="bg-white text-black text-center text-xs font-mono py-2 px-3 border border-white/10 font-bold">{row.zScore > 0 ? "+" : ""}{row.zScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
