/**
 * CommodityTerminal.tsx
 *
 * Sidebar esquerda com 10 commodities individuais clicáveis.
 * Painel direito dinâmico com: preço + variação, indicadores rápidos,
 * duas colunas Fear (vermelho #ef4444) / Greed (dourado #C6A85A).
 *
 * Estado inicial: "Soja" selecionada por padrão.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Wheat, Combine, Coffee, Droplets, TrendingUp,
  Activity, Coins, Mountain, Gem,
} from "lucide-react";

/* ── Tipos ── */
type CommodityId =
  | "soja" | "milho" | "trigo" | "boi_gordo" | "cafe"
  | "algodao" | "acucar" | "cacau" | "minerio" | "niobio";

interface IndicatorSet {
  label: string;
  val: string;
  color: string;
}

interface Commodity {
  id: CommodityId;
  name: string;
  subtitle: string;
  price: string;
  variation: string;
  trendDown: boolean;
  icon: React.ElementType;
  indicators: {
    a: IndicatorSet;
    b: IndicatorSet;
    c: IndicatorSet;
    d: IndicatorSet;
  };
  fearTitle: string;
  fear: string[];
  greedTitle: string;
  greed: string[];
  /** Frase institucional curta (Drew Crawford insight) */
  insight?: string;
}

