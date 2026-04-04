import { motion } from "framer-motion";
import { FadeIn } from "@/components/FadeIn";

const triade = [
  { num: "01", titulo: "Desvalorização Monetária", desc: "Preservação de poder de compra via Hard Assets físicos e derivativos lastreados em commodities reais.", icone: "◈" },
  { num: "02", titulo: "Volatilidade Física", desc: "Hedge contra oscilações de preços de insumos e produtos agropecuários, minerais e energéticos.", icone: "◈" },
  { num: "03", titulo: "Risco Sistêmico", desc: "Blindagem contra crises bancárias e geopolíticas com ativos descorrelacionados do sistema financeiro tradicional.", icone: "◈" },
];

const commodities = ["Ouro", "Petróleo", "Gás Natural", "Metais Industriais", "Commodities Agro"];

export default function EscudoReal() {
  return (
    <div className="relative border border-white/5 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(198,167,92,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,167,92,1) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
      <div className="relative z-10 px-8 pt-10 pb-8 border-b border-white/5">
        <FadeIn>
          <p className="text-[9px] text-muted-foreground/40 tracking-[0.35em] uppercase mb-3">Proteção Patrimonial</p>
          <h2 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest leading-tight">O Escudo Real</h2>
          <p className="font-display text-xl text-foreground/60 uppercase tracking-widest mt-1">Commodities &amp; Hedge</p>
        </FadeIn>
      </div>
      <div className="relative z-10 px-8 py-10">
        <FadeIn delay={0.1}>
          <p className="text-[10px] text-muted-foreground/50 tracking-[0.3em] uppercase mb-6">Proteção contra a Tríade de Risco</p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {triade.map((item, i) => (
            <FadeIn key={i} delay={0.15 + i * 0.12}>
              <motion.div whileHover={{ borderColor: "rgba(198,167,92,0.25)" }} className="group relative p-6 border border-white/5 bg-card/40 hover:bg-card/70 transition-all duration-500 cursor-default">
                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-primary/0 group-hover:border-primary/25 transition-colors duration-500" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-primary/0 group-hover:border-primary/25 transition-colors duration-500" />
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-display text-xs text-primary/40 tracking-widest">{item.num}</span>
                  <div className="h-px flex-1 bg-white/5" />
                </div>
                <p className="font-display text-lg text-primary tracking-wide leading-snug mb-3">{item.titulo}</p>
                <p className="text-muted-foreground text-xs leading-relaxed font-light">{item.desc}</p>
                <motion.div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" initial={{ opacity: 0, scaleX: 0 }} whileHover={{ opacity: 1, scaleX: 1 }} transition={{ duration: 0.3 }} />
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
      <FadeIn delay={0.5}>
        <div className="relative z-10 border-t border-white/5 bg-primary/4 px-8 py-4 overflow-hidden">
          <div className="flex items-center gap-0 flex-wrap sm:flex-nowrap">
            {commodities.map((c, i) => (
              <div key={i} className="flex items-center gap-0 shrink-0">
                <span className="font-display text-sm text-primary/80 tracking-widest px-4 uppercase hover:text-primary transition-colors cursor-default">{c}</span>
                {i < commodities.length - 1 && <span className="text-primary/20 text-xs">·</span>}
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
