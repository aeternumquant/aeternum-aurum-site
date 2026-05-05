import Allocation from "../components/common/Allocation";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
import VolatilitySurface from "../components/common/VolatilitySurface";
import AllocationVisuals from "../components/AllocationVisuals";

const GOLD = "#C6A85A";

const categories = [
  { label: "Commodities & Real Assets", pct: "35%", color: "border-primary/30", intro: "Exposição estrutural a mercados físicos com alta correlação a choques de oferta e ciclos inflacionários.", topics: ["Agricultura", "Energia", "Metais Preciosos", "Índices Globais de Commodities"], strategy: "Futuros de commodities com roll estrutural. Em backwardation, o roll captura retorno positivo independente de direção de preço.", visual: [{ label: "Produção", arrow: "→", dest: "Armazenagem" }, { label: "Armazenagem", arrow: "→", dest: "Exportação" }, { label: "Exportação", arrow: "→", dest: "Futuros / Hedge" }] },
  { label: "Global Macro", pct: "25%", color: "border-primary/20", intro: "Captura de grandes ciclos econômicos através de câmbio, taxas de juro soberanas e posicionamento em ciclos de crescimento global.", topics: ["Câmbio (G10 e EM)", "Taxas de Juro Soberanas", "Ciclos Macro Globais", "Ouro como ativo soberano"], strategy: "Futuros de câmbio e posições em treasuries. Exploração de diferenciais de taxa de juro entre países.", visual: [{ label: "Fed / BCE", arrow: "→", dest: "Diferencial de Taxa" }, { label: "Diferencial de Taxa", arrow: "→", dest: "Fluxo de Capital" }, { label: "Fluxo de Capital", arrow: "→", dest: "Posição em Câmbio" }] },
  { label: "Volatilidade & Derivativos", pct: "20%", color: "border-primary/15", intro: "Operações em volatilidade implícita, estruturas de opções e proteção assimétrica.", topics: ["Opções sobre Índices", "Volatilidade Implícita vs. Realizada", "Estruturas de Proteção", "Theta Decay Harvesting"], strategy: "Long volatility em eventos de cauda. Short volatility estrutural via theta decay em ambientes calmos.", visual: null, hasVolSurface: true },
  { label: "ISO 20022 Assets", pct: "12%", color: "border-primary/10", intro: "Exposição à nova infraestrutura financeira digital: ativos tokenizados, protocolos de liquidação e redes de pagamento institucional.", topics: ["Adoção Institucional de ISO 20022", "Sistemas de Liquidação Digital", "Stablecoin Infrastructure", "Payment Rails Blockchain"], strategy: "Posicionamento em provedores de infraestrutura e ativos digitais com clara função de liquidação.", visual: [{ label: "Banco Originador", arrow: "→", dest: "ISO 20022 Message" }, { label: "ISO 20022 Message", arrow: "→", dest: "Liquidação Instantânea" }, { label: "Liquidação Instantânea", arrow: "→", dest: "Banco Receptor" }] },
  { label: "Equities Long/Short", pct: "8%", color: "border-primary/8", intro: "Posições direcionais e pair trades em mercados de ações globais.", topics: ["Dispersão de Equity Global", "Long/Short por Setor", "Eventos de Repricing", "Mercados Desenvolvidos"], strategy: "Pares de ações com alta correlação histórica que divergem por evento específico.", visual: [{ label: "Long: Empresa A", arrow: "↕", dest: "Pair Trade" }, { label: "Short: Empresa B", arrow: "↕", dest: "Pair Trade" }, { label: "Pair Trade", arrow: "→", dest: "Alpha Isolado" }] },
];

