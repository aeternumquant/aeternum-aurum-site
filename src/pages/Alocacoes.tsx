import Allocation from "../components/common/Allocation";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
import VolatilitySurface from "../components/common/VolatilitySurface";
import AllocationVisuals from "../components/AllocationVisuals";

const categories = [
  { label: "Commodities & Real Assets", pct: "35%", color: "border-primary/30", intro: "Exposição estrutural a mercados físicos com alta correlação a choques de oferta e ciclos inflacionários.", topics: ["Agricultura", "Energia", "Metais Preciosos", "Índices Globais de Commodities"], strategy: "Futuros de commodities com roll estrutural. Em backwardation, o roll captura retorno positivo independente de direção de preço.", visual: [{ label: "Produção", arrow: "→", dest: "Armazenagem" }, { label: "Armazenagem", arrow: "→", dest: "Exportação" }, { label: "Exportação", arrow: "→", dest: "Futuros / Hedge" }] },
  { label: "Global Macro", pct: "25%", color: "border-primary/20", intro: "Captura de grandes ciclos econômicos através de câmbio, taxas de juro soberanas e posicionamento em ciclos de crescimento global.", topics: ["Câmbio (G10 e EM)", "Taxas de Juro Soberanas", "Ciclos Macro Globais", "Ouro como ativo soberano"], strategy: "Futuros de câmbio e posições em treasuries. Exploração de diferenciais de taxa de juro entre países.", visual: [{ label: "Fed / BCE", arrow: "→", dest: "Diferencial de Taxa" }, { label: "Diferencial de Taxa", arrow: "→", dest: "Fluxo de Capital" }, { label: "Fluxo de Capital", arrow: "→", dest: "Posição em Câmbio" }] },
  { label: "Volatilidade & Derivativos", pct: "20%", color: "border-primary/15", intro: "Operações em volatilidade implícita, estruturas de opções e proteção assimétrica.", topics: ["Opções sobre Índices", "Volatilidade Implícita vs. Realizada", "Estruturas de Proteção", "Theta Decay Harvesting"], strategy: "Long volatility em eventos de cauda. Short volatility estrutural via theta decay em ambientes calmos.", visual: null, hasVolSurface: true },
  { label: "ISO 20022 Assets", pct: "12%", color: "border-primary/10", intro: "Exposição à nova infraestrutura financeira digital: ativos tokenizados, protocolos de liquidação e redes de pagamento institucional.", topics: ["Adoção Institucional de ISO 20022", "Sistemas de Liquidação Digital", "Stablecoin Infrastructure", "Payment Rails Blockchain"], strategy: "Posicionamento em provedores de infraestrutura e ativos digitais com clara função de liquidação.", visual: [{ label: "Banco Originador", arrow: "→", dest: "ISO 20022 Message" }, { label: "ISO 20022 Message", arrow: "→", dest: "Liquidação Instantânea" }, { label: "Liquidação Instantânea", arrow: "→", dest: "Banco Receptor" }] },
  { label: "Equities Long/Short", pct: "8%", color: "border-primary/8", intro: "Posições direcionais e pair trades em mercados de ações globais.", topics: ["Dispersão de Equity Global", "Long/Short por Setor", "Eventos de Repricing", "Mercados Desenvolvidos"], strategy: "Pares de ações com alta correlação histórica que divergem por evento específico.", visual: [{ label: "Long: Empresa A", arrow: "↕", dest: "Pair Trade" }, { label: "Short: Empresa B", arrow: "↕", dest: "Pair Trade" }, { label: "Pair Trade", arrow: "→", dest: "Alpha Isolado" }] },
];

export default function AlocacoesPage() {
  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Portfólio</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Alocações</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">Estrutura de alocação dinâmica, ajustada continuamente conforme cenário macroeconômico.</p>
          </FadeIn>
        </div>
      </section>
      <Allocation />
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-5xl mx-auto space-y-2">
          {categories.map((cat, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <details className="group border border-white/5 bg-card/30 hover:bg-card/50 transition-colors open:bg-card/50">
                <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                  <div className="flex items-center gap-4">
                    <div className={`w-1 h-8 border-l-2 ${cat.color}`} />
                    <div>
                      <span className="font-display text-base text-primary tracking-wide">{cat.label}</span>
                      <span className="ml-3 text-[10px] text-muted-foreground/50 tracking-widest">{cat.pct}</span>
                    </div>
                  </div>
                  <span className="text-primary/40 group-open:rotate-90 transition-transform duration-300 text-sm">→</span>
                </summary>
                <div className="px-6 pb-8 border-t border-white/5 pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <p className="text-muted-foreground text-sm font-light leading-relaxed mb-6">{cat.intro}</p>
                      <p className="text-[9px] text-primary/50 tracking-widest uppercase mb-3">Exposição</p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {cat.topics.map((t, j) => (
                          <span key={j} className="text-[8px] tracking-widest uppercase bg-primary/4 border border-primary/10 text-primary/60 px-2.5 py-1">{t}</span>
                        ))}
                      </div>
                      <p className="text-[9px] text-primary/50 tracking-widest uppercase mb-2">Estratégia Exemplo</p>
                      <p className="text-muted-foreground text-xs font-light leading-relaxed">{cat.strategy}</p>
                    </div>
                    <div className="flex items-center justify-center h-full">
                      {(cat as any).hasVolSurface ? (
                        <div className="w-full border border-white/5 bg-background/40 p-4 min-h-[12rem] flex items-center justify-center"><VolatilitySurface /></div>
                      ) : (
                        <div className="w-full">
                          <AllocationVisuals type={cat.label} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </details>
            </FadeIn>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}
