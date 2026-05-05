import FrameworkSection from "../components/common/Framework";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
import MacroRiskModels from "../components/common/MacroRiskModels";
import ZonaPiloto from "../components/common/ZonaPiloto";

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
    <main className="pt-14 min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
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

      {/* ══════════════════════════════════════════════════════
          RESUMO PARA O PÚBLICO — LINGUAGEM ACESSÍVEL
          Posicionado logo após o hero, antes dos passos técnicos
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-card/15">
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3 text-center" style={{ color: "rgba(198,168,90,0.65)" }}>
              Entendendo a Plataforma
            </p>
            <h2 className="font-display text-2xl sm:text-3xl text-primary uppercase tracking-widest mb-4 text-center">
              Em Linguagem Simples
            </h2>
            <div className="h-px w-20 bg-gradient-to-r from-primary to-primary/10 mx-auto mb-8" />
            <p className="text-muted-foreground text-base leading-relaxed text-center max-w-2xl mx-auto mb-12">
              Você não precisa ser matemático ou economista para entender o que fazemos.
              Aqui está o que a Aeternum Aurum faz, explicado de forma direta.
            </p>
          </FadeIn>

          {/* 4 Conceitos em Linguagem Simples */}
          <div className="grid sm:grid-cols-2 gap-5 mb-12">
            {[
              {
                icone: "◆",
                titulo: "O que é o 'medo do mercado' e por que importa?",
                corpo: `Existe um indicador chamado VIX — chamamos de "termômetro do medo". Quando está alto,
                  os grandes investidores estão com medo. Quando está baixo, estão confiantes demais.
                  Ambos os extremos criam oportunidades. A Aeternum lê esse termômetro antes de qualquer decisão.`,
              },
              {
                icone: "◆",
                titulo: "Por que dados valem mais que opiniões?",
                corpo: `Um analista pode estar certo ou errado. Dados de posicionamento de mercado mostram
                  o que as pessoas realmente estão fazendo com seu dinheiro — não o que elas falam.
                  Nosso sistema lê essas "pegadas digitais" e toma decisões baseadas em fatos, não em narrativas.`,
              },
              {
                icone: "◆",
                titulo: "Como protegemos seu capital em crises?",
                corpo: `Usamos um sistema de proteção chamado hedge — como um seguro para seu investimento.
                  Quando identificamos risco crescendo (o VIX subindo, por exemplo), compramos proteção
                  preventiva. É o equivalente a colocar um seguro no carro antes de sair na chuva forte.`,
              },
              {
                icone: "◆",
                titulo: "O que significa 'quantitativo' na prática?",
                corpo: `Significa que todas as nossas decisões têm número. Em vez de dizer "achamos que soja vai
                  subir", dizemos "há 68% de probabilidade de soja entre R$128 e R$148 nos próximos 30 dias,
                  baseado em dados de opções, estoques e sazonalidade". Isso permite tamanhar o risco corretamente.`,
              },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="up">
                <div className="border border-white/8 bg-card/40 p-6 h-full hover:border-primary/20 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-primary/50 text-xs mt-0.5 flex-shrink-0">{item.icone}</span>
                    <h3 className="font-display text-sm text-foreground tracking-wide leading-snug">
                      {item.titulo}
                    </h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.corpo}</p>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 5 Princípios de Investimento Responsável */}
          <FadeIn delay={0.4}>
            <div className="border border-primary/15 bg-primary/3 p-6">
              <h3 className="font-display text-base text-primary uppercase tracking-wider mb-5 text-center">
                5 Princípios que Guiam Todas as Nossas Decisões
              </h3>
              <div className="grid sm:grid-cols-5 gap-4">
                {[
                  { num: "I",    txt: "Dados primeiro, sempre" },
                  { num: "II",   txt: "Risco definido antes da entrada" },
                  { num: "III",  txt: "Diversificação real, não aparente" },
                  { num: "IV",   txt: "Proteção automática em crises" },
                  { num: "V",    txt: "Transparência total no processo" },
                ].map((p) => (
                  <div key={p.num} className="text-center">
                    <div className="font-display text-2xl text-primary/30 mb-1">{p.num}</div>
                    <p className="text-[10px] text-muted-foreground/60 leading-tight">{p.txt}</p>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="mb-12"><MacroRiskModels /></div>
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

      {/* ZONA PILOTO: World Map with Real-Time Commodity Flows */}
      <ZonaPiloto />

      {/* New: Capital Protection in Crises Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-30" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <FadeIn>
            <p className="text-[10px] text-accent/60 tracking-[0.3em] uppercase mb-4">Resiliência & Proteção</p>
            <h2 className="font-display text-4xl text-accent uppercase tracking-widest mb-6">Proteção de Capital em Crises</h2>
            <p className="text-muted-foreground text-base leading-relaxed font-light max-w-3xl mb-12">
              Implementamos protocolos multi-camada para monitorar liquidez em mercados, rastrear exposição a risco político e financeiro, e execute hedges preventivos usando ISO 20022 para liquidações internacionais seguras.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Liquidity Tracking Card */}
            <FadeIn delay={0.1}>
              <div className="border border-accent/20 bg-gradient-to-br from-accent/5 to-transparent p-8 group hover:border-accent/40 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent font-display text-lg group-hover:bg-accent/30 transition-colors">
                    ≋
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-accent tracking-wide mb-1">Rastreamento de Liquidez</h3>
                    <p className="text-muted-foreground text-sm">Monitoramos spreads bid-ask, volumes de ordem, e profundidade de livro em tempo real</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/10 p-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Spread Médio</span>
                    <span className="text-accent">0.15 bps</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volume Diário</span>
                    <span className="text-accent">$2.45B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profundidade (10M)</span>
                    <span className="text-accent">$125M</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-primary">
                    <span>Status Liquidez</span>
                    <span className="animate-pulse">● Saudável</span>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Risk Management Card */}
            <FadeIn delay={0.2}>
              <div className="border border-primary/20 bg-gradient-to-br from-primary/5 to-transparent p-8 group hover:border-primary/40 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-display text-lg group-hover:bg-primary/30 transition-colors">
                    ◆
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-primary tracking-wide mb-1">Proteção contra Crises</h3>
                    <p className="text-muted-foreground text-sm">Hedges dinâmicos contra risco político, bancário e de câmbio com derivativos cross-border</p>
                  </div>
                </div>
                <div className="bg-white/5 rounded border border-white/10 p-4 space-y-3 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risco Político</span>
                    <span className="text-primary">Cobertura 85%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risco Câmbio</span>
                    <span className="text-primary">Cobertura 92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Risco Crédito</span>
                    <span className="text-primary">Cobertura 78%</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-accent">
                    <span>Exposição Residual</span>
                    <span>2.3%</span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* ISO 20022 & Cross-Border Payments Section */}
          <FadeIn delay={0.3}>
            <div className="border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-8 mb-8">
              <h3 className="font-display text-2xl text-primary uppercase tracking-wider mb-4">ISO 20022 - Pagamentos Transfronteiriços Modernos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    Operamos sob o protocolo <span className="text-accent font-semibold">ISO 20022</span>, o padrão internacional para mensagens financeiras estruturadas. Isso permite:
                  </p>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Liquidação T+0 em múltiplas moedas</span></li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Rastreabilidade fim-a-fim de transferências</span></li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Conformidade com reguladores globais (Basel III, EMIR)</span></li>
                    <li className="flex gap-2"><span className="text-primary">✓</span> <span>Redução de risco operacional em 40%</span></li>
                  </ul>
                </div>
                <div className="bg-white/5 border border-white/10 rounded p-4 space-y-3 font-mono text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tempo Médio de Liquidação</span>
                    <span className="text-primary">2.1 min</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Taxa de Confirmação</span>
                    <span className="text-accent">99.97%</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Moedas Suportadas</span>
                    <span className="text-primary">45+</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="text-center text-accent">
                    <p className="text-[10px] uppercase tracking-wider">Última Atualização</p>
                    <p>07/04/2026 14:35 UTC</p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Crisis Scenarios Card */}
          <FadeIn delay={0.4}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-primary/70 uppercase tracking-widest mb-2 font-semibold">Cenário 1: Crise Banco Central</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Proteção via forwards de moeda, ouro e ativos não-correlacionados. Redução de drawdown: 65%</p>
              </div>
              <div className="border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-accent/70 uppercase tracking-widest mb-2 font-semibold">Cenário 2: Crack Acionário Global</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Pivô para ativos defensivos e liquidez. Put spreads dinâmicas. Redução de drawdown: 48%</p>
              </div>
              <div className="border border-white/5 bg-white/3 p-5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-orange-400/70 uppercase tracking-widest mb-2 font-semibold">Cenário 3: Evento Geopolítico</p>
                <p className="text-xs text-muted-foreground leading-relaxed">Realocação para mercados não-afetados, comodidades e ativos seguros. Redução de drawdown: 72%</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      <FrameworkSection />
      <Footer />
    </main>
  );
}
