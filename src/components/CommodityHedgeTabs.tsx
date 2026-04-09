import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "./common/FadeIn";

const hedgeTabs = [
  {
    id: "energia",
    title: "Petróleo & Diesel",
    subtitle: "Risco Sistêmico de Curto Prazo",
    problem: "Cadeamentos geopolíticos ou cortes da OPEP+ geram spikes no preço do barril, aumentando os custos de frete logístico agro e comprimindo margens operacionais abruptamente.",
    solution: "Posições estratégicas em OTM (Out-of-the-Money) Call Options de Petróleo Crude estruturadas para absorver o choque de preço, mitigando o risco das empresas de logística e grandes produtores rurais.",
    assetInFocus: "PETR4 / WTI Crude",
    action: "Call Ladder Hedge",
    metrics: { var: "12.4%", exposure: "Alta", qscore: 8.7 }
  },
  {
    id: "agro",
    title: "Soja & Carne",
    subtitle: "Ciclos de Safra & Proteína",
    problem: "Quedas massivas na taxa de exportação devido à super safra chinesa ou embargos que derrubam o preço pago ao produtor (basis) abaixo do custo de produção local.",
    solution: "Implementação combinada de Net Short Futures no milho/soja para blindar as quedas (Forward Sales sintéticas) e Put Spreads para limitar caudas severas, protegendo a balança do produtor.",
    assetInFocus: "ZC (Corn) / ZS (Soybean)",
    action: "Protective Put Spread",
    metrics: { var: "8.1%", exposure: "Moderada", qscore: 7.2 }
  },
  {
    id: "minerais",
    title: "Esmeraldas & Nióbio",
    subtitle: "Ativos Alternativos Puros",
    problem: "Falta de liquidez de tela (derivativos limitados) somada a uma volatilidade extrema ligada a ciclos macroeconômicos tech e mercado de luxo global.",
    solution: "Utilização de proxies altamente correlacionados em ETFs globais e ações de mineradoras locais (como CMOC/Niobras ou Vale) para construir um delta tracking que mimetiza e protege o impacto de preço no Brasil.",
    assetInFocus: "VALE3 / Proxies",
    action: "Delta Tracking Proxy",
    metrics: { var: "15.8%", exposure: "Ultra-High", qscore: 9.1 }
  }
];

export default function CommodityHedgeTabs() {
  const [activeTab, setActiveTab] = useState(hedgeTabs[0].id);

  const activeData = hedgeTabs.find(t => t.id === activeTab) || hedgeTabs[0];

  return (
    <div className="w-full flex justify-center py-12">
      <div className="w-full max-w-5xl">
        
        {/* Tabs Header */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-8 border-b border-white/5 pb-4">
          {hedgeTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-sm tracking-widest uppercase transition-all duration-300 relative ${
                activeTab === tab.id ? "text-primary font-display" : "text-white/40 font-light hover:text-white/70"
              }`}
            >
              {tab.title}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-primary"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-[#08090c] border border-white/5 p-6 sm:p-10 relative overflow-hidden min-h-[400px]">
          {/* Ambient Glow tied to active tab */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={activeData.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10"
            >
              {/* Left Column (Texts) */}
              <div className="col-span-1 lg:col-span-7">
                <p className="text-[10px] text-primary/60 tracking-[0.3em] uppercase mb-4">
                  {activeData.subtitle}
                </p>
                <h3 className="font-display text-4xl text-white mb-8 tracking-widest uppercase">
                  {activeData.title}
                </h3>
                
                <div className="space-y-8">
                  <div>
                    <h4 className="text-xs text-[#F44336] uppercase tracking-widest mb-2 border-b border-[#F44336]/20 pb-2">O Problema (Assimetria Negativa)</h4>
                    <p className="text-muted-foreground font-light text-sm leading-relaxed">
                      {activeData.problem}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-xs text-[#4CAF50] uppercase tracking-widest mb-2 border-b border-[#4CAF50]/20 pb-2">A Solução Aeternum (Hedge)</h4>
                    <p className="text-foreground/80 font-light text-sm leading-relaxed">
                      {activeData.solution}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column (Metrics Terminal) */}
              <div className="col-span-1 lg:col-span-5 h-full flex items-center justify-center lg:justify-end">
                <div className="border border-primary/20 bg-primary/5 p-6 w-full relative">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                  
                  <p className="text-[10px] text-primary/60 tracking-widest uppercase mb-6 text-center">Protocolo Operacional</p>
                  
                  <div className="space-y-4 font-mono">
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-xs text-white/40">Foco do Ativo:</span>
                      <span className="text-sm text-primary">{activeData.assetInFocus}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-xs text-white/40">Estrutura (Ação):</span>
                      <span className="text-sm text-white/90">{activeData.action}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-xs text-white/40">Value at Risk (VaR):</span>
                      <span className="text-sm text-[#F44336]">{activeData.metrics.var}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-primary/10 pb-2">
                      <span className="text-xs text-white/40">Q-Score MenthorQ:</span>
                      <span className="text-sm text-[#4CAF50]">{activeData.metrics.qscore}/10</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-4 border-t border-primary/10">
                    <div className="w-full bg-black/40 h-10 border border-primary/20 flex items-center justify-center overflow-hidden relative group cursor-crosshair">
                      <div className="absolute inset-0 bg-primary/10 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-700 ease-out" />
                      <span className="text-[10px] text-primary uppercase tracking-widest relative z-10 group-hover:text-black transition-colors">Inicializar Monitoramento Tático</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