/* Dados comparativos SWIFT vs Ripple vs Stellar */
const swiftComparison = [
  { metric: "Velocidade de Liquidação", swift: "2-5 dias úteis", ripple: "3-5 segundos", stellar: "2-5 segundos" },
  { metric: "Custo por Transação", swift: "US$ 15-50", ripple: "~US$ 0.0002", stellar: "~US$ 0.00001" },
  { metric: "Rastreabilidade", swift: "Parcial (MT103)", ripple: "Total (XRPL)", stellar: "Total (on-chain)" },
  { metric: "Disponibilidade", swift: "Horário bancário", ripple: "24/7/365", stellar: "24/7/365" },
  { metric: "ISO 20022 Nativo", swift: "Em migração (2025+)", ripple: "Sim — membro oficial", stellar: "Sim — compatível" },
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

      {/* ══════════════════════════════════════════════
          ISO 20022 – EXPANSÃO
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: `${GOLD}80` }}>Infraestrutura Digital</p>
            <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest mb-2" style={{ color: GOLD }}>
              ISO 20022 Assets
            </h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-3xl mb-8">
              Conectando o agro e a indústria brasileira ao sistema de pagamentos que substitui o SWIFT
            </p>
            <div className="h-px w-24 mb-8" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
          </FadeIn>

          {/* Intro */}
          <FadeIn delay={0.1}>
            <div className="p-6 sm:p-8 border mb-6" style={{ borderColor: `${GOLD}18`, backgroundColor: "rgba(10,10,10,0.55)" }}>
              <p className="text-sm leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.6)" }}>
                O mundo financeiro está migrando do padrão SWIFT MT (Message Type), criado nos anos 1970, para o <span style={{ color: GOLD }}>ISO 20022</span> — um protocolo de mensageria financeira que padroniza dados de pagamento com granularidade sem precedentes. Dois protocolos blockchain são <strong className="text-white/80">nativamente compatíveis</strong> com ISO 20022 e permitem liquidação em segundos com custo quase zero: <span style={{ color: GOLD }}>Ripple (XRP + XRPL)</span> e <span style={{ color: GOLD }}>Stellar (XLM)</span>.
              </p>
            </div>
          </FadeIn>

          {/* Cards XRP + XLM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <FadeIn delay={0.15}>
              <div className="p-6 border h-full" style={{ borderColor: `${GOLD}20`, backgroundColor: "rgba(28,28,28,0.5)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm" style={{ backgroundColor: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}>XRP</div>
                  <div>
                    <h3 className="font-display text-base tracking-widest" style={{ color: GOLD }}>RIPPLE (XRP + XRPL)</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Membro Oficial ISO 20022 Standards Body</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
                  A Ripple é membro oficial do comitê ISO 20022 Standards Body — o único protocolo blockchain com assento no órgão regulador. O XRP Ledger (XRPL) é utilizado por bancos institucionais como SBI Holdings, Santander e Standard Chartered para pagamentos cross-border com liquidação em 3–5 segundos. O token XRP serve como ponte de liquidez entre moedas fiduciárias, eliminando a necessidade de contas nostro/vostro que prendem trilhões de dólares no sistema SWIFT.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-6 border h-full" style={{ borderColor: `${GOLD}20`, backgroundColor: "rgba(28,28,28,0.5)" }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-display text-sm" style={{ backgroundColor: `${GOLD}15`, color: GOLD, border: `1px solid ${GOLD}30` }}>XLM</div>
                  <div>
                    <h3 className="font-display text-base tracking-widest" style={{ color: GOLD }}>STELLAR (XLM)</h3>
                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">Tokenização + Remessas de Baixo Custo</p>
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
                  A rede Stellar é otimizada para tokenização de ativos reais (commodities, imóveis, títulos de crédito) e remessas de baixo valor com custo por transação inferior a US$ 0.00001. Parcerias com MoneyGram e UNHCR demonstram escala operacional. Para o agro brasileiro, Stellar permite a tokenização de recebíveis e CPRs (Cédulas de Produto Rural) com liquidação instantânea e auditabilidade total on-chain.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Estratégia Aeternum */}
          <FadeIn delay={0.25}>
            <div className="p-6 border-l-2 mb-8" style={{ borderColor: GOLD, backgroundColor: `${GOLD}08` }}>
              <p className="text-[9px] uppercase tracking-[0.3em] mb-2" style={{ color: `${GOLD}90` }}>Estratégia Aeternum</p>
              <p className="text-sm leading-relaxed font-light" style={{ color: `${GOLD}cc`, fontStyle: "italic" }}>
                Utilizamos XRP e XLM como ponte entre o Real (BRL) e o novo sistema global ISO 20022, permitindo: hedge cambial automático via liquidação cross-border em segundos, tokenização de commodities físicas (soja, milho, café) para acesso a mercados internacionais sem intermediários, e diversificação de patrimônio em ativos digitais institucionais com liquidez 24/7.
              </p>
            </div>
          </FadeIn>

          {/* Tabela Comparativa */}
          <FadeIn delay={0.3}>
            <p className="text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: `${GOLD}80` }}>Comparativo de Infraestrutura</p>
            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ borderBottom: `1px solid ${GOLD}20` }}>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-display" style={{ color: `${GOLD}70` }}>Métrica</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-display text-center" style={{ color: "rgba(255,255,255,0.35)" }}>SWIFT</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-display text-center" style={{ color: GOLD }}>Ripple (XRP)</th>
                    <th className="py-3 px-4 text-[10px] uppercase tracking-widest font-display text-center" style={{ color: GOLD }}>Stellar (XLM)</th>
                  </tr>
                </thead>
                <tbody>
                  {swiftComparison.map((row, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${GOLD}10` }}>
                      <td className="py-3 px-4 text-xs font-light" style={{ color: "rgba(255,255,255,0.55)" }}>{row.metric}</td>
                      <td className="py-3 px-4 text-xs font-mono text-center" style={{ color: "rgba(255,255,255,0.3)" }}>{row.swift}</td>
                      <td className="py-3 px-4 text-xs font-mono text-center" style={{ color: "#4CAF50" }}>{row.ripple}</td>
                      <td className="py-3 px-4 text-xs font-mono text-center" style={{ color: "#4CAF50" }}>{row.stellar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </FadeIn>

          {/* Benefícios para o Cliente */}
          <FadeIn delay={0.35}>
            <p className="text-[9px] uppercase tracking-[0.3em] mb-4" style={{ color: `${GOLD}80` }}>Benefícios para o Cliente</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {[
                { title: "Custo de Exportação", desc: "Redução de até 95% nos custos de liquidação cross-border vs. SWIFT tradicional" },
                { title: "Liquidez 24/7", desc: "Operações fora do horário bancário com liquidação instantânea e sem intermediários" },
                { title: "Proteção Cambial", desc: "Hedge automático via stablecoins e protocolos ISO 20022 com rastreabilidade total" },
                { title: "Tokenização", desc: "Commodities físicas tokenizadas para acesso a mercados globais com transparência on-chain" },
              ].map((b, i) => (
                <div key={i} className="p-4 text-center" style={{ border: `1px solid ${GOLD}18`, backgroundColor: `${GOLD}06` }}>
                  <p className="font-display text-sm tracking-wider mb-2" style={{ color: GOLD }}>{b.title}</p>
                  <p className="text-[10px] leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.45)" }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          DIVERSIFICAÇÃO DE PATRIMÔNIO
      ══════════════════════════════════════════════ */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5" style={{ backgroundColor: "#0A0A0A" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: `${GOLD}80` }}>Gestão Quantitativa</p>
            <h2 className="font-display text-2xl sm:text-3xl uppercase tracking-widest mb-2" style={{ color: GOLD }}>
              Diversificação de Patrimônio
            </h2>
            <p className="text-sm text-muted-foreground font-light leading-relaxed max-w-3xl mb-8">
              Estratégias baseadas em pesquisa peer-reviewed para proteção e multiplicação de capital
            </p>
            <div className="h-px w-24 mb-8" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <FadeIn delay={0.1}>
              <div className="p-6 border h-full" style={{ borderColor: `${GOLD}20`, backgroundColor: "rgba(28,28,28,0.5)" }}>
                <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: `${GOLD}60` }}>EGARCH • TGARCH • GARCH-M</p>
                <h3 className="font-display text-base tracking-widest mb-3" style={{ color: GOLD }}>Volatilidade Estocástica</h3>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Utilizamos modelos GARCH avançados (EGARCH, TGARCH) validados por papers de 2022–2025 para capturar o "efeito alavancagem" em soja, milho e boi gordo. Esses modelos fornecem um mapa de volatilidade institucional que permite dimensionar posições com precisão — protegendo capital antes que crises de liquidez se materializem.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="p-6 border h-full" style={{ borderColor: `${GOLD}20`, backgroundColor: "rgba(28,28,28,0.5)" }}>
                <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: `${GOLD}60` }}>Time-MoE • Chronos • Moirai</p>
                <h3 className="font-display text-base tracking-widest mb-3" style={{ color: GOLD }}>Previsão com Foundation Models</h3>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Combinamos ARIMA clássico com Time Series Foundation Models de última geração (2024–2026). Os modelos Time-MoE e Chronos superaram previsões do USDA em até 55% de precisão para grãos. Entregamos previsões de 30, 60 e 90 dias com intervalos de confiança e cenários de estresse atualizados diariamente.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="p-6 border h-full" style={{ borderColor: `${GOLD}20`, backgroundColor: "rgba(28,28,28,0.5)" }}>
                <p className="text-[9px] tracking-[0.3em] uppercase mb-2" style={{ color: `${GOLD}60` }}>Deep Policy Gradient • PPO</p>
                <h3 className="font-display text-base tracking-widest mb-3" style={{ color: GOLD }}>Hedging por Reinforcement Learning</h3>
                <p className="text-xs leading-relaxed font-light" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Desenvolvemos algoritmos de hedging automático usando Deep Policy Gradient e Reinforcement Learning (Hanetho, 2023). Em vez de proteção estática, o sistema aprende e se adapta em tempo real — reduzindo custos de hedging em 23% a 42% comparado a métodos tradicionais, enquanto mantém cobertura de cauda equivalente.
                </p>
              </div>
            </FadeIn>
          </div>

          {/* Métricas */}
          <FadeIn delay={0.25}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { stat: "1.42", label: "Sharpe Ratio — Soja (ZS)" },
                { stat: "+54.9%", label: "Melhoria vs USDA (Trigo)" },
                { stat: "23-42%", label: "Redução Custo de Hedging" },
                { stat: "73%", label: "Taxa de Acerto vs Narrativa" },
              ].map((item, i) => (
                <div key={i} className="p-4 text-center" style={{ border: `1px solid ${GOLD}22`, backgroundColor: `${GOLD}07` }}>
                  <div className="font-display text-2xl mb-1" style={{ color: GOLD }}>{item.stat}</div>
                  <p className="text-[10px] leading-relaxed" style={{ color: "rgba(255,255,255,0.42)" }}>{item.label}</p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </main>
  );
}
