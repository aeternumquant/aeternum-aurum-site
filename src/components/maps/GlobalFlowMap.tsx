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
import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  Line,
} from "react-simple-maps";
import {
  X,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

/* ── Dourado da marca ── */
const GOLD = "#C6A85A";

type RelationType = "VERDE" | "VERMELHO" | "DOURADA";
type AssetType =
  | "Soja" | "Milho" | "Trigo" | "Brent" | "Ouro" | "Prata"
  | "Cobre" | "GasNatural" | "Aluminio" | "Paladio"
  | "Cafe" | "Algodao" | "BoiGordo" | "Acucar" | "Cacau"
  | "Arroz" | "Frango" | "Laranja" | "Etanol" | "Amendoim"
  | "MinerioFerro" | "Niobio"
  | null;

/* ── Cores dos tipos de relação — elegantes e profissionais ── */
const relColor: Record<RelationType, { stroke: string; label: string }> = {
  VERDE:    { stroke: "rgba(52,211,153,0.80)", label: "Parceiro / Exportação" },
  VERMELHO: { stroke: "rgba(248,113,113,0.80)", label: "Competição" },
  DOURADA:  { stroke: `${GOLD}cc`,             label: "Estratégico" },
};

/* ── Países — 25 nós estratégicos ── */
const baseMarkers = [
  // América do Sul
  { id: "BR", label: "Brasil",         city: "São Paulo",        coordinates: [-47.929, -15.780] as [number, number], isPrimary: true  },
  { id: "AR", label: "Argentina",      city: "Buenos Aires",     coordinates: [-58.381, -34.603] as [number, number], isPrimary: false },
  { id: "CL", label: "Chile",          city: "Santiago",         coordinates: [-70.669, -33.448] as [number, number], isPrimary: false },
  { id: "CO", label: "Colômbia",       city: "Bogotá",           coordinates: [-74.072,  4.711]  as [number, number], isPrimary: false },
  // América do Norte
  { id: "US", label: "EUA",            city: "Chicago (CME)",    coordinates: [-87.629, 41.878]  as [number, number], isPrimary: false },
  { id: "MX", label: "México",         city: "Cidade do México", coordinates: [-99.133, 19.432]  as [number, number], isPrimary: false },
  { id: "CA", label: "Canadá",         city: "Vancouver",        coordinates: [-123.120, 49.282] as [number, number], isPrimary: false },
  // Europa
  { id: "UK", label: "Reino Unido",    city: "Londres (LME)",    coordinates: [-0.127,  51.507]  as [number, number], isPrimary: false },
  { id: "EU", label: "União Europeia", city: "Frankfurt",        coordinates: [8.682,   50.110]  as [number, number], isPrimary: false },
  { id: "RU", label: "Rússia",         city: "Novorossiysk",     coordinates: [37.766,  44.716]  as [number, number], isPrimary: false },
  { id: "TR", label: "Turquia",        city: "Istambul",         coordinates: [28.978,  41.015]  as [number, number], isPrimary: false },
  // Oriente Médio & África
  { id: "SA", label: "Arábia Saudita", city: "Riad",             coordinates: [46.675,  24.686]  as [number, number], isPrimary: false },
  { id: "AE", label: "Emirados",       city: "Dubai",            coordinates: [55.296,  25.276]  as [number, number], isPrimary: false },
  { id: "EG", label: "Egito",          city: "Cairo",            coordinates: [31.235,  30.044]  as [number, number], isPrimary: false },
  { id: "ZA", label: "África do Sul",  city: "Joanesburgo",      coordinates: [28.047, -26.202]  as [number, number], isPrimary: false },
  // Ásia
  { id: "CN", label: "China",          city: "Xangai",           coordinates: [121.473, 31.230]  as [number, number], isPrimary: false },
  { id: "JP", label: "Japão",          city: "Tóquio",           coordinates: [139.691, 35.689]  as [number, number], isPrimary: false },
  { id: "KR", label: "Coreia do Sul",  city: "Seul",             coordinates: [126.977, 37.566]  as [number, number], isPrimary: false },
  { id: "IN", label: "Índia",          city: "Mumbai",           coordinates: [72.847,  19.076]  as [number, number], isPrimary: false },
  { id: "SG", label: "Singapura",      city: "Porto Jurong",     coordinates: [103.819,  1.352]  as [number, number], isPrimary: false },
  { id: "ID", label: "Indonésia",      city: "Jacarta",          coordinates: [106.845, -6.208]  as [number, number], isPrimary: false },
  { id: "VN", label: "Vietnã",         city: "Hanói",            coordinates: [105.834, 21.027]  as [number, number], isPrimary: false },
  { id: "TH", label: "Tailândia",      city: "Bangcoc",          coordinates: [100.501, 13.756]  as [number, number], isPrimary: false },
  { id: "PK", label: "Paquistão",      city: "Carachi",          coordinates: [67.009,  24.860]  as [number, number], isPrimary: false },
  // Oceania
  { id: "AU", label: "Austrália",      city: "Sydney",           coordinates: [151.209, -33.868] as [number, number], isPrimary: false },
];

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
  category: "Agro" | "Metais" | "Energia";
  relevantCountries: Array<{ id: string; type: RelationType; note?: string }>;
  flowData: string;
  percentage: string;
  volume?: string;
  price: string;
  change: number;
  unit: string;
}> = {
  Soja: {
    label: "Soja", category: "Agro",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "58% das exportações" },
      { id: "US", type: "VERMELHO", note: "Competidor direto" },
      { id: "AR", type: "VERMELHO", note: "Competidor regional" },
      { id: "EU", type: "VERDE",    note: "Importador 12%" },
      { id: "JP", type: "VERDE",    note: "Importador 4%" },
    ],
    flowData: "Brasil exporta 45% da soja global (≈55M toneladas). China responde por 58% do destino. Referência CME/CBOT. Safra BR 23/24: recorde de 158M ton.",
    percentage: "45% global", volume: "55M ton/ano",
    price: "R$ 136,20/sc", change: +0.82, unit: "/saca 60kg",
  },
  Milho: {
    label: "Milho", category: "Agro",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "Maior importador" },
      { id: "US", type: "VERMELHO", note: "Competidor" },
      { id: "JP", type: "VERDE",    note: "Importador relevante" },
      { id: "KR", type: "VERDE",    note: "Importador crescente" },
      { id: "MX", type: "VERDE",    note: "Importador próximo" },
      { id: "SG", type: "DOURADA",  note: "Hub de trading" },
    ],
    flowData: "Brasil 2º exportador mundial. Safra 23/24 recorde de 135M ton. China absorveu 11M ton. Referência CBOT Chicago.",
    percentage: "28% global", volume: "135M ton/ano",
    price: "R$ 52,40/sc", change: -0.34, unit: "/saca 60kg",
  },
  Cafe: {
    label: "Café", category: "Agro",
    relevantCountries: [
      { id: "US", type: "VERDE",    note: "Maior importador global" },
      { id: "EU", type: "VERDE",    note: "Alemanha + Itália" },
      { id: "JP", type: "VERDE",    note: "3º maior importador" },
      { id: "KR", type: "VERDE",    note: "Demanda crescente" },
      { id: "RU", type: "VERMELHO", note: "Competição por blends" },
      { id: "CO", type: "VERMELHO", note: "Competidor arábica" },
    ],
    flowData: "Brasil: maior produtor mundial (38% da oferta). Café arábica referenciado na ICE NY (KC). Presença em 80+ países exportadores.",
    percentage: "38% global", volume: "68M sacas/ano",
    price: "USD 4.82/lb", change: +2.14, unit: "/libra (ICE NY)",
  },
  BoiGordo: {
    label: "Boi Gordo", category: "Agro",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "50% do volume exportado" },
      { id: "US", type: "DOURADA",  note: "Referência CME" },
      { id: "ID", type: "VERDE",    note: "Importador relevante" },
      { id: "EG", type: "VERDE",    note: "Importador crescente" },
      { id: "SA", type: "VERDE",    note: "Mercado Halal" },
      { id: "AE", type: "VERDE",    note: "Hub de distribuição" },
    ],
    flowData: "Brasil: maior exportador de carne bovina global (27%). China concentra 50% do volume. Contrato futuro negociado na B3/BM&F.",
    percentage: "27% global", volume: "2.8M ton/ano",
    price: "R$ 320,40/@", change: +0.45, unit: "/@15kg",
  },
  Algodao: {
    label: "Algodão", category: "Agro",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "Maior importador" },
      { id: "VN", type: "VERDE",    note: "Indústria têxtil" },
      { id: "ID", type: "VERDE",    note: "Têxteis crescentes" },
      { id: "PK", type: "VERDE",    note: "Indústria têxtil" },
      { id: "TR", type: "VERDE",    note: "Hub têxtil europeu" },
      { id: "IN", type: "VERMELHO", note: "Competidor" },
    ],
    flowData: "Brasil: 2º maior exportador global. Centro-Oeste concentra 70% da produção. Referência ICE NY (CT).",
    percentage: "22% global", volume: "3.4M ton/ano",
    price: "USD 0.68/lb", change: -0.92, unit: "/libra (ICE NY)",
  },
  Acucar: {
    label: "Açúcar", category: "Agro",
    relevantCountries: [
      { id: "IN", type: "VERMELHO", note: "Competidor" },
      { id: "CN", type: "VERDE",    note: "Importador top 5" },
      { id: "ID", type: "VERDE",    note: "Maior importador" },
      { id: "SA", type: "VERDE",    note: "Importador Golfo" },
      { id: "US", type: "DOURADA",  note: "ICE NY referência" },
      { id: "EU", type: "VERDE",    note: "Importador relevante" },
    ],
    flowData: "Brasil: maior produtor e exportador mundial, ≈40% do mercado. Safra Centro-Sul 24/25 estimada em 680M ton de cana. ICE NY (SB).",
    percentage: "40% global", volume: "36M ton/ano",
    price: "USD 18.4/lb", change: +1.67, unit: "/100 libras",
  },
  Cacau: {
    label: "Cacau", category: "Agro",
    relevantCountries: [
      { id: "EU", type: "VERDE",    note: "Maior importador" },
      { id: "US", type: "VERDE",    note: "Indústria de chocolates" },
      { id: "ID", type: "VERMELHO", note: "Competidor Ásia" },
      { id: "UK", type: "DOURADA",  note: "ICE London" },
      { id: "SG", type: "DOURADA",  note: "Hub Ásia-Pacífico" },
    ],
    flowData: "Brasil: 6º produtor mundial, Bahia com 60% da produção. Déficit global de 374K ton em 23/24 impulsionou preços +70%.",
    percentage: "6% global", volume: "300K ton/ano",
    price: "USD 8.240/ton", change: +3.22, unit: "/tonelada",
  },
  Arroz: {
    label: "Arroz", category: "Agro",
    relevantCountries: [
      { id: "CN", type: "DOURADA",  note: "Maior produtor global" },
      { id: "IN", type: "VERMELHO", note: "Maior exportador" },
      { id: "VN", type: "VERMELHO", note: "2º exportador" },
      { id: "TH", type: "VERMELHO", note: "3º exportador" },
      { id: "ID", type: "VERDE",    note: "Maior importador" },
    ],
    flowData: "Brasil: maior produtor fora da Ásia. RS responde por 70% da produção nacional. Foco no mercado interno e Mercosul.",
    percentage: "2% global", volume: "12M ton/ano",
    price: "R$ 85,20/sc", change: +0.12, unit: "/saca 50kg",
  },
  Frango: {
    label: "Frango", category: "Agro",
    relevantCountries: [
      { id: "SA", type: "VERDE",    note: "Maior importador" },
      { id: "JP", type: "VERDE",    note: "Importador histórico" },
      { id: "CN", type: "VERDE",    note: "Demanda crescente" },
      { id: "EG", type: "VERDE",    note: "Importador MENA" },
      { id: "EU", type: "VERDE",    note: "Certificação Halal" },
      { id: "US", type: "DOURADA",  note: "Referência CBOT" },
    ],
    flowData: "Brasil: maior exportador global de frango (37%). Golfo Pérsico e Japão são destinos históricos. JBS, BRF e Marfrig lideram.",
    percentage: "37% global", volume: "5.1M ton/ano",
    price: "R$ 8,90/kg", change: -0.55, unit: "/kg vivo",
  },
  Laranja: {
    label: "Suco de Laranja", category: "Agro",
    relevantCountries: [
      { id: "EU", type: "VERDE",    note: "60% das exportações" },
      { id: "US", type: "VERDE",    note: "Importador histórico" },
      { id: "JP", type: "VERDE",    note: "Importador relevante" },
      { id: "UK", type: "VERDE",    note: "5% das exportações" },
      { id: "CA", type: "VERDE",    note: "Importador crescente" },
    ],
    flowData: "Brasil: monopolista global com 75% das exportações de FCOJ. São Paulo + Triângulo Mineiro. ICE NY (OJ).",
    percentage: "75% global", volume: "1.7M ton FCOJ",
    price: "USD 4.10/lb", change: +4.88, unit: "/libra FCOJ",
  },
  Etanol: {
    label: "Etanol", category: "Agro",
    relevantCountries: [
      { id: "US", type: "DOURADA",  note: "Maior produtor / referência" },
      { id: "EU", type: "VERDE",    note: "Importador crescente" },
      { id: "IN", type: "VERDE",    note: "Blending mandatório" },
      { id: "CA", type: "VERDE",    note: "Importador NAFTA" },
      { id: "KR", type: "VERDE",    note: "Demanda renovável" },
    ],
    flowData: "Brasil: 2º maior produtor global de etanol (cana). Capacidade de 35B litros/ano. Paridade com gasolina é principal driver interno.",
    percentage: "25% global", volume: "35B litros/ano",
    price: "R$ 3.82/L", change: +0.78, unit: "/litro usina",
  },
  Amendoim: {
    label: "Amendoim", category: "Agro",
    relevantCountries: [
      { id: "EU", type: "VERDE",    note: "Maior importador" },
      { id: "RU", type: "VERDE",    note: "Importador relevante" },
      { id: "UK", type: "VERDE",    note: "Mercado especializado" },
      { id: "CN", type: "DOURADA",  note: "Competidor e comprador" },
      { id: "TR", type: "VERDE",    note: "Processamento regional" },
    ],
    flowData: "Brasil: 2º exportador de amendoim in natura. SP concentra 80% da produção. Crescimento por pet food e indústria alimentícia.",
    percentage: "18% global", volume: "600K ton/ano",
    price: "R$ 4.200/ton", change: +0.22, unit: "/tonelada",
  },
  Trigo: {
    label: "Trigo", category: "Agro",
    relevantCountries: [
      { id: "RU", type: "VERMELHO", note: "Maior exportador (22%)" },
      { id: "US", type: "VERMELHO", note: "CBOT referência" },
      { id: "AU", type: "VERMELHO", note: "Competidor hemisfério sul" },
      { id: "CN", type: "VERDE",    note: "Maior importador" },
      { id: "EG", type: "VERDE",    note: "2º maior importador" },
      { id: "TR", type: "DOURADA",  note: "Hub de reexportação" },
    ],
    flowData: "Rússia controla 22% das exportações via Mar Negro. Brasil importa ≈7M ton/ano do Mercosul e Mar Negro.",
    percentage: "22% global (RU)", volume: "800M ton/ano",
    price: "R$ 74,80/sc", change: -0.78, unit: "/saca 60kg",
  },
  // ── Metais ──
  Ouro: {
    label: "Ouro", category: "Metais",
    relevantCountries: [
      { id: "US", type: "DOURADA",  note: "COMEX referência" },
      { id: "CN", type: "VERDE",    note: "Maior comprador BC" },
      { id: "UK", type: "DOURADA",  note: "LBMA London" },
      { id: "EU", type: "DOURADA",  note: "Genebra cofres" },
      { id: "IN", type: "VERDE",    note: "Demanda joalheria" },
      { id: "AU", type: "VERDE",    note: "Maior produtor" },
    ],
    flowData: "Precificado na CME/COMEX e armazenado em cofres via LBMA. Bancos Centrais adicionaram 1.037 ton em 2023 — maior compra desde 1967.",
    percentage: "Reserva global", volume: "3.644 ton/ano",
    price: "USD 2.342/oz", change: +0.44, unit: "/troy oz",
  },
  Prata: {
    label: "Prata", category: "Metais",
    relevantCountries: [
      { id: "US", type: "DOURADA",  note: "COMEX referência" },
      { id: "CN", type: "VERDE",    note: "Demanda industrial" },
      { id: "IN", type: "VERDE",    note: "Solar fotovoltaico" },
      { id: "UK", type: "DOURADA",  note: "LBMA" },
    ],
    flowData: "Metal dual: industrial (solar consome 14%/ano) e reserva de valor. COMEX define spot global. Déficit estrutural pelo boom solar.",
    percentage: "Ref. COMEX", volume: "25.000+ ton/ano",
    price: "USD 29.80/oz", change: +1.23, unit: "/troy oz",
  },
  Cobre: {
    label: "Cobre", category: "Metais",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "55% da demanda" },
      { id: "AU", type: "VERDE",    note: "Exportador" },
      { id: "UK", type: "DOURADA",  note: "LME Londres" },
      { id: "SG", type: "DOURADA",  note: "Hub Ásia" },
      { id: "CL", type: "VERMELHO", note: "Maior produtor (28%)" },
    ],
    flowData: "Metal da transição energética. China consome 55% da demanda. Chile é maior produtor. LME London define preço spot global.",
    percentage: "Ref. LME", volume: "24M ton/ano",
    price: "USD 9.840/ton", change: +0.67, unit: "/tonelada LME",
  },
  Aluminio: {
    label: "Alumínio", category: "Metais",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "60% produção global" },
      { id: "UK", type: "DOURADA",  note: "LME referência" },
      { id: "EU", type: "VERDE",    note: "Importador" },
      { id: "IN", type: "VERDE",    note: "Crescimento rápido" },
    ],
    flowData: "China domina 60% da produção global. Custo energético define competitividade. LME London é bolsa de referência.",
    percentage: "Ref. LME", volume: "69M ton/ano",
    price: "USD 2.440/ton", change: -0.31, unit: "/tonelada LME",
  },
  Paladio: {
    label: "Paládio", category: "Metais",
    relevantCountries: [
      { id: "RU", type: "VERDE",    note: "40% da oferta" },
      { id: "US", type: "DOURADA",  note: "NYMEX referência" },
      { id: "CN", type: "VERDE",    note: "Catalisadores" },
      { id: "UK", type: "DOURADA",  note: "LBMA" },
      { id: "ZA", type: "VERDE",    note: "2º maior produtor" },
    ],
    flowData: "PGM raro para catalisadores automotivos. Rússia + África do Sul = 80% oferta. Substitui platina como tendência de risco.",
    percentage: "Ref. NYMEX", volume: "220+ ton/ano",
    price: "USD 1.020/oz", change: -1.44, unit: "/troy oz",
  },
  // ── Energia ──
  Brent: {
    label: "Petróleo Brent", category: "Energia",
    relevantCountries: [
      { id: "SA", type: "DOURADA",  note: "OPEC+ 12% oferta" },
      { id: "AE", type: "DOURADA",  note: "Estreito de Ormuz" },
      { id: "US", type: "VERDE",    note: "Shale / WTI" },
      { id: "CN", type: "VERDE",    note: "Maior importador" },
      { id: "EU", type: "VERDE",    note: "Importação crítica" },
      { id: "RU", type: "VERMELHO", note: "Sanções & rerouting" },
    ],
    flowData: "Fluxo via Estreito de Ormuz (20% do petróleo global). Arabia Saudita e OPEC+ controlam produção. ICE London é bolsa de referência.",
    percentage: "21M bbl/dia", volume: "Hormuz chokepoint",
    price: "USD 88.40/bbl", change: +0.92, unit: "/barril",
  },
  GasNatural: {
    label: "Gás Natural", category: "Energia",
    relevantCountries: [
      { id: "US", type: "VERDE",    note: "Henry Hub shale" },
      { id: "EU", type: "VERDE",    note: "TTF Amsterdam" },
      { id: "RU", type: "VERMELHO", note: "Gasodutos sancionados" },
      { id: "SA", type: "DOURADA",  note: "GNL Golfo" },
      { id: "AU", type: "VERDE",    note: "Exportador LNG" },
    ],
    flowData: "Mercados regionais segmentados. EUA (Henry Hub), Europa (TTF Amsterdam), Golfo (GNL). Brasil: gás boliviano + GNL.",
    percentage: "Ref. Henry Hub", volume: "4.000+ bcm/ano",
    price: "USD 2.18/MMBtu", change: -2.34, unit: "/MMBtu",
  },
  // ── Minério de Ferro ──
  MinerioFerro: {
    label: "Minério de Ferro", category: "Metais",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "70% das exportações brasileiras" },
      { id: "JP", type: "VERDE",    note: "Siderúrgicas premium" },
      { id: "KR", type: "VERDE",    note: "POSCO e siderurgia" },
      { id: "AU", type: "VERMELHO", note: "Rio Tinto / BHP competem" },
      { id: "UK", type: "DOURADA",  note: "LME e Anglo American" },
      { id: "EU", type: "VERDE",    note: "ArcelorMittal e Thyssenkrupp" },
    ],
    flowData: "Brasil é o 2º maior exportador mundial de minério (Vale + CSN). China absorve 70% do volume. Preço referenciado na SGX Singapore e Dalian Commodity Exchange (DCE). Vale sozinha = 20% do supply global.",
    percentage: "20% global (Vale)", volume: "400M ton/ano",
    price: "USD 105.40/ton", change: -1.82, unit: "/tonelada 62% Fe",
  },
  // ── Nióbio ──
  Niobio: {
    label: "Nióbio", category: "Metais",
    relevantCountries: [
      { id: "CN", type: "VERDE",    note: "Maior consumidor de FeNb" },
      { id: "EU", type: "VERDE",    note: "Siderurgia especializada" },
      { id: "US", type: "VERDE",    note: "Aeronáutica e defesa" },
      { id: "JP", type: "VERDE",    note: "Aço especial automotivo" },
      { id: "KR", type: "VERDE",    note: "Hyundai e Samsung Steel" },
      { id: "CA", type: "DOURADA",  note: "Niobec — único concorrente" },
    ],
    flowData: "Brasil controla 94% da produção mundial de nióbio via CBMM (Araxá-MG). Metal estratégico para aço de alta resistência, carros elétricos, aviões e ressonâncias magnéticas. Mercado OTC: sem bolsa de referência pública.",
    percentage: "94% global", volume: "90K ton FeNb/ano",
    price: "USD 42.00/kg", change: 0, unit: "/kg FeNb (OTC)",
  },
};

