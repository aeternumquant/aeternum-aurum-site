/**
 * GlobalFlowMap.tsx — Mapa Mundial de Fluxos de Commodities
 *
 * Design: institucional minimalista — sem emojis, tipografia limpa.
 * Features:
 *   - 25+ países estratégicos para o agronegócio brasileiro
 *   - 20 commodities agrupadas em Agro / Metais / Energia
 *   - Linhas de fluxo: verde (parceria), vermelho (competição), dourado (estratégico)
 *   - Painel lateral desktop / bottom-sheet mobile (não cobre o mapa)
 *   - Painel de países estratégicos abaixo do mapa com detalhes por clique
 *   - Dados mock nível Bloomberg: preço, variação, volume, pontos-chave
 */
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useMarketData, type MarketPoint } from "../../hooks/useMarketData";
import {
  formatValueUnit,
  formatDayMonthUTC,
  formatMonthUTC,
  brlConvert,
  formatBRLRefApprox,
} from "../../lib/marketFormat";
import CommodityFlowMap from "./CommodityFlowMap";
import { useTradeFlows } from "../../hooks/useTradeFlows";
import { usePsdRanking, fmtPsd as fmtPsdRank } from "../../hooks/usePsdRanking";
import { useUsgsRanking, fmtUsgs } from "../../hooks/useUsgs";
import RareEarthMap from "./RareEarthMap";
import { FLOW_CARDS } from "../../lib/flowMapConfig";

/* ── Dourado da marca ── */
const GOLD = "#C6A85A";

// Painel de rodape preservado para o futuro card de COMPETIDOR (nao renderiza).
const SHOW_STRATEGIC_PANEL = false;

type AssetType =
  | "Soja" | "Milho" | "Trigo" | "Brent" | "Ouro" | "Prata"
  | "Cobre" | "GasNatural" | "Aluminio" | "Paladio"
  | "Cafe" | "Algodao" | "BoiGordo" | "Acucar" | "Cacau"
  | "Arroz" | "Frango" | "Laranja" | "Etanol" | "Amendoim"
  | "MinerioFerro" | "Niobio"
  | "Ureia" | "KCl" | "MAP" | "TSP" | "Rocha"
  | "TerrasRaras"
  | null;

type MapCategory = "Agro" | "Minérios" | "Energia" | "Fertilizantes" | "Terras raras";

/* ── Países estratégicos para o painel abaixo do mapa ── */
const strategicCountries = [
  {
    id: "CN", label: "China", region: "Ásia",
    partners: 8,
    keyPoints: [
      "Maior importador global de soja (58%) e carne bovina",
      "Sinal de compra define o CME Group",
      "Reservas em alta — demanda de ouro +18% a/a",
    ],
    exports: ["Soja", "Milho", "Boi Gordo", "Algodão", "Cacau"],
  },
  {
    id: "US", label: "EUA", region: "América do Norte",
    partners: 7,
    keyPoints: [
      "CBOT Chicago: referência global de preços",
      "Principal competidor do Brasil em soja e milho",
      "Henry Hub: benchmark global de GNL",
    ],
    exports: ["Soja", "Milho", "Café", "Ouro", "Petróleo"],
  },
  {
    id: "IN", label: "Índia", region: "Ásia",
    partners: 5,
    keyPoints: [
      "Segundo maior importador de açúcar e oleaginosas",
      "Demanda de frango em crescimento acelerado",
      "Mandato de blending etanol-gasolina: 20% até 2025",
    ],
    exports: ["Açúcar", "Algodão", "Frango", "Etanol"],
  },
  {
    id: "JP", label: "Japão", region: "Ásia",
    partners: 5,
    keyPoints: [
      "3º maior importador de café no mundo",
      "Principal destino asiático de frango brasileiro",
      "Alto consumo de proteína animal com rastreabilidade exigida",
    ],
    exports: ["Café", "Frango", "Soja", "Milho"],
  },
  {
    id: "KR", label: "Coreia do Sul", region: "Ásia",
    partners: 4,
    keyPoints: [
      "Importador crescente de milho e frango",
      "Demanda por café premium em alta",
      "Hub logístico para Extremo Oriente",
    ],
    exports: ["Milho", "Frango", "Café", "Soja"],
  },
  {
    id: "SA", label: "Arábia Saudita", region: "Oriente Médio",
    partners: 4,
    keyPoints: [
      "Principal destino de carne halal do Brasil",
      "Controla 12% da oferta global de petróleo (OPEC+)",
      "Estreito de Ormuz: chokepoint crítico global",
    ],
    exports: ["Boi Gordo", "Frango", "Açúcar"],
  },
  {
    id: "EG", label: "Egito", region: "África do Norte",
    partners: 3,
    keyPoints: [
      "2º maior importador de trigo do mundo",
      "Demanda crescente de carne bovina brasileira",
      "Canal de Suez: rota estratégica para Europa",
    ],
    exports: ["Trigo", "Boi Gordo", "Frango"],
  },
  {
    id: "ID", label: "Indonésia", region: "Ásia",
    partners: 4,
    keyPoints: [
      "Maior importador de açúcar da Ásia",
      "Demanda de soja para ração e tofu",
      "Produção própria de borracha e amendoim",
    ],
    exports: ["Açúcar", "Soja", "Algodão"],
  },
  {
    id: "MX", label: "México", region: "América do Norte",
    partners: 3,
    keyPoints: [
      "Importador de milho amarelo para ração",
      "Mercado emergente de café e açúcar",
      "Parceiro no USMCA (acesso ao mercado norte-americano)",
    ],
    exports: ["Milho", "Café", "Açúcar"],
  },
  {
    id: "VN", label: "Vietnã", region: "Ásia",
    partners: 3,
    keyPoints: [
      "Maior importador de algodão brasileiro na Ásia",
      "Indústria têxtil com demanda crescente",
      "Importador de milho para ração de suínos",
    ],
    exports: ["Algodão", "Milho", "Café"],
  },
  {
    id: "EU", label: "União Europeia", region: "Europa",
    partners: 6,
    keyPoints: [
      "60% das exportações brasileiras de suco de laranja",
      "Principal importador de café do Brasil",
      "Regulação EUDR impacta cacau e soja a partir de 2025",
    ],
    exports: ["Suco de Laranja", "Café", "Soja", "Cacau"],
  },
  {
    id: "AE", label: "Emirados", region: "Oriente Médio",
    partners: 3,
    keyPoints: [
      "Hub de reexportação regional para Oriente Médio e África",
      "Free trade zones facilitam logística de commodities",
      "Demanda crescente de protein animal premium",
    ],
    exports: ["Boi Gordo", "Frango", "Açúcar"],
  },
];

