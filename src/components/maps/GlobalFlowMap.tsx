import { useState, useId } from "react";
import { motion, MotionValue, useMotionValueEvent, useScroll } from "framer-motion";
import { ComposableMap, Geographies, Geography, Marker, Line } from "react-simple-maps";
import { X, RotateCcw, TrendingUp } from "lucide-react";

// TopoJSON with world country boundaries
const geoUrl = "https://unpkg.com/world-atlas@2.0.2/countries-110m.json";

export interface GlobalFlowMapProps {
  scrollProgress?: MotionValue<number>;
}

// Relationship Types with colors
type RelationType = "VERDE" | "VERMELHO" | "DOURADA";

// Asset Types - Commodities only
type AssetType = "Soja" | "Milho" | "Trigo" | "Brent" | "Ouro" | "Prata" | "Cobre" | "GasNatural" | "Aluminio" | "Paladio" | null;

// Color mapping for relationship types
const relationshipColors: Record<RelationType, { glow: string; stroke: string; dashArray: string }> = {
  VERDE: { glow: "rgba(34, 197, 94, 0.8)", stroke: "rgba(34, 197, 94, 0.7)", dashArray: "0" },
  VERMELHO: { glow: "rgba(239, 68, 68, 0.8)", stroke: "rgba(239, 68, 68, 0.7)", dashArray: "0" },
  DOURADA: { glow: "rgba(198, 167, 92, 0.8)", stroke: "rgba(198, 167, 92, 0.7)", dashArray: "0" },
};

// Nós globais estratégicos por Lat, Lng (com tradução para português)
const baseMarkers = [
  { id: "BR", label: "Brasil", city: "São Paulo", coordinates: [-47.9292, -15.7801], isPrimary: true },
  { id: "US", label: "EUA", city: "Chicago (CME)", coordinates: [-87.6298, 41.8781], isPrimary: false },
  { id: "CH", label: "China", city: "Xangai", coordinates: [121.4737, 31.2304], isPrimary: false },
  { id: "AR", label: "Argentina", city: "Buenos Aires", coordinates: [-58.3816, -34.6037], isPrimary: false },
  { id: "AU", label: "Austrália", city: "Sydney", coordinates: [151.2093, -33.8688], isPrimary: false },
  { id: "ME", label: "Arábia Saudita", city: "Golfo (Hormuz)", coordinates: [56.45, 26.56], isPrimary: false },
  { id: "RU", label: "Rússia", city: "Novorossiysk", coordinates: [37.7667, 44.7167], isPrimary: false },
  { id: "UK", label: "Reino Unido", city: "Londres (LME)", coordinates: [-0.1276, 51.5072], isPrimary: false },
  { id: "EU", label: "Suíça", city: "Genebra", coordinates: [6.1432, 46.2044], isPrimary: false },
  { id: "IN", label: "Índia", city: "Mumbai", coordinates: [72.8479, 19.0760], isPrimary: false },
  { id: "SG", label: "Singapura", city: "Terminal", coordinates: [103.8198, 1.3521], isPrimary: false },
  { id: "ZA", label: "África do Sul", city: "Joanesburgo", coordinates: [28.0473, -26.2023], isPrimary: false },
];

