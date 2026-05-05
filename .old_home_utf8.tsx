import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Hero from "../components/common/Hero";
import ZonaPiloto from "../components/common/ZonaPiloto";
import CTA from "../components/common/CTA";
import Footer from "../components/common/Footer";
import AnimatedCounter from "../components/common/AnimatedCounter";
import { FadeIn } from "../components/common/FadeIn";

const metrics = [
  { value: "US$ 2.4M", label: "Ativos sob gest├úo" },
  { value: "28.2%", label: "Retorno m├®dio anual" },
  { value: "0.94", label: "├ìndice Sharpe" },
  { value: "23+", label: "Anos de experi├¬ncia" },
];

const accessTiers = [
  {
    id: "circle",
    name: "Aeternum Circle",
    audience: "Grandes capitalistas e investidores institucionais",
    description: "O n├¡vel mais exclusivo para quem constr├│i imp├®rio de capital duradouro.",
    benefits: [
      "Acesso total aos modelos quantitativos propriet├írios",
      "Portal privado com an├ílises di├írias de risco macro",
      "Conex├úo direta com especialistas em prote├º├úo de capital",
      "Sinais de entrada/sa├¡da em crises pol├¡ticas e financeiras",
      "Acessibilidade a ISO 20022 e fluxos institucionais",
      "Consultoria personalizada trimestral",
      "├ìndice Sharpe 0.94+",
    ],
    price: "Sob consulta",
    cta: "Solicitar Acesso",
    highlight: true,
  },
  {
    id: "partners",
    name: "Strategic Partners",
    audience: "Afiliados, consultores e analistas",
    description: "Para quem quer distribuir intelig├¬ncia institucional com nosso suporte.",
    benefits: [
      "Biblioteca de an├ílises macro quantitativas",
      "Dados de fluxo Brasil-EUA em tempo real",
      "Modelos de prote├º├úo assim├®trica de capital",
      "Dashboards customiz├íveis",
      "Suporte t├®cnico dedicado",
      "Comiss├úo em cada indica├º├úo ativa",
      "Updates semanais de intelig├¬ncia",
    ],
    price: "A partir de R$ 5.000/m├¬s",
    cta: "Virar Parceiro",
    highlight: false,
  },
  {
    id: "access",
    name: "Intelligence Access",
    audience: "Traders em forma├º├úo e jovens analistas",
    description: "Para quem quer aprender e acompanhar os melhores modelos do mercado.",
    benefits: [
      "Acesso aos relat├│rios de intelig├¬ncia macro",
      "Hist├│rico de an├ílises e correla├º├Áes",
      "Webin├írios mensais sobre modelos quantitativos",
      "Comunidade privada com especialistas",
      "An├ílise de fluxos agro-institucionais",
      "Ferramentas de backtesting b├ísicas",
      "Certificado de conclus├úo dispon├¡vel",
    ],
    price: "R$ 299/m├¬s",
    cta: "Come├ºar Agora",
    highlight: false,
  },
];

