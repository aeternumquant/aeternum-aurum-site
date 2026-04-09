import { useState } from "react";
import { TrendingUp, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";

interface QScore {
  momentum: number;
  seasonality: number;
  volatility: number;
  options: number;
}

interface TechnicalLevels {
  putSupport: number;
  callResistance: number;
  lowerBand: number;
  riskTrigger: number;
  hvl: number;
}

interface NewsHighlight {
  title: string;
  sentiment: "positive" | "negative" | "neutral";
}

interface MarketAsset {
  id: string;
  ticker: string;
  name: string;
  price: number;
  changePercent: number;
  changeAmount: number;
  qScore: QScore;
  netGEX: number;
  technicalLevels: TechnicalLevels;
  bias: "Bullish" | "Bearish" | "Neutral" | "Mixed";
  news: NewsHighlight[];
}

interface MarketIntelligenceProps {
  isLoading?: boolean;
  data?: {
    stocks: MarketAsset[];
    commodities: MarketAsset[];
    lastUpdated?: string;
  };
  onRefresh?: () => void;
}

// Mock data padrão para stocks
const DEFAULT_STOCKS_DATA: MarketAsset[] = [
  {
    id: "PBR",
    ticker: "PBR",
    name: "Petrobras",
    price: 28.45,
    changePercent: 2.34,
    changeAmount: 0.65,
    qScore: { momentum: 72, seasonality: 65, volatility: 58, options: 74 },
    netGEX: 2450000,
    technicalLevels: {
      putSupport: 27.50,
      callResistance: 30.20,
      lowerBand: 26.80,
      riskTrigger: 26.00,
      hvl: 31.50,
    },
    bias: "Bullish",
    news: [
      { title: "Produção Q1 supera previsões por 3%", sentiment: "positive" },
      { title: "Preços de óleo em alta por questões de suprimento", sentiment: "positive" },
    ],
  },
  {
    id: "VALE",
    ticker: "VALE",
    name: "Vale",
    price: 18.92,
    changePercent: -1.45,
    changeAmount: -0.28,
    qScore: { momentum: 45, seasonality: 52, volatility: 68, options: 51 },
    netGEX: -1250000,
    technicalLevels: {
      putSupport: 17.80,
      callResistance: 19.50,
      lowerBand: 17.20,
      riskTrigger: 16.50,
      hvl: 20.75,
    },
    bias: "Neutral",
    news: [
      { title: "Preços de minério recuam com demanda fraca na China", sentiment: "negative" },
      { title: "Anúncio de dividendos esperado no próximo mês", sentiment: "neutral" },
    ],
  },
  {
    id: "JBS",
    ticker: "JBS",
    name: "JBS",
    price: 32.15,
    changePercent: 1.78,
    changeAmount: 0.56,
    qScore: { momentum: 68, seasonality: 71, volatility: 52, options: 66 },
    netGEX: 1820000,
    technicalLevels: {
      putSupport: 31.00,
      callResistance: 33.50,
      lowerBand: 30.25,
      riskTrigger: 29.50,
      hvl: 35.20,
    },
    bias: "Bullish",
    news: [
      { title: "Demanda por proteína forte em mercados de exportação", sentiment: "positive" },
      { title: "Ganhos de eficiência operacional impulsionam margens", sentiment: "positive" },
    ],
  },
];

// Mock data padrão para commodities
const DEFAULT_COMMODITIES_DATA: MarketAsset[] = [
  {
    id: "SOYBEAN",
    ticker: "ZS",
    name: "Soja",
    price: 11.85,
    changePercent: 0.92,
    changeAmount: 0.11,
    qScore: { momentum: 58, seasonality: 82, volatility: 62, options: 59 },
    netGEX: 3200000,
    technicalLevels: {
      putSupport: 11.20,
      callResistance: 12.40,
      lowerBand: 10.85,
      riskTrigger: 10.40,
      hvl: 13.15,
    },
    bias: "Bullish",
    news: [
      { title: "Colheita brasileira esperada 15% acima do ano anterior", sentiment: "positive" },
      { title: "Demanda chinesa de importação mostra sinais de recuperação", sentiment: "positive" },
    ],
  },
  {
    id: "CORN",
    ticker: "ZC",
    name: "Milho",
    price: 4.28,
    changePercent: -0.56,
    changeAmount: -0.02,
    qScore: { momentum: 48, seasonality: 76, volatility: 55, options: 52 },
    netGEX: 1650000,
    technicalLevels: {
      putSupport: 4.10,
      callResistance: 4.45,
      lowerBand: 3.95,
      riskTrigger: 3.80,
      hvl: 4.65,
    },
    bias: "Neutral",
    news: [
      { title: "USDA mantém estimativas favoráveis de colheita", sentiment: "neutral" },
      { title: "Restrições de capacidade de armazenamento no Centro-Oeste", sentiment: "negative" },
    ],
  },
  {
    id: "WHEAT",
    ticker: "ZWH",
    name: "Trigo",
    price: 5.62,
    changePercent: 1.34,
    changeAmount: 0.07,
    qScore: { momentum: 62, seasonality: 68, volatility: 59, options: 61 },
    netGEX: 2100000,
    technicalLevels: {
      putSupport: 5.30,
      callResistance: 5.95,
      lowerBand: 5.10,
      riskTrigger: 4.90,
      hvl: 6.25,
    },
    bias: "Bullish",
    news: [
      { title: "Estoques globais de trigo em mínimas de vários anos", sentiment: "positive" },
      { title: "Atrasos no plantio de primavera esperados em regiões do norte", sentiment: "negative" },
    ],
  },
  {
    id: "BRENT",
    ticker: "CL",
    name: "Brent Crude",
    price: 87.45,
    changePercent: 3.21,
    changeAmount: 2.72,
    qScore: { momentum: 78, seasonality: 55, volatility: 71, options: 75 },
    netGEX: 5400000,
    technicalLevels: {
      putSupport: 84.20,
      callResistance: 91.50,
      lowerBand: 82.10,
      riskTrigger: 80.00,
      hvl: 95.75,
    },
    bias: "Bullish",
    news: [
      { title: "OPEC+ mantém disciplina na produção", sentiment: "positive" },
      { title: "Prêmio de risco geopolítico sustenta preços", sentiment: "positive" },
    ],
  },
  {
    id: "GOLD",
    ticker: "GC",
    name: "Ouro",
    price: 2145.30,
    changePercent: 1.56,
    changeAmount: 33.20,
    qScore: { momentum: 71, seasonality: 48, volatility: 38, options: 68 },
    netGEX: -850000,
    technicalLevels: {
      putSupport: 2120.00,
      callResistance: 2180.00,
      lowerBand: 2100.00,
      riskTrigger: 2080.00,
      hvl: 2220.00,
    },
    bias: "Bullish",
    news: [
      { title: "Bancos centrais continuam estratégia de acumulação", sentiment: "positive" },
      { title: "Fraqueza do dólar sustenta demanda por ativo seguro", sentiment: "positive" },
    ],
  },
  {
    id: "SILVER",
    ticker: "SI",
    name: "Prata",
    price: 28.42,
    changePercent: 2.11,
    changeAmount: 0.59,
    qScore: { momentum: 75, seasonality: 52, volatility: 64, options: 72 },
    netGEX: 2250000,
    technicalLevels: {
      putSupport: 27.50,
      callResistance: 29.80,
      lowerBand: 27.00,
      riskTrigger: 26.20,
      hvl: 31.25,
    },
    bias: "Bullish",
    news: [
      { title: "Demanda industrial acelera no setor de tecnologia", sentiment: "positive" },
      { title: "Expansão da indústria solar sustenta perspectiva fundamental", sentiment: "positive" },
    ],
  },
  {
    id: "PALLADIUM",
    ticker: "PA",
    name: "Paládio",
    price: 925.50,
    changePercent: -2.34,
    changeAmount: -22.10,
    qScore: { momentum: 42, seasonality: 45, volatility: 72, options: 48 },
    netGEX: -1900000,
    technicalLevels: {
      putSupport: 900.00,
      callResistance: 960.00,
      lowerBand: 880.00,
      riskTrigger: 850.00,
      hvl: 1010.00,
    },
    bias: "Bearish",
    news: [
      { title: "Recuperação do setor automotivo mais lenta que o esperado", sentiment: "negative" },
      { title: "Incertezas de suprimento russo criam volatilidade", sentiment: "negative" },
    ],
  },
  {
    id: "COPPER",
    ticker: "HG",
    name: "Cobre",
    price: 4.12,
    changePercent: 1.47,
    changeAmount: 0.06,
    qScore: { momentum: 69, seasonality: 61, volatility: 58, options: 67 },
    netGEX: 3650000,
    technicalLevels: {
      putSupport: 3.95,
      callResistance: 4.35,
      lowerBand: 3.80,
      riskTrigger: 3.65,
      hvl: 4.58,
    },
    bias: "Bullish",
    news: [
      { title: "Investimento em infraestrutura de energia limpa acelera", sentiment: "positive" },
      { title: "PMI de manufatura chinesa mostra melhora", sentiment: "positive" },
    ],
  },
  {
    id: "NATGAS",
    ticker: "NG",
    name: "Gás Natural",
    price: 2.85,
    changePercent: -3.12,
    changeAmount: -0.09,
    qScore: { momentum: 38, seasonality: 74, volatility: 69, options: 42 },
    netGEX: -2800000,
    technicalLevels: {
      putSupport: 2.65,
      callResistance: 3.15,
      lowerBand: 2.50,
      riskTrigger: 2.30,
      hvl: 3.45,
    },
    bias: "Bearish",
    news: [
      { title: "Clima mais quente reduz demanda sazonal", sentiment: "negative" },
      { title: "Aumento de capacidade de exportação de GNL pressiona oferta doméstica", sentiment: "negative" },
    ],
  },
  {
    id: "ALUMINUM",
    ticker: "AL",
    name: "Alumínio",
    price: 2385.25,
    changePercent: 0.78,
    changeAmount: 18.50,
    qScore: { momentum: 55, seasonality: 58, volatility: 51, options: 54 },
    netGEX: 1420000,
    technicalLevels: {
      putSupport: 2340.00,
      callResistance: 2450.00,
      lowerBand: 2310.00,
      riskTrigger: 2280.00,
      hvl: 2520.00,
    },
    bias: "Neutral",
    news: [
      { title: "Custos de energia se estabilizam em níveis mais baixos", sentiment: "positive" },
      { title: "Crescimento de demanda de aeronáutica sustenta perspectiva", sentiment: "positive" },
    ],
  },
];

// Componente de skeleton loading
function SkeletonCard() {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6">
      <div className="space-y-4">
        <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse" />
        <div className="h-6 bg-white/10 rounded w-1/2 animate-pulse" />
        <div className="space-y-2">
          <div className="h-3 bg-white/10 rounded w-full animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-5/6 animate-pulse" />
          <div className="h-3 bg-white/10 rounded w-4/6 animate-pulse" />
        </div>
        <div className="h-8 bg-white/10 rounded w-1/3 animate-pulse" />
      </div>
    </div>
  );
}

