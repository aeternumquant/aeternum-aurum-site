import { useId } from "react";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

const matrixData = [
  { asset: "PETR4", type: "Energy", spot: 38.85, qScore: 8.2, gammaFlip: 38.00, blindSpot: 40.50, flow: "CALL_HEAVY" },
  { asset: "VALE3", type: "Mining", spot: 61.20, qScore: 4.1, gammaFlip: 62.50, blindSpot: 58.00, flow: "PUT_HEAVY" },
  { asset: "JBSS3", type: "Protein", spot: 31.40, qScore: 6.8, gammaFlip: 30.00, blindSpot: 34.00, flow: "NEUTRAL" },
  { asset: "SOY.C", type: "Agro", spot: 1184.50, qScore: 7.5, gammaFlip: 1150.00, blindSpot: 1220.00, flow: "CALL_BULLISH" },
  { asset: "CORN.C", type: "Agro", spot: 432.25, qScore: 3.2, gammaFlip: 450.00, blindSpot: 410.00, flow: "PUT_HEAVY" },
];

export default function OptionsMatrixGrid() {
  const uid = useId();

  return (
    <div className="w-full">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h3 className="text-primary text-sm tracking-[0.2em] uppercase font-display mb-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            Matriz de Derivativos & Q-Score
          </h3>
          <p className="text-muted-foreground font-light text-xs">Métricas quantitativas para commodities e ativos diretos</p>
        </div>
      </div>

      <div className="border border-white/5 bg-[#08090c] overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-normal">Ativo</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-normal text-right">Spot</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-normal text-center">Q-Score (1-10)</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-normal text-right">Gamma Flip</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-primary/40 font-normal text-right">Blind Spot</th>
              <th className="p-4 text-[10px] uppercase tracking-widest text-white/40 font-normal">Options Flow</th>
            </tr>
          </thead>
          <tbody>
            {matrixData.map((row, i) => (
              <tr 
                key={`${row.asset}-${uid}`} 
                className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
              >
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-white/90">{row.asset}</span>
                    <span className="text-[8px] border border-white/10 px-1 py-0.5 text-white/30 uppercase tracking-wider hidden sm:inline-block">
                      {row.type}
                    </span>
                  </div>
                </td>
                <td className="p-4 font-mono text-sm text-white/70 text-right">
                  {row.spot.toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${row.qScore > 6 ? 'bg-[#4CAF50]' : row.qScore < 4 ? 'bg-[#F44336]' : 'bg-white/30'}`}
                        style={{ width: `${(row.qScore / 10) * 100}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs text-white/80">{row.qScore.toFixed(1)}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <span className={`font-mono text-xs ${row.spot > row.gammaFlip ? 'text-[#4CAF50]/80' : 'text-[#F44336]/80'}`}>
                    {row.gammaFlip.toFixed(2)}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <span className="font-mono text-xs text-primary/80 group-hover:text-primary transition-colors flex items-center justify-end gap-1">
                    {row.spot < row.blindSpot ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {row.blindSpot.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`text-[9px] tracking-widest uppercase border px-2 py-0.5 ${
                    row.flow.includes("CALL") 
                      ? 'border-[#4CAF50]/20 text-[#4CAF50]/80 bg-[#4CAF50]/5' 
                      : row.flow.includes("PUT")
                        ? 'border-[#F44336]/20 text-[#F44336]/80 bg-[#F44336]/5'
                        : 'border-white/10 text-white/50'
                  }`}>
                    {row.flow.replace("_", " ")}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex justify-between items-center text-[10px] text-white/30 uppercase tracking-widest">
        <span>* Baseado em dados de Market Makers</span>
        <span>Atualização em tempo real (Simulada)</span>
      </div>
    </div>
  );
}
