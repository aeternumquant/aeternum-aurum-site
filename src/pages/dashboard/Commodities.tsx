import Agro from "../../components/common/Agro";
import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import EscudoReal from "../../components/common/EscudoReal";
import GovernancaEstrategica from "../../components/GovernancaEstrategica";
import CommodityTerminal from "../../components/CommodityTerminal";
import { useLanguage } from "../../context/LanguageContext";
import { RouteSeo } from "../../lib/seo/RouteSeo";

const stats = [
  { value: "20%", label: "Alocação em Commodities" },
  { value: "4", label: "Categorias cobertas" },
  { value: "12+", label: "Mercados monitorados" },
  { value: "Diária", label: "Frequência de rebalanceamento" },
];

export default function CommoditiesPage() {
  const { t } = useLanguage();
  return (
    <main className="pt-14 min-h-screen">
      <RouteSeo
        title="Commodities"
        description="Visualização de fluxos macro de commodities globais. Infraestrutura analítica para identificação de gargalos geopolíticos e regimes de risco."
        path="/commodities"
      />
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Mercados Reais</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Commodities</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">Exposição estratégica a mercados de matérias-primas com vantagem informacional.</p>
          </FadeIn>
        </div>
      </section>
      <section className="py-16 border-b border-white/5 bg-card/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="none">
                <div className="text-center px-4">
                  <div className="font-display text-3xl sm:text-4xl text-primary mb-2">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground tracking-widest uppercase">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto"><EscudoReal /></div>
      </section>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card/10 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Intervenção Quantitativa</p>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4">Hedge Estrutural & Assimetrias por Commodity</h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-2xl mb-12">
              Transformamos riscos em teses de proteção. Selecione o segmento abaixo para entender como a plataforma isola e protege o capital em cenários não-lineares.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <CommodityTerminal />
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BLOCO: Termômetro do Medo e Previsões (movido de Execução)
      ══════════════════════════════════════════════ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Leitura de Fluxo</p>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4">Termômetro do Medo e Previsões Operacionais</h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-2xl mb-12">
              Leitura de posicionamento institucional e previsões de preço de curto prazo aplicadas ao mercado físico de commodities.
            </p>
          </FadeIn>

          <div className="space-y-4">
            {/* Termômetro do Medo e da Ganância */}
            <FadeIn>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-6">
                <h4 className="text-[#C6A85A] font-display text-lg tracking-widest mb-3 uppercase">{t("exec.fear.title", "Termômetro do Medo e da Ganância")}</h4>
                <p className="text-sm text-[#F5F5F5]/70 leading-relaxed font-light mb-4">
                  {t("exec.fear.p1", 'Monitoramos o indicador VIX/OVX como o "termômetro do medo" institucional. Quando os níveis atingem extremos de desvio padrão, as Gamma Walls se rompem, gerando oportunidades de entrada assimétrica. Nossos modelos CTA (Commodity Trading Advisors) ajustam a exposição baseados no fluxo global, lendo o posicionamento antes do impacto direto no preço físico.')}
                </p>
                <p className="text-sm text-[#F5F5F5]/70 leading-relaxed font-light">
                  {t("exec.fear.p2", "Aplicamos modelos quantitativos de GARCH e Time Series Foundation Models para mapear a volatilidade estocástica e proteger o capital da inevitabilidade matemática das crises de liquidez.")}
                </p>
              </div>
            </FadeIn>

            {/* As 3 Armadilhas Ocultas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FadeIn>
                <div className="bg-[#1C1C1C]/50 border border-[#F5F5F5]/20 p-5 rounded-sm hover:border-[#F5F5F5]/50 transition-colors h-full">
                  <p className="text-[10px] text-[#F5F5F5] uppercase tracking-widest mb-2 font-semibold">{t("exec.trap1.label", "Armadilha 1")}</p>
                  <p className="text-[#F5F5F5] text-sm font-display mb-2">{t("exec.trap1.title", "Ilusão de Liquidez")}</p>
                  <p className="text-xs text-[#F5F5F5]/60 font-light">{t("exec.trap1.desc", "Comprar base sem olhar o Order Book. O mercado esvazia na hora da saída estrutural.")}</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.1}>
                <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 p-5 rounded-sm hover:border-[#C6A85A]/50 transition-colors h-full">
                  <p className="text-[10px] text-[#C6A85A] uppercase tracking-widest mb-2 font-semibold">{t("exec.trap2.label", "Armadilha 2")}</p>
                  <p className="text-[#F5F5F5] text-sm font-display mb-2">{t("exec.trap2.title", "Hedging Estático")}</p>
                  <p className="text-xs text-[#F5F5F5]/60 font-light">{t("exec.trap2.desc", "Travar preços sem Reinforcement Learning Hedging. Custa absurdamente caro.")}</p>
                </div>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 p-5 rounded-sm hover:border-[#C6A85A]/50 transition-colors h-full">
                  <p className="text-[10px] text-[#C6A85A] uppercase tracking-widest mb-2 font-semibold">{t("exec.trap3.label", "Armadilha 3")}</p>
                  <p className="text-[#F5F5F5] text-sm font-display mb-2">{t("exec.trap3.title", "Risco de Correlação")}</p>
                  <p className="text-xs text-[#F5F5F5]/60 font-light">{t("exec.trap3.desc", "Acreditar que portfólios estão diversificados quando todos respondem ao mesmo choque macro.")}</p>
                </div>
              </FadeIn>
            </div>

            {/* Previsões Operacionais (30/60/90d) */}
            <FadeIn>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 hover:border-[#C6A85A]/40 transition-colors">
                <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">30 • 60 • 90 Dias</p>
                <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.forecasts.title", "Previsões Operacionais")}</h4>
                <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                  {t("exec.science.forecasts.text", 'Nossos modelos capturam ciclos de safra, padrões sazonais e choques externos com precisão que métodos antigos nunca alcançaram. Entregamos previsões de preço de 30, 60 e 90 dias com intervalos de confiança + cenários de "estresse" (ex: o que acontece se chover 40% menos em Mato Grosso). Tudo atualizado automaticamente todo dia.')}
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto"><GovernancaEstrategica /></div>
      </section>
      <Agro />
      <Footer />
    </main>
  );
}