/* ══════════════════════════════════════════════════════
   DADOS DAS 10 COMMODITIES
══════════════════════════════════════════════════════ */
const commodities: Commodity[] = [
  /* ─── 1. SOJA ─── */
  {
    id: "soja",
    name: "Soja",
    subtitle: "CBOT · Saca 60kg",
    price: "R$ 133,40",
    variation: "-1.2%",
    trendDown: true,
    icon: Sprout,
    indicators: {
      a: { label: "VIX Agrícola", val: "24.8", color: "text-orange-400" },
      b: { label: "NetGEX", val: "-$420M", color: "text-red-500" },
      c: { label: "Q-Score (CTA)", val: "-1.8 SD", color: "text-orange-400" },
      d: { label: "Baseline Vol", val: "14.2%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Tensões no Mar Negro + retenção de exportação russa afetam 30% do trigo global — soja sofre contágio direto.",
      "OVX em alta = frete explode → custo de escoamento de Goiás para Santos dispara sem aviso.",
      "Gamma Wall em US$ 11,80/bushel → preço ricocheteia sem nenhuma notícia fundamental.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Hedge institucional com assimetria positiva via modelos CTA calibrados para o Basis de Goiás.",
      "Parceiros diretos de escoamento na China + UAE — contratos de receita já estruturados e tokenizados.",
      "Tokenização de CPR / CDA via Stellar → liquidez instantânea sem banco, sem taxa CDI.",
    ],
    insight: "Brasil produz 6 em cada 10 toneladas de soja exportadas no mundo. A rota Mato Grosso–Hong Kong é a nova artéria da proteína global.",
  },

  /* ─── 2. MILHO ─── */
  {
    id: "milho",
    name: "Milho",
    subtitle: "CBOT · Saca 60kg",
    price: "R$ 54,20",
    variation: "+0.8%",
    trendDown: false,
    icon: Combine,
    indicators: {
      a: { label: "VIX Agrícola", val: "22.1", color: "text-primary" },
      b: { label: "NetGEX", val: "+$150M", color: "text-[#C6A85A]" },
      c: { label: "CTA Exposure", val: "Neutral", color: "text-muted-foreground" },
      d: { label: "Baseline Vol", val: "18.5%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Descolamento do Basis B3–CBOT impede hedges tradicionais de funcionar nas janelas de rolagem.",
      "Choques El Niño/La Niña com lags ocultos — modelos climáticos privados chegam tarde demais.",
      "Alta correlação com energia: when OVX sobe, o custo de secagem e frete terrestre explode.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Pair Trading algorítmico inter-safras (verão/inverno) com margem isolada e sizing por volatilidade.",
      "Monitoramento satelital de umidade para antecipar o Basis real antes do USDA reportar.",
      "Colateral on-chain de CPR de milho indexado em USDC → custo de capital zero para o produtor.",
    ],
    insight: "Brasil é o 2º exportador mundial de milho — safra 23/24 recorde de 135 M ton. CBOT ainda subestima a oferta brasileira.",
  },

  /* ─── 3. TRIGO ─── */
  {
    id: "trigo",
    name: "Trigo",
    subtitle: "CBOT · Saca 60kg",
    price: "R$ 76,50",
    variation: "+2.1%",
    trendDown: false,
    icon: Wheat,
    indicators: {
      a: { label: "VIX Hedger", val: "31.5", color: "text-red-500" },
      b: { label: "Gamma Profile", val: "Short", color: "text-red-500" },
      c: { label: "Q-Score", val: "+2.1 SD", color: "text-[#C6A85A]" },
      d: { label: "Baseline Vol", val: "24.1%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Rússia controla 22% das exportações globais via Mar Negro — qualquer escalada trava o fluxo e explode o preço.",
      "Brasil importa ~7 M ton/ano: custo de importação sobe com câmbio e frete sem hedge estruturado.",
      "Failed Auctions na CME criam lacunas de liquidez que eliminam stops sem motivo fundamental.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Arbitragem espacial CME vs Euronext parametrizada — captura o spread antes que o mercado feche.",
      "Trava Estruturada via matriz de opções (call spread) fixando custo de importação em patamar conhecido.",
      "Trade finance via rede de parceiros em Dubai para clearing internacional sem banco correspondente.",
    ],
    insight: "Egito é o 2º maior importador de trigo do mundo — e o Brasil tem posição privilegiada para fornecimento via parceiros do Mediterrâneo.",
  },

  /* ─── 4. BOI GORDO ─── */
  {
    id: "boi_gordo",
    name: "Boi Gordo",
    subtitle: "B3 · @15kg",
    price: "R$ 321,80",
    variation: "-0.5%",
    trendDown: true,
    icon: TrendingUp,
    indicators: {
      a: { label: "VIX Pecuário", val: "19.8", color: "text-primary" },
      b: { label: "NetGEX B3", val: "Neutro", color: "text-muted-foreground" },
      c: { label: "Q-Score", val: "-0.5 SD", color: "text-primary" },
      d: { label: "Baseline Vol", val: "12.3%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Banimentos sanitários por febre aftosa ou BSE travam exportação da noite para o dia sem aviso.",
      "Basis Risk irrecuperável entre mercado físico e contrato futuro B3 em momentos de liquidação.",
      "Custo de reposição (garrote) descolado da curva forward da arroba — ciclo pecuário distorcido.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Cross-hedge proprietário Grãos–Proteína travando a relação de crushing spread boi/milho.",
      "Opções exóticas customizadas cobrindo picos de custo de reposição no pico do ciclo de alta.",
      "Auditoria IoT de rastreabilidade + tokenização on-chain permitindo acesso a mercados premium.",
    ],
    insight: "Brasil é o maior exportador de carne bovina global (27%) — China concentra 50% do volume. Rota Goiás–Xangai é estratégica.",
  },

  /* ─── 5. CAFÉ ─── */
  {
    id: "cafe",
    name: "Café",
    subtitle: "ICE NY · US¢/lb",
    price: "USD 4.82/lb",
    variation: "+4.2%",
    trendDown: false,
    icon: Coffee,
    indicators: {
      a: { label: "VIX Proxy", val: "42.0", color: "text-red-500" },
      b: { label: "ICE Gamma", val: "+$850M", color: "text-[#C6A85A]" },
      c: { label: "CTA Position", val: "Max Long", color: "text-red-500" },
      d: { label: "Baseline Vol", val: "38.2%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Short Squeeze estrutural forçado por fundos na ICE NY — exportadores com posição short são dizimados.",
      "Geadas pontuais em MG/SP com modelos meteorológicos privados chegando com 5 dias de atraso.",
      "Risco de contraparte elevado nas tradings em momentos de margin calls extremas e liquidações.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Mapeamento termal satelital preditivo anulando o atraso informacional (vs USDA e CONAB).",
      "Volatility Selling estruturado configurado para lucrar via Theta quando o mercado atinge histeria.",
      "Integração com redes de trade finance suíças para clearing premium isolado do câmbio local.",
    ],
    insight: "Brasil produz 1 em cada 3 xícaras de café consumidas no planeta — 38% da oferta global. O mercado ainda subestima o poder de pricing.",
  },

  /* ─── 6. ALGODÃO ─── */
  {
    id: "algodao",
    name: "Algodão",
    subtitle: "ICE NY · US¢/lb",
    price: "USD 0.68/lb",
    variation: "-0.2%",
    trendDown: true,
    icon: Droplets,
    indicators: {
      a: { label: "Macro Risk", val: "20.1", color: "text-primary" },
      b: { label: "GEX ICE", val: "-$120M", color: "text-red-500" },
      c: { label: "Trend Algo", val: "Short", color: "text-red-500" },
      d: { label: "Implied Vol", val: "19.8%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Dependência aguda do ciclo macro chinês — desaceleração da indústria têxtil destrói demanda instantaneamente.",
      "Distorção cambial BRL/USD corroendo margens entre custo de insumo e preço de venda na ICE.",
      "Acumulação excessiva de certificados físicos em Rotterdam/Genebra distorcendo o spread rolagem.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Hedge multi-moeda dinâmico isolando o alfa do câmbio — retorno em USD protegido de ambos os lados.",
      "Swaps OTC facilitando rolagem de contratos sem spread destruidor de book institucional.",
      "Rotas de escoamento Indo-Pacífico garantidas com clearing via parceiros não-bancários em Singapura.",
    ],
    insight: "Brasil é o 2º maior exportador global de algodão — Centro-Oeste concentra 70% da produção. Viet Nam e Paquistão absorvem a demanda têxtil.",
  },

  /* ─── 7. AÇÚCAR ─── */
  {
    id: "acucar",
    name: "Açúcar",
    subtitle: "ICE NY · US¢/100lb",
    price: "USD 18.4/lb",
    variation: "+1.5%",
    trendDown: false,
    icon: Activity,
    indicators: {
      a: { label: "Policy Risk", val: "25.2", color: "text-orange-400" },
      b: { label: "Gamma Bias", val: "Call Heavy", color: "text-[#C6A85A]" },
      c: { label: "CTA Exposure", val: "+2.8 SD", color: "text-red-500" },
      d: { label: "Baseline Vol", val: "22.4%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Políticas de retenção da Índia e Tailândia travam o escoamento global e colapsam preços sem aviso.",
      "Limit Ups após geadas ou pragas imprevistas liquidam stops sem chance de defesa operacional.",
      "Trend Followers (CTA Max Long) criando overshooting irracional de +40% em semanas.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Q-Score rastreando exaustão do capital CTA para cronometrar saída antes da reversão agressiva.",
      "Carry sintético via opções gerando yield em entressafra — mesmo quando cana 'dorme'.",
      "Smart Contracts atrelando faturamento ICE à wallet corporativa com liquidação T+0.",
    ],
    insight: "Mais da metade do açúcar comercializado no mundo é brasileiro — ~40% do mercado global. Maior mispricing de poder de precificação do agro.",
  },

  /* ─── 8. CACAU ─── */
  {
    id: "cacau",
    name: "Cacau",
    subtitle: "ICE London · USD/ton",
    price: "USD 8.240/ton",
    variation: "+12.4%",
    trendDown: false,
    icon: Sprout,
    indicators: {
      a: { label: "ICE Vol", val: "58.1", color: "text-red-500" },
      b: { label: "Gamma Profile", val: "Explosive", color: "text-red-500" },
      c: { label: "Short Squeeze", val: "Extremo", color: "text-red-500" },
      d: { label: "Baseline Vol", val: "45.2%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Pragas biológicas na Costa do Marfim + Ghana destruíram 374 K ton em 23/24 — déficit histórico.",
      "Margin calls na ICE London colapsando tradings primárias e contaminando toda a cadeia de crédito.",
      "Alta da volatilidade implícita tornando opções de proteção proibitivamente caras para os exportadores.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Satélites de índice verde (NDVI) detectando floração e estoque antes de qualquer relatório oficial.",
      "Delta-zero puts em prazos longos capturando a reversão sem exposição direcional ao caos.",
      "Counterparty alternativa direta eliminando a dependência das tradings europeias em colapso.",
    ],
    insight: "Bahia representa 60% da produção brasileira de cacau. O déficit global criou o maior short squeeze da commoditie desde 1977.",
  },

  /* ─── 9. MINÉRIO DE FERRO ─── */
  {
    id: "minerio",
    name: "Minério de Ferro",
    subtitle: "SGX · USD/ton 62% Fe",
    price: "USD 105.40/ton",
    variation: "-1.8%",
    trendDown: true,
    icon: Mountain,
    indicators: {
      a: { label: "China PMI", val: "49.1", color: "text-red-500" },
      b: { label: "Portfólio Vale", val: "Long", color: "text-[#C6A85A]" },
      c: { label: "CTA Signal", val: "-1.4 SD", color: "text-orange-400" },
      d: { label: "Iron Vol 30d", val: "28.7%", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "PMI industrial chinês abaixo de 50 = demanda de aço cai e o preço do minério derruba em cascata.",
      "Barragens de rejeitos: riscos regulatórios e ESG bloqueando projetos inteiros da noite para o dia.",
      "Austrália (Rio Tinto/BHP) expande capacidade → pressão competitiva crônica sobre Vale e preços FOB.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "Modelo preditivo de demanda de aço chinês (crédito + PMI + inventários) para timing de entrada.",
      "Estratégias de futures spread SGX vs Dalian Commodity Exchange capturando o basis Asia.",
      "Acesso a network de tradings asiáticas especializadas para execução OTC premium sem slippage.",
    ],
    insight: "Brasil lidera exportações de minério de ferro para China e Ásia. Vale sozinha responde por 20% do supply global — poder de pricing enorme.",
  },

  /* ─── 10. NIÓBIO ─── */
  {
    id: "niobio",
    name: "Nióbio",
    subtitle: "OTC · USD/kg FeNb",
    price: "USD 42,00/kg",
    variation: "+0.0%",
    trendDown: false,
    icon: Gem,
    indicators: {
      a: { label: "Supply Conc.", val: "94% BR", color: "text-[#C6A85A]" },
      b: { label: "EV Demand", val: "Acelerado", color: "text-[#C6A85A]" },
      c: { label: "Liquidity", val: "OTC Only", color: "text-orange-400" },
      d: { label: "Price Vol", val: "Baixa", color: "text-primary" },
    },
    fearTitle: "Riscos invisíveis",
    fear: [
      "Mercado 100% OTC e opaco — não há bolsa de referência, formação de preço controlada por CBMM.",
      "Substitutos tecnológicos (vanádio, titânio) podem erodir a vantagem estratégica em nicho de mercado.",
      "Risco de expropriação ou imposição de royalties elevados dado o caráter estratégico nacional do ativo.",
    ],
    greedTitle: "Proteção Aeternum",
    greed: [
      "94% da produção mundial sai do Brasil — poder de precificação sem precedente para quem entende o ativo.",
      "Contratos bilaterais de longo prazo com siderúrgicas asiáticas e europeias garantindo premium estrutural.",
      "Tokenização de contratos futuros de FeNb via Stellar abrindo mercado de capitais não-bancário.",
    ],
    insight: "Brasil controla 94% da produção mundial de nióbio — essencial para aço, carros elétricos, aviões e imagens de ressonância. O maior monopólio de recurso estratégico do planeta.",
  },
];

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export default function CommodityTerminal() {
  const [activeId, setActiveId] = useState<CommodityId>("soja");
  const active = commodities.find((c) => c.id === activeId)!;

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-6xl">
        <div className="flex flex-col md:flex-row border border-white/10 bg-[#08090c] rounded-sm overflow-hidden shadow-2xl shadow-black/60">

          {/* ── Sidebar esquerda (lista de commodities) ── */}
          <div className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-black/30 flex md:flex-col overflow-x-auto md:overflow-y-auto custom-scrollbar-hide">
            {commodities.map((c) => {
              const isActive = c.id === activeId;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex-shrink-0 w-full text-left px-5 py-4 relative transition-all duration-200 ${
                    isActive ? "bg-primary/5" : "hover:bg-white/4"
                  }`}
                >
                  {/* Indicador esquerdo ativo */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarIndicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary hidden md:block"
                    />
                  )}
                  {/* Indicador inferior ativo (mobile) */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebarIndicatorMobile"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary md:hidden"
                    />
                  )}

                  <div className="flex items-center gap-2.5">
                    <c.icon
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-primary" : "text-muted-foreground/40"}`}
                    />
                    <span
                      className={`font-display tracking-widest text-[13px] uppercase ${
                        isActive ? "text-primary" : "text-muted-foreground/60"
                      }`}
                    >
                      {c.name}
                    </span>
                  </div>

                  {/* Variação % visível na sidebar */}
                  <div className={`text-[9px] font-mono mt-1 ml-6 ${c.trendDown ? "text-red-500/70" : "text-green-400/70"}`}>
                    {c.variation} &nbsp;·&nbsp; {c.subtitle.split("·")[0].trim()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Painel direito dinâmico ── */}
          <div className="flex-1 p-6 sm:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                {/* ── Header: nome + preço ── */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-5 border-b border-white/5">
                  <div>
                    <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.25em] mb-1">
                      {active.subtitle}
                    </p>
                    <h3 className="font-display text-3xl sm:text-4xl text-foreground uppercase tracking-widest">
                      {active.name}
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="font-mono text-2xl text-foreground leading-tight">
                      {active.price}
                    </div>
                    <div className={`text-sm font-mono tracking-wider mt-1 ${active.trendDown ? "text-red-500" : "text-green-400"}`}>
                      {active.variation}
                    </div>
                  </div>
                </div>

                {/* ── Indicadores rápidos (4 colunas) ── */}
                <div className="grid grid-cols-4 gap-0 border border-white/5 bg-black/20 mb-7 divide-x divide-white/5">
                  {Object.values(active.indicators).map((ind, i) => (
                    <div key={i} className="flex flex-col items-center justify-center text-center py-3 px-2">
                      <span className="text-[8px] text-muted-foreground/50 uppercase tracking-widest mb-1.5">
                        {ind.label}
                      </span>
                      <span className={`text-xs font-mono font-semibold ${ind.color}`}>
                        {ind.val}
                      </span>
                    </div>
                  ))}
                </div>

                {/* ── Insight institucional (Drew Crawford) ── */}
                {active.insight && (
                  <div
                    className="mb-6 px-4 py-3 border-l-2 text-xs leading-relaxed italic"
                    style={{
                      borderColor: "#C6A85A",
                      backgroundColor: "rgba(198,168,90,0.04)",
                      color: "rgba(198,168,90,0.75)",
                    }}
                  >
                    {active.insight}
                  </div>
                )}

                {/* ── Two-column Fear / Greed ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                  {/* Fear — card esquerdo vermelho "Riscos Invisíveis" */}
                  <div className="border border-[#ef4444]/15 bg-[#ef4444]/[0.025] p-5 rounded-sm hover:border-[#ef4444]/30 transition-colors flex flex-col">
                    <h4 className="text-[10px] uppercase tracking-widest mb-4 pb-2 border-b border-[#ef4444]/15" style={{ color: "#ef4444" }}>
                      {active.fearTitle}
                    </h4>
                    <ul className="space-y-3 flex-1">
                      {active.fear.map((f, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-[#ef4444]/50 text-xs shrink-0 mt-0.5">▪</span>
                          <p className="text-muted-foreground/80 text-xs leading-relaxed font-light">
                            {f}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Greed — card direito verde #10b981 "Proteção Aeternum" */}
                  <div className="border border-[#10b981]/15 bg-[#10b981]/[0.025] p-5 rounded-sm hover:border-[#10b981]/30 transition-colors flex flex-col">
                    <h4 className="text-[10px] uppercase tracking-widest mb-4 pb-2 border-b border-[#10b981]/15" style={{ color: "#10b981" }}>
                      {active.greedTitle}
                    </h4>
                    <ul className="space-y-3 flex-1">
                      {active.greed.map((g, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-[#10b981]/50 text-xs shrink-0 mt-0.5">▪</span>
                          <p className="text-white/80 text-xs leading-relaxed font-light">
                            {g}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>

                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
