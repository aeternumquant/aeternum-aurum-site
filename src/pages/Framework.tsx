import FrameworkSection from "@/components/Framework";
import Footer from "@/components/Footer";
import { FadeIn } from "@/components/FadeIn";
import GoiasFlowMap from "@/components/GoiasFlowMap";

const steps = [
  { num: "01", title: "Identificação de Oportunidades", desc: "Mapeamento sistemático de distorções de preço em mercados globais via modelos quantitativos e análise fundamentalista." },
  { num: "02", title: "Validação e Due Diligence", desc: "Processo rigoroso de validação com múltiplas camadas de análise. Independência entre as equipes de pesquisa e gestão." },
  { num: "03", title: "Construção do Portfólio", desc: "Sizing baseado em volatilidade ajustada ao risco. Diversificação multidimensional por ativo, região e fator de risco." },
  { num: "04", title: "Monitoramento Ativo", desc: "Acompanhamento em tempo real com sistemas proprietários de alerta e re-balanceamento tático conforme condições de mercado." },
];

const streams = [
  { icon: "◈", label: "Redes de Televisão Globais", desc: "CNN, Bloomberg, Reuters. Captura de eventos de alto impacto antes da digestão pelo mercado." },
  { icon: "◈", label: "Desenvolvimentos Militares", desc: "Movimentos de tropas, escaladas e sanções monitorados como preditores de prêmio de risco em commodities e câmbio." },
  { icon: "◈", label: "Anúncios Macroeconômicos", desc: "Fed, BCE, OPEP. Leitura antecipada de fluxos de liquidez e reposicionamento institucional." },
  { icon: "◈", label: "Choques de Oferta em Commodities", desc: "Estoques do EIA, dados CFTC, relatórios de safra USDA. Identificação de desequilíbrios estruturais." },
  { icon: "◈", label: "Geopolítica & Diplomacia", desc: "Sanções, acordos bilaterais e tensões regionais convertidos em sinais de posicionamento para o portfólio." },
  { icon: "◈", label: "Fluxos de Capital Institucional", desc: "Posicionamento de fundos soberanos, hedge funds e bancos centrais via dados de custódia e prime brokers." },
];

export default function FrameworkPage() {
  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Metodologia</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Framework</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">Nossa metodologia integra análise macroeconômica, modelos quantitativos e inteligência de risco para gerar retornos consistentes e assimétricos.</p>
          </FadeIn>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/20 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10">
            {steps.map((step, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="flex gap-8 border-b border-white/5 pb-10 last:border-0 last:pb-0 group">
                  <span className="font-display text-4xl text-primary/20 shrink-0 tabular-nums group-hover:text-primary/40 transition-colors">{step.num}</span>
                  <div>
                    <h3 className="font-display text-lg text-foreground uppercase tracking-wider mb-3">{step.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-light">{step.desc}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4 text-center">Operação Contínua</p>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4 text-center">Inteligência em Tempo Real</h2>
            <p className="text-center text-muted-foreground text-sm font-light max-w-2xl mx-auto mb-16">Agentes operam 24 horas por dia, 7 dias por semana, monitorando fluxos globais de informação relevantes para mercados macro.</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="border border-white/5 bg-[#08090c] p-2 sm:p-4 mb-12"><GoiasFlowMap /></div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((s, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <div className="p-5 border border-white/5 bg-card/30 hover:bg-card/60 transition-colors group">
                  <div className="flex items-start gap-3">
                    <span className="text-primary/40 text-xs mt-0.5 shrink-0">{s.icon}</span>
                    <div>
                      <p className="font-display text-sm text-primary tracking-wide mb-1">{s.label}</p>
                      <p className="text-muted-foreground text-xs font-light leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <FrameworkSection />
      <Footer />
    </main>
  );
}
