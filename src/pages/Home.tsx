import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { WireframeCube } from "../components/common/WireframeCube";
import CursorGlow from "../components/common/CursorGlow";
import Footer from "../components/common/Footer";
import ZonaPiloto from "../components/common/ZonaPiloto";

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

function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden bg-black pt-14">
      {/* Background texture */}
      <div
        className="absolute inset-0 z-0 opacity-70"
        style={{
          backgroundImage: "url(/hero-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/40 via-transparent to-black/70" />

      {/* Content — cube + text stacked vertically, like the original */}
      <motion.div style={{ y, opacity }} className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto w-full">

        {/* WireframeCube — above the title, inline, visible */}
        <motion.div
          className="mb-10 pointer-events-none select-none"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <WireframeCube className="w-[120px] h-[130px] sm:w-[140px] sm:h-[154px] md:w-[160px] md:h-[176px]" />
        </motion.div>

        {/* AETERNUM AURUM */}
        <div className="overflow-hidden mb-0">
          <motion.h1
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] text-foreground font-light leading-none"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            Aeternum Aurum
          </motion.h1>
        </div>

        {/* PARTNERS */}
        <div className="overflow-hidden mb-6">
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl uppercase tracking-[0.2em] font-light leading-none"
              style={{ color: "rgba(198, 168, 90, 0.90)" }}
            >
              Partners
            </span>
          </motion.div>
        </div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.0 }}
          className="font-sans text-[10px] sm:text-xs tracking-[0.3em] text-muted-foreground uppercase mb-0"
        >
          Plataforma Privada de Inteligência de Capital
        </motion.p>

        {/* Shimmer divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="w-24 sm:w-32 h-[1px] shimmer-line my-8"
        />

        {/* Pill tags */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.4 }}
          className="font-sans text-[9px] sm:text-[10px] tracking-[0.25em] text-muted-foreground uppercase flex items-center gap-2 sm:gap-4 flex-wrap justify-center"
        >
          <span>Global Macro</span>
          <span className="text-primary/40">|</span>
          <span>Event-Driven</span>
          <span className="text-primary/40">|</span>
          <span>Quantitative Risk</span>
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.9, duration: 1 }}
        style={{ opacity }}
      >
        <p className="text-[9px] tracking-widest uppercase text-white/30">Scroll</p>
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-[#C6A85A]/50">
          <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}


export default function Home() {
  return (
    <main className="relative" style={{ backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
      {/* Efeito de luz dourada que segue o mouse */}
      <CursorGlow />
      
      {/* Hero original com cubo 3D centralizado e os textos corretos */}
      <HeroSection />

      {/* Nossa Abordagem */}
      <section className="relative z-10 pt-20 pb-10 px-4 sm:px-6">
        <RevealSection>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-[#C6A85A] mb-4">Nossa Abordagem</h2>
            <p className="text-sm sm:text-base text-white/60 max-w-3xl mx-auto leading-relaxed font-light mb-6">
              A <span className="text-[#C6A85A] font-semibold">Aeternum Aurum</span> é uma plataforma privada de inteligência macro quantitativa, dedicada a proteger e multiplicar capital em cenários desafiadores. Especializamos em identificar crises políticas e financeiras antes que impactem os mercados, enquanto construímos a ponte estratégica entre o agronegócio brasileiro e os mercados institucionais americanos.
            </p>
            <p className="text-sm sm:text-base text-white/60 max-w-3xl mx-auto leading-relaxed font-light">
              Nosso diferencial é simples: não especulamos. Nós construímos, analisamos e protegemos riqueza duradoura através de modelos quantitativos de classe mundial e inteligência que funciona nos piores cenários.
            </p>
          </div>
        </RevealSection>
      </section>

      {/* Os 4 Pilares */}
      <section className="relative z-10 py-10 pb-16 px-4 sm:px-6">
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
      <section className="relative z-10 pt-4 pb-16">
        <RevealSection delay={0.2}>
          <ZonaPiloto />
        </RevealSection>
      </section>

      {/* Seção: Risco no Mercado */}
      <section className="relative z-10 py-16 px-4 sm:px-6 bg-[#0a0a0a]/50 border-y border-white/5">
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
      <section className="relative z-10 py-24 px-4 sm:px-6">
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
                onClick={() => window.location.href = '/execucao'} 
                className="px-8 py-3 bg-transparent border border-white/10 hover:border-[#C6A85A] hover:bg-[#C6A85A]/5 text-white text-[10px] tracking-[0.2em] uppercase transition-all duration-300 rounded-sm hover:shadow-[0_0_15px_rgba(198,168,90,0.12)]"
            >
                Ver Plataforma Completa
             </button>
          </RevealSection>
        </div>
      </section>

      {/* Disclaimer Institucional */}
      <section className="relative z-10 py-12 px-4 sm:px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-[10px] sm:text-xs text-white/40 uppercase tracking-widest mb-4">Disclaimer & Risk Disclosure</p>
          <p className="text-[9px] sm:text-[10px] text-white/30 leading-relaxed font-light text-justify sm:text-center max-w-5xl mx-auto">
            Aeternum Aurum Partners é uma plataforma de inteligência quantitativa e estruturação tecnológica focada em clientes institucionais e High-Net-Worth Individuals (HNWI). Não atuamos como corretora, gestora de recursos de terceiros (asset management) ou consultoria de valores mobiliários aberta ao público geral. Todas as informações, dados quantitativos e modelos preditivos disponibilizados na plataforma têm caráter estritamente educacional e de inteligência de mercado, não constituindo oferta, solicitação ou recomendação para compra ou venda de qualquer ativo financeiro, derivativo ou commodity. O mercado de commodities e derivativos envolve alto risco e pode não ser adequado para todos os investidores. Desempenho passado não é garantia de resultados futuros. As estratégias de proteção (hedge) e modelos GARCH apresentados são ilustrativos das capacidades tecnológicas da plataforma e dependem da execução por entidades reguladas nas respectivas jurisdições (CVM, SEC, CFTC). Ao solicitar acesso, o usuário atesta ter capacidade técnica e financeira para compreender os riscos sistêmicos inerentes aos mercados globais de capital.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
