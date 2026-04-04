import { Link } from "react-router-dom";
import { WireframeCube } from "@/components/WireframeCube";
import ParticleField from "@/components/ParticleField";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <ParticleField />
      <div className="relative z-10 flex flex-col items-center">
        <WireframeCube className="w-16 h-16 mb-8 opacity-50" animate={false} />
        <h1 className="font-display text-4xl text-primary mb-4 tracking-widest uppercase">404</h1>
        <p className="text-muted-foreground text-sm tracking-wider uppercase mb-8">Página não encontrada</p>
        <Link
          to="/"
          className="px-6 py-3 border border-primary/40 text-foreground/80 text-xs tracking-widest uppercase hover:bg-primary hover:text-background hover:border-primary transition-all duration-300"
        >
          Retornar à página inicial
        </Link>
      </div>
    </div>
  );
}
