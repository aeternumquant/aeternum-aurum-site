import { motion } from "framer-motion";
import { useId, useEffect, useState } from "react";

export default function VolatilitySurface() {
  const uid = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dimensões do grid (Strikes vs Tempo)
  const rows = 18; // DTE (Days to expiration)
  const cols = 26; // Strikes

  // Helper para gerar o mapa de calor baseado na altura (Volatilidade/Z)
  const getColor = (z: number, maxZ: number) => {
    const ratio = Math.max(0, Math.min(1, z / maxZ));
    // Escala de cores estilo MenthorQ (Roxo -> Azul -> Ciano -> Verde -> Amarelo -> Laranja -> Vermelho)
    if (ratio < 0.2) return `hsl(260, 100%, ${30 + ratio * 100}%)`; // Roxo Escuro
    if (ratio < 0.4) return `hsl(210, 100%, ${30 + (ratio - 0.2) * 150}%)`; // Azul
    if (ratio < 0.6) return `hsl(180, 100%, ${40 + (ratio - 0.4) * 100}%)`; // Ciano
    if (ratio < 0.8) return `hsl(80, 100%, ${50 + (ratio - 0.6) * 100}%)`; // Verde/Amarelo
    return `hsl(${30 - (ratio - 0.8) * 150}, 100%, 50%)`; // Laranja -> Vermelho nas pontas
  };

  // Função matemática para gerar a "Superfície"
  const getElevation = (r: number, c: number) => {
    const strikeOffset = c - cols / 2;
    // Volatility Smile básico (Parábola em X)
    let z = (strikeOffset * strikeOffset) * 0.15;
    
    // Decaimento no tempo (Mais vol perto do vencimento, r = 0)
    const timeFactor = Math.max(0.1, (rows - r) / rows);
    z = z * timeFactor * 4;

    // Adiciona o "Spike" anômalo visto na foto (Ex: Earnings ou Evento OTM Put extremado)
    // O spike fica no curto prazo (r baixo) e strike fora do dinheiro (crd perto de 3 ou 4)
    if (r < 4 && c > 3 && c < 8) {
      const peak = (4 - r) * (1 - Math.abs(c - 5) * 0.3);
      z += Math.max(0, peak * 25);
    }
    
    // Pequeno spike no lado oposto (Call skew)
    if (r < 3 && c > cols - 5) {
      const peak = (3 - r) * (1 - Math.abs(c - (cols - 3)) * 0.4);
      z += Math.max(0, peak * 12);
    }

    return z;
  };

  const renderPolygons = () => {
    const polygons = [];
    const maxZ = 60; // Referência para 100% vermelho

    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        // Pontos 3D (Grid cartesiano)
        const p1 = { x: c, y: r, z: getElevation(r, c) };
        const p2 = { x: c + 1, y: r, z: getElevation(r, c + 1) };
        const p3 = { x: c + 1, y: r + 1, z: getElevation(r + 1, c + 1) };
        const p4 = { x: c, y: r + 1, z: getElevation(r + 1, c) };

        // Projeção Isométrica para 2D
        const project = (p: {x: number, y: number, z: number}) => {
          const isoX = (p.x - p.y) * 12;
          const isoY = (p.x + p.y) * 6 - p.z;
          return `${isoX},${isoY}`;
        };

        const pathCoords = `${project(p1)} ${project(p2)} ${project(p3)} ${project(p4)}`;
        const avgZ = (p1.z + p2.z + p3.z + p4.z) / 4;
        const color = getColor(avgZ, maxZ);

        polygons.push(
          <motion.polygon
            key={`${r}-${c}`}
            points={pathCoords}
            fill={color}
            stroke="rgba(0,0,0,0.4)" // Lines preta discreta demarcando a quebra do Heatmap
            strokeWidth="0.5"
            style={{ opacity: 0.8 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 0.8, scale: 1 } : {}}
            transition={{ 
              duration: 0.5, 
              delay: (r * cols + c) * 0.002, // Animação onda nascendo
              ease: "easeOut"
            }}
          />
        );
      }
    }
    return polygons;
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full relative group bg-black/60 border border-white/5 p-4 min-h-[450px] flex items-center justify-center overflow-hidden">
        
        {/* Glow de fundo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/5 blur-[150px] rounded-full pointer-events-none z-0" />

        {/* Labels e Interface Parecida com MenthorQ */}
        <div className="absolute top-4 left-4 z-20">
          <h3 className="text-white text-xl font-display mb-1 flex items-center gap-2 tracking-wide">
            Volatility Surface for PBR
          </h3>
          <p className="text-white/60 font-mono text-xs tracking-widest uppercase">
            Timestamp: Live EOD
          </p>
        </div>

        {/* Legenda de Cores (Barra Gradiente Lateral parecida com MenthorQ) */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 h-64 w-12 flex flex-col items-end z-20">
          <div className="flex gap-2 h-full">
            <div className="w-3 h-full rounded-full" 
                 style={{ 
                   background: 'linear-gradient(to top, hsl(260,100%,30%), hsl(210,100%,50%), hsl(180,100%,50%), hsl(80,100%,50%), hsl(15,100%,50%), red)' 
                 }} 
            />
            <div className="h-full flex flex-col justify-between py-1 text-[9px] text-white/50 font-mono">
              <span>700</span>
              <span>500</span>
              <span>300</span>
              <span>100</span>
              <span>0</span>
            </div>
          </div>
          <span className="text-[10px] text-white/40 font-mono -rotate-90 mt-12 mr-6 text-nowrap">Implied Vol (%)</span>
        </div>

        {/* Eixos Flutuantes em 3D */}
        <div className="absolute z-10 w-full h-full flex items-center justify-center pointer-events-none">
          <svg viewBox="-300 -100 600 350" className="w-full max-w-3xl overflow-visible">
            
            {/* Linhas guias traçadas do cenário 3D no fundo */}
            <g stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" strokeDasharray="2 2">
               <line x1="-50" y1="20" x2="-250" y2="-80" />
               <line x1="50" y1="20" x2="250" y2="-80" />
            </g>

            <text x="-200" y="-90" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" transform="rotate(-26, -200, -90)">Term Structure</text>
            <text x="200" y="-90" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" transform="rotate(26, 200, -90)">Skew</text>

            <g transform="translate(0, 50)">
              {/* O Mesh Heatmap */}
              {renderPolygons()}
            </g>

            {/* Sub-eixos Inferiores (Expiration days, Strike Price) */}
            <g transform="translate(0, 50)">
               <text x="-120" y="240" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" transform="rotate(26, -120, 240)">Strike Price</text>
               <text x="120" y="240" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="monospace" transform="rotate(-26, 120, 240)">Expiration (days)</text>
            </g>
          </svg>
        </div>

        <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 opacity-50">
           <div className="w-4 h-4 rounded-full border border-white flex items-center justify-center font-display text-[8px] text-white">Q</div>
           <span className="text-[10px] tracking-widest text-white font-display">AETERNUM</span>
        </div>
      </div>
    </div>
  );
}
