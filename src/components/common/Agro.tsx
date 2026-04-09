import { FadeIn } from "./FadeIn";
import { Wheat, TrendingUp, BarChart2, Droplets } from "lucide-react";
import { motion } from "framer-motion";

const commodities = [
  { icon: Wheat, title: "Grãos & Oleaginosas", desc: "Soja, milho, trigo e derivados. Análise de ciclos de safra, estoques globais e arbitragem entre praças." },
  { icon: Droplets, title: "Energia & Petróleo", desc: "WTI, Brent, gás natural e renováveis. Exposição via futuros e estruturas de volatilidade." },
  { icon: TrendingUp, title: "Metais Preciosos", desc: "Ouro, prata e platina como reserva de valor e proteção contra instabilidade monetária." },
  { icon: BarChart2, title: "Soft Commodities", desc: "Café, açúcar, algodão e cacau. Vantagem comparativa em mercados com assimetria de informação." },
];

export default function Agro() {
  return (
    <section id="parceria" className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 border-t border-white/5 bg-card/20">
      <div className="max-w-6xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-3xl sm:text-4xl text-primary text-center mb-4 tracking-widest uppercase">
            Commodities & Agro
          </h2>
          <p className="text-center text-muted-foreground text-xs tracking-widest uppercase mb-16">
            Expertise em mercados de matérias-primas globais
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
          {commodities.map((item, i) => (
            <FadeIn key={i} delay={i * 0.15}>
              <motion.div
                className="flex gap-5 p-6 border border-white/5 bg-background hover:bg-white/[0.015] transition-colors rounded-sm group relative overflow-hidden"
                whileHover="hovered"
              >
                {/* Subtle gold glow on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent pointer-events-none"
                  variants={{ hovered: { opacity: 1 } }}
                  initial={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
                <div className="shrink-0 w-10 h-10 border border-primary/20 group-hover:border-primary/40 flex items-center justify-center transition-all duration-300 relative z-10">
                  <item.icon className="w-4 h-4 text-primary" strokeWidth={1.5} />
                </div>
                <div className="relative z-10">
                  <h4 className="font-display text-base text-foreground tracking-wider uppercase mb-2 group-hover:text-primary/90 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
