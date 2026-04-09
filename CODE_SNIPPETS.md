# 🎯 Fluxo Macro - Key Code Snippets Reference

## Component Overview

The enhanced GlobalFlowMap component manages interactive geopolitical intelligence with these core mechanisms:

---

## 1. Asset Flow Data Structure

```typescript
// Complete type-safe mapping of all assets to their trading partners
const assetFlows: Record<AssetType, {
  label: string;                    // "PETR4", "Soja", etc.
  category: "Ações" | "Commodities"; // UI categorization
  relevantCountries: string[];      // ["BR", "CH", "SG", "US"]
  flowData: string;                 // Real economic description
  percentage: string;               // Market share: "45%"
  volume?: string;                  // Production: "55M toneladas"
}> = {
  // Example: Oil Company
  PETR4: {
    label: "PETR4",
    category: "Ações",
    relevantCountries: ["BR", "US", "CH", "SG"],
    flowData: "Brasil exporta 20% da produção (≈2.3M bbl/dia) para Ásia e EUA via terminal de Singapura",
    percentage: "20% produção global",
    volume: "2.3M bbl/dia"
  },
  // Example: Agricultural Commodity
  Soja: {
    label: "Soja",
    category: "Commodities",
    relevantCountries: ["BR", "US", "CH"],
    flowData: "Brasil exporta 45% da soja global (≈55M toneladas), principalmente para China via CME Group",
    percentage: "45% da produção",
    volume: "55M toneladas"
  },
  // ... 11 more assets
};
```

---

## 2. Geographic Markers - Country Nodes

```typescript
// All strategic trading hubs and geopolitical chokepoints
const baseMarkers = [
  {
    id: "BR",                              // Unique ID for references
    label: "Brasil",                       // Portuguese display name
    city: "São Paulo",                     // Context city
    coordinates: [-47.9292, -15.7801],     // Lat/Lng for map projection
    isPrimary: true                        // Brasil is the central hub
  },
  { id: "CH", label: "China", city: "Xangai", coordinates: [121.4737, 31.2304], isPrimary: false },
  { id: "US", label: "EUA", city: "Chicago (CME)", coordinates: [-87.6298, 41.8781], isPrimary: false },
  // ... 6 more countries
];
```

---

## 3. State Management

```typescript
// Two simple state variables power the entire interaction
const [progress, setProgress] = useState<number>(0);
const [selectedAsset, setSelectedAsset] = useState<AssetType>(null);

// Derived state - computed on every render
const primaryMarker = baseMarkers.find(m => m.isPrimary);
const assetData = selectedAsset ? assetFlows[selectedAsset] : null;
const relevantCountryIds = assetData?.relevantCountries || [];

// Auto-categorize assets by their category field
const stocks = Object.entries(assetFlows)
  .filter(([, v]) => v.category === "Ações")
  .map(([k]) => k as AssetType);

const commodities = Object.entries(assetFlows)
  .filter(([, v]) => v.category === "Commodities")
  .map(([k]) => k as AssetType);
```

---

## 4. Asset Selector Component

