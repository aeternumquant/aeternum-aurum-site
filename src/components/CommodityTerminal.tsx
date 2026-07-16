/**
 * CommodityTerminal.tsx
 *
 * Terminal de commodities: sidebar de 10 commodities clicaveis + painel de
 * detalhe dinamico.
 *
 * Etapa 3a (dado real): as 4 commodities com serie no Supabase (soja, milho,
 * cafe, boi) mostram DADO REAL vindo do cache (valor + unidade + data + estado
 * de defasagem + atribuicao). As 6 sem fonte (trigo, algodao, acucar, cacau,
 * minerio, niobio) aparecem como "Sob consulta": sem numero e sem mock.
 *
 * Regras de honestidade aplicadas:
 *  - rotulo completo (label_pt do banco), nao encurtado para "Soja";
 *  - unidade sempre colada ao valor (soja em USD/saca, milho em BRL/saca);
 *  - data do dado visivel ("em 15/07") e badge sobrio quando defasado;
 *  - atribuicao das fontes no rodape, com a string exata do banco;
 *  - decimais em virgula (pt-BR); loading vira skeleton, erro vira mensagem.
 */
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sprout, Wheat, Combine, Coffee, Droplets, TrendingUp,
  Activity, Mountain, Gem,
} from "lucide-react";
import { useMarketData, type MarketPoint } from "../hooks/useMarketData";

/* Tipos */
type CommodityId =
  | "soja" | "milho" | "trigo" | "boi_gordo" | "cafe"
  | "algodao" | "acucar" | "cacau" | "minerio" | "niobio";

interface CommodityMeta {
  id: CommodityId;
  name: string;
  /** Metadado curto e factual. null nas linhas "sob consulta" (sem fonte). */
  subtitle: string | null;
  icon: React.ElementType;
  /** Code da serie no banco. null quando nao ha fonte (linha "sob consulta"). */
  seriesCode: string | null;
  fearTitle: string;
  fear: string[];
  greedTitle: string;
  greed: string[];
  insight?: string;
}

