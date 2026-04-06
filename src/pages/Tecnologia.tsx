import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import GammaExposureChart from "@/components/GammaExposureChart";
import OptionsMatrixGrid from "@/components/OptionsMatrixGrid";
import VolatilitySurface from "@/components/VolatilitySurface";

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

      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/15">
        <div className="max-w-6xl mx-auto">
          {/* Modelagem Quantitativa (MenthorQ Style) */}
          <div className="mt-24 mb-8">
            <FadeIn>
              <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4">Risco & Derivativos</h2>
              <p className="text-muted-foreground text-sm font-light max-w-3xl leading-relaxed mb-12">
                A aplicação de modelos quantitativos institucionais americanos permite a identificação de assimetrias estruturais. Monitoramos fluxos de opções, níveis de gamma (GEX) e skew de volatilidade para os principais ativos de base do fundo.
              </p>
            </FadeIn>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              {/* GEX Chart Takes 7 cols */}
              <FadeIn delay={0.1} className="lg:col-span-7">
                <GammaExposureChart />
              </FadeIn>
              
              {/* Vol Surface Takes 5 cols */}
              <FadeIn delay={0.2} className="lg:col-span-5 flex items-stretch">
                <div className="w-full flex items-center justify-center">
                  <VolatilitySurface />
                </div>
              </FadeIn>
            </div>

            {/* Options Matrix (Full Width) */}
            <FadeIn delay={0.3}>
              <OptionsMatrixGrid />
            </FadeIn>
          </div>

          <FadeIn delay={0.5}>
            <div className="mt-16 p-6 border border-primary/20 bg-primary/4">
              <p className="text-[10px] text-primary/70 tracking-widest uppercase mb-2">Síntese Estratégica</p>
              <p className="text-foreground/80 text-sm leading-relaxed font-light">
                Mapeamos as deficiências analíticas do mercado e implementamos frameworks institucionais (TRL 7+). Ao combinar cartografia neural geográfica com modelagem de derivativos avançada, a Aeternum Aurum isola oportunidades descorrelacionadas com alta precisão preditiva no cenário macroeconômico global.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>
      <Footer />
    </main>
  );
}
