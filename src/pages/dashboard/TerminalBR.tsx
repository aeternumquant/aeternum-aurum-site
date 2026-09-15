import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import { RouteSeo } from "../../lib/seo/RouteSeo";
import TerminalGrid from "../../components/terminal/TerminalGrid";

/**
 * Terminal BR — agora é o PAINEL em grade. Cada dado é um módulo (command); a URL
 * é o estado (?commands=mapa,stocks&escopo=soja). O mapa do Brasil virou UM módulo,
 * não a página inteira. Grade fixa nesta versão; tema escuro, tokens da casa.
 */
export default function TerminalBRPage() {
  return (
    <main className="pt-14 min-h-screen bg-background">
      <RouteSeo
        title="Terminal BR — Painel"
        description="O Brasil agrícola em módulos: janela de plantio (ZARC) por município, stocks-to-use e mais. Cada card traz o dado, a leitura e a fonte."
        path="/terminal-br"
      />
      <section className="tbr py-10 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <FadeIn>
          <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">Terminal Brasil</p>
          <h1 className="font-sans font-[590] text-2xl sm:text-3xl text-[var(--t-tx-1)] uppercase tracking-widest mb-2">Painel</h1>
          <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-2xl mb-8">
            O Brasil agrícola. A tabela responde <span className="text-primary/80">como está o mercado</span>;
            os módulos abaixo, <span className="text-primary/80">o que acontece</span> em cada coisa. Cada número tem escala, cobertura e fonte.
          </p>

          {/* tabelas (topo) + módulos (grade), particionados por kind no TerminalGrid */}
          <TerminalGrid />
        </FadeIn>
      </section>
      <Footer />
    </main>
  );
}