/* ── Dados de commodities — sem emojis, estilo institucional ── */
const assetFlows: Record<NonNullable<AssetType>, {
  label: string;
  category: MapCategory;
  flowData: string;
  percentage: string;
  volume?: string;
}> = {
  Soja: {
    label: "Soja", category: "Agro",
    flowData: "Brasil exporta 45% da soja global (≈55M toneladas). China responde por 58% do destino. Referência CME/CBOT. Safra BR 23/24: recorde de 158M ton.",
    percentage: "45% global", volume: "55M ton/ano",
  },
  Milho: {
    label: "Milho", category: "Agro",
    flowData: "Brasil 2º exportador mundial. Safra 23/24 recorde de 135M ton. China absorveu 11M ton. Referência CBOT Chicago.",
    percentage: "28% global", volume: "135M ton/ano",
  },
  Cafe: {
    label: "Café", category: "Agro",
    flowData: "Brasil: maior produtor mundial (38% da oferta). Café arábica referenciado na ICE NY (KC). Presença em 80+ países exportadores.",
    percentage: "38% global", volume: "68M sacas/ano",
  },
  BoiGordo: {
    label: "Boi Gordo", category: "Agro",
    flowData: "Brasil: maior exportador de carne bovina global (27%). China concentra 50% do volume. Contrato futuro negociado na B3/BM&F.",
    percentage: "27% global", volume: "2.8M ton/ano",
  },
  Algodao: {
    label: "Algodão", category: "Agro",
    flowData: "Brasil: 2º maior exportador global. Centro-Oeste concentra 70% da produção. Referência ICE NY (CT).",
    percentage: "22% global", volume: "3.4M ton/ano",
  },
  Acucar: {
    label: "Açúcar", category: "Agro",
    flowData: "Brasil: maior produtor e exportador mundial, ≈40% do mercado. Safra Centro-Sul 24/25 estimada em 680M ton de cana. ICE NY (SB).",
    percentage: "40% global", volume: "36M ton/ano",
  },
  Cacau: {
    label: "Cacau", category: "Agro",
    flowData: "Brasil: 6º produtor mundial, Bahia com 60% da produção. Déficit global de 374K ton em 23/24 impulsionou preços +70%.",
    percentage: "6% global", volume: "300K ton/ano",
  },
  Arroz: {
    label: "Arroz", category: "Agro",
    flowData: "Brasil: maior produtor fora da Ásia. RS responde por 70% da produção nacional. Foco no mercado interno e Mercosul.",
    percentage: "2% global", volume: "12M ton/ano",
  },
  Frango: {
    label: "Frango", category: "Agro",
    flowData: "Brasil: maior exportador global de frango (37%). Golfo Pérsico e Japão são destinos históricos. JBS, BRF e Marfrig lideram.",
    percentage: "37% global", volume: "5.1M ton/ano",
  },
  Laranja: {
    label: "Suco de Laranja", category: "Agro",
    flowData: "Brasil: monopolista global com 75% das exportações de FCOJ. São Paulo + Triângulo Mineiro. ICE NY (OJ).",
    percentage: "75% global", volume: "1.7M ton FCOJ",
  },
  Etanol: {
    label: "Etanol", category: "Agro",
    flowData: "Brasil: 2º maior produtor global de etanol (cana). Capacidade de 35B litros/ano. Paridade com gasolina é principal driver interno.",
    percentage: "25% global", volume: "35B litros/ano",
  },
  Amendoim: {
    label: "Amendoim", category: "Agro",
    flowData: "Brasil: 2º exportador de amendoim in natura. SP concentra 80% da produção. Crescimento por pet food e indústria alimentícia.",
    percentage: "18% global", volume: "600K ton/ano",
  },
  Trigo: {
    label: "Trigo", category: "Agro",
    flowData: "Rússia controla 22% das exportações via Mar Negro. Brasil importa ≈7M ton/ano do Mercosul e Mar Negro.",
    percentage: "22% global (RU)", volume: "800M ton/ano",
  },
  // ── Minérios ──
  Ouro: {
    label: "Ouro", category: "Minérios",
    flowData: "Precificado na CME/COMEX e armazenado em cofres via LBMA. Bancos Centrais adicionaram 1.037 ton em 2023 — maior compra desde 1967.",
    percentage: "Reserva global", volume: "3.644 ton/ano",
  },
  Prata: {
    label: "Prata", category: "Minérios",
    flowData: "Metal dual: industrial (solar consome 14%/ano) e reserva de valor. COMEX define spot global. Déficit estrutural pelo boom solar.",
    percentage: "Ref. COMEX", volume: "25.000+ ton/ano",
  },
  Cobre: {
    label: "Cobre", category: "Minérios",
    flowData: "Metal da transição energética. China consome 55% da demanda. Chile é maior produtor. LME London define preço spot global.",
    percentage: "Ref. LME", volume: "24M ton/ano",
  },
  Aluminio: {
    label: "Alumínio", category: "Minérios",
    flowData: "China domina 60% da produção global. Custo energético define competitividade. LME London é bolsa de referência.",
    percentage: "Ref. LME", volume: "69M ton/ano",
  },
  Paladio: {
    label: "Paládio", category: "Minérios",
    flowData: "PGM raro para catalisadores automotivos. Rússia + África do Sul = 80% oferta. Substitui platina como tendência de risco.",
    percentage: "Ref. NYMEX", volume: "220+ ton/ano",
  },
  // ── Energia ──
  Brent: {
    label: "Petróleo Brent", category: "Energia",
    flowData: "Fluxo via Estreito de Ormuz (20% do petróleo global). Arabia Saudita e OPEC+ controlam produção. ICE London é bolsa de referência.",
    percentage: "21M bbl/dia", volume: "Hormuz chokepoint",
  },
  GasNatural: {
    label: "Gás Natural", category: "Energia",
    flowData: "Mercados regionais segmentados. EUA (Henry Hub), Europa (TTF Amsterdam), Golfo (GNL). Brasil: gás boliviano + GNL.",
    percentage: "Ref. Henry Hub", volume: "4.000+ bcm/ano",
  },
  // ── Minério de Ferro ──
  MinerioFerro: {
    label: "Minério de Ferro", category: "Minérios",
    flowData: "Brasil é o 2º maior exportador mundial de minério (Vale + CSN). China absorve 70% do volume. Preço referenciado na SGX Singapore e Dalian Commodity Exchange (DCE). Vale sozinha = 20% do supply global.",
    percentage: "20% global (Vale)", volume: "400M ton/ano",
  },
  // ── Nióbio ──
  Niobio: {
    label: "Nióbio", category: "Minérios",
    flowData: "Brasil controla 94% da produção mundial de nióbio via CBMM (Araxá-MG). Metal estratégico para aço de alta resistência, carros elétricos, aviões e ressonâncias magnéticas. Mercado OTC: sem bolsa de referência pública.",
    percentage: "94% global", volume: "90K ton FeNb/ano",
  },
  // ── Fertilizantes (importacao; renderizam SEMPRE pela lei nova/FLOW_CARDS;
  //    os campos editoriais do mapa velho ficam vazios de proposito) ──
  Ureia: { label: "Ureia", category: "Fertilizantes", flowData: "", percentage: "" },
  KCl:   { label: "KCl (potássio)", category: "Fertilizantes", flowData: "", percentage: "" },
  MAP:   { label: "Fosfatado (MAP)", category: "Fertilizantes", flowData: "", percentage: "" },
  TSP:   { label: "TSP", category: "Fertilizantes", flowData: "", percentage: "" },
  Rocha: { label: "Rocha fosfática", category: "Fertilizantes", flowData: "", percentage: "" },
  // ── Terras raras (aba propria; renderiza o card de GAP reserva-vs-producao) ──
  TerrasRaras: { label: "Terras raras", category: "Terras raras", flowData: "", percentage: "" },
};

