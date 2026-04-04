import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import TechStackVisualization from "@/components/TechStackVisualization";
import GoiasFlowMap from "@/components/GoiasFlowMap";

export default function TecnologiaPage() {
  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">TRL 7+ Certificado</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground uppercase tracking-widest mb-4 leading-tight">Tecnologia <span className="text-primary">EUA</span><br />Aplicada ao Brasil</h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light max-w-2xl mt-4">Validando ferramentas quantitativas americanas de nível TRL 7+ no maior hub agroindustrial do Brasil: o estado de Goiás.</p>
          </FadeIn>
        </div>
      </section>

      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto"><TechStackVisualization /></div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/15">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4 text-center">Zona Piloto · Goiás</h2>
            <p className="text-center text-muted-foreground text-xs tracking-widest uppercase mb-12">Multi-bilhões em exportações · Minerais · Soja · Proteína Animal · Esmeraldas</p>
          </FadeIn>

          {/* Neural Cartography Map */}
          <FadeIn delay={0.15}>
            <div className="border border-white/5 bg-[#08090c] p-2 sm:p-4 mb-12">
              <GoiasFlowMap />
            </div>
          </FadeIn>

          {/* City details grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { cidade: "Goiânia", tag: "HUB FINANCEIRO", desc: "Centro financeiro e hub de liquidação de capital do estado de Goiás.", accent: true },
              { cidade: "Brasília", tag: "CAPITAL FEDERAL", desc: "Centro político e regulatório, interface com governo federal e agências.", accent: true },
              { cidade: "Rio Verde", tag: "AGRO EXPORT", desc: "Maior polo exportador de soja e milho de Goiás." },
              { cidade: "Jataí", tag: "GRÃOS & PROTEÍNA", desc: "Zona estratégica de grãos e proteína animal." },
              { cidade: "Catalão", tag: "NIÓBIO · MINERAÇÃO", desc: "Um dos maiores polos mundiais de produção de nióbio, operando através da CMOC (Niobras)." },
              { cidade: "Campos Verdes", tag: "ESMERALDAS", desc: "Polo de extração de esmeraldas, um dos maiores do mundo." },
            ].map((z, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className={`p-5 border transition-colors group h-full ${z.accent ? "border-primary/15 bg-primary/[0.03] hover:bg-primary/[0.06]" : "border-white/5 bg-background hover:bg-white/[0.015]"}`}>
                  <div className="flex items-start gap-3">
                    <div className={`shrink-0 w-2 h-2 rounded-full mt-1.5 transition-colors ${z.accent ? "bg-primary/80 group-hover:bg-primary" : "bg-primary/40 group-hover:bg-primary/60"}`} />
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-display text-base text-foreground tracking-wider uppercase">{z.cidade}</h4>
                        <span className="text-[7px] text-primary/40 tracking-[0.2em] uppercase border border-primary/10 px-1.5 py-0.5">{z.tag}</span>
                      </div>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed">{z.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-10 p-6 border border-primary/20 bg-primary/4">
              <p className="text-[10px] text-primary/70 tracking-widest uppercase mb-2">Síntese</p>
              <p className="text-foreground/80 text-sm leading-relaxed font-light">Um polo exportador de múltiplos bilhões de dólares, atualmente restringido por frameworks analógicos. O deployment do stack tecnológico americano resolve a lacuna crítica de ferramentas digitais modernas de gestão de risco. Linhas de fluxo convergem para Goiânia e Brasília como centros de liquidação e regulação.</p>
            </div>
          </FadeIn>
        </div>
      </section>
      <Footer />
    </main>
  );
}