// Componente visual para Q-Score com círculos coloridos
function QScoreVisual({ score, label }: { score: number; label: string }) {
  const getColor = (value: number) => {
    if (value >= 70) return "bg-emerald-500/30 border-emerald-500/50 text-emerald-300";
    if (value >= 55) return "bg-amber-500/30 border-amber-500/50 text-amber-300";
    return "bg-red-500/30 border-red-500/50 text-red-300";
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold text-sm ${getColor(score)}`}
      >
        {score}
      </div>
      <span className="text-xs text-muted-foreground text-center">{label}</span>
    </div>
  );
}

// Componente aprimorado de card de ativo
function AssetCard({ asset }: { asset: MarketAsset }) {
  const isPositive = asset.changePercent >= 0;
  const biasColors = {
    Bullish: "from-emerald-900/30 to-emerald-900/10",
    Bearish: "from-red-900/30 to-red-900/10",
    Neutral: "from-slate-900/30 to-slate-900/10",
    Mixed: "from-amber-900/30 to-amber-900/10",
  };

  const biasTextColors = {
    Bullish: "text-emerald-400",
    Bearish: "text-red-400",
    Neutral: "text-slate-300",
    Mixed: "text-amber-400",
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10">
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-transparent to-transparent opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header com ticker e preço */}
      <div className="relative z-10 mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-sm font-display text-primary tracking-wider uppercase">
              {asset.ticker}
            </h3>
            <p className="text-xs text-muted-foreground">{asset.name}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold text-foreground">
              ${asset.price.toFixed(2)}
            </p>
            <div
              className={`flex items-center justify-end gap-1 ${
                isPositive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isPositive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span className="text-xs font-medium">
                {isPositive ? "+" : ""}
                {asset.changePercent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Separador */}
      <div className="relative z-10 my-3 h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

      {/* Q-Score Visual com círculos */}
      <div className="relative z-10 mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Q-Score
        </p>
        <div className="grid grid-cols-4 gap-2">
          <QScoreVisual score={asset.qScore.momentum} label="Momentum" />
          <QScoreVisual score={asset.qScore.seasonality} label="Sazonalidade" />
          <QScoreVisual score={asset.qScore.volatility} label="Volatilidade" />
          <QScoreVisual score={asset.qScore.options} label="Opções" />
        </div>
      </div>

      {/* NetGEX */}
      <div className="relative z-10 mb-4 rounded-sm bg-white/5 p-3">
        <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider">
          Posição NetGEX
        </p>
        <div
          className={`text-sm font-semibold ${
            asset.netGEX > 0 ? "text-emerald-400" : "text-red-400"
          }`}
        >
          ${(asset.netGEX / 1000000).toFixed(2)}M{" "}
          <span className="text-xs text-muted-foreground">
            {asset.netGEX > 0 ? "Comprado" : "Vendido"}
          </span>
        </div>
      </div>

      {/* Níveis Técnicos */}
      <div className="relative z-10 mb-4">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Níveis Técnicos
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Suporte Put</span>
            <span className="text-emerald-400 font-semibold">
              ${asset.technicalLevels.putSupport.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Resistência Call</span>
            <span className="text-red-400 font-semibold">
              ${asset.technicalLevels.callResistance.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Banda Inferior</span>
            <span className="font-semibold text-slate-300">
              ${asset.technicalLevels.lowerBand.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Stop de Risco</span>
            <span className="font-semibold text-red-500">
              ${asset.technicalLevels.riskTrigger.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Badge de Viés */}
      <div className="relative z-10 mb-4">
        <div
          className={`inline-block rounded-full bg-gradient-to-r ${biasColors[asset.bias]} px-3 py-1 text-xs font-semibold ${biasTextColors[asset.bias]}`}
        >
          {asset.bias}
        </div>
      </div>

      {/* Destaques de Notícias */}
      <div className="relative z-10">
        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Notícias
        </p>
        <div className="space-y-2">
          {asset.news.map((newsItem, idx) => (
            <div
              key={idx}
              className="flex gap-2 rounded-sm bg-white/5 p-2 text-xs text-muted-foreground"
            >
              <AlertCircle
                size={12}
                className={`mt-0.5 flex-shrink-0 ${
                  newsItem.sentiment === "positive"
                    ? "text-emerald-500"
                    : newsItem.sentiment === "negative"
                      ? "text-red-500"
                      : "text-slate-500"
                }`}
              />
              <span>{newsItem.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MarketIntelligence({
  isLoading = false,
  data,
  onRefresh,
}: MarketIntelligenceProps) {
  const [activeTab, setActiveTab] = useState<"stocks" | "commodities">("stocks");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Usa dados fornecidos ou padrões
  const stocks = data?.stocks || DEFAULT_STOCKS_DATA;
  const commodities = data?.commodities || DEFAULT_COMMODITIES_DATA;
  const lastUpdated = data?.lastUpdated || new Date().toLocaleTimeString("pt-BR");

  const assets = activeTab === "stocks" ? stocks : commodities;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (onRefresh) {
      await onRefresh();
    }
    setIsRefreshing(false);
  };

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-display tracking-tight mb-4">
                <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                  Inteligência de Mercado
                </span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Análise avançada QUIN com insights profissionais, níveis técnicos e indicadores de sentimento
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing}
              className="px-6 py-3 rounded-lg font-semibold tracking-wide transition-all duration-300 flex items-center gap-2 whitespace-nowrap bg-gradient-to-r from-primary/20 to-accent/20 text-primary hover:from-primary/30 hover:to-accent/30 border border-primary/30 hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw
                size={16}
                className={`${isRefreshing ? "animate-spin" : ""}`}
              />
              Atualizar Dados
            </button>
          </div>

          {/* Timestamp */}
          <div className="mt-4 text-xs text-muted-foreground">
            Última atualização: {lastUpdated}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 justify-start mb-12">
          {[
            { id: "stocks", label: "Ações Principais" },
            { id: "commodities", label: "Commodities Principais" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "stocks" | "commodities")}
              className={`px-6 py-3 rounded-lg font-semibold tracking-wide transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/50"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Assets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
            : assets.map((asset) => <AssetCard key={asset.id} asset={asset} />)}
        </div>
      </div>
    </section>
  );
}