// Fertilizantes: a unica categoria toda de IMPORTACAO. A aba propria deixa a
// assimetria visivel — tres abas do que sai, uma do que entra.
const categories: { key: MapCategory }[] = [
  { key: "Agro" },
  { key: "Minérios" },
  { key: "Energia" },
  { key: "Fertilizantes" },
  { key: "Terras raras" },
];

/* ── Variação em vírgula decimal (pt-BR), 2 casas — ex.: "1,82" ── */
const pctFmt = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* ── Vermelho sóbrio (Sistema A) para o estado defasado — não neon ── */
const RED_STALE = "#C0564C";

/**
 * Linha de frescor/período de um ponto. A honestidade mora aqui:
 *  - mensal: "Média de junho/2026" — NUNCA "01/06". O Pink Sheet publica a média
 *    do mês; mostrar o dia apresentaria a média como preço de uma data única.
 *  - diária/contínua: "Atualizado DD/MM".
 *  - defasado (isStale): "Última atualização <ref>" em vermelho sóbrio.
 * `withMarket` prefixa o mercado onde o preço se forma (B3, LBMA…), quando há.
 * `lower` deixa a palavra minúscula para uso inline no bloco secundário.
 */
function freshnessLine(
  point: MarketPoint,
  opts?: { withMarket?: boolean; lower?: boolean },
): { text: string; stale: boolean } {
  const withMarket = opts?.withMarket ?? true;
  const isMonthly = point.frequency === "mensal";
  const ref = isMonthly ? formatMonthUTC(point.ts) : formatDayMonthUTC(point.ts);
  const mkt = withMarket && point.market ? `${point.market} · ` : "";
  const word = (s: string) => (opts?.lower ? s.toLowerCase() : s);
  if (point.isStale) return { text: `${mkt}${word("Última atualização")} ${ref}`, stale: true };
  if (isMonthly) return { text: `${mkt}${word("Média de")} ${ref}`, stale: false };
  return { text: `${mkt}${word("Atualizado")} ${ref}`, stale: false };
}

