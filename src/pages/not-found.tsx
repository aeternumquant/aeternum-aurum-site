import { Link } from "react-router-dom";
import { WireframeCube } from "../components/common/WireframeCube";
import ParticleField from "../components/common/ParticleField";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <WireframeCube />
        <h1 className="text-6xl font-bold mt-8 mb-4">404</h1>
        <p className="text-2xl mb-8">Página não encontrada</p>
        
        <Link 
          to="/" 
          className="inline-block px-8 py-4 bg-yellow-400 text-black font-medium rounded-lg hover:bg-yellow-300 transition-colors"
        >
          Voltar para Home
        </Link>
      </div>
    </div>
  );
}