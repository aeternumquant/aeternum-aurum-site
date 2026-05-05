import { motion } from "framer-motion";
import GlobalFlowMap from "../maps/GlobalFlowMap";

const zonas = [
  {
    cidade: "Strait of Hormuz",
    tag: "ENERGY CHOKEPOINT",
    desc: "20% do fluxo global de petróleo.",
    accent: true,
  },
  {
    cidade: "CME Group (Chicago)",
    tag: "FUTUROS GLOBAL",
    desc: "Epicentro de precificação Agro e Ouro.",
    accent: false,
  },
  {
    cidade: "Shanghai Port",
    tag: "HUB DE DEMANDA",
    desc: "Absorção primária de commodities minerais e grãos.",
    accent: true,
  },
  {
    cidade: "Genebra",
    tag: "PHYSICAL TRADING",
    desc: "Liquidação de contratos institucionais e clearing.",
    accent: false,
  },
  {
    cidade: "Novi Novorossiysk",
    tag: "GEOPOLÍTICA (MAR NEGRO)",
    desc: "Escoamento e gargalos táticos de grãos.",
    accent: false,
  },
  {
    cidade: "Londres (LME)",
    tag: "METAIS BÁSICOS",
    desc: "Formação de preços de ligas e metais industriais.",
    accent: false,
  },
];

export default function ZonaPiloto() {
  return (
    <section className="relative bg-[#08090c] border-t border-white/5">
      {/* ── Título ── */}
      <div className="px-6 pt-12 pb-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-[10px] text-primary/70 tracking-[0.3em] uppercase mb-3"
        >
          Rede de Liquidez · Infraestrutura
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl text-primary tracking-widest uppercase"
        >
          Fluxo Macro
        </motion.h2>
      </div>

      {/* ── Mapa Interativo ── */}
      <div className="w-full" style={{ height: "70vh", minHeight: 400, maxHeight: 700 }}>
        <GlobalFlowMap />
      </div>

      {/* ── Cards de Zonas ── */}
      <div className="relative bg-gradient-to-t from-[#0a0a0a] via-[#08090c]/80 to-transparent border-t border-white/5 overflow-x-auto overflow-y-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/2 via-transparent to-transparent pointer-events-none" />

        <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 min-w-max">
          {/* Descrição geral */}
          <div className="flex-shrink-0 w-44 sm:w-52 flex flex-col justify-center pr-4 border-r border-white/5">
            <p className="text-[9px] text-primary/70 tracking-widest uppercase mb-1">
              Principais Centros
            </p>
            <p className="text-white/40 text-[10px] font-light leading-relaxed">
              Trilhões em transações · Gargalos Geopolíticos · Petróleo · Minérios
            </p>
          </div>

          {zonas.map((z, i) => (
            <motion.div
              key={i}
              className={`flex-shrink-0 w-52 sm:w-60 p-3 sm:p-4 border transition-colors rounded-sm ${
                z.accent ? "border-primary/15 bg-primary/[0.03]" : "border-white/5 bg-[#0a0a0a]"
              }`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <h4 className="font-display text-sm text-white/90 tracking-wider uppercase mb-1">
                {z.cidade}
              </h4>
              <p className="text-[8px] text-primary/70 tracking-widest uppercase mb-2">
                {z.tag}
              </p>
              <p className="text-white/40 text-[10px] font-light leading-relaxed">
                {z.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
