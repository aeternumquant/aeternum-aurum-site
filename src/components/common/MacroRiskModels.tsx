import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";

export default function MacroRiskModels() {
  return (
    <div className="w-full h-full min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden bg-[#08090c] p-6 lg:p-12 border border-white/5">
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-50 pointer-events-none" />
       
       <FadeIn>
         <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Node 1 */}
            <motion.div 
               className="border border-white/10 bg-black/60 p-6 rounded-sm relative group shadow-2xl"
               whileHover={{ y: -5, borderColor: "rgba(198,167,92,0.4)" }}
            >
               <div className="text-[10px] text-primary/60 tracking-widest uppercase mb-5">Input Global</div>
               <h4 className="font-display text-lg tracking-wider text-white mb-3">Sinais Geopolíticos e Macro</h4>
               <p className="font-light text-xs text-muted-foreground leading-relaxed mb-6 h-16">Avaliação em tempo real de gargalos logísticos, choques de oferta e decisões de policy makers (Fed, BCE, OPEP+).</p>
               <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-[9px] text-primary/40 uppercase bg-primary/5 border border-primary/10 px-2 py-1">Liquidez Cross-Border</span>
                  <span className="text-[9px] text-primary/40 uppercase bg-primary/5 border border-primary/10 px-2 py-1">Yield Curve</span>
               </div>
            </motion.div>

            {/* Node 2 */}
            <motion.div 
               className="border border-primary/30 bg-primary/5 p-6 rounded-sm relative group shadow-2xl"
               whileHover={{ y: -5, borderColor: "rgba(198,167,92,0.6)" }}
            >
               <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-primary/30 hidden md:block" />
               <div className="text-[10px] text-primary tracking-widest uppercase mb-5">Motor Quantitativo MenthorQ</div>
               <h4 className="font-display text-xl tracking-wider text-white mb-3">Estruturação de Risco</h4>
               <p className="font-light text-xs text-foreground/80 leading-relaxed mb-6 h-16">Modelagem de correlação assimétrica. Aplicação de opções OTM para isolar caudas e estruturar hedges determinísticos.</p>
               <div className="pt-4 border-t border-primary/20 flex flex-wrap gap-2">
                  <span className="text-[9px] text-primary/80 uppercase bg-primary/10 border border-primary/20 px-2 py-1">Gamma Exposure (GEX)</span>
                  <span className="text-[9px] text-primary/80 uppercase bg-primary/10 border border-primary/20 px-2 py-1">Volatility Skew</span>
               </div>
            </motion.div>

            {/* Node 3 */}
            <motion.div 
               className="border border-white/10 bg-black/60 p-6 rounded-sm relative group shadow-2xl"
               whileHover={{ y: -5, borderColor: "rgba(198,167,92,0.4)" }}
            >
               <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-8 h-[2px] bg-primary/30 hidden md:block" />
               <div className="text-[10px] text-primary/60 tracking-widest uppercase mb-5">Output / Execução ISO</div>
               <h4 className="font-display text-lg tracking-wider text-white mb-3">Liquidação Institucional</h4>
               <p className="font-light text-xs text-muted-foreground leading-relaxed mb-6 h-16">Sizing otimizado, execução segmentada via Dark Pools e infraestrutura de liquidação atômica (ISO 20022).</p>
               <div className="pt-4 border-t border-white/5 flex flex-wrap gap-2">
                  <span className="text-[9px] text-primary/40 uppercase bg-primary/5 border border-primary/10 px-2 py-1">Smart Order Routing</span>
                  <span className="text-[9px] text-primary/40 uppercase bg-primary/5 border border-primary/10 px-2 py-1">Stellar Network</span>
               </div>
            </motion.div>
         </div>
       </FadeIn>
    </div>
  );
}
