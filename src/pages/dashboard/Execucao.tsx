import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { ComposedChart, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, AreaChart, Area, Scatter } from "recharts";
import { useState } from "react";
import GoiasFlowMap from "../../components/maps/GoiasFlowMap";

// Dados realistas de Ouro - 07/04/2026 (GCQ2026)
const curveData = [
  { days: 0, price: 2370, past: 2345 },      // Spot hoje
  { days: 30, price: 2385, past: 2360 },     // Maio
  { days: 60, price: 2415, past: 2390 },     // Junho
  { days: 90, price: 2450, past: 2425 },     // Setembro
  { days: 120, price: 2485, past: 2460 },    // Dezembro
];

const scoreHistoryData = [
  { d: "03-15", option: 4, mom: 2, vol: 2, seas: 1 },
  { d: "03-20", option: 3, mom: 2, vol: 4, seas: 2 },
  { d: "03-25", option: 2, mom: 3, vol: 5, seas: 3 },
  { d: "03-30", option: 3, mom: 3, vol: 4, seas: 4 },
  { d: "04-07", option: 4, mom: 3, vol: 3, seas: 4 },
];

const gexProfileData = [
  { strike: 2300, put: 18, call: 3 },
  { strike: 2320, put: 28, call: 8 },
  { strike: 2340, put: 52, call: 15 },
  { strike: 2360, put: 15, call: 38 },
  { strike: 2380, put: 8, call: 60 },
  { strike: 2400, put: 3, call: 72 },
  { strike: 2420, put: -8, call: -25 },
  { strike: 2450, put: -15, call: -48 },
  { strike: 2500, put: -5, call: -22 },
];

