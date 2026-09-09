import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { RouteSeo } from "../../lib/seo/RouteSeo";
import BrazilMap from "../../components/maps/BrazilMap";

/**
 * Terminal BR — mapa por estado da janela de plantio (ZARC). Publico: o
 * visitante ve os estados e o agregado de Goias; o valor por municipio e do
 * assinante (a gate esta no servidor). v1: Goias completo; demais UFs por vir.
 */
export default function TerminalBRPage() {
  return (
    <main className="pt-14 min-h-screen bg-background">
      <RouteSeo
        title="Terminal BR — Janela de plantio"
        description="Mapa por estado da janela de plantio de baixo risco (ZARC). O detalhe por município é do Terminal."
        path="/terminal-br"
      />
      <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto">
        <FadeIn>
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">Terminal Brasil</p>
          <h1 className="font-display text-2xl sm:text-3xl text-primary uppercase tracking-widest mb-2">
            O campo por município
          </h1>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xl mb-8">
            O Brasil agrícola por município. Comece pela janela de plantio (ZARC); a camada e a cultura mudam
            no seletor. O agregado por estado é aberto; o valor de cada município é do Terminal.
          </p>
          <BrazilMap />
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}
