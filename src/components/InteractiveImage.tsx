import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, X, Maximize2, RotateCcw } from "lucide-react";

interface InteractiveImageProps { src: string; alt: string; caption?: string; className?: string; }

export default function InteractiveImage({ src, alt, caption, className }: InteractiveImageProps) {
  const [open, setOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });

  const resetView = useCallback(() => { setScale(1); setPosition({ x: 0, y: 0 }); }, []);
  const zoom = useCallback((delta: number) => { setScale((s) => Math.min(5, Math.max(1, s + delta))); }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); resetView(); }
      if (e.key === "+" || e.key === "=") zoom(0.5);
      if (e.key === "-") zoom(-0.5);
      if (e.key === "0") resetView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, zoom, resetView]);

  useEffect(() => { if (scale === 1) setPosition({ x: 0, y: 0 }); }, [scale]);

  return (
    <>
      <div className={`relative group overflow-hidden cursor-zoom-in ${className ?? ""}`} onClick={() => setOpen(true)}>
        <img src={src} alt={alt} className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.015]" />
        <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2 bg-background/80 border border-white/10 px-3 py-1.5">
            <Maximize2 size={12} className="text-primary" />
            <span className="text-[9px] text-primary tracking-widest uppercase">Ver em detalhe</span>
          </div>
        </div>
        {caption && <p className="mt-2 text-[10px] text-muted-foreground/50 tracking-widest uppercase text-center">{caption}</p>}
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 z-[100] bg-background/96 backdrop-blur-sm flex items-center justify-center" onClick={(e) => { if (e.target === e.currentTarget) { setOpen(false); resetView(); } }}>
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              <button onClick={() => zoom(0.5)} className="w-8 h-8 flex items-center justify-center border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/25 transition-colors"><ZoomIn size={14} /></button>
              <button onClick={() => zoom(-0.5)} className="w-8 h-8 flex items-center justify-center border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/25 transition-colors"><ZoomOut size={14} /></button>
              <button onClick={resetView} className="w-8 h-8 flex items-center justify-center border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/25 transition-colors"><RotateCcw size={14} /></button>
              <button onClick={() => { setOpen(false); resetView(); }} className="w-8 h-8 flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/10 transition-colors ml-2"><X size={14} /></button>
            </div>
            <div className="absolute top-4 left-4 text-[9px] text-muted-foreground/50 tracking-widest uppercase">{Math.round(scale * 100)}% · Scroll para zoom</div>
            <div className="w-full h-full flex items-center justify-center overflow-hidden select-none" onWheel={(e) => { e.preventDefault(); zoom(e.deltaY < 0 ? 0.3 : -0.3); }} onMouseDown={(e) => { if (scale === 1) return; setDragging(true); dragStart.current = { x: e.clientX, y: e.clientY, px: position.x, py: position.y }; }} onMouseMove={(e) => { if (!dragging) return; setPosition({ x: dragStart.current.px + (e.clientX - dragStart.current.x), y: dragStart.current.py + (e.clientY - dragStart.current.y) }); }} onMouseUp={() => setDragging(false)} onMouseLeave={() => setDragging(false)} style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}>
              <motion.img src={src} alt={alt} animate={{ scale, x: position.x, y: position.y }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="max-w-[90vw] max-h-[85vh] object-contain border border-white/5" draggable={false} onDoubleClick={resetView} />
            </div>
            {caption && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground/50 tracking-widest uppercase">{caption}</div>}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