/* ══════════════════════════════════════════════════════
   AS 10 COMMODITIES (narrativa editorial preservada;
   numero e fonte agora vem do hook, nao daqui)
══════════════════════════════════════════════════════ */
const commodities: CommodityMeta[] = [
  /* 1. SOJA (real) */
  {
    id: "soja",
    name: "Soja",
    subtitle: "B3 · futuro SJC",
    icon: Sprout,
    seriesCode: "SOJA_FUT",
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

  /* 2. MILHO (real) */
  {
    id: "milho",
    name: "Milho",
    subtitle: "B3 · futuro CCM",
    icon: Combine,
    seriesCode: "MILHO_FUT",
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

  /* 3. TRIGO (sob consulta) */
  {
    id: "trigo",
    name: "Trigo",
    subtitle: null,
    icon: Wheat,
    seriesCode: null,
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

  /* 4. BOI GORDO (real) */
  {
    id: "boi_gordo",
    name: "Boi Gordo",
    subtitle: "B3 · futuro BGI",
    icon: TrendingUp,
    seriesCode: "BOI_FUT",
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

  /* 5. CAFÉ (real) */
  {
    id: "cafe",
    name: "Café",
    subtitle: "B3 · futuro ICF",
    icon: Coffee,
    seriesCode: "CAFE_FUT",
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

  /* 6. ALGODÃO (sob consulta) */
  {
    id: "algodao",
    name: "Algodão",
    subtitle: null,
    icon: Droplets,
    seriesCode: null,
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

  /* 7. AÇÚCAR (sob consulta) */
  {
    id: "acucar",
    name: "Açúcar",
    subtitle: null,
    icon: Activity,
    seriesCode: null,
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

  /* 8. CACAU (sob consulta) */
  {
    id: "cacau",
    name: "Cacau",
    subtitle: null,
    icon: Sprout,
    seriesCode: null,
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

  /* 9. MINÉRIO DE FERRO (sob consulta) */
  {
    id: "minerio",
    name: "Minério de Ferro",
    subtitle: null,
    icon: Mountain,
    seriesCode: null,
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

  /* 10. NIÓBIO (sob consulta) */
  {
    id: "niobio",
    name: "Nióbio",
    subtitle: null,
    icon: Gem,
    seriesCode: null,
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

/* ── Formatacao (pt-BR: virgula, unidade colada) ── */
const valueFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatValueUnit(point: MarketPoint): string {
  const v = valueFmt.format(point.value);
  return point.unit ? `${v} ${point.unit}` : v;
}

/** "em 15/07" usando a data UTC do pregao (evita virar 14/07 num fuso UTC-3). */
function formatDayMonthUTC(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

/** Chave de data em UTC (YYYY-MM-DD) para casar dias ignorando a hora. */
function utcDateKey(ts: string): string {
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

const brlFmt = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const PTAX_CODE = "PTAX_USD_VENDA";

/**
 * Conversao de REFERENCIA USD -> BRL pela PTAX, com as travas de honestidade:
 *  - so converte serie cotada em USD (nao faz o inverso em milho/boi);
 *  - exige PTAX presente, positiva e NAO defasada (isStale=false): cambio velho
 *    convertendo preco novo e pior que nao converter;
 *  - exige MESMO DIA (data UTC): a PTAX tem hora e o settlement e meia-noite,
 *    entao comparamos a data, nao o timestamp. Converter preco de 15/07 com
 *    cambio de 16/07 produz um numero que nunca existiu.
 * Devolve null quando qualquer trava falha; nesse caso mostramos so o USD.
 */
function brlReference(
  point: MarketPoint,
  ptax: MarketPoint | null,
): { brl: number; ptaxDate: string } | null {
  if (!point.unit || !point.unit.toUpperCase().startsWith("USD")) return null;
  if (!ptax || ptax.isStale) return null;
  if (!Number.isFinite(ptax.value) || ptax.value <= 0) return null;
  if (utcDateKey(point.ts) !== utcDateKey(ptax.ts)) return null;
  return { brl: point.value * ptax.value, ptaxDate: formatDayMonthUTC(ptax.ts) };
}

/* ── Pecas visuais pequenas ── */
function ValueSkeleton() {
  return <div className="h-7 w-32 rounded-sm bg-white/5 animate-pulse ml-auto" />;
}

function StaleTag({ ageInDays }: { ageInDays: number }) {
  const days = Math.floor(ageInDays);
  return (
    <span
      title={`Ultima atualizacao ha ${days} dia(s). O worker roda 2x/dia; a fonte pode ter falhado.`}
      className="ml-2 inline-block align-middle text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-sm border border-[#C6A85A]/40 text-[#C6A85A]/90"
    >
      defasado
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════ */
export default function CommodityTerminal() {
  const { data, loading, error } = useMarketData();
  const [activeId, setActiveId] = useState<CommodityId>("soja");
  const active = commodities.find((c) => c.id === activeId)!;

  const bySeries = useMemo(() => {
    const map = new Map<string, MarketPoint>();
    for (const p of data ?? []) map.set(p.code, p);
    return map;
  }, [data]);

  const activePoint = active.seriesCode ? bySeries.get(active.seriesCode) ?? null : null;

  // PTAX (uma das 7 series publicas) para a conversao de referencia USD -> BRL.
  const ptaxPoint = bySeries.get(PTAX_CODE) ?? null;
  const activeBrlRef = activePoint ? brlReference(activePoint, ptaxPoint) : null;

  // Atribuicoes unicas das series reais exibidas (string exata do banco).
  const attributions = useMemo(() => {
    const set = new Set<string>();
    for (const c of commodities) {
      if (!c.seriesCode) continue;
      const p = bySeries.get(c.seriesCode);
      if (p?.attribution) set.add(p.attribution);
    }
    return [...set];
  }, [bySeries]);

  return (
    <div className="w-full flex justify-center py-4">
      <div className="w-full max-w-6xl">

        {/* Banner honesto quando a leitura falha (nao silencia, nao zera) */}
        {error && (
          <div className="mb-3 text-xs text-[#C6A85A]/90 border border-[#C6A85A]/25 bg-[#C6A85A]/[0.03] px-3 py-2 rounded-sm">
            Não foi possível carregar os dados de mercado agora. A estrutura segue visível; os valores voltam quando a fonte responder.
          </div>
        )}

        <div className="flex flex-col md:flex-row border border-white/10 bg-[#08090c] rounded-sm overflow-hidden shadow-2xl shadow-black/60">

          {/* ── Sidebar esquerda ── */}
          <div className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-white/5 bg-black/30 flex md:flex-col overflow-x-auto md:overflow-y-auto custom-scrollbar-hide">
            {commodities.map((c) => {
              const isActive = c.id === activeId;
              const point = c.seriesCode ? bySeries.get(c.seriesCode) ?? null : null;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className={`flex-shrink-0 w-full text-left px-5 py-4 relative transition-all duration-200 ${
                    isActive ? "bg-primary/5" : "hover:bg-white/4"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebarIndicator"
                      className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary hidden md:block"
                    />
                  )}
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

                  {/* Linha de status: valor real, "Sob consulta", skeleton ou indisponivel */}
                  <div className="text-[9px] font-mono mt-1 ml-6 min-h-[12px]">
                    {!c.seriesCode ? (
                      <span className="text-muted-foreground/40 uppercase tracking-wider">Sob consulta</span>
                    ) : loading ? (
                      <span className="inline-block h-2 w-16 rounded-sm bg-white/5 animate-pulse align-middle" />
                    ) : point ? (
                      <span className={point.isStale ? "text-[#C6A85A]/70" : "text-muted-foreground/70"}>
                        {formatValueUnit(point)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/40">indisponível</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── Painel direito dinamico ── */}
          <div className="flex-1 p-6 sm:p-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.22 }}
              >
                {/* Header: rotulo completo + valor/unidade/data ou "Sob consulta" */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 pb-5 border-b border-white/5">
                  <div className="min-w-0">
                    {active.subtitle && (
                      <p className="text-[9px] text-muted-foreground/50 uppercase tracking-[0.25em] mb-1">
                        {active.subtitle}
                      </p>
                    )}
                    <h3 className="font-display text-3xl sm:text-4xl text-foreground uppercase tracking-widest">
                      {active.name}
                    </h3>
                    {/* Rotulo completo do banco (nao encurtado), so nas linhas reais */}
                    {active.seriesCode && activePoint && (
                      <p className="text-xs text-muted-foreground/70 mt-1.5 font-light">
                        {activePoint.labelPt}
                      </p>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    {!active.seriesCode ? (
                      <div className="font-mono text-lg text-muted-foreground/60 uppercase tracking-wider">
                        Sob consulta
                      </div>
                    ) : loading ? (
                      <ValueSkeleton />
                    ) : activePoint ? (
                      <>
                        <div className="font-mono text-2xl text-foreground leading-tight">
                          {formatValueUnit(activePoint)}
                        </div>
                        <div className="text-xs font-mono text-muted-foreground/60 mt-1">
                          em {formatDayMonthUTC(activePoint.ts)}
                          {activePoint.isStale && <StaleTag ageInDays={activePoint.ageInDays} />}
                        </div>
                        {activeBrlRef && (
                          <div className="text-[11px] font-mono text-muted-foreground/45 mt-1">
                            ≈ {brlFmt.format(activeBrlRef.brl)} · conversão PTAX de {activeBrlRef.ptaxDate}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="font-mono text-sm text-muted-foreground/70">
                        dado indisponível
                      </div>
                    )}
                  </div>
                </div>

                {/* Insight institucional */}
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

                {/* Two-column Fear / Greed (teses editoriais, nao dados) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="border border-[#ef4444]/15 bg-[#ef4444]/[0.025] p-5 rounded-sm hover:border-[#ef4444]/30 transition-colors flex flex-col">
                    <h4 className="text-[10px] uppercase tracking-widest mb-4 pb-2 border-b border-[#ef4444]/15" style={{ color: "#ef4444" }}>
                      {active.fearTitle}
                    </h4>
                    <ul className="space-y-3 flex-1">
                      {active.fear.map((f, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-[#ef4444]/50 text-xs shrink-0 mt-0.5">▪</span>
                          <p className="text-muted-foreground/80 text-xs leading-relaxed font-light">{f}</p>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="border border-[#10b981]/15 bg-[#10b981]/[0.025] p-5 rounded-sm hover:border-[#10b981]/30 transition-colors flex flex-col">
                    <h4 className="text-[10px] uppercase tracking-widest mb-4 pb-2 border-b border-[#10b981]/15" style={{ color: "#10b981" }}>
                      {active.greedTitle}
                    </h4>
                    <ul className="space-y-3 flex-1">
                      {active.greed.map((g, i) => (
                        <li key={i} className="flex gap-2.5">
                          <span className="text-[#10b981]/50 text-xs shrink-0 mt-0.5">▪</span>
                          <p className="text-white/80 text-xs leading-relaxed font-light">{g}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Rodape: atribuicao das fontes (string exata do banco) */}
                {attributions.length > 0 && (
                  <div className="mt-7 pt-4 border-t border-white/5 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {attributions.map((a) => (
                      <span key={a} className="text-[10px] text-muted-foreground/50">{a}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground/35">Cache Aeternum, atualizado 2x/dia.</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </div>
  );
}