export default function ExecucaoPage() {
  const [assetTarget, setAssetTarget] = useState("GOLD FUTURES (GCQ2026)");

  return (
    <main className="pt-14 min-h-screen bg-[#08090C]">
      {/* Top Navbar / Asset Search simulation */}
      <div className="bg-[#12141A] border-b border-white/5 px-4 sm:px-8 py-3 flex items-center justify-between">
         <div className="flex items-center gap-4">
             <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full font-display text-primary shadow-[0_0_15px_rgba(198,167,92,0.2)]">Q</div>
             <input type="text" value={assetTarget} onChange={(e) => setAssetTarget(e.target.value)} className="bg-transparent border-none text-white text-lg font-display tracking-widest outline-none uppercase w-full max-w-[400px]" />
         </div>
         <div className="flex gap-4">
             <span className="text-white bg-white/10 px-4 py-1.5 text-xs font-mono rounded-sm">2026-04-05</span>
             <button className="bg-[#2D60FF] text-white px-4 py-1.5 text-xs font-mono rounded-sm shadow-[0_0_10px_rgba(45,96,255,0.4)]">Adicionar Ordem</button>
         </div>
      </div>

      <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-4">
         
         {/* Row 1: Key Metrics & QScore */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Asset Vital Stats */}
            <div className="lg:col-span-4 bg-[#12141A] border border-white/5 rounded-sm p-5 row-span-2">
               <h3 className="text-white font-display text-xl mb-4 tracking-widest hover:text-primary transition-colors cursor-pointer">{assetTarget}</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">P/C OI (Liquidez)</p>
                    <p className="text-white font-mono text-lg">0.68</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Movimento Esp. 1D</p>
                    <p className="text-white font-mono text-lg">± 1.25%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Condição Gamma</p>
                    <p className="text-[#4CAF50] font-mono text-lg">Positivo</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Vol. Implícita 30D</p>
                    <p className="text-white font-mono text-lg">18.45%</p>
                  </div>
               </div>
            </div>

            {/* Q-Score Main block */}
            <div className="lg:col-span-8 bg-[#12141A] border border-white/5 rounded-sm p-5">
               <div className="text-center mb-6">
                  <h3 className="text-white font-display text-2xl tracking-widest flex items-center justify-center gap-2">
                    <span className="text-white/60 text-lg">Q</span>SCORE
                  </h3>
                  <p className="text-[10px] text-muted-foreground font-light tracking-wide mt-1">Nosso score quantitativo que condensa dados operacionais em sinais de ação.</p>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Option */}
                  <div className="bg-[#0b1324]/50 border border-white/5 p-4 text-center">
                     <p className="text-3xl text-white font-display mb-1">2</p>
                     <p className="text-[10px] text-white/80 uppercase tracking-widest">Neutro</p>
                     <div className="w-8 h-[1px] bg-white/20 mx-auto my-2" />
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-wider">Opções</p>
                  </div>
                  {/* Volatility */}
                  <div className="bg-[#2D0D12]/60 border border-[#F44336]/20 p-4 text-center">
                     <p className="text-3xl text-white font-display mb-1">4</p>
                     <p className="text-[10px] text-[#F44336] uppercase tracking-widest">Alto</p>
                     <div className="w-8 h-[1px] bg-[#F44336]/20 mx-auto my-2" />
                     <p className="text-[9px] text-[#F44336] uppercase tracking-wider">Volatilidade</p>
                  </div>
                  {/* Momentum */}
                  <div className="bg-[#0b1324]/50 border border-white/5 p-4 text-center">
                     <p className="text-3xl text-white font-display mb-1">3</p>
                     <p className="text-[10px] text-white/80 uppercase tracking-widest">Alerta</p>
                     <div className="w-8 h-[1px] bg-white/20 mx-auto my-2" />
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-wider">Momentum</p>
                  </div>
                  {/* Seasonality */}
                  <div className="bg-[#051F11]/60 border border-[#4CAF50]/20 p-4 text-center">
                     <p className="text-3xl text-white font-display mb-1">4</p>
                     <p className="text-[10px] text-[#4CAF50] uppercase tracking-widest">Positivo</p>
                     <div className="w-8 h-[1px] bg-[#4CAF50]/20 mx-auto my-2" />
                     <p className="text-[9px] text-[#4CAF50] uppercase tracking-wider">Sazonalidade</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Row 2: Net GEX Charts & Key Levels */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* GEX Profile Chart */}
            <div className="lg:col-span-8 bg-[#12141A] border border-white/5 rounded-sm p-5">
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-white font-display text-lg tracking-widest">Exposição Gamma Líquida (GEX)</h3>
                    <p className="text-[10px] text-muted-foreground">Analisa as métricas de formadores de mercado para antecipar pontos de rejeição de preço.</p>
                  </div>
                  {/* Removed Ask Quin Button */}
               </div>
               
               <div className="w-full h-[250px] flex gap-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={gexProfileData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }} barCategoryGap={1}>
                       <XAxis type="number" hide />
                       <YAxis type="category" dataKey="strike" tick={{ fill: "#8A8A8A", fontSize: 10 }} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#000", borderColor: "#333", fontSize: "10px" }} />
                       <ReferenceLine x={0} stroke="rgba(255,255,255,0.2)" />
                       <Bar dataKey="put" fill="#F44336" stackId="a" />
                       <Bar dataKey="call" fill="#4CAF50" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Key Levels Table */}
            <div className="lg:col-span-4 bg-[#12141A] border border-white/5 rounded-sm p-5">
               <h3 className="text-white font-display text-lg tracking-widest mb-1">Níveis Principais</h3>
               <p className="text-[10px] text-muted-foreground mb-6">Sumário de pontos nodais na estrutura de precificação.</p>
               
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  <div className="bg-[#0b1324] border border-white/5 p-2 px-3">
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-widest mb-1">Resistência de Call</p>
                     <p className="text-white font-mono text-sm leading-none">2450.00</p>
                  </div>
                  <div className="bg-[#0b1324] border border-white/5 p-2 px-3">
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-widest mb-1">Nível de Alta Vol</p>
                     <p className="text-white font-mono text-sm leading-none">2180.00</p>
                  </div>
                  <div className="bg-[#0b1324] border border-white/5 p-2 px-3">
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-widest mb-1">Suporte de Put</p>
                     <p className="text-white font-mono text-sm leading-none">2250.00</p>
                  </div>
                  <div className="bg-[#0b1324] border border-white/5 p-2 px-3">
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-widest mb-1">Máxima Diária (1DMax)</p>
                     <p className="text-white font-mono text-sm leading-none">2375.40</p>
                  </div>
                  <div className="bg-[#0b1324] border border-white/5 p-2 px-3">
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-widest mb-1">GEX Total</p>
                     <p className="text-[#4CAF50] font-mono text-sm leading-none">12.8M</p>
                  </div>
                  <div className="bg-[#0b1324] border border-white/5 p-2 px-3">
                     <p className="text-[9px] text-[#A6C4FA] uppercase tracking-widest mb-1">Distância p/ Alta Vol</p>
                     <p className="text-white font-mono text-sm leading-none">2.45%</p>
                  </div>
               </div>
            </div>

         </div>

         {/* Row 3: Mini Charts (Futures Curve, QScores over time) */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Futures Curve */}
            <div className="bg-[#12141A] border border-white/5 rounded-sm p-4 h-[220px] flex flex-col">
               <h3 className="text-white font-display text-sm tracking-widest mb-1">Estrutura Termo (Futuros)</h3>
               <div className="flex-1 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={curveData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="days" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis domain={['dataMin', 'dataMax']} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <Line type="monotone" dataKey="price" stroke="#4CAF50" strokeWidth={1.5} dot={false} />
                        <Line type="monotone" dataKey="past" stroke="#F44336" strokeWidth={1} strokeDasharray="3 3" dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Momentum Score History */}
            <div className="bg-[#12141A] border border-white/5 rounded-sm p-4 h-[220px] flex flex-col">
               <h3 className="text-white font-display text-sm tracking-widest mb-1">Histórico de Momentum</h3>
               <div className="flex-1 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={scoreHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="d" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <Line type="stepAfter" dataKey="mom" stroke="#4CAF50" strokeWidth={1.5} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>

            {/* Volatility Score History */}
            <div className="bg-[#12141A] border border-white/5 rounded-sm p-4 h-[220px] flex flex-col">
               <h3 className="text-white font-display text-sm tracking-widest mb-1">Histórico de Volatilidade</h3>
               <div className="flex-1 w-full mt-2">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={scoreHistoryData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <XAxis dataKey="d" tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 5]} ticks={[1,2,3,4,5]} tick={{ fill: "#666", fontSize: 9 }} axisLine={false} tickLine={false} />
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <Line type="stepAfter" dataKey="vol" stroke="#9C27B0" strokeWidth={1.5} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>

         {/* Row 4: Goias Map & Cities Details */}
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="lg:col-span-12 mb-2">
               <h3 className="text-white font-display text-xl tracking-widest flex items-center gap-2">
                 ZONA PILOTO <span className="text-primary">• GOIÁS</span>
               </h3>
               <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Infraestrutura Logística e Financeira Regional</p>
            </div>

            {/* Map Container */}
            <div className="lg:col-span-8 bg-[#12141A] border border-white/5 rounded-sm h-[400px]">
               <GoiasFlowMap standalone={true} />
            </div>

            {/* Cities Citation */}
            <div className="lg:col-span-4 flex flex-col gap-3">
               {[
                  { name: "Goiânia", role: "Hub Financeiro", desc: "Capital e polo de regulação e estruturação de operações financeiras (R$ 12B PIB)." },
                  { name: "Brasília", role: "Capital Federal", desc: "Governança estratégica, compliance e regulação macro." },
                  { name: "Rio Verde", role: "Soja & Milho", desc: "Principal nó de escoamento. Exportação direta de US$ 4.2B anuais." },
                  { name: "Jataí", role: "Grãos & Proteína", desc: "Top 10 Nacional em volume agropecuário estruturado." },
                  { name: "Catalão", role: "Nióbio & Mineração", desc: "Base de depósitos minerais estratégicos e base CMOC/Niobras." },
                  { name: "Campos Verdes", role: "Esmeraldas", desc: "Polo mundial de extração de gemas com lastro tangível." },
               ].map((city, idx) => (
                  <div key={idx} className="bg-[#12141A] border border-white/5 p-3 rounded-sm hover:border-primary/20 transition-colors">
                     <div className="flex justify-between items-baseline mb-1">
                        <span className="text-white font-display text-sm tracking-wider">{city.name}</span>
                        <span className="text-[9px] text-[#C6A75C] tracking-widest uppercase font-mono">{city.role}</span>
                     </div>
                     <p className="text-[10px] text-muted-foreground leading-relaxed">{city.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </div>
      <Footer />
    </main>
  );
}