/**
 * Linha de conversão de REFERÊNCIA para BRL (só moeda, nunca unidade — o sufixo
 * "/t", "/oz", "/dmtu" é preservado). Regra por frequência:
 *  - diária: só converte se a PTAX é do MESMO dia do preço (câmbio velho com preço
 *    novo mente); rótulo "(PTAX DD/MM)".
 *  - mensal: as datas nunca casam (Pink Sheet marca o mês); converte ao câmbio de
 *    hoje com rótulo EXPLÍCITO "ao câmbio de hoje (PTAX DD/MM)" — não afirma o
 *    preço em reais do mês, afirma a conversão de hoje e diz qual.
 * PTAX defasada/ausente ⇒ null (não converte). Só séries cotadas em USD.
 */
function brlRefLine(point: MarketPoint, ptax: MarketPoint | null): string | null {
  const c = brlConvert(point, ptax);
  if (!c) return null;
  const isMonthly = point.frequency === "mensal";
  if (!isMonthly && !c.sameDay) return null;
  const suffix = point.unit ? point.unit.slice(3) : ""; // "USD/t" -> "/t"
  const cambio = isMonthly
    ? ` ao câmbio de hoje (PTAX ${c.ptaxDate})`
    : ` (PTAX ${c.ptaxDate})`;
  return `≈ ${formatBRLRefApprox(c.brl)}${suffix}${cambio}`;
}

/**
 * Liga cada commodity do mapa às séries do cache (series_latest).
 *
 * Quatro commodities têm DOIS mercados (global mensal + diário BR). O mapa mostra
 * os dois: primário = o DIÁRIO (mais fresco, e o público é brasileiro);
 * secundário, menor e discreto = a referência GLOBAL mensal. São números
 * diferentes, de mercados, unidades e períodos diferentes — o `note` e o período
 * ("média de junho/2026") carregam a diferença para não virarem contradição. As
 * outras 15 têm uma série só; não se força simetria (card com mais dado mostra
 * mais). Prata/cobre/alumínio/minério/trigo/algodão/açúcar/cacau/arroz/frango/
 * amendoim: só mensal. Boi/etanol/Brent/gás: só diária.
 *
 * `code: null` = sem cotação no cache; o card mostra `noQuote`, nunca um número
 * (regra 4.5: zero mock ao lado de dado real). Três casos, motivos DIFERENTES —
 * nenhum inventa preço:
 *  - Nióbio: não há preço público em bolsa nenhuma (OTC). É a própria história.
 *  - Paládio: tem preço (NYMEX), mas não é ingerido no cache hoje.
 *  - Suco de Laranja: LARANJA_WB é laranja FRUTA (navel, importação UE), produto
 *    DIFERENTE de FCOJ (suco concentrado). Casar seria a mesma troca do boi.
 * Boi usa só BOI_FUT (B3): CARNE_BOVINA_WB é carne desossada NZ, outro produto.
 */
type AssetSeries =
  | { code: string; secondary?: { code: string; note: string } }
  | { code: null; noQuote: string };
