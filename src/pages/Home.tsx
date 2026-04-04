import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Hero from "@/components/Hero";
import FrameworkSection from "@/components/Framework";
import Allocation from "@/components/Allocation";
import ZonaPiloto from "@/components/ZonaPiloto";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import AnimatedCounter from "@/components/AnimatedCounter";
import { FadeIn } from "@/components/FadeIn";

const metrics = [
  { value: "US$ 2.4M", label: "Ativos sob gestão" },
  { value: "28.2%", label: "Retorno médio anual" },
  { value: "0.94", label: "Índice Sharpe" },
  { value: "23+", label: "Anos de experiência" },
];

export default function Home() {
  const metricsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: metricsProgress } = useScroll({
    target: metricsRef,
    offset: ["start end", "end start"],
  });
  const metricsY = useTransform(metricsProgress, [0, 1], ["5%", "-5%"]);

  return (
    <main className="pt-14">
      {/* HERO: full viewport with parallax */}
      <Hero />

      {/* FRAMEWORK: scroll-driven card reveals */}
      <FrameworkSection />

      {/* ALLOCATION: animated bars */}
      <Allocation />

      {/* ZONA PILOTO: cities, commodities, map */}
      <ZonaPiloto />

      {/* METRICS: parallax strip with animated counters */}
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

      {/* CTA */}
      <CTA />

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