// Asset to Countries mapping with flow data and relationship types
const assetFlows: Record<AssetType, {
  label: string;
  category: "Commodities";
  relevantCountries: Array<{ id: string; type: RelationType }>;
  flowData: string;
  percentage: string;
  volume?: string;
}> = {
  Soja: {
    label: "Soja",
    category: "Commodities",
    relevantCountries: [
      { id: "CH", type: "VERDE" },  // Brasil é grande exportador
      { id: "US", type: "VERMELHO" },  // Competição direta
      { id: "AR", type: "VERMELHO" }   // Competição
    ],
    flowData: "Brasil exporta 45% da soja global (≈55M toneladas), principalmente para China via CME Group",
    percentage: "45% da produção",
    volume: "55M toneladas"
  },
  Milho: {
    label: "Milho",
    category: "Commodities",
    relevantCountries: [
      { id: "CH", type: "VERDE" },
      { id: "US", type: "VERMELHO" },
      { id: "IN", type: "VERDE" },
      { id: "SG", type: "DOURADA" }
    ],
    flowData: "Terceira maior commodity agrícola, Brasil participa com 5% das exportações via terminal de Singapura",
    percentage: "5% mercado",
    volume: "12M toneladas"
  },
  Trigo: {
    label: "Trigo",
    category: "Commodities",
    relevantCountries: [
      { id: "RU", type: "VERMELHO" },
      { id: "US", type: "VERMELHO" },
      { id: "CH", type: "VERDE" },
      { id: "EU", type: "VERDE" }
    ],
    flowData: "Rússia controla 20% das exportações, abastecendo via Novorossiysk (Mar Negro) e Índia",
    percentage: "20% global",
    volume: "190M toneladas"
  },
  Brent: {
    label: "Brent",
    category: "Commodities",
    relevantCountries: [
      { id: "ME", type: "DOURADA" },  // Chokepoint crítico
      { id: "US", type: "VERDE" },
      { id: "EU", type: "VERDE" },
      { id: "CH", type: "VERDE" },
      { id: "SG", type: "DOURADA" }
    ],
    flowData: "Petróleo Brent flui via Hormuz, maior gargalo geopolítico (20% do petróleo global cruza aqui)",
    percentage: "20% fluxo",
    volume: "21M bbl/dia"
  },
  Ouro: {
    label: "Ouro",
    category: "Commodities",
    relevantCountries: [
      { id: "US", type: "DOURADA" },
      { id: "CH", type: "VERDE" },
      { id: "UK", type: "DOURADA" },
      { id: "EU", type: "DOURADA" },
      { id: "AU", type: "VERDE" }
    ],
    flowData: "Ouro precificado em Chicago (CME) e armazenado em cofres de Genebra via sistema de clearing LBMA",
    percentage: "100% preçado",
    volume: "3000+ toneladas"
  },
  Prata: {
    label: "Prata",
    category: "Commodities",
    relevantCountries: [
      { id: "US", type: "DOURADA" },
      { id: "CH", type: "VERDE" },
      { id: "UK", type: "DOURADA" }
    ],
    flowData: "Metal industrial e de investimento, comercializado via COMEX (CME) com demanda chinesa crescente",
    percentage: "25% demanda",
    volume: "25000+ toneladas"
  },
  Cobre: {
    label: "Cobre",
    category: "Commodities",
    relevantCountries: [
      { id: "CH", type: "VERDE" },
      { id: "AU", type: "VERDE" },
      { id: "UK", type: "DOURADA" },
      { id: "SG", type: "DOURADA" }
    ],
    flowData: "Metal verde essencial para transição energética, 45% da demanda vem da China via LME",
    percentage: "45% demanda",
    volume: "23M toneladas"
  },
  GasNatural: {
    label: "Gás Natural",
    category: "Commodities",
    relevantCountries: [
      { id: "US", type: "VERDE" },
      { id: "EU", type: "VERDE" },
      { id: "RU", type: "VERMELHO" },
      { id: "ME", type: "DOURADA" }
    ],
    flowData: "Mercados segmentados: EUA (shale), EU (GNL), Rússia (gasodutos), Golfo (LNG)",
    percentage: "100% regional",
    volume: "4000+ bcm/ano"
  },
  Aluminio: {
    label: "Alumínio",
    category: "Commodities",
    relevantCountries: [
      { id: "CH", type: "VERDE" },
      { id: "UK", type: "DOURADA" },
      { id: "EU", type: "VERDE" },
      { id: "IN", type: "VERDE" }
    ],
    flowData: "China consome 60% da produção global, com preços formados na LME de Londres",
    percentage: "60% consumo",
    volume: "67M toneladas"
  },
  Paladio: {
    label: "Paládio",
    category: "Commodities",
    relevantCountries: [
      { id: "RU", type: "VERDE" },
      { id: "US", type: "DOURADA" },
      { id: "CH", type: "VERDE" },
      { id: "UK", type: "DOURADA" }
    ],
    flowData: "Metal raro para catalisadores, Rússia fornece 40%, preços via NYMEX e LME",
    percentage: "40% oferta",
    volume: "200+ toneladas"
  },
};