const ASSET_SERIES: Record<NonNullable<AssetType>, AssetSeries> = {
  // ── Agro ──
  Soja:     { code: "SOJA_FUT",  secondary: { code: "SOJA_WB",  note: "referência global · US Gulf" } },
  Milho:    { code: "MILHO_FUT", secondary: { code: "MILHO_WB", note: "referência global · US Gulf" } },
  Trigo:    { code: "TRIGO_WB" },
  Cafe:     { code: "CAFE_FUT",  secondary: { code: "CAFE_ICO", note: "referência global · ICO" } },
  Algodao:  { code: "ALGODAO_WB" },
  BoiGordo: { code: "BOI_FUT" },
  Acucar:   { code: "ACUCAR_WB" },
  Cacau:    { code: "CACAU_WB" },
  Arroz:    { code: "ARROZ_WB" },
  Frango:   { code: "FRANGO_WB" },
  Etanol:   { code: "ETANOL_FUT" },
  Amendoim: { code: "AMENDOIM_WB" },
  Laranja:  { code: null, noQuote: "Sem cotação disponível" },
  // ── Minérios ──
  Ouro:         { code: "OURO_PAXG", secondary: { code: "OURO_LBMA", note: "spot Londres · LBMA" } },
  Prata:        { code: "PRATA_LBMA" },
  Cobre:        { code: "COBRE_WB" },
  Aluminio:     { code: "ALUMINIO_WB" },
  MinerioFerro: { code: "MINERIO_WB" },
  Paladio:      { code: null, noQuote: "Sem cotação disponível" },
  Niobio:       { code: null, noQuote: "Sem cotação pública em bolsa" },
  // ── Fertilizantes (2g). MAP: o preco de referencia e DAP (substituto). ──
  Ureia: { code: "UREIA_WB" },
  KCl:   { code: "KCL_WB" },
  MAP:   { code: "DAP_WB" },
  TSP:   { code: "TSP_WB" },
  Rocha: { code: "ROCHA_FOSFATICA_WB" },
  // ── Energia ──
  Brent:      { code: "BRENT_SPOT" },
  GasNatural: { code: "GAS_NATURAL_HH" },
  // Terras raras: sem preco de bolsa (card e o gap reserva-vs-producao, USGS).
  TerrasRaras: { code: null, noQuote: "Sem cotação pública em bolsa" },
};

/**
 * Rodape do mapa: ranking MUNDIAL de producao da commodity selecionada (USDA
 * PSD, o competidor de producao). Dado ja no banco (todos os paises); reativo a
 * carta. O Brasil SEMPRE destacado (peso/borda dourada) — esteja em 1o ou em
 * 8o. Os outros neutros (so numero, sem cor de papel). Mesma fonte/eixo (safra).
 */