export default function Home() {
  const metricsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: metricsProgress } = useScroll({
    target: metricsRef,
    offset: ["start end", "end start"],
  });
  const metricsY = useTransform(metricsProgress, [0, 1], ["5%", "-5%"]);

  const [hoveredTier, setHoveredTier] = useState<string | null>(null);

  return (
    <main className="pt-14">
      {/* HERO: full viewport with parallax */}
      <Hero />

      {/* METRICS: parallax strip with animated counters - right after Hero */}
      <section
        ref={metricsRef}
        className="py-20 border-y border-white/5 bg-background relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px shimmer-line" />
        <motion.div style={{ y: metricsY }} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 divide-x divide-white/5">
            {metrics.map((m, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="none">
                <div className="text-center px-4">
                  <AnimatedCounter
                    value={m.value}
                    className="font-display sm:text-4xl lg:text-5xl text-primary mb-3 text-center text-[35px]"
                  />
                  <div className="font-sans text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
                    {m.label}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </motion.div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px shimmer-line" />
      </section>

      {/* QUEM SOMOS */}
      <section className="py-24 border-b border-white/5 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl sm:text-5xl text-primary mb-4 uppercase tracking-widest">
                Quem Somos
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/20 mx-auto" />
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-3xl mx-auto">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6">
                A <span className="text-primary font-semibold">Aeternum Aurum</span> ├® uma plataforma privada de intelig├¬ncia macro quantitativa, dedicada a proteger e multiplicar capital em cen├írios desafiadores. Especializamos em identificar crises pol├¡ticas e financeiras antes que impactem os mercados, enquanto constru├¡mos a ponte estrat├®gica entre o agroneg├│cio brasileiro e os mercados institucionais americanos.
              </p>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Nosso diferencial ├® simples: n├úo especulamos. N├│s constru├¡mos, analisamos e protegemos riqueza duradoura atrav├®s de modelos quantitativos de classe mundial e intelig├¬ncia que funciona nos piores cen├írios.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* O QUE FAZEMOS */}
      <section className="py-24 border-b border-white/5 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl sm:text-5xl text-primary mb-4 uppercase tracking-widest">
                O Que Fazemos
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/20 mx-auto" />
            </div>
          </FadeIn>

          <FadeIn delay={0.2} direction="up">
            <div className="max-w-3xl mx-auto">
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="w-1 h-24 bg-gradient-to-b from-primary to-primary/20 mt-1" />
                  <div>
                    <h3 className="text-lg font-display text-primary mb-2 uppercase tracking-wider">
                      Intelig├¬ncia Institucional
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      An├ílise de fluxos de capital, movimenta├º├Áes institucionais e trends macro que impactam portf├│lios.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-1 h-24 bg-gradient-to-b from-primary to-primary/20 mt-1" />
                  <div>
                    <h3 className="text-lg font-display text-primary mb-2 uppercase tracking-wider">
                      Modelos Quantitativos
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Algoritmos propriet├írios testados em 23+ anos de crises, bolhas e mudan├ºas de regime de mercado.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-1 h-24 bg-gradient-to-b from-primary to-primary/20 mt-1" />
                  <div>
                    <h3 className="text-lg font-display text-primary mb-2 uppercase tracking-wider">
                      ISO 20022 & Padr├Áes Institucionais
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Estrutura├º├úo de dados secondo os padr├Áes de liquida├º├úo global, conectando Brasil aos mercados americanos.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-1 h-24 bg-gradient-to-b from-primary to-primary/20 mt-1" />
                  <div>
                    <h3 className="text-lg font-display text-primary mb-2 uppercase tracking-wider">
                      Prote├º├úo Assim├®trica de Capital
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Estrat├®gias que ganham em crises, ganham em altas e minimizam perdas ÔÇö com Sharpe 0.94.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* N├ìVEIS DE ACESSO */}
      <section className="py-24 border-b border-white/5 bg-background relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn direction="up">
            <div className="text-center mb-16">
              <h2 className="font-display text-4xl sm:text-5xl text-primary mb-4 uppercase tracking-widest">
                Escolha Seu N├¡vel de Acesso
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-primary/20 mx-auto" />
              <p className="text-muted-foreground text-base mt-6 max-w-2xl mx-auto">
                Tr├¬s n├¡veis premium de acesso ├á intelig├¬ncia quantitativa de classe mundial.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-6">
            {accessTiers.map((tier, i) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                onMouseEnter={() => setHoveredTier(tier.id)}
                onMouseLeave={() => setHoveredTier(null)}
                className={`relative group rounded-sm border transition-all duration-300 ${
                  tier.highlight
                    ? "border-primary/60 bg-gradient-to-b from-primary/10 to-primary/5 shadow-2xl shadow-primary/20"
                    : hoveredTier === tier.id
                    ? "border-primary/40 bg-white/8"
                    : "border-white/10 bg-white/5"
                } ${tier.highlight ? "scale-105 md:scale-110" : ""} p-8`}
              >
                {/* Badge */}
                {tier.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-primary to-primary/70 px-3 py-1 rounded-full text-xs font-bold text-background uppercase tracking-wider">
                      Mais Exclusivo
                    </div>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <h3 className="font-display text-2xl text-primary mb-2 uppercase tracking-wider">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-primary/70 font-semibold mb-3">{tier.audience}</p>
                  <p className="text-muted-foreground text-sm">{tier.description}</p>
                </div>

                {/* Price */}
                <div className="mb-8 py-6 border-y border-white/10">
                  <p className="font-display text-3xl text-primary font-bold mb-1">
                    {tier.price}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">
                    Acesso completo a todas as ferramentas
                  </p>
                </div>

                {/* Benefits */}
                <div className="mb-8 space-y-3">
                  {tier.benefits.map((benefit, j) => (
                    <motion.div
                      key={j}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + j * 0.05 }}
                      className="flex gap-3 items-start"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{benefit}</span>
                    </motion.div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-4 rounded-sm font-display uppercase tracking-wider text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 group/btn ${
                    tier.highlight
                      ? "bg-primary text-background hover:shadow-lg hover:shadow-primary/30"
                      : hoveredTier === tier.id
                      ? "bg-primary/20 text-primary border border-primary/40 hover:bg-primary/30"
                      : "bg-white/10 text-primary border border-white/15 hover:bg-white/15"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ZONA PILOTO: world map (Fluxo Macro) - KEEP AT END */}
      <ZonaPiloto />

      {/* CTA */}
      <CTA />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
