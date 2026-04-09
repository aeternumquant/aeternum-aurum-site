import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const terminalTabs = [
  {
    id: "graos",
    title: "Grãos & Oleaginosas",
    subtitle: "Soja, Milho, Trigo e Derivados",
    context: "Análise quantitativa de ciclos de safra e arbitragem espacial. Monitoramos a assimetria climática no cinturão do meio-oeste dos EUA e os fluxos de custódia na CME.",
    geo: "Tensões no Mar Negro afetam 30% das exportações globais de trigo. A política comercial de retenção portuária cria spreads estruturais massivos inter-mercados.",
    stellar: "Protocolos e Tokenização de recibos de depósito agropecuário (CDA/WA) na rede Stellar. Permite a liquidação atômica e reduz a curva de financiamento bancário corporativo a zero via smart contracts.",
    stats: { importers: "China, UE, Egito", exporters: "Brasil, EUA, Rússia", var: "8.5%", trend: "Contango" }
  },
  {
    id: "energia",
    title: "Energia & Petróleo",
    subtitle: "WTI, Brent, Gás Natural",
    context: "A inelasticidade da demanda de curto prazo aliada a choques estruturais formam prêmios de risco maciços. Foco de predição via modelo neural nas curvas termo-estruturais.",
    geo: "Conflitos proxy no Oriente Médio e cortes táticos da OPEP+ afetam diretamente o spread Brent-WTI. As SPR (reservas dos EUA) agem como 'Put Walls' institucionais.",
    stellar: "Contratos de frete marítimo (Baltic Dry Index proxy) orquestrados em stablecoins com oráculos on-chain. Execução de hedge instantânea na doca confirmada em ~5s via Stellar ISO 20022.",
    stats: { importers: "UE, Japão, Índia", exporters: "EUA, Arábia Saudita, Rússia", var: "15.2%", trend: "Backwardation" }
  },
  {
    id: "metais",
    title: "Metais Preciosos",
    subtitle: "Ouro, Prata e Platina",
    context: "Operamos ouro como proxy de degradação da confiança fiscal global e hedge tail-risk absoluto contra a exaustão de ciclos da dívida norte-americana.",
    geo: "Desdolarização do Leste: Bancos Centrais em bloco acumulando fisicamente Ouro desde 2022. Exaustão de mineração e restrições de refino na Eurásia.",
    stellar: "Integração plena ao ecossistema de Real-World Assets (RWA). Barras auditadas Vault-Grade tokenizadas, conferindo 100% de mobilidade de liquidez algorítmica institucional na Ledger Stellar.",
    stats: { importers: "Bancos Centrais, Índia", exporters: "China, Austrália, Canadá", var: "6.8%", trend: "Uptrend Macro" }
  },
  {
    id: "softs",
    title: "Soft Commodities",
    subtitle: "Café, Açúcar, Algodão e Cacau",
    context: "Mercados de ineficiência e assimetria informacional extremas. Exploramos anomalias de spread originadas de sazonais climáticos preditivos (ENSO).",
    geo: "Estrangulamento nas cadeias de extração (como cacau na África Ocidental devido a pragas e regulação europeia) causando short squeezes históricos e precificação distópica na ICE.",
    stellar: "Pagamentos institucionais B2B efetuados via 'Cross-Border Anchors' da rede Stellar evitam a contaminação cambial de moedas emergentes, isolando o retorno real do commodity em USD-pegs.",
    stats: { importers: "EUA, União Europeia", exporters: "Brasil, Costa do Marfim, Índia", var: "18.4%", trend: "Short Squeeze" }
  }
];

export default function CommodityTerminal() {
  const [activeTab, setActiveTab] = useState(terminalTabs[0].id);
  const activeData = terminalTabs.find(t => t.id === activeTab) || terminalTabs[0];

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row border border-white/5 bg-[#08090c]">
           {/* Sidebar Navigation */}
           <div className="md:w-64 border-b md:border-b-0 md:border-r border-white/5 flex md:flex-col bg-card/20 overflow-x-auto md:overflow-visible">
              {terminalTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 text-left px-5 py-4 transition-colors relative ${activeTab === tab.id ? "bg-primary/5" : "hover:bg-white/5"}`}
                >
                  {activeTab === tab.id && (
                     <motion.div 
                       layoutId="terminalActiveIndicator"
                       className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary hidden md:block"
                     />
                  )}
                  {activeTab === tab.id && (
                     <motion.div 
                       layoutId="terminalActiveIndicatorMobile"
                       className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary md:hidden"
                     />
                  )}
                  <h5 className={`font-display tracking-widest text-[13px] uppercase ${activeTab === tab.id ? "text-primary" : "text-muted-foreground"}`}>{tab.title}</h5>
                  <p className="text-[9px] text-muted-foreground/50 uppercase mt-0.5 tracking-wider hidden md:block">{tab.subtitle}</p>
                </button>
              ))}
           </div>

           {/* Content Area */}
           <div className="flex-1 p-6 sm:p-10 relative overflow-hidden backdrop-blur-md">
              <AnimatePresence mode="wait">
                 <motion.div
                    key={activeData.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                 >
                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                        <div>
                           <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-2">{activeData.subtitle}</p>
                           <h3 className="font-display text-3xl sm:text-4xl text-foreground uppercase tracking-widest">{activeData.title}</h3>
                        </div>
                        <div className="text-right hidden sm:block">
                           <div className="text-[10px] text-primary/50 tracking-wider uppercase">Trend</div>
                           <div className="font-display text-lg text-primary">{activeData.stats.trend}</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                        {/* Geo and Context */}
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[10px] text-primary/60 tracking-widest uppercase mb-2">Análise Macro & Contexto</h4>
                                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                                    {activeData.context}
                                </p>
                            </div>
                            <div className="p-4 border border-[#F44336]/20 bg-[#F44336]/5">
                                <h4 className="text-[10px] text-[#F44336]/80 tracking-widest uppercase mb-2 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#F44336]"></span> Tensão Geopolítica</h4>
                                <p className="text-sm font-light text-[#F44336]/70 leading-relaxed">
                                    {activeData.geo}
                                </p>
                            </div>
                        </div>

                        {/* Tech & Data */}
                        <div className="space-y-6">
                            <div className="p-4 border border-[#4CAF50]/20 bg-[#4CAF50]/5">
                                <h4 className="text-[10px] text-[#4CAF50]/80 tracking-widest uppercase mb-2 flex items-center gap-2">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#4CAF50]"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                 Blockchain / Stellar Networks
                                </h4>
                                <p className="text-sm font-light text-[#4CAF50]/70 leading-relaxed">
                                    {activeData.stellar}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="border border-white/5 p-3 flex flex-col justify-center">
                                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mb-1">Maiores Exportadores</span>
                                    <span className="text-xs text-foreground/80 font-light">{activeData.stats.exporters}</span>
                                </div>
                                <div className="border border-white/5 p-3 flex flex-col justify-center">
                                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest mb-1">Maiores Importadores</span>
                                    <span className="text-xs text-foreground/80 font-light">{activeData.stats.importers}</span>
                                </div>
                                <div className="col-span-2 border border-white/5 p-3 flex items-center justify-between">
                                    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">Baseline Volatility (VaR)</span>
                                    <span className="text-sm font-display text-primary">{activeData.stats.var}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                 </motion.div>
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
}