function ProductionRankingFooter({ code }: { code: string }) {
  const { data } = usePsdRanking(code);
  if (!data) return null;
  const cell = (r: { iso: string; name: string; value: number | null; rank: number; isBrazil: boolean }) => (
    <span
      key={r.iso}
      className="flex-shrink-0 flex items-baseline gap-1.5 px-2.5 py-1"
      style={{
        backgroundColor: r.isBrazil ? `${GOLD}12` : "rgba(255,255,255,0.02)",
        border: `1px solid ${r.isBrazil ? `${GOLD}55` : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <span className="font-sans text-[8px]" style={{ color: r.isBrazil ? GOLD : "rgba(255,255,255,0.3)" }}>{r.rank}</span>
      <span className="font-sans text-[9px]" style={{ color: r.isBrazil ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: r.isBrazil ? 600 : 400 }}>
        {r.name}
      </span>
      <span className="font-sans text-[8.5px]" style={{ color: r.isBrazil ? `${GOLD}dd` : "rgba(255,255,255,0.45)" }}>
        {fmtPsdRank(r.value, data.unitId)}
      </span>
    </span>
  );
  return (
    <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${GOLD}18`, backgroundColor: "rgba(5,5,3,0.98)" }}>
      <div className="font-sans text-[8px] uppercase tracking-[0.2em] mb-1.5" style={{ color: `${GOLD}90` }}>
        Produção mundial · safra {data.safraLabel} · projeção USDA
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {data.top.map(cell)}
        {data.brazilOutside && (
          <>
            <span className="flex-shrink-0 font-sans text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>…</span>
            {cell(data.brazilOutside)}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Rodape da aba Minerios: ranking mundial de PRODUCAO do mineral (USGS MCS).
 * Mesmo padrao do agricola (Brasil destacado); o niobio mostra o Brasil ~93%,
 * o espelho da soja. Fonte USGS (nao PSD); unidade por mineral.
 */
function UsgsRankingFooter({ commodity }: { commodity: string }) {
  const { data } = useUsgsRanking(commodity);
  if (!data) return null;
  const cell = (r: { iso: string; name: string; value: number | null; rank: number; isBrazil: boolean }) => (
    <span
      key={r.iso}
      className="flex-shrink-0 flex items-baseline gap-1.5 px-2.5 py-1"
      style={{
        backgroundColor: r.isBrazil ? `${GOLD}12` : "rgba(255,255,255,0.02)",
        border: `1px solid ${r.isBrazil ? `${GOLD}55` : "rgba(255,255,255,0.06)"}`,
      }}
    >
      <span className="font-sans text-[8px]" style={{ color: r.isBrazil ? GOLD : "rgba(255,255,255,0.3)" }}>{r.rank}</span>
      <span className="font-sans text-[9px]" style={{ color: r.isBrazil ? "#fff" : "rgba(255,255,255,0.7)", fontWeight: r.isBrazil ? 600 : 400 }}>
        {r.name}
      </span>
      <span className="font-sans text-[8.5px]" style={{ color: r.isBrazil ? `${GOLD}dd` : "rgba(255,255,255,0.45)" }}>
        {fmtUsgs(r.value, data.unit)}
      </span>
    </span>
  );
  return (
    <div className="flex-shrink-0 px-4 py-2" style={{ borderTop: `1px solid ${GOLD}18`, backgroundColor: "rgba(5,5,3,0.98)" }}>
      <div className="font-sans text-[8px] uppercase tracking-[0.2em] mb-1.5" style={{ color: `${GOLD}90` }}>
        Produção mundial · {data.year} · USGS MCS 2026
      </div>
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {data.top.map(cell)}
        {data.brazilOutside && (
          <>
            <span className="flex-shrink-0 font-sans text-[9px]" style={{ color: "rgba(255,255,255,0.25)" }}>…</span>
            {cell(data.brazilOutside)}
          </>
        )}
      </div>
    </div>
  );
}

/**
 * Bloco compacto de preço para o card do Mapa v2 (CommodityFlowMap). A mesma
 * honestidade do InfoPanel: valor+unidade, conversão BRL de referência, período
 * (média mensal vs. atualizado), atribuição, variação com rótulo, secundário.
 * Vive aqui para reusar brlRefLine/freshnessLine sem duplicar as travas.
 */
function PriceSummary({
  point,
  secondary,
  ptax,
  hasSeries,
  loading,
  noQuote,
}: {
  point: MarketPoint | null;
  secondary: { point: MarketPoint | null; note: string } | null;
  ptax: MarketPoint | null;
  hasSeries: boolean;
  loading: boolean;
  noQuote: string | null;
}) {
  const cp = point?.changePercent ?? null;
  const up = cp != null && cp > 0;
  const down = cp != null && cp < 0;
  const changeColor = up ? "rgba(52,211,153,1)" : down ? "rgba(248,113,113,1)" : "rgba(255,255,255,0.4)";
  const ChangeIcon = up ? TrendingUp : down ? TrendingDown : Minus;
  const noQuoteText = hasSeries ? (loading ? "Carregando…" : "Cotação indisponível") : (noQuote ?? "Sem cotação pública");
  const sec = secondary?.point ? { point: secondary.point, note: secondary.note } : null;

  return (
    <div style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="px-4 py-3 flex items-start justify-between">
        <div>
          <div className="font-sans text-[8px] uppercase tracking-widest mb-0.5" style={{ color: "rgba(255,255,255,0.25)" }}>
            Preço
          </div>
          {point ? (
            <>
              <div className="font-display text-base text-white">{formatValueUnit(point)}</div>
              {(() => {
                const brl = brlRefLine(point, ptax);
                return brl ? (
                  <div className="font-sans text-[8px] mt-0.5" style={{ color: `${GOLD}aa` }}>{brl}</div>
                ) : null;
              })()}
              {(() => {
                const fl = freshnessLine(point);
                return (
                  <div className="font-sans text-[8px] mt-0.5" style={{ color: fl.stale ? RED_STALE : "rgba(255,255,255,0.3)" }}>
                    {fl.text}
                  </div>
                );
              })()}
              {point.attribution && (
                <div className="font-sans text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.22)" }}>
                  {point.attribution}
                </div>
              )}
            </>
          ) : (
            <div className="font-display text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {noQuoteText}
            </div>
          )}
        </div>
        {point && cp != null && (
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="flex items-center gap-1" style={{ color: changeColor }}>
              <ChangeIcon className="w-3.5 h-3.5" />
              <span className="font-display text-xs font-bold">
                {up ? "+" : ""}{pctFmt.format(cp)}%
              </span>
            </div>
            {point.changeLabel && (
              <span className="font-sans text-[7px] mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                {point.changeLabel}
              </span>
            )}
          </div>
        )}
      </div>
      {sec && (
        <div className="px-4 pb-2.5">
          <div className="font-display text-xs" style={{ color: "rgba(255,255,255,0.72)" }}>
            {formatValueUnit(sec.point)}
          </div>
          {(() => {
            const fl = freshnessLine(sec.point, { withMarket: false, lower: true });
            return (
              <div className="font-sans text-[7.5px] mt-0.5" style={{ color: fl.stale ? RED_STALE : "rgba(255,255,255,0.3)" }}>
                {sec.note} · {fl.text}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

/* ── País Estratégico — card abaixo do mapa ── */
function CountryCard({
  country,
  isSelected,
  onClick,
}: {
  country: typeof strategicCountries[0];
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      className="text-left transition-all duration-300 w-full"
      style={{
        border: isSelected ? `1px solid ${GOLD}55` : "1px solid rgba(255,255,255,0.07)",
        backgroundColor: isSelected ? `${GOLD}08` : "rgba(255,255,255,0.02)",
        padding: "12px 14px",
      }}
      whileHover={{ borderColor: `${GOLD}40` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-display text-sm mb-0.5" style={{ color: isSelected ? GOLD : "rgba(255,255,255,0.75)" }}>
            {country.label}
          </div>
          <div className="font-sans text-[8px] uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.3)" }}>
            {country.region}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <div className="font-display text-lg font-bold" style={{ color: GOLD }}>
            {country.partners}
          </div>
          <div className="font-sans text-[7px] uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.25)" }}>
            parceiros
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden mt-3 pt-3"
            style={{ borderTop: `1px solid ${GOLD}20` }}
          >
            <div className="space-y-1.5 mb-2">
              {country.keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: GOLD }} />
                  <span className="font-sans text-[9px] leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.5)" }}>
                    {kp}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {country.exports.map((exp) => (
                <span key={exp}
                  className="font-sans text-[7px] uppercase tracking-wide px-1.5 py-0.5"
                  style={{
                    backgroundColor: `${GOLD}12`,
                    border: `1px solid ${GOLD}30`,
                    color: GOLD,
                  }}>
                  {exp}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ── Componente Principal ── */
export default function GlobalFlowMap() {
  const [selectedAsset, setSelectedAsset]   = useState<AssetType>(null);
  const [activeCategory, setActiveCategory] = useState<MapCategory>("Agro");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCountries, setShowCountries]   = useState(false);

  // Cache real (series_latest). Indexado por code para lookup O(1) por commodity.
  const { data: market, loading } = useMarketData();

  // Mapa v2: cards com config na FLOW_CARDS usam a lei nova (rollout por
  // grupos). So busca o fluxo Comex quando um deles esta selecionado.
  const flowCfg = selectedAsset ? FLOW_CARDS[selectedAsset] : undefined;
  const tradeFlows = useTradeFlows(flowCfg, !!flowCfg);
  const bySeries = useMemo(() => {
    const m = new Map<string, MarketPoint>();
    (market ?? []).forEach((p) => m.set(p.code, p));
    return m;
  }, [market]);


  // Série + estado do preço da commodity aberta: distingue "sem cotação por
  // design" (code null) de "ainda não carregou / indisponível" (transitório).
  // Nas 4 duais resolve também o secundário (referência global mensal).
  const selectedInfo = (() => {
    const empty = {
      point: null as MarketPoint | null,
      secondary: null as { point: MarketPoint | null; note: string } | null,
      hasSeries: false,
      noQuote: null as string | null,
    };
    if (!selectedAsset) return empty;
    const s = ASSET_SERIES[selectedAsset];
    if (s.code == null) return { ...empty, noQuote: s.noQuote };
    const secondary = s.secondary
      ? { point: bySeries.get(s.secondary.code) ?? null, note: s.secondary.note }
      : null;
    return { point: bySeries.get(s.code) ?? null, secondary, hasSeries: true, noQuote: null as string | null };
  })();
  const filteredAssets = (
    Object.entries(assetFlows) as [NonNullable<AssetType>, typeof assetFlows[NonNullable<AssetType>]][]
  )
    .filter(([, v]) => v.category === activeCategory)
    .map(([k]) => k);

  return (
    <div className="w-full h-full relative flex flex-col"
      style={{ backgroundColor: "#050503" }}>
      {/* Grade muito sutil */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(${GOLD}40 1px, transparent 1px), linear-gradient(90deg, ${GOLD}40 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* ── Seletor de Categoria + Commodities ── */}
      <div className="relative z-30 flex-shrink-0"
        style={{
          backgroundColor: "rgba(5,5,3,0.95)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
        {/* Tabs de categoria */}
        <div className="flex px-3 pt-2"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => { setActiveCategory(cat.key); setSelectedAsset(null); }}
              className="px-4 py-2 font-sans text-[9px] uppercase tracking-[0.2em] transition-all"
              style={{
                borderBottom: activeCategory === cat.key
                  ? `1px solid ${GOLD}`
                  : "1px solid transparent",
                color: activeCategory === cat.key
                  ? GOLD
                  : "rgba(255,255,255,0.3)",
                marginBottom: "-1px",
              }}
            >
              {cat.key}
            </button>
          ))}
          {selectedAsset && (
            <button
              onClick={() => setSelectedAsset(null)}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 font-sans text-[8px] uppercase tracking-widest transition-colors mb-1"
              style={{ color: "rgba(255,255,255,0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = GOLD)}
              onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}
            >
              <RotateCcw className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Commodities */}
        <div className="flex flex-wrap gap-1.5 px-3 py-2.5 items-center">
          {!selectedAsset && (
            <span className="font-sans text-[7px] uppercase tracking-[0.2em] mr-1"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              Selecione:
            </span>
          )}
          {filteredAssets.map((asset) => {
            const d = assetFlows[asset];
            return (
              <motion.button
                key={asset}
                onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
                className="font-sans text-[8px] sm:text-[9px] uppercase tracking-[0.1em] px-2.5 py-1 transition-all"
                style={
                  selectedAsset === asset
                    ? {
                        backgroundColor: GOLD,
                        color: "#050503",
                        border: `1px solid ${GOLD}`,
                        boxShadow: `0 0 12px ${GOLD}40`,
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.03)",
                        color: "rgba(255,255,255,0.45)",
                        border: "1px solid rgba(255,255,255,0.09)",
                      }
                }
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {d.label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {selectedAsset === "TerrasRaras" ? (
        /* Aba Terras raras: o MAPA pintado (cor=reserva, tamanho=producao) +
           card lateral de gap. Sem fluxo bilateral (o dado nao tem). */
        <div className="flex-1 relative min-h-0">
          <RareEarthMap />
        </div>
      ) : flowCfg && selectedAsset ? (
        /* Mapa v2: a lei nova para os cards com config (rollout por grupos). */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0">
          {tradeFlows.data || flowCfg.mode === "priceOnly" ? (
            <CommodityFlowMap
              label={flowCfg.cardLabel ?? assetFlows[selectedAsset].label}
              cfg={flowCfg}
              flows={tradeFlows.data}
              priceBlockFor={(subKey) => {
                // Preco COLADO ao sub-produto: usa o price do sub quando ha;
                // senao herda o mapeamento do card (ASSET_SERIES).
                const sp = flowCfg.subs.find((s) => s.key === subKey)?.price;
                let point = selectedInfo.point;
                let secondary = selectedInfo.secondary;
                let noQuote = selectedInfo.noQuote;
                let hasSeries = selectedInfo.hasSeries;
                if (sp) {
                  if (sp.code == null) {
                    point = null; secondary = null; hasSeries = false; noQuote = sp.noQuote;
                  } else {
                    hasSeries = true; noQuote = null;
                    point = bySeries.get(sp.code) ?? null;
                    secondary = sp.secondary
                      ? { point: bySeries.get(sp.secondary.code) ?? null, note: sp.secondary.note }
                      : null;
                  }
                }
                return (
                  <PriceSummary
                    point={point}
                    secondary={secondary}
                    ptax={bySeries.get("PTAX_USD_VENDA") ?? null}
                    hasSeries={hasSeries}
                    loading={loading}
                    noQuote={noQuote}
                  />
                );
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-sans text-[9px] uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                {tradeFlows.error ? "fluxo indisponível" : "carregando fluxo…"}
              </span>
            </div>
          )}
          </div>
          {flowCfg.psd && <ProductionRankingFooter code={flowCfg.psd.code} />}
          {flowCfg.usgs && <UsgsRankingFooter commodity={flowCfg.usgs} />}
        </div>
      ) : (
      <>
      {/* Sem commodity selecionada: so o prompt. O mapa VELHO morreu no cleanup
          do Grupo E (os 27 chips usam a lei nova). */}
      <div className="flex-1 relative min-h-0 flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-[11px] tracking-[0.25em] uppercase mb-1"
            style={{ color: `${GOLD}90` }}>
            Inteligência Geopolítica de Commodities
          </p>
          <p className="font-sans text-[8px] tracking-widest uppercase"
            style={{ color: "rgba(255,255,255,0.22)" }}>
            Selecione uma commodity acima para visualizar os fluxos
          </p>
        </div>
      </div>

      {/* ── Painel de Países Estratégicos — PRESERVADO, nao renderizado: futuro
          lar do card de COMPETIDOR (estrutura reaproveitavel). ── */}
      {SHOW_STRATEGIC_PANEL && (
      <div className="flex-shrink-0 relative z-20"
        style={{ borderTop: `1px solid ${GOLD}18` }}>
        {/* Toggle header */}
        <button
          onClick={() => setShowCountries((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 transition-colors"
          style={{ backgroundColor: "rgba(5,5,3,0.98)" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-4 h-px" style={{ backgroundColor: GOLD }} />
            <span className="font-sans text-[9px] uppercase tracking-[0.22em]"
              style={{ color: `${GOLD}99` }}>
              Países Estratégicos
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-sans text-[7px] uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.25)" }}>
              {strategicCountries.length} regiões
            </span>
            {showCountries
              ? <ChevronDown className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
              : <ChevronUp className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
            }
          </div>
        </button>

        {/* Grid de países */}
        <AnimatePresence>
          {showCountries && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
              style={{ backgroundColor: "rgba(5,5,3,0.99)" }}
            >
              <div
                className="grid gap-1 p-3 overflow-y-auto"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                  maxHeight: "260px",
                }}
              >
                {strategicCountries.map((country) => (
                  <CountryCard
                    key={country.id}
                    country={country}
                    isSelected={selectedCountry === country.id}
                    onClick={() =>
                      setSelectedCountry((prev) =>
                        prev === country.id ? null : country.id
                      )
                    }
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      )}
      </>
      )}
    </div>
  );
}
