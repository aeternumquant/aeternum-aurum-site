import { motion } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";

const alvo = [
  { valor: "200+", titulo: "Produtores Segurados", desc: "Grandes produtores com cobertura de hedge digital ativa dentro do ciclo de 18 meses." },
  { valor: "Milhões", titulo: "Em Ativos Reais Hedgeados", desc: "Capital real em commodities e propriedades protegido digitalmente contra volatilidade." },
  { valor: "Expandido", titulo: "Vínculos Bilaterais EUA", desc: "Linkagens comerciais Brasil–EUA ampliadas via estrutura de custódia e execução americana." },
];

const motor = [
  { titulo: "Sobrevivência > Alpha", subtitulo: "Capital Preservation First", desc: "Enfatiza a preservação de capital acima da especulação. O elemento humano do pânico é inteiramente removido do processo decisório.", cor: "border-primary/30" },
  { titulo: "Motor de Risco Dinâmico", subtitulo: "Dynamic Portfolio Risk Engine", desc: "Calcula continuamente a exposição total do portfólio e rebalanceia automaticamente para evitar concentração excessiva em qualquer ativo.", cor: "border-primary/20" },
  { titulo: "Circuit Breakers Imutáveis", subtitulo: "Hard-Coded Circuit Breakers", desc: "Pausas matemáticas e automatizadas ativadas a cada drawdown diário de 5%. Prova confiabilidade institucional com risco zero de ruína total.", cor: "border-primary/12" },
];

export default function GovernancaEstrategica() {
  return (
    <div className="relative border border-white/5 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: "radial-gradient(rgba(198,167,92,1) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
      <div className="relative z-10 px-8 pt-10 pb-8 border-b border-white/5">
        <FadeIn>
          <p className="text-[9px] text-muted-foreground/40 tracking-[0.35em] uppercase mb-3">18 Meses de Resultado</p>
          <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest leading-tight">Impacto Estratégico</h2>
          <p className="font-display text-xl text-foreground/60 uppercase tracking-widest mt-1">Governança Absoluta</p>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-2xl mt-4">Entregando resiliência econômica tangível ao longo de 18 meses, governada por protocolos de risco de grau institucional rigorosos.</p>
        </FadeIn>
      </div>
      <div className="relative z-10 px-8 pt-10 pb-8 border-b border-white/5">
        <FadeIn delay={0.1}><p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase mb-8">O Alvo de 18 Meses</p></FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
          {alvo.map((item, i) => (
            <FadeIn key={i} delay={0.15 + i * 0.12}>
              <motion.div whileHover={{ backgroundColor: "rgba(255,255,255,0.015)" }} className="px-6 py-5 first:pl-0 last:pr-0 transition-colors duration-300">
                <div className="font-display text-4xl text-primary mb-1 leading-none text-center">{item.valor}</div>
                <div className="text-[9px] text-muted-foreground/50 tracking-widest uppercase mb-3">{item.titulo}</div>
                <p className="text-muted-foreground font-light text-center text-[11px]">{item.desc}</p>
              </motion.div>
            </FadeIn>
          ))}
        </div>
        <FadeIn delay={0.5}>
          <p className="mt-6 text-[10px] text-muted-foreground/35 font-light leading-relaxed border-t border-white/5 pt-5 italic">Resultados imediatos e tangíveis que mobilizam benefícios futuros, garantindo que a resiliência digital sobreviva ao ciclo inicial.</p>
        </FadeIn>
      </div>
      <div className="relative z-10 px-8 py-10">
        <FadeIn delay={0.2}><p className="text-[10px] text-muted-foreground/40 tracking-[0.3em] uppercase mb-8">O Motor de Execução · O Cadeado</p></FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {motor.map((item, i) => (
            <FadeIn key={i} delay={0.25 + i * 0.12}>
              <motion.div whileHover={{ borderColor: "rgba(198,167,92,0.3)" }} className={`group relative p-6 border bg-card/30 hover:bg-card/60 transition-all duration-500 ${item.cor}`}>
                <div className="absolute top-0 right-0 w-5 h-5 overflow-hidden">
                  <div className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-t-primary/10 border-l-[20px] border-l-transparent" />
                </div>
                <p className="font-display text-base text-primary tracking-wide leading-snug mb-1">{item.titulo}</p>
                <p className="text-[8px] text-muted-foreground/35 tracking-widest uppercase mb-4">{item.subtitulo}</p>
                <p className="text-muted-foreground text-xs font-light leading-relaxed">{item.desc}</p>
                <motion.div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent" initial={{ scaleX: 0 }} whileHover={{ scaleX: 1 }} transition={{ duration: 0.4 }} />
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
