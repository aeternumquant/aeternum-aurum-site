import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import GoiasFlowMap from "../../components/maps/GoiasFlowMap";
import { useLanguage } from "../../context/LanguageContext";

export default function ExecucaoPage() {
  const { t } = useLanguage();

  return (
    <main className="pt-14 min-h-screen bg-[#0A0A0A]">
      {/* Hero */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background z-0" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">{t("exec.macro.subtitle", "Inevitabilidade Matemática e Proteção Quantitativa")}</p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-foreground uppercase tracking-widest mb-4 leading-tight">
              {t("exec.macro.title", "INTELIGÊNCIA MACRO")} <span className="text-primary">{t("exec.macro.aeternum", "• AETERNUM")}</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-light max-w-2xl mt-4">
              Análise institucional de volatilidade, proteção quantitativa e ciência de ponta aplicada à gestão de risco em commodities e ativos reais.
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-4">
        {/* Inteligência Macro */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-8">
          {/* Termômetro do Medo e Armadilhas */}
          <div className="lg:col-span-8 space-y-4">
            {/* Termômetro do Medo */}
            <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm p-6">
              <h4 className="text-[#C6A85A] font-display text-lg tracking-widest mb-3 uppercase">{t("exec.fear.title", "Termômetro do Medo e da Ganância")}</h4>
              <p className="text-sm text-[#F5F5F5]/70 leading-relaxed font-light mb-4">
                {t("exec.fear.p1", 'Monitoramos o indicador VIX/OVX como o "termômetro do medo" institucional. Quando os níveis atingem extremos de desvio padrão, as Gamma Walls se rompem, gerando oportunidades de entrada assimétrica. Nossos modelos CTA (Commodity Trading Advisors) ajustam a exposição baseados no fluxo global, lendo o posicionamento antes do impacto direto no preço físico.')}
              </p>
              <p className="text-sm text-[#F5F5F5]/70 leading-relaxed font-light">
                {t("exec.fear.p2", "Aplicamos modelos quantitativos de GARCH e Time Series Foundation Models para mapear a volatilidade estocástica e proteger o capital da inevitabilidade matemática das crises de liquidez.")}
              </p>
            </div>

            {/* As 3 Armadilhas Ocultas */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#1C1C1C]/50 border border-[#F5F5F5]/20 p-5 rounded-sm hover:border-[#F5F5F5]/50 transition-colors">
                <p className="text-[10px] text-[#F5F5F5] uppercase tracking-widest mb-2 font-semibold">{t("exec.trap1.label", "Armadilha 1")}</p>
                <p className="text-[#F5F5F5] text-sm font-display mb-2">{t("exec.trap1.title", "Ilusão de Liquidez")}</p>
                <p className="text-xs text-[#F5F5F5]/60 font-light">{t("exec.trap1.desc", "Comprar base sem olhar o Order Book. O mercado esvazia na hora da saída estrutural.")}</p>
              </div>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 p-5 rounded-sm hover:border-[#C6A85A]/50 transition-colors">
                <p className="text-[10px] text-[#C6A85A] uppercase tracking-widest mb-2 font-semibold">{t("exec.trap2.label", "Armadilha 2")}</p>
                <p className="text-[#F5F5F5] text-sm font-display mb-2">{t("exec.trap2.title", "Hedging Estático")}</p>
                <p className="text-xs text-[#F5F5F5]/60 font-light">{t("exec.trap2.desc", "Travar preços sem Reinforcement Learning Hedging. Custa absurdamente caro.")}</p>
              </div>
              <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 p-5 rounded-sm hover:border-[#C6A85A]/50 transition-colors">
                <p className="text-[10px] text-[#C6A85A] uppercase tracking-widest mb-2 font-semibold">{t("exec.trap3.label", "Armadilha 3")}</p>
                <p className="text-[#F5F5F5] text-sm font-display mb-2">{t("exec.trap3.title", "Risco de Correlação")}</p>
                <p className="text-xs text-[#F5F5F5]/60 font-light">{t("exec.trap3.desc", "Acreditar que portfólios estão diversificados quando todos respondem ao mesmo choque macro.")}</p>
              </div>
            </div>
          </div>

          {/* Backtests e Métricas */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#C6A85A]/5 border border-[#C6A85A]/30 rounded-sm p-6 h-full flex flex-col justify-center">
              <h4 className="text-[#F5F5F5] font-display text-lg tracking-widest mb-6 uppercase text-center">{t("exec.backtests.title", "Backtests Reais")}</h4>
              <div className="space-y-4">
                <div className="border-b border-[#C6A85A]/10 pb-3">
                  <p className="text-[10px] text-[#F5F5F5]/40 uppercase tracking-widest mb-1">{t("exec.backtests.soy", "Soja (ZS) - Índice Sharpe")}</p>
                  <p className="text-3xl text-[#C6A85A] font-display">1.42</p>
                </div>
                <div className="border-b border-[#C6A85A]/10 pb-3">
                  <p className="text-[10px] text-[#F5F5F5]/40 uppercase tracking-widest mb-1">{t("exec.backtests.mae", "Otimização de Erro (MAE)")}</p>
                  <p className="text-3xl text-[#C6A85A] font-display">+48%</p>
                  <p className="text-xs text-[#F5F5F5]/60 mt-1">{t("exec.backtests.maeNote", "Improvement sobre benchmark")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#F5F5F5]/40 uppercase tracking-widest mb-1">{t("exec.backtests.costReduction", "Redução de Custos")}</p>
                  <p className="text-2xl text-[#F5F5F5] font-display">23% a 42%</p>
                  <p className="text-xs text-[#F5F5F5]/60 mt-1">{t("exec.backtests.costNote", "Hedging via opções dinâmicas")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            BLOCO: Ciência de Ponta Aplicada (Texto Gabriel CF)
        ══════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8 pt-8 border-t border-[#C6A85A]/10">
          <div className="lg:col-span-12 mb-2">
            <h3 className="text-[#F5F5F5] font-display text-xl tracking-widest flex items-center gap-2">
              {t("exec.science.title", "CIÊNCIA DE PONTA APLICADA")} <span className="text-[#C6A85A]">{t("exec.science.aeternum", "• AETERNUM")}</span>
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{t("exec.science.subtitle", "Pesquisa Peer-Reviewed Validada em Operações Reais")}</p>
          </div>

          {/* Grid de cards científicos */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Volatilidade Estocástica */}
            <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 hover:border-[#C6A85A]/40 transition-colors">
              <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">EGARCH • TGARCH</p>
              <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.stochVol.title", "Volatilidade Estocástica")}</h4>
              <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                {t("exec.science.stochVol.text", 'Vários papers de 2022–2025 confirmam que EGARCH e TGARCH capturam melhor o "efeito alavancagem" em soja, milho e boi gordo no Brasil. Combinamos esses modelos para oferecer um mapa de volatilidade institucional mais preciso que abordagens tradicionais.')}
              </p>
            </div>

            {/* Termômetro Real-Time */}
            <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 hover:border-[#C6A85A]/40 transition-colors">
              <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">Atualizado a cada 15 min</p>
              <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.realtime.title", "Termômetro de Volatilidade em Tempo Real")}</h4>
              <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                {t("exec.science.realtime.text", 'Entregamos um termômetro de volatilidade em tempo real atualizado a cada 15 minutos. Quando o termômetro sobe acima de certo nível, o sistema automaticamente sugere (ou executa, se o cliente autorizar) aumento de hedge ou redução de exposição. É como ter um "alerta de tempestade" 24 horas por dia.')}
              </p>
            </div>

            {/* Time Series Foundation Models */}
            <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 hover:border-[#C6A85A]/40 transition-colors">
              <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">Wang et al. 2026 • arXiv:2601.06371</p>
              <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.tsfm.title", "Time Series Foundation Models")}</h4>
              <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                {t("exec.science.tsfm.text", "Combinamos métodos clássicos (ARIMA) com os novíssimos Time Series Foundation Models (2024–2026). Os modelos Time-MoE, Chronos e Moirai superaram as previsões oficiais do USDA em 45% a 55% de precisão para milho, soja e trigo. O Time-MoE melhorou 54,9% no trigo e 18,5% no milho em relação aos modelos tradicionais.")}
              </p>
            </div>

            {/* Previsões Operacionais */}
            <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 hover:border-[#C6A85A]/40 transition-colors">
              <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">30 • 60 • 90 Dias</p>
              <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.forecasts.title", "Previsões Operacionais")}</h4>
              <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                {t("exec.science.forecasts.text", 'Nossos modelos capturam ciclos de safra, padrões sazonais e choques externos com precisão que métodos antigos nunca alcançaram. Entregamos previsões de preço de 30, 60 e 90 dias com intervalos de confiança + cenários de "estresse" (ex: o que acontece se chover 40% menos em Mato Grosso). Tudo atualizado automaticamente todo dia.')}
              </p>
            </div>

            {/* Hedging Inteligente */}
            <div className="bg-[#1C1C1C]/50 border border-[#C6A85A]/20 rounded-sm p-6 hover:border-[#C6A85A]/40 transition-colors">
              <p className="text-[9px] text-[#C6A85A]/60 tracking-[0.3em] uppercase mb-2">Hanetho, 2023 • arXiv:2309.00630</p>
              <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-3 uppercase">{t("exec.science.hedging.title", "Hedging Inteligente")}</h4>
              <p className="text-xs text-[#F5F5F5]/70 leading-relaxed font-light">
                {t("exec.science.hedging.text", "Desenvolvemos algoritmos de hedging automático usando Deep Policy Gradient e Reinforcement Learning. Em vez de proteção estática, o sistema aprende e se adapta em tempo real, reduzindo custos de hedging em 23% a 42% comparado a métodos tradicionais.")}
              </p>
            </div>

            {/* Resumo de Performance */}
            <div className="bg-gradient-to-br from-[#0a0a0a] to-[#C6A85A]/5 border border-[#C6A85A]/30 rounded-sm p-6 flex flex-col justify-center">
              <h4 className="text-[#C6A85A] font-display text-base tracking-widest mb-4 uppercase text-center">Resultados Validados</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-baseline border-b border-[#C6A85A]/10 pb-2">
                  <span className="text-[10px] text-[#F5F5F5]/50 uppercase tracking-widest">Melhoria USDA (Trigo)</span>
                  <span className="text-xl text-[#C6A85A] font-display">+54.9%</span>
                </div>
                <div className="flex justify-between items-baseline border-b border-[#C6A85A]/10 pb-2">
                  <span className="text-[10px] text-[#F5F5F5]/50 uppercase tracking-widest">Melhoria USDA (Milho)</span>
                  <span className="text-xl text-[#C6A85A] font-display">+18.5%</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-[10px] text-[#F5F5F5]/50 uppercase tracking-widest">Redução Custo Hedge</span>
                  <span className="text-xl text-[#C6A85A] font-display">23–42%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Zona Piloto Goiás */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-8 pt-8 border-t border-[#C6A85A]/10">
          <div className="lg:col-span-12 mb-2">
            <h3 className="text-[#F5F5F5] font-display text-xl tracking-widest flex items-center gap-2">
              {t("exec.zona.title", "ZONA PILOTO")} <span className="text-primary">{t("exec.zona.goias", "• GOIÁS")}</span>
            </h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">{t("exec.zona.subtitle", "Infraestrutura Logística e Financeira Regional. Fluxo Global de Clima para Agro.")}</p>
          </div>

          <div className="lg:col-span-8 bg-[#1C1C1C]/50 border border-[#C6A85A]/10 rounded-sm h-[400px]">
            <GoiasFlowMap standalone={true} />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-3">
            {[
              { name: "Goiânia", role: "Hub Financeiro", desc: "Capital e polo de regulação e estruturação de operações financeiras (R$ 12B PIB)." },
              { name: "Brasília", role: "Capital Federal", desc: "Governança estratégica, compliance e regulação macro." },
              { name: "Rio Verde", role: "Soja & Milho", desc: "Principal nó de escoamento. Exportação direta de US$ 4.2B anuais." },
              { name: "Jataí", role: "Grãos & Proteína", desc: "Top 10 Nacional em volume agropecuário estruturado." },
              { name: "Catalão", role: "Nióbio & Mineração", desc: "Base de depósitos minerais estratégicos e base CMOC/Niobras." },
              { name: "Campos Verdes", role: "Esmeraldas", desc: "Polo mundial de extração de gemas com lastro tangível." },
            ].map((city, idx) => (
              <div key={idx} className="bg-[#1C1C1C]/50 border border-[#C6A85A]/10 p-3 rounded-sm hover:border-primary/20 transition-colors">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-[#F5F5F5] font-display text-sm tracking-wider">{city.name}</span>
                  <span className="text-[9px] text-[#C6A85A] tracking-widest uppercase font-mono">{city.role}</span>
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{city.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