export default function GlobalFlowMap({ scrollProgress }: GlobalFlowMapProps) {
  const [progress, setProgress] = useState(0);
  const [selectedAsset, setSelectedAsset] = useState<AssetType>(null);
  const uid = useId();

  const { scrollYProgress } = useScroll();
  const activeProgress = scrollProgress || scrollYProgress;

  useMotionValueEvent(activeProgress, "change", (latest: number) => {
    if (typeof latest === "number" && !isNaN(latest)) {
      setProgress(latest);
    }
  });

  const primaryMarker = baseMarkers.find(m => m.isPrimary);
  const assetData = selectedAsset ? assetFlows[selectedAsset] : null;
  const relevantCountryIds = assetData?.relevantCountries || [];

  // Asset categories for selector
  const commodities = Object.entries(assetFlows)
    .filter(([, v]) => v.category === "Commodities")
    .map(([k]) => k as AssetType);

  return (
    <div className="w-full h-full relative bg-[#060709] overflow-hidden flex flex-col">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: `translateY(${progress * 20}px)`
        }}
      />
      
      {/* Glow Ambient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 35% 55%, rgba(198,167,92,${0.05 + progress * 0.1}) 0%, transparent 60%)`,
          transition: "background 0.6s ease-out",
        }}
      />

      {/* Asset Selector - Premium Bloomberg Style */}
      <motion.div 
        className="relative z-30 p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-sm"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Selector Title */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
            <span className="text-[9px] sm:text-[10px] text-muted-foreground tracking-[0.2em] uppercase font-display">
              Seletor de Commodities
            </span>
          </div>
          {selectedAsset && (
            <motion.button
              onClick={() => setSelectedAsset(null)}
              className="flex items-center gap-1 px-2 py-1 rounded-sm bg-primary/10 hover:bg-primary/20 border border-primary/30 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-3 h-3 text-primary" />
              <span className="text-[8px] sm:text-[9px] text-primary uppercase tracking-wider">Resetar</span>
            </motion.button>
          )}
        </div>

        {/* Commodities Section */}
        <div>
          <div className="text-[8px] sm:text-[9px] text-primary/60 tracking-[0.15em] uppercase font-display mb-2">
            Commodities
          </div>
          <div className="flex flex-wrap gap-2">
            {commodities.map((asset) => (
              <motion.button
                key={asset}
                onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
                className={`px-2 sm:px-3 py-1 rounded-sm text-[8px] sm:text-[9px] uppercase tracking-[0.1em] font-display transition-all border ${
                  selectedAsset === asset
                    ? "bg-primary text-background border-primary shadow-lg shadow-primary/50"
                    : "bg-white/5 text-foreground border-white/15 hover:border-primary/50 hover:bg-white/10"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {asset === "GasNatural" ? "Gás Natural" : assetFlows[asset].label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Map Container */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <div className="w-full h-full max-w-none relative z-10 pointer-events-none" style={{ transform: "scale(1.2)" }}>
          <ComposableMap 
            projection="geoMercator" 
            projectionConfig={{ scale: 120, center: [10, 15] }}
            width={800}
            height={400}
            style={{ width: "100%", height: "100%", outline: "none", pointerEvents: "none" }}
          >
            <defs>
              {/* Gold Glow Filter */}
              <filter id={`glow-${uid}`}>
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feFlood floodColor="rgba(198,167,92,0.8)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Green Glow Filter - for VERDE relationships */}
              <filter id={`glow-verde-${uid}`}>
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feFlood floodColor="rgba(34,197,94,0.85)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Red Glow Filter - for VERMELHO relationships */}
              <filter id={`glow-vermelho-${uid}`}>
                <feGaussianBlur stdDeviation="2.5" result="blur" />
                <feFlood floodColor="rgba(239,68,68,0.85)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Gold Glow Filter - for DOURADA relationships */}
              <filter id={`glow-dourada-${uid}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="rgba(198,167,92,0.9)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Accent Glow Filter for selected countries */}
              <filter id={`glow-accent-${uid}`}>
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feFlood floodColor="rgba(59,130,246,0.8)" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Curved Line Animation */}
              <style>{`
                @keyframes flow-animation {
                  0% { stroke-dashoffset: 50; opacity: 0.3; }
                  50% { opacity: 1; }
                  100% { stroke-dashoffset: 0; opacity: 0.3; }
                }
                .animated-line {
                  animation: flow-animation 3s ease-in-out infinite;
                }
              `}</style>
            </defs>

            {/* Map Geometries */}
            <Geographies geography={geoUrl}>
              {({ geographies }) => 
                geographies.map((geo) => {
                  const isHighlighted = selectedAsset && relevantCountryIds.some(id => 
                    baseMarkers.find(m => m.id === id)?.coordinates
                  );
                  
                  return (
                    <Geography 
                      key={geo.rsmKey} 
                      geography={geo}
                      fill="rgba(255,255,255,0.03)"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth={0.5}
                      style={{
                        default: { outline: "none" },
                        hover: { outline: "none", fill: "rgba(198,167,92,0.05)" },
                        pressed: { outline: "none" }
                      }}
                    />
                  );
                })
              }
            </Geographies>

            {/* Connection Lines */}
            {primaryMarker && assetData && (
              <>
                {/* Lines to all countries with dynamic relationship colors */}
                {baseMarkers.filter(m => !m.isPrimary).map((dest, i) => {
                  // Find if this country is in the selected asset's relevant countries and get its relationship type
                  const countryRelation = assetData.relevantCountries.find(c => c.id === dest.id);
                  const isActive = !!countryRelation;
                  const relationColor = isActive ? relationshipColors[countryRelation!.type] : null;
                  
                  return (
                    <Line
                      key={`line-${dest.id}`}
                      from={primaryMarker.coordinates as [number, number]}
                      to={dest.coordinates as [number, number]}
                      stroke={isActive ? relationColor!.stroke : "rgba(198,167,92,0.15)"}
                      strokeWidth={isActive ? 2.5 : 0.8}
                      strokeLinecap="round"
                      strokeDasharray={isActive ? relationColor!.dashArray : "3 3"}
                      className={isActive ? "animated-line" : ""}
                      filter={isActive ? `url(#glow-${countryRelation!.type.toLowerCase()}-${uid})` : ""}
                      style={{
                        opacity: progress > 0.1 ? (isActive ? 0.85 : 0.15) : 0,
                        transition: `opacity 0.6s ease, stroke 0.6s ease ${i * 0.05}s, stroke-width 0.6s ease ${i * 0.05}s`
                      }}
                    />
                  );
                })}
              </>
            )}

            {/* Markers */}
            {baseMarkers.map((marker, i) => {
              const isHighlighted = selectedAsset && relevantCountryIds.includes(marker.id);
              return (
                <Marker key={`marker-${marker.id}`} coordinates={marker.coordinates as [number, number]}>
                  <motion.g
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: progress > 0.1 ? 1 : 0, scale: progress > 0.1 ? 1 : 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    {/* Pulse ring for highlighted countries */}
                    {isHighlighted && (
                      <circle cx={0} cy={0} r="20" fill="rgba(59,130,246,0.1)">
                        <animate attributeName="r" values="8; 40" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1; 0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Primary pulse (only for Brasil) */}
                    {marker.isPrimary && (
                      <circle cx={0} cy={0} r="15" fill="rgba(198,167,92,0.15)">
                        <animate attributeName="r" values="3; 30" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" values="1; 0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}

                    {/* Marker circle */}
                    <circle 
                      cx={0} cy={0} 
                      r={isHighlighted ? "5" : marker.isPrimary ? "3.5" : "2"} 
                      fill={isHighlighted ? "#3B82F6" : marker.isPrimary ? "#C6A75C" : "rgba(255,255,255,0.8)"}
                      filter={isHighlighted ? `url(#glow-accent-${uid})` : marker.isPrimary ? `url(#glow-${uid})` : ""}
                      style={{ transition: "all 0.6s ease" }}
                    />

                    {/* Enhanced Labels - Much larger and more readable */}
                    <text
                      textAnchor={marker.id === "UK" || marker.id === "SG" ? "end" : marker.id === "EU" || marker.id === "ME" ? "start" : "middle"}
                      x={marker.id === "UK" || marker.id === "SG" ? -6 : marker.id === "EU" || marker.id === "ME" ? 6 : 0}
                      y={marker.id === "RU" ? -8 : marker.id === "EU" || marker.id === "UK" ? 0 : marker.id === "BR" ? 14 : 12}
                      style={{
                        fontFamily: "monospace",
                        fontSize: isHighlighted || marker.isPrimary ? "7px" : "6px",
                        fontWeight: "bold",
                        fill: isHighlighted || marker.isPrimary ? "#C6A75C" : "rgba(255,255,255,0.7)",
                        letterSpacing: "0.5px",
                        textShadow: `0 0 10px ${isHighlighted ? "rgba(59,130,246,0.5)" : "rgba(198,167,92,0.3)"}`,
                        transition: "all 0.6s ease",
                        pointerEvents: "none",
                      }}
                    >
                      {marker.label}
                    </text>

                    {/* City name for highlighted markers */}
                    {isHighlighted && (
                      <text
                        textAnchor={marker.id === "UK" || marker.id === "SG" ? "end" : marker.id === "EU" || marker.id === "ME" ? "start" : "middle"}
                        x={marker.id === "UK" || marker.id === "SG" ? -6 : marker.id === "EU" || marker.id === "ME" ? 6 : 0}
                        y={marker.id === "RU" ? 2 : marker.id === "EU" || marker.id === "UK" ? 10 : marker.id === "BR" ? 24 : 22}
                        style={{
                          fontFamily: "monospace",
                          fontSize: "5px",
                          fill: "rgba(59,130,246,0.7)",
                          letterSpacing: "0.3px",
                          pointerEvents: "none",
                        }}
                      >
                        {marker.city}
                      </text>
                    )}
                  </motion.g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Flow Data Side Panel */}
        {selectedAsset && assetData && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-4 right-4 z-20 max-w-xs w-full bg-background/90 backdrop-blur-sm border border-primary/30 rounded-sm p-4 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-[10px] text-primary/60 tracking-widest uppercase">
                  {assetData.category}
                </div>
                <h4 className="text-lg font-display text-primary font-bold">{assetFlows[selectedAsset].label}</h4>
              </div>
              <button
                onClick={() => setSelectedAsset(null)}
                className="p-1 hover:bg-white/10 rounded-sm transition-colors"
              >
                <X className="w-4 h-4 text-foreground/50" />
              </button>
            </div>

            {/* Flow Data */}
            <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
              {assetData.flowData}
            </p>

            {/* Metrics */}
            <div className="space-y-2 border-t border-white/10 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Participação</span>
                <span className="text-[10px] font-display text-primary font-bold">{assetData.percentage}</span>
              </div>
              {assetData.volume && (
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Volume</span>
                  <span className="text-[10px] font-display text-primary font-bold">{assetData.volume}</span>
                </div>
              )}
            </div>

            {/* Connected Countries with Relationship Types */}
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
                Principais Fluxos
              </div>
              <div className="space-y-2">
                {assetData.relevantCountries.map((countryRelation) => {
                  const country = baseMarkers.find(m => m.id === countryRelation.id);
                  const relationColor = relationshipColors[countryRelation.type];
                  const relationLabel = countryRelation.type === "VERDE" ? "Exportador" : 
                                       countryRelation.type === "VERMELHO" ? "Competição" : 
                                       "Estratégico";
                  
                  return (
                    <div key={countryRelation.id} className="flex items-center justify-between bg-white/5 px-2 py-1 rounded-sm border border-white/10">
                      <span className="text-[8px] text-foreground uppercase tracking-wider">
                        {country?.label}
                      </span>
                      <span 
                        className="text-[7px] uppercase tracking-wider font-bold px-1 py-0.5 rounded-sm"
                        style={{
                          backgroundColor: relationColor.color + "20",
                          color: relationColor.color,
                          border: `1px solid ${relationColor.color}40`
                        }}
                      >
                        {relationLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Header Info - Only show when no asset selected */}
      {!selectedAsset && (
        <motion.div 
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 text-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: progress > 0.1 ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-primary text-[11px] tracking-[0.2em] uppercase font-display mb-2">
            Inteligência Geopolítica
          </p>
          <p className="text-white/40 font-light text-[9px] tracking-widest uppercase">
            Selecione um ativo acima para explorar fluxos
          </p>
        </motion.div>
      )}
    </div>
  );
}
