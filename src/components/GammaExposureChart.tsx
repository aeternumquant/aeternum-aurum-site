import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { useId, useState } from 'react';
import { FadeIn } from './common/FadeIn';

// Dados de Gamma Exposure com preços reais B3 - 07/04/2026
const gexDataPETR4 = [
  { strike: 46.00, callGex: 120, putGex: -450 },
  { strike: 47.00, callGex: 210, putGex: -580 },
  { strike: 48.00, callGex: 340, putGex: -710 },
  { strike: 48.50, callGex: 420, putGex: -890 }, // Suporte Delta Put
  { strike: 49.00, callGex: 610, putGex: -520 },
  { strike: 49.25, callGex: 950, putGex: -200 }, // Spot Atual - R$ 49.25
  { strike: 49.50, callGex: 1100, putGex: -100 },
  { strike: 50.00, callGex: 1450, putGex: -50 },  // Call Wall / Resistência
  { strike: 50.50, callGex: 850, putGex: -20 },
  { strike: 51.00, callGex: 620, putGex: -10 },
  { strike: 51.50, callGex: 310, putGex: 0 },
];

const gexDataVALE3 = [
  { strike: 78.00, callGex: 80, putGex: -620 },
  { strike: 79.00, callGex: 150, putGex: -850 },
  { strike: 80.50, callGex: 220, putGex: -1100 }, // Put Support
  { strike: 81.50, callGex: 450, putGex: -500 },
  { strike: 83.00, callGex: 780, putGex: -200 }, // Spot Atual - R$ 83.00
  { strike: 84.00, callGex: 1250, putGex: -50 },
  { strike: 85.00, callGex: 1800, putGex: -10 }, // Call Wall
  { strike: 86.00, callGex: 900, putGex: 0 },
  { strike: 87.00, callGex: 400, putGex: 0 },
];

const gexDataJBSS3 = [
  { strike: 35.50, callGex: 50, putGex: -300 },
  { strike: 36.50, callGex: 120, putGex: -450 }, // Put Support
  { strike: 37.50, callGex: 300, putGex: -150 },
  { strike: 39.03, callGex: 500, putGex: -50 }, // Spot Atual - R$ 39.03
  { strike: 40.00, callGex: 850, putGex: 0 },   // Call Wall
  { strike: 41.00, callGex: 320, putGex: 0 },
];

const assetConfig = {
   "PETR4": { data: gexDataPETR4, spot: 49.25, putSupport: 48.50, callWall: 50.00 },
   "VALE3": { data: gexDataVALE3, spot: 83.00, putSupport: 80.50, callWall: 85.00 },
   "JBSS3": { data: gexDataJBSS3, spot: 39.03, putSupport: 36.50, callWall: 40.00 }
};

export default function GammaExposureChart() {
  const uid = useId();
  const [activeAsset, setActiveAsset] = useState<"PETR4" | "VALE3" | "JBSS3">("PETR4");

  // Formatador para o Tooltip com visual "Quant"
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0c0e12] border border-white/10 p-3 shadow-2xl backdrop-blur-md">
          <p className="text-primary/70 text-[10px] tracking-widest uppercase mb-2 border-b border-white/5 pb-2">
            Strike R$ {label.toFixed(2)}
          </p>
          <div className="space-y-1">
            <p className="text-[#4CAF50] text-xs font-mono">
              <span className="text-white/40 mr-2">C-GEX:</span>+{payload[0]?.value}K
            </p>
            <p className="text-[#F44336] text-xs font-mono">
              <span className="text-white/40 mr-2">P-GEX:</span>{payload[1]?.value}K
            </p>
          </div>
          <div className="mt-2 pt-2 border-t border-white/5">
            <p className="text-white/80 text-xs font-mono">
              <span className="text-white/40 mr-2">Net GEX:</span>
              <span className={(payload[0]?.value + payload[1]?.value) > 0 ? "text-[#4CAF50]" : "text-[#F44336]"}>
                {((payload[0]?.value + payload[1]?.value) > 0 ? "+" : "") + (payload[0]?.value + payload[1]?.value)}K
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-4xl border border-white/5 bg-[#08090c] p-6 relative group overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />

        {/* Header do Gráfico */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10">
          <div>
            <h3 className="text-primary text-sm tracking-[0.2em] uppercase font-display mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Opções & Exposição Gamma (GEX)
            </h3>
            <p className="text-muted-foreground font-light text-xs">Modelagem de fluxos de formadores de mercado (Market Makers)</p>
          </div>

          <div className="flex gap-2 mt-4 sm:mt-0">
            {["PETR4", "VALE3", "JBSS3"].map((asset) => (
              <button
                key={asset}
                onClick={() => setActiveAsset(asset)}
                className={`text-[10px] tracking-widest px-3 py-1.5 transition-colors border ${
                  activeAsset === asset 
                    ? "border-primary/30 text-primary bg-primary/5" 
                    : "border-white/5 text-white/40 hover:text-white/80 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                {asset}
              </button>
            ))}
          </div>
        </div>

        {/* Indicadores de Topo */}
        <div className="grid grid-cols-3 gap-4 mb-8 border-y border-white/5 py-4 relative z-10">
          <div className="text-center border-r border-white/5">
            <p className="text-[10px] text-white/40 tracking-widest uppercase mb-1">Spot Price</p>
            <p className="font-mono text-xl text-white/90">R$ {assetConfig[activeAsset].spot.toFixed(2)}</p>
          </div>
          <div className="text-center border-r border-white/5">
            <p className="text-[10px] text-[#4CAF50]/60 tracking-widest uppercase mb-1">Call Wall</p>
            <p className="font-mono text-xl text-[#4CAF50]">R$ {assetConfig[activeAsset].callWall.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-[#F44336]/60 tracking-widest uppercase mb-1">Put Support</p>
            <p className="font-mono text-xl text-[#F44336]">R$ {assetConfig[activeAsset].putSupport.toFixed(2)}</p>
          </div>
        </div>

        {/* Área do Gráfico */}
        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={assetConfig[activeAsset].data}
              margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              barGap={0}
            >
              <defs>
                <linearGradient id={`colorCall-${uid}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.2}/>
                </linearGradient>
                <linearGradient id={`colorPut-${uid}`} x1="0" y1="1" x2="0" y2="0">
                  <stop offset="5%" stopColor="#F44336" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#F44336" stopOpacity={0.2}/>
                </linearGradient>
              </defs>

              <XAxis 
                dataKey="strike" 
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontFamily: 'monospace' }} 
                tickFormatter={(val) => `R$${val.toFixed(2)}`}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'monospace' }} 
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(198,167,92,0.05)' }}
              />
              
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" strokeWidth={1} />
              
              {/* Linha indicando o Spot */}
              <ReferenceLine 
                x={assetConfig[activeAsset].spot} 
                stroke="rgba(198,167,92,0.4)" 
                strokeDasharray="3 3" 
                label={{ position: 'top', value: 'SPOT', fill: 'rgba(198,167,92,0.8)', fontSize: 10, fontFamily: 'monospace' }}
              />

              <Bar dataKey="callGex" stackId="a" fill={`url(#colorCall-${uid})`} radius={[2, 2, 0, 0]} />
              <Bar dataKey="putGex" stackId="a" fill={`url(#colorPut-${uid})`} radius={[0, 0, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