```typescript
{/* Asset Selector - Premium Bloomberg Style */}
<motion.div className="relative z-30 p-3 sm:p-4 border-b border-white/10 bg-gradient-to-r from-background/80 via-background/90 to-background/80 backdrop-blur-sm">
  
  {/* Header with Reset Button */}
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-primary" />
      <span className="text-[9px] sm:text-[10px] text-muted-foreground tracking-[0.2em] uppercase">
        Seletor de Ativos
      </span>
    </div>
    {selectedAsset && (
      <motion.button
        onClick={() => setSelectedAsset(null)}
        className="flex items-center gap-1 px-2 py-1 rounded-sm bg-primary/10 hover:bg-primary/20 border border-primary/30"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RotateCcw className="w-3 h-3 text-primary" />
        <span className="text-[8px] sm:text-[9px] text-primary uppercase">Resetar</span>
      </motion.button>
    )}
  </div>

  {/* Ações Section - Stocks */}
  <div className="mb-3">
    <div className="text-[8px] text-primary/60 tracking-[0.15em] uppercase mb-2">Ações</div>
    <div className="flex flex-wrap gap-2">
      {stocks.map((asset) => (
        <motion.button
          key={asset}
          onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
          className={`px-2 sm:px-3 py-1 rounded-sm text-[8px] uppercase tracking-[0.1em] font-display transition-all border ${
            selectedAsset === asset
              ? "bg-primary text-background border-primary shadow-lg shadow-primary/50"
              : "bg-white/5 text-foreground border-white/15 hover:border-primary/50 hover:bg-white/10"
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {asset}
        </motion.button>
      ))}
    </div>
  </div>

  {/* Commodities Section */}
  <div>
    <div className="text-[8px] text-primary/60 tracking-[0.15em] uppercase mb-2">Commodities</div>
    <div className="flex flex-wrap gap-2">
      {commodities.map((asset) => (
        <motion.button
          key={asset}
          onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
          className={`px-2 sm:px-3 py-1 rounded-sm text-[8px] uppercase tracking-[0.1em] transition-all border ${
            selectedAsset === asset
              ? "bg-primary text-background border-primary shadow-lg shadow-primary/50"
              : "bg-white/5 text-foreground border-white/15 hover:border-primary/50"
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
```

---

## 5. Dynamic Flow Lines

```typescript
{/* Connection Lines - Core visualization logic */}
{primaryMarker && (
  <>
    {baseMarkers.filter(m => !m.isPrimary).map((dest, i) => {
      // Check if destination country is relevant to selected asset
      const isActive = relevantCountryIds.includes(dest.id);
      
      return (
        <Line
          key={`line-${dest.id}`}
          from={primaryMarker.coordinates as [number, number]}
          to={dest.coordinates as [number, number]}
          // Active lines: bright blue, solid, thicker
          // Inactive lines: faded gold, dotted
          stroke={isActive ? "rgba(59,130,246,0.7)" : "rgba(198,167,92,0.2)"}
          strokeWidth={isActive ? 2.5 : 1}
          strokeLinecap="round"
          // Solid line when active (animated), dotted when not
          strokeDasharray={isActive ? "0" : "3 3"}
          // Apply animation class only to active lines
          className={isActive ? "animated-line" : ""}
          style={{
            // Smooth opacity transitions based on scroll & selection
            opacity: progress > 0.1 ? (isActive ? 1 : 0.3) : 0,
            // Staggered transitions for visual effect
            transition: `opacity 0.6s ease, stroke 0.6s ease ${i * 0.05}s, stroke-width 0.6s ease ${i * 0.05}s`
          }}
        />
      );
    })}
  </>
)}
```

---

## 6. CSS Animation for Line Flow

```css
/* Inject into SVG defs */
<style>{`
  @keyframes flow-animation {
    0% { 
      stroke-dashoffset: 50;    /* Offset creates moving dash effect */
      opacity: 0.3;              /* Faded */
    }
    50% { 
      opacity: 1;                /* Peak brightness */
    }
    100% { 
      stroke-dashoffset: 0;      /* Complete loop */
      opacity: 0.3;              /* Fade back */
    }
  }
  .animated-line {
    animation: flow-animation 3s ease-in-out infinite; /* 3-second cycle */
  }
`}</style>
```

---

## 7. Enhanced Country Markers

```typescript
{/* Markers - Countries on the map */}
{baseMarkers.map((marker, i) => {
  // Determine if this country is relevant to selected asset
  const isHighlighted = selectedAsset && relevantCountryIds.includes(marker.id);
  
  return (
    <Marker key={`marker-${marker.id}`} coordinates={marker.coordinates as [number, number]}>
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: progress > 0.1 ? 1 : 0, scale: progress > 0.1 ? 1 : 0 }}
        transition={{ delay: i * 0.1 }}
      >
        
        {/* Blue Pulse Ring - Only for highlighted countries */}
        {isHighlighted && (
          <circle cx={0} cy={0} r="20" fill="rgba(59,130,246,0.1)">
            {/* Expand animation: 8-40px radius */}
            <animate attributeName="r" values="8; 40" dur="2s" repeatCount="indefinite" />
            {/* Fade animation: 1-0 opacity */}
            <animate attributeName="opacity" values="1; 0" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Gold Pulse Ring - Only for Brasil (primary marker) */}
        {marker.isPrimary && (
          <circle cx={0} cy={0} r="15" fill="rgba(198,167,92,0.15)">
            <animate attributeName="r" values="3; 30" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1; 0" dur="2s" repeatCount="indefinite" />
          </circle>
        )}

        {/* Main Marker Circle */}
        <circle 
          cx={0} cy={0} 
          r={isHighlighted ? "5" : marker.isPrimary ? "3.5" : "2"} 
          fill={isHighlighted ? "#3B82F6" : marker.isPrimary ? "#C6A75C" : "rgba(255,255,255,0.8)"}
          filter={isHighlighted ? `url(#glow-accent-${uid})` : marker.isPrimary ? `url(#glow-${uid})` : ""}
          style={{ transition: "all 0.6s ease" }}
        />

        {/* Enhanced Country Label */}
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

        {/* City Name - Only when highlighted */}
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
```

---

## 8. Economic Flow Data Side Panel

```typescript
{/* Flow Data Side Panel - Appears when asset selected */}
{selectedAsset && assetData && (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 20 }}
    className="absolute bottom-4 right-4 z-20 max-w-xs w-full bg-background/90 backdrop-blur-sm border border-primary/30 rounded-sm p-4 shadow-2xl"
  >
    {/* Header */}
    <div className="flex items-start justify-between mb-3">
      <div>
        <div className="text-[10px] text-primary/60 tracking-widest uppercase">
          {assetData.category}
        </div>
        <h4 className="text-lg font-display text-primary font-bold">
          {assetFlows[selectedAsset].label}
        </h4>
      </div>
      {/* Close button */}
      <button
        onClick={() => setSelectedAsset(null)}
        className="p-1 hover:bg-white/10 rounded-sm transition-colors"
      >
        <X className="w-4 h-4 text-foreground/50" />
      </button>
    </div>

    {/* Flow Data Description */}
    <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
      {assetData.flowData}
    </p>

    {/* Metrics Section */}
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

    {/* Connected Countries (as badges) */}
    <div className="mt-3 pt-3 border-t border-white/10">
      <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-2">
        Principais Fluxos
      </div>
      <div className="flex flex-wrap gap-1">
        {assetData.relevantCountries.map((countryId) => {
          const country = baseMarkers.find(m => m.id === countryId);
          return (
            <span 
              key={countryId} 
              className="inline-block px-2 py-1 bg-primary/10 border border-primary/30 rounded-sm text-[8px] text-primary uppercase tracking-wider"
            >
              {country?.label}
            </span>
          );
        })}
      </div>
    </div>
  </motion.div>
)}
```

---

## 9. SVG Filters for Glow Effects

```typescript
<defs>
  {/* Gold Glow - Applied to primary marker (Brasil) */}
  <filter id={`glow-${uid}`}>
    <feGaussianBlur stdDeviation="2" result="blur" />
    <feFlood floodColor="rgba(198,167,92,0.8)" result="color" />
    <feComposite in="color" in2="blur" operator="in" result="glow" />
    <feMerge>
      <feMergeNode in="glow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>

  {/* Blue Glow - Applied to highlighted countries */}
  <filter id={`glow-accent-${uid}`}>
    <feGaussianBlur stdDeviation="3" result="blur" />
    <feFlood floodColor="rgba(59,130,246,0.8)" result="color" />
    <feComposite in="color" in2="blur" operator="in" result="glow" />
    <feMerge>
      <feMergeNode in="glow" />
      <feMergeNode in="SourceGraphic" />
    </feMerge>
  </filter>
</defs>
```

---

## 10. Color System Constants

```typescript
// Primary Colors (Aeternum Palette)
const colors = {
  gold: {
    hex: "#C6A75C",
    light: "rgba(198,167,92,0.8)",
    medium: "rgba(198,167,92,0.5)",
    dark: "rgba(198,167,92,0.2)",
  },
  blue: {
    hex: "#3B82F6",
    light: "rgba(59,130,246,0.8)",
    medium: "rgba(59,130,246,0.5)",
    dark: "rgba(59,130,246,0.1)",
  },
  background: "#060709",
  white: "rgba(255,255,255,0.7)",
  muted: "rgba(255,255,255,0.4)",
};

// Used throughout component for:
// - Primary markers: gold
// - Selected countries: blue
// - Text labels: gold/white
// - Glows: both colors
// - Backgrounds: dark background
```

---

## Key Interaction Patterns

### Toggle Asset Selection
```typescript
onClick={() => setSelectedAsset(selectedAsset === asset ? null : asset)}
// Click PETR4 → shows PETR4 flows
// Click PETR4 again → hides flows
// Click VALE3 → switches to VALE3 flows
```

### Reset Everything
```typescript
onClick={() => setSelectedAsset(null)}
// Clears selection
// Side panel disappears
// All lines return to default
// All countries fade back
```

### Check If Country Is Relevant
```typescript
const isHighlighted = selectedAsset && relevantCountryIds.includes(marker.id);
// If asset selected AND country in relevantCountries
// Then highlight country with blue effects
```

---

## Summary: How It All Works Together

1. **User selects asset** → `selectedAsset` state updates
2. **Component re-renders** → `relevantCountryIds` computed
3. **Asset selector** → button highlights in gold
4. **Lines dynamically change**:
   - Active lines: Blue, solid, thick, animated
   - Inactive lines: Gold, dotted, thin, faded
5. **Markers dynamically change**:
   - Selected countries: Blue circles, blue pulses, size increases
   - Unselected countries: White/gold circles, faded
   - Country labels: Font increases, city names appear
6. **Side panel appears** → Shows economic data for selected asset
7. **User clicks Close or Reset** → Everything returns to default

This simplicity (driven by a single `selectedAsset` state variable) makes the component:
- Easy to understand
- Easy to extend (add new assets)
- Easy to maintain
- Performant (minimal re-renders)
- Type-safe (TypeScript throughout)