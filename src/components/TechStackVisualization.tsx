import { motion } from "framer-motion";
import { useState } from "react";

const camadas = [
  { index: "01", rotulo: "Análise", nome: "MenthorQ", local: "Miami, FL", tag: "Motor Quantitativo", desc: "Processa 95% dos fluxos globais de derivativos para análise estrutural preditiva. Identifica exposição Net GEX e superfícies de volatilidade em todas as principais classes de ativos em tempo real.", badges: ["Net GEX", "Superfície de Volatilidade", "95% de Cobertura"], color: "from-primary/10 to-primary/3", border: "border-primary/25", dotColor: "bg-primary" },
  { index: "02", rotulo: "Inteligência", nome: "Grok Heavy AI", local: "Infraestrutura EUA", tag: "IA / Processamento de Sinais", desc: "Processa macro-sentimento em tempo real, filtra ruído de mercado e garante conformidade ISO 20022. Monitora continuamente sinais geopolíticos e fluxos de bancos centrais.", badges: ["ISO 20022", "Macro Sentimento", "Tempo Real"], color: "from-primary/7 to-primary/2", border: "border-primary/15", dotColor: "bg-primary/70" },
  { index: "03", rotulo: "Execução", nome: "Antigravity", local: "Corretoras EUA", tag: "Execução Automatizada", desc: "A camada de execução conectada diretamente a corretoras americanas confiáveis para hedge instantâneo e automatizado. Roteamento de ordens sub-milissegundo com trilha de auditoria completa e conformidade regulatória.", badges: ["Roteamento Sub-ms", "Corretoras EUA", "Trilha de Auditoria"], color: "from-primary/4 to-transparent", border: "border-primary/8", dotColor: "bg-primary/50" },
];

const PontoAnimado = ({ delay }: { delay: number }) => (
  <motion.div className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary/60" initial={{ top: "0%", opacity: 0 }} animate={{ top: "100%", opacity: [0, 1, 1, 0] }} transition={{ duration: 1.4, delay, repeat: Infinity, ease: "linear" }} />
);

export default function TechStackVisualization() {
  const [ativa, setAtiva] = useState<number | null>(null);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-[9px] text-muted-foreground/50 tracking-[0.35em] uppercase mb-2">Arquitetura</p>
        <h3 className="font-display text-2xl text-primary uppercase tracking-widest">Stack Tecnológico TRL 7+</h3>
        <p className="text-[10px] text-muted-foreground tracking-widest uppercase mt-2">Análise · Inteligência · Execução</p>
      </div>
      <div className="relative">
        {camadas.map((camada, i) => (
          <div key={i} className="relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              onClick={() => setAtiva(ativa === i ? null : i)}
              className={`relative overflow-hidden cursor-pointer border bg-gradient-to-b ${camada.color} ${camada.border} transition-all duration-500 ${ativa === i ? "shadow-[0_0_40px_-10px_rgba(198,167,92,0.15)]" : ""}`}
              style={{ transform: `perspective(1200px) rotateX(${i === 0 ? 2 : i === 2 ? -2 : 0}deg)` }}
            >
              <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: "linear-gradient(rgba(198,167,92,1) 1px, transparent 1px), linear-gradient(90deg, rgba(198,167,92,1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row gap-5 sm:gap-8">
                <div className="shrink-0 sm:w-44">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${camada.dotColor} transition-all duration-300 ${ativa === i ? "scale-150" : ""}`} />
                    <span className="text-[9px] text-muted-foreground/40 tracking-[0.3em] uppercase">{camada.index} · {camada.rotulo}</span>
                  </div>
                  <p className="font-display text-2xl text-primary tracking-wide leading-none mb-1">{camada.nome}</p>
                  <p className="text-[9px] text-muted-foreground/50 tracking-wider">{camada.local}</p>
                  <span className="inline-block mt-3 text-[8px] tracking-widest uppercase border border-primary/15 text-primary/50 px-2 py-0.5">{camada.tag}</span>
                </div>
                <div className="flex-1 sm:border-l border-white/5 sm:pl-8">
                  <p className="text-muted-foreground text-[13px] leading-relaxed font-light mb-4">{camada.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {camada.badges.map((b, j) => (
                      <span key={j} className="text-[8px] tracking-widest uppercase bg-primary/5 border border-primary/10 text-primary/60 px-2.5 py-1">{b}</span>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div className="absolute bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent w-full" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: ativa === i ? 1 : 0, opacity: ativa === i ? 1 : 0 }} transition={{ duration: 0.4 }} />
            </motion.div>
            {i < camadas.length - 1 && (
              <div className="relative h-10 flex items-center justify-center">
                <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-primary/10" />
                <PontoAnimado delay={i * 0.5} />
                <PontoAnimado delay={i * 0.5 + 0.7} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-0.5">
                  <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[5px] border-t-primary/25" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.8 }} className="mt-10 flex items-center justify-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/15" />
        <span className="text-[9px] text-muted-foreground/30 tracking-[0.3em] uppercase">Corretoras EUA · Execução Instantânea</span>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/15" />
      </motion.div>
    </div>
  );
}
