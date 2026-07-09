import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CursorGlow from "../components/common/CursorGlow";
import Footer from "../components/common/Footer";
import Hero from "../components/common/Hero";
import ManifestoSection from "../components/home/ManifestoSection";
import ZonaPiloto from "../components/common/ZonaPiloto";
import ExportCalculator from "../components/tokenization/ExportCalculator";
import { RouteSeo } from "../lib/seo/RouteSeo";

const GOLD = "#C6A85A";

const RevealSection = ({ children, delay = 0, className = "" }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default function Home() {
  const navigate = useNavigate();
  return (
    <main className="relative" style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      <RouteSeo
        title="Plataforma de Inteligência Quantitativa"
        fullTitle="Aeternum Aurum Partners — Plataforma de Inteligência Quantitativa"
        description="Plataforma de tecnologia quantitativa para clientes institucionais. Foundation Models, Engenharia de Volatilidade, Inferência Bayesiana e Derivativos Climáticos. Goiânia, Brasil — atuação global."
        path="/"
      />
      {/* Efeito de luz dourada que segue o mouse */}
      <CursorGlow />
      
      {/* Hero CNAE-safe (common/Hero.tsx) */}
      <Hero />

      {/* Manifesto (substitui a antiga seção "abordagem") */}
      <ManifestoSection />

      {/* Os 4 Pilares */}
      <section id="pilares" className="relative z-10 py-10 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Inteligência Institucional", desc: "Análise de fluxos de capital, movimentações institucionais e trends macro que impactam portfólios." },
              { title: "Modelos Quantitativos", desc: "Algoritmos proprietários testados em 23+ anos de crises, bolhas e mudanças de regime de mercado." },
              { title: "ISO 20022 & Padrões", desc: "Estruturação de dados segundo os padrões de liquidação global, conectando Brasil aos mercados americanos." },
              { title: "Proteção Assimétrica", desc: "Estratégias que ganham em crises, ganham em altas e minimizam perdas — com histórico comprovado." }
            ].map((pilar, i) => (
              <RevealSection key={i} delay={i * 0.1}>
                <div className="p-6 h-full bg-[#0A0A0A] border border-[#C6A85A]/20 hover:border-[#C6A85A]/55 hover:bg-[#C6A85A]/[0.03] transition-all duration-300 rounded-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#C6A85A]/0 to-[#C6A85A]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    <h3 className="font-sans font-medium uppercase tracking-[0.18em] text-[10px] text-[#C6A85A] mb-3">
                      {pilar.title}
                    </h3>
                    <p className="text-white/45 text-xs leading-relaxed font-light">
                      {pilar.desc}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* Mapa Global logo abaixo de Nossa Abordagem */}
      <div className="relative z-10 pt-4 pb-16">
        <RevealSection delay={0.2}>
          <ZonaPiloto />
        </RevealSection>
      </div>

      <ExportCalculator />

      {/* Seção: Risco no Mercado */}
      <section id="risco-mensuravel" className="relative z-10 py-16 px-4 sm:px-6 bg-[#0a0a0a]/50 border-y border-white/5">
        <RevealSection>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl sm:text-4xl font-display font-light text-[#C6A85A] mb-4 leading-snug">
              No mercado de commodities, não há recompensa para quem não mede o risco.
            </h3>
            <div className="h-[1px] w-16 bg-[#C6A85A]/40 mx-auto my-6" />
            <p className="text-white/60 text-sm sm:text-base font-light max-w-3xl mx-auto">
              Operações desprotegidas estão à mercê da volatilidade global. Nossa infraestrutura quantitativa transforma incerteza em risco mensurável, permitindo a proteção sistemática do seu capital através de modelos matemáticos validados internacionalmente.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* Seção: Proteção Mensurável (3 Passos) */}
      <section id="metodologia" className="relative z-10 py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <RevealSection>
            <div className="text-center mb-16">
              <h2 className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#C6A85A] mb-4">A Metodologia</h2>
              <p className="text-2xl sm:text-4xl font-display font-light text-[#C6A85A]">Não vendemos previsão. <br className="hidden sm:block"/>Vendemos proteção mensurável.</p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Captura de Dados",
                desc: "Monitoramento em tempo real de fluxos logísticos, prêmios físicos, macroeconomia global e métricas de formadores de mercado em múltiplas bolsas."
              },
              {
                step: "02",
                title: "Engenharia Quantitativa",
                desc: "Processamento via GARCH, Machine Learning e análise de volatilidade estocástica para identificar assimetrias e anomalias de precificação."
              },
              {
                step: "03",
                title: "Blindagem de Capital",
                desc: "Execução algorítmica de estruturas de hedge de precisão (Opções e Futuros) projetadas para limitar o risco sistêmico mantendo o potencial de alta."
              }
            ].map((item, i) => (
              <RevealSection key={i} delay={i * 0.2}>
                <div className="group relative p-8 bg-[#0a0a0a] border border-white/5 hover:border-[#d4af37]/30 transition-all duration-500 rounded-sm h-full overflow-hidden flex flex-col justify-between">
                  {/* Subtle hover background glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-[#d4af37]/0 to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative z-10">
                    <div className="text-4xl font-display font-light text-white/10 group-hover:text-[#C6A85A]/20 transition-colors duration-500 mb-6">
                      {item.step}
                    </div>
                    <h3 className="text-lg text-white font-display uppercase tracking-widest mb-4 group-hover:text-[#C6A85A] transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/50 leading-relaxed font-light group-hover:text-white/70 transition-colors duration-300">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
          
          <RevealSection delay={0.8} className="mt-16 text-center">
             <button
                onClick={() => navigate('/tecnologia')}
                className="px-8 py-3 bg-transparent border border-white/10 hover:border-[#C6A85A] hover:bg-[#C6A85A]/5 text-white text-[10px] tracking-[0.2em] uppercase transition-all duration-300 rounded-sm hover:shadow-[0_0_15px_rgba(198,168,90,0.12)]"
            >
                Ver Plataforma Completa
             </button>
          </RevealSection>
        </div>
      </section>

      <Footer />
    </main>
  );
}