const categories: { key: "Agro" | "Metais" | "Energia" }[] = [
  { key: "Agro" },
  { key: "Metais" },
  { key: "Energia" },
];

/* ── Painel de informações — versão institucional ── */
function InfoPanel({
  selectedAsset,
  onClose,
}: {
  selectedAsset: NonNullable<AssetType>;
  onClose: () => void;
}) {
  const data = assetFlows[selectedAsset];
  if (!data) return null;

  const changePositive = data.change > 0;
  const changeNeutral  = data.change === 0;
  const changeColor = changePositive
    ? "rgba(52,211,153,1)"
    : changeNeutral
    ? "rgba(255,255,255,0.4)"
    : "rgba(248,113,113,1)";
  const ChangeIcon = changePositive ? TrendingUp : changeNeutral ? Minus : TrendingDown;

  return (
    <>
      {/* Desktop — lateral direita fixada ao TOPO do container (sem cortar) */}
      <div
        className="hidden sm:block absolute top-0 right-0 z-30 w-72"
        style={{
          /* max-height = 100% do container \u2014 nunca ultrapassa */
          maxHeight: "100%",
          overflowY: "auto",
          backgroundColor: "rgba(6,5,3,0.96)",
          border: `1px solid ${GOLD}30`,
          borderTop: "none",   /* sem borda dupla com o header do mapa */
          boxShadow: `-8px 0 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)`,
        }}
      >
        <AnimatePresence>
          <motion.div
            key={selectedAsset}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between px-4 py-3"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div className="font-sans text-[8px] uppercase tracking-[0.22em] mb-0.5"
                  style={{ color: `${GOLD}90` }}>
                  {data.category}
                </div>
                <div className="font-display text-base" style={{ color: GOLD }}>
                  {data.label}
                </div>
              </div>
              <button onClick={onClose}
                className="p-1 transition-colors hover:bg-white/5 mt-0.5">
                <X className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            </div>

            {/* Preço + variação */}
            <div className="px-4 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div className="font-sans text-[8px] uppercase tracking-widest mb-0.5"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  Preço Atual
                </div>
                <div className="font-display text-lg text-white">{data.price}</div>
                <div className="font-sans text-[8px]"
                  style={{ color: "rgba(255,255,255,0.3)" }}>
                  {data.unit}
                </div>
              </div>
              <div className="flex items-center gap-1" style={{ color: changeColor }}>
                <ChangeIcon className="w-4 h-4" />
                <span className="font-display text-sm font-bold">
                  {changePositive ? "+" : ""}{data.change.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Descrição do fluxo */}
            <div className="px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <p className="font-sans text-[10px] leading-relaxed"
                style={{ color: "rgba(255,255,255,0.45)" }}>
                {data.flowData}
              </p>
            </div>

            {/* Métricas */}
            <div className="px-4 py-3 flex gap-6"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <div>
                <div className="font-sans text-[7px] uppercase tracking-wider"
                  style={{ color: "rgba(255,255,255,0.25)" }}>
                  Participação
                </div>
                <div className="font-display text-xs font-bold"
                  style={{ color: GOLD }}>
                  {data.percentage}
                </div>
              </div>
              {data.volume && (
                <div>
                  <div className="font-sans text-[7px] uppercase tracking-wider"
                    style={{ color: "rgba(255,255,255,0.25)" }}>
                    Volume
                  </div>
                  <div className="font-display text-xs font-bold"
                    style={{ color: GOLD }}>
                    {data.volume}
                  </div>
                </div>
              )}
            </div>

            {/* Fluxos estratégicos */}
            <div className="px-4 py-3">
              <div className="font-sans text-[7px] uppercase tracking-wider mb-2"
                style={{ color: "rgba(255,255,255,0.25)" }}>
                Fluxos Estratégicos
              </div>
              <div className="space-y-1.5">
                {data.relevantCountries.map((c) => {
                  const m = baseMarkers.find((b) => b.id === c.id);
                  const col = relColor[c.type];
                  return (
                    <div key={c.id}
                      className="flex items-center justify-between px-2 py-1.5"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <div>
                        <span className="font-sans text-[9px] text-white/70 uppercase tracking-wide">
                          {m?.label}
                        </span>
                        {c.note && (
                          <div className="font-sans text-[7px] mt-0.5"
                            style={{ color: "rgba(255,255,255,0.28)" }}>
                            {c.note}
                          </div>
                        )}
                      </div>
                      <span
                        className="font-sans text-[7px] uppercase tracking-wide font-semibold px-1.5 py-0.5"
                        style={{
                          color: col.stroke.replace("0.80", "1"),
                          backgroundColor: col.stroke.replace("0.80", "0.12"),
                          border: `1px solid ${col.stroke.replace("0.80", "0.3")}`,
                        }}
                      >
                        {col.label.split(" / ")[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile — bottom sheet */}
      <AnimatePresence>
        <motion.div
          key={`mobile-${selectedAsset}`}
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 32, stiffness: 320 }}
          className="sm:hidden fixed bottom-0 left-0 right-0 z-50 overflow-y-auto"
          style={{
            maxHeight: "42vh",
            backgroundColor: "rgba(6,5,3,0.97)",
            borderTop: `1px solid ${GOLD}35`,
          }}
        >
          <div className="flex justify-center pt-2.5 pb-1.5">
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
          </div>
          <div className="px-4 pb-5">
            {/* Título + preço */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-display text-sm" style={{ color: GOLD }}>{data.label}</div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-display text-white text-sm">{data.price}</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: changeColor }}>
                    <ChangeIcon className="w-3 h-3" />
                    {changePositive ? "+" : ""}{data.change.toFixed(2)}%
                  </span>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5">
                <ChevronDown className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
              </button>
            </div>
            <p className="font-sans text-[10px] leading-relaxed mb-3"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              {data.flowData}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {data.relevantCountries.map((c) => {
                const m   = baseMarkers.find((b) => b.id === c.id);
                const col = relColor[c.type];
                return (
                  <span key={c.id}
                    className="font-sans text-[7px] uppercase tracking-wide font-semibold px-2 py-1"
                    style={{
                      color: col.stroke.replace("0.80", "1"),
                      backgroundColor: col.stroke.replace("0.80", "0.12"),
                      border: `1px solid ${col.stroke.replace("0.80", "0.3")}`,
                    }}
                  >
                    {m?.label}
                  </span>
                );
              })}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
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
  const [activeCategory, setActiveCategory] = useState<"Agro" | "Metais" | "Energia">("Agro");
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [showCountries, setShowCountries]   = useState(false);
  const uid = useId();

  const assetData           = selectedAsset ? assetFlows[selectedAsset] : null;
  const relevantCountryIds  = assetData?.relevantCountries.map((c) => c.id) ?? [];
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

      {/* ── Mapa ── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* Mapa ajustado: center deslocado para direita para eliminar espaço
            vazio da região do Alasca e enquadrar Europa-Ásia com o Japão visível */}
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ scale: 128, center: [25, 18] }}
          width={900}
          height={460}
          style={{ width: "100%", height: "100%", outline: "none" }}
        >
            <defs>
              {/* Filtros de glow por tipo */}
              {["gold", "verde", "vermelho", "dourada"].map((type) => {
                const colors: Record<string, string> = {
                  gold:     GOLD,
                  verde:    "rgba(52,211,153,0.9)",
                  vermelho: "rgba(248,113,113,0.9)",
                  dourada:  `${GOLD}ee`,
                };
                return (
                  <filter key={type} id={`glow-${type}-${uid}`}>
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feFlood floodColor={colors[type]} result="color" />
                    <feComposite in="color" in2="blur" operator="in" result="glow" />
                    <feMerge>
                      <feMergeNode in="glow" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                );
              })}

              {/* Animação de fluxo nas linhas */}
              <style>{`
                @keyframes flow-run {
                  0%   { stroke-dashoffset: 60; opacity: 0.2; }
                  50%  { opacity: 0.9; }
                  100% { stroke-dashoffset: 0; opacity: 0.2; }
                }
                .flow-line { animation: flow-run 3.2s ease-in-out infinite; }
              `}</style>
            </defs>

            {/* Países */}
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="rgba(255,255,255,0.025)"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={0.35}
                    style={{
                      default: { outline: "none" },
                      hover:   { outline: "none", fill: `${GOLD}08` },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Linhas de fluxo */}
            {assetData &&
              (() => {
                const primary = baseMarkers.find((m) => m.isPrimary)!;
                return baseMarkers.filter((m) => !m.isPrimary).map((dest, i) => {
                  const rel = assetData.relevantCountries.find((c) => c.id === dest.id);
                  const isActive = !!rel;
                  const col = isActive ? relColor[rel!.type] : null;
                  return (
                    <Line
                      key={dest.id}
                      from={primary.coordinates}
                      to={dest.coordinates}
                      stroke={isActive ? col!.stroke : "rgba(255,255,255,0.05)"}
                      strokeWidth={isActive ? 1.8 : 0.5}
                      strokeLinecap="round"
                      strokeDasharray={isActive ? "5 3" : "2 5"}
                      className={isActive ? "flow-line" : ""}
                      filter={isActive ? `url(#glow-${rel!.type.toLowerCase()}-${uid})` : ""}
                      style={{
                        opacity: isActive ? 0.9 : 0.1,
                        transition: `opacity 0.5s ease ${i * 0.035}s, stroke 0.5s ease`,
                      }}
                    />
                  );
                });
              })()}

            {/* Marcadores */}
            {baseMarkers.map((marker, i) => {
              const rel = assetData?.relevantCountries.find((c) => c.id === marker.id);
              const isHighlighted = !!relColor && !!rel;
              const col = rel ? relColor[rel.type] : null;

              return (
                <Marker key={marker.id} coordinates={marker.coordinates}>
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05, duration: 0.35 }}
                  >
                    {/* Pulso primário (Brasil) */}
                    {marker.isPrimary && (
                      <circle cx={0} cy={0} r={10} fill={`${GOLD}15`}>
                        <animate attributeName="r" values="3;22" dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.8;0" dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Pulso para países ativos */}
                    {isHighlighted && col && (
                      <circle cx={0} cy={0} r={10} fill="rgba(255,255,255,0.04)">
                        <animate attributeName="r" values="4;18" dur="2.0s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="0.7;0" dur="2.0s" repeatCount="indefinite" />
                      </circle>
                    )}
                    {/* Ponto */}
                    <circle
                      cx={0} cy={0}
                      r={isHighlighted ? 4 : marker.isPrimary ? 3.5 : 1.6}
                      fill={
                        isHighlighted && col
                          ? col.stroke.replace("0.80", "1")
                          : marker.isPrimary
                          ? GOLD
                          : "rgba(255,255,255,0.5)"
                      }
                      filter={
                        isHighlighted
                          ? `url(#glow-${rel!.type.toLowerCase()}-${uid})`
                          : marker.isPrimary
                          ? `url(#glow-gold-${uid})`
                          : undefined
                      }
                      style={{ transition: "all 0.45s ease" }}
                    />
                    {/* Label — posicionada acima da bolinha para países menores,
                        abaixo para o Brasil (isPrimary) */}
                    <text
                      textAnchor="middle"
                      x={0}
                      y={
                        marker.isPrimary
                          ? 14      /* Brasil: label abaixo do ponto grande */
                          : ["AE", "SA", "TR", "SG", "KR", "EG"].includes(marker.id)
                          ? -8     /* Oriente Médio / Ásia compacta: label acima */
                          : 9      /* demais: logo abaixo */
                      }
                      style={{
                        fontFamily: "monospace",
                        fontSize: isHighlighted || marker.isPrimary ? "6.5px" : "5px",
                        fontWeight: "600",
                        fill: isHighlighted && col
                          ? col.stroke.replace("0.80", "1")
                          : marker.isPrimary
                          ? GOLD
                          : "rgba(255,255,255,0.45)",
                        letterSpacing: "0.3px",
                        pointerEvents: "none",
                        transition: "all 0.45s ease",
                      }}
                    >
                      {marker.label}
                    </text>
                  </motion.g>
                </Marker>
              );
            })}
        </ComposableMap>

        {/* Legenda */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-4 px-3 py-2"
          style={{
            backgroundColor: "rgba(5,5,3,0.85)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {(["VERDE", "VERMELHO", "DOURADA"] as RelationType[]).map((type) => {
            const col = relColor[type];
            return (
              <div key={type} className="flex items-center gap-1.5">
                <div className="w-5 h-px" style={{ backgroundColor: col.stroke.replace("0.80", "1") }} />
                <span className="font-sans text-[7px] sm:text-[8px] uppercase tracking-wide"
                  style={{ color: "rgba(255,255,255,0.35)" }}>
                  {col.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Prompt inicial */}
        {!selectedAsset && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
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
        )}

        {/* Painel de informações */}
        {selectedAsset && (
          <InfoPanel
            selectedAsset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}
      </div>

      {/* ── Painel de Países Estratégicos ── */}
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
    </div>
  );
}
