import { useRef } from "react";
import { Globe, LineChart, ShieldAlert } from "lucide-react";
import { FadeIn } from "./FadeIn";
import { motion, useScroll, useTransform, useInView } from "framer-motion";

const cards = [
  {
    icon: Globe,
    title: "Análise Macro Global",
    subtitle: "Fluxos de capital, política monetária, ciclos.",
    desc: "Leitura sistemática do contexto macro que determina o comportamento dos ativos: política monetária dos principais bancos centrais, fluxos de capital entre regiões, ciclos de commodities, choques de oferta e dinâmica de taxa de câmbio. Calibração contínua para o mercado brasileiro, com integração de indicadores BCB, CEPEA e séries internacionais.",
  },
  {
    icon: LineChart,
    title: "Eventos e Descontinuidades",
    subtitle: "Quebras estruturais, regimes, choques.",
    desc: "Análise dos eventos que rompem a continuidade estatística do mercado: mudanças de regime, choques geopolíticos, decisões regulatórias, quebras de safra, crises de liquidez. Modelos de detecção de regime e testes de quebra estrutural informam quando os parâmetros clássicos deixam de valer.",
  },
  {
    icon: ShieldAlert,
    title: "Risco Quantitativo",
    subtitle: "Cauda, dependência, drawdown.",
    desc: "Medição rigorosa do risco em todas as suas dimensões: risco de cauda, dependência entre ativos, drawdown máximo, exposição condicional. Cada portfólio é avaliado contra benchmarks de risco coerente e seu comportamento em cenários históricos e hipotéticos.",
  },
];

function FrameworkCard({ item, index }: { item: typeof cards[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50, filter: "blur(6px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : {}
      }
      transition={{
        duration: 0.9,
        delay: index * 0.2,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
      whileHover="hovered"
      className="group h-full p-8 border border-white/5 bg-card hover:bg-white/[0.02] transition-colors duration-500 rounded-sm relative overflow-hidden"
    >
      {/* Animated gold border on hover */}
      <motion.div
        className="absolute inset-0 rounded-sm pointer-events-none"
        style={{ border: "1px solid transparent" }}
        variants={{
          hovered: {
            borderColor: "rgba(198,167,92,0.2)",
            boxShadow: "inset 0 0 30px rgba(198,167,92,0.03), 0 0 20px rgba(198,167,92,0.03)",
          },
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-primary/0 group-hover:border-primary/20 transition-colors duration-500" />
      <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-primary/0 group-hover:border-primary/20 transition-colors duration-500" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-sm bg-primary/10 flex items-center justify-center mb-6 border border-primary/20 group-hover:border-primary/40 group-hover:bg-primary/15 transition-all duration-500">
          <item.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2 tracking-wider uppercase">{item.title}</h3>
        <p className="text-primary/70 text-xs tracking-wide mb-4">{item.subtitle}</p>
        <p className="text-muted-foreground text-sm leading-relaxed font-light">{item.desc}</p>
      </div>

      {/* Bottom shimmer line */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        variants={{ hovered: { scaleX: 1, opacity: 1 } }}
        initial={{ scaleX: 0, opacity: 0 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  );
}

export default function FrameworkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Subtle parallax on the whole section
  const sectionY = useTransform(scrollYProgress, [0, 1], ["3%", "-3%"]);

  return (
    <section
      ref={sectionRef}
      id="framework"
      className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5 relative bg-card/30 overflow-hidden"
    >
      <motion.div style={{ y: sectionY }} className="max-w-6xl mx-auto">
        <FadeIn>
          <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
            Domínios de competência
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-primary text-center mb-6 tracking-widest uppercase">
            Os três eixos da análise quantitativa Aeternum
          </h2>
          <p className="text-center text-muted-foreground text-sm leading-relaxed max-w-2xl mx-auto mb-16 font-light">
            Toda decisão de risco passa por três perguntas diferentes: o que o cenário macro está dizendo,
            o que pode acontecer de descontinuidade, e o que o risco mede em cada portfólio. Cada uma exige
            um conjunto de modelos próprio, e a plataforma trabalha os três em paralelo.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {cards.map((item, i) => (
            <FrameworkCard key={i} item={item} index={i} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}
