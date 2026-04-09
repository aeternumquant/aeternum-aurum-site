import { useParams, Link, useNavigate } from "react-router-dom";
import { MoveLeft } from "lucide-react";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
import { shortPapers } from "../lib/researchData";
import { useAuth } from "../context/AuthContext";
import NotFound from "./not-found";

export default function ArticleReader() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const paper = shortPapers.find((p) => p.id === id);

  if (!paper || !paper.sections || paper.sections.length === 0) {
    return <NotFound />;
  }

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Header strictly for reading state */}
      <div className="fixed top-0 left-0 right-0 h-14 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center px-4 sm:px-6">
        <Link
          to="/research"
          className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors font-sans"
        >
          <MoveLeft className="w-3 h-3" /> Voltar para Pesquisas
        </Link>
      </div>

      <article className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <FadeIn>
          {/* Article Header */}
          <header className="mb-16 border-b border-white/10 pb-12 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <span className="text-[10px] border border-primary/20 text-primary/70 px-2 py-0.5 tracking-widest uppercase font-sans">
                {paper.tag}
              </span>
              <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase font-sans">
                {paper.date}
              </span>
              <span className="text-primary/30 text-xs">·</span>
              <span className="text-[10px] text-muted-foreground/60 tracking-widest uppercase font-sans">
                Leitura: {paper.readTime}
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-primary leading-[1.1] tracking-wide mb-6">
              {paper.title}
            </h1>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs font-display">AA</span>
              </div>
              <div className="text-left">
                <p className="text-[11px] text-foreground/80 tracking-widest uppercase font-sans">
                  {paper.author}
                </p>
                <p className="text-[9px] text-muted-foreground tracking-widest uppercase font-sans">
                  Aeternum Partners
                </p>
              </div>
            </div>
          </header>
        </FadeIn>

        {/* Article Body */}
        <div className={`prose prose-invert prose-p:font-serif prose-p:text-lg prose-p:text-muted-foreground prose-p:leading-loose prose-h2:font-display prose-h2:text-3xl prose-h2:text-primary prose-h2:font-normal prose-h2:mt-16 prose-h2:tracking-wide max-w-none ${!isAuthenticated ? 'blur-md' : ''}`}>
          {paper.sections.map((sec, idx) => (
            <FadeIn key={idx} delay={0.1 * (idx % 3)}>
              {sec.type === "abstract" && (
                <div className="p-8 border border-white/5 bg-card/20 mb-12 relative overflow-hidden rounded-sm">
                  <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                  <p className="font-sans text-[11px] text-primary/70 tracking-widest uppercase mb-4">Abstract</p>
                  <p className="font-serif text-xl sm:text-2xl text-foreground/90 font-light leading-relaxed m-0 italic">
                    "{sec.content}"
                  </p>
                </div>
              )}

              {sec.type === "heading" && <h2 className="mt-16 mb-8">{sec.content}</h2>}

              {sec.type === "paragraph" && <p className="mb-8">{sec.content}</p>}

              {sec.type === "callout" && (
                <blockquote className="border-l-2 border-primary/40 pl-6 my-12 py-2">
                  <p className="font-serif text-2xl text-primary/90 font-light italic m-0">
                    {sec.content}
                  </p>
                </blockquote>
              )}

              {sec.type === "table" && sec.data && (
                <div className="my-12 overflow-x-auto">
                  <table className="w-full text-left border-collapse font-sans text-sm">
                    <thead>
                      <tr className="border-b border-primary/20 bg-primary/5">
                        {sec.data.headers.map((h: string, i: number) => (
                          <th key={i} className="py-4 px-4 text-primary/80 font-normal tracking-widest uppercase text-[10px]">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sec.data.rows.map((row: string[], i: number) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          {row.map((cell: string, j: number) => (
                            <td key={j} className="py-4 px-4 text-muted-foreground font-light">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-[9px] text-muted-foreground/40 mt-3 font-sans uppercase tracking-widest text-right">
                    Fonte: Aeternum Q-Models
                  </p>
                </div>
              )}

              {sec.type === "chart-placeholder" && (
                <div className="my-12 border border-white/5 bg-[#080a0f] p-8 aspect-video flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
                  <div className="w-full h-px bg-white/5 absolute top-1/2 -translate-y-1/2" />
                  <div className="h-full w-px bg-white/5 absolute left-1/2 -translate-x-1/2" />
                  
                  {/* Decorative chart elements */}
                  <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
                    <path d="M0,80 Q25,30 50,60 T100,20 T150,70 T200,40" stroke="rgba(198,167,92,0.4)" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                    <path d="M0,60 Q30,70 60,40 T120,60 T160,30 T200,50" stroke="rgba(255,255,255,0.1)" fill="none" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                  </svg>

                  <p className="text-primary/70 font-display text-lg tracking-widest uppercase mb-2 relative z-10 text-center">
                    {sec.content}
                  </p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] relative z-10 text-center">
                    Visualização Restrita
                  </p>
                </div>
              )}
            </FadeIn>
          ))}
        </div>

        <FadeIn delay={0.6}>
          <div className="mt-20 pt-10 border-t border-white/10 flex flex-col items-center text-center">
            <p className="font-display text-2xl text-primary tracking-widest uppercase mb-4">
              Baixar Relatório Completo
            </p>
            <p className="text-muted-foreground text-sm font-light max-w-md mx-auto mb-8">
              Membros institucionais e LPs possuam acesso ao PDF detalhado com apêndice matemático e código de execução base.
            </p>
            <Link
              to="/acesso"
              className="px-8 py-3 bg-primary/10 border border-primary/30 text-primary text-[10px] tracking-[0.2em] uppercase font-sans hover:bg-primary/20 hover:border-primary/50 transition-all duration-300"
            >
              Autenticar Download (.PDF)
            </Link>
          </div>
        </FadeIn>

        {!isAuthenticated && (
          <FadeIn delay={0.8}>
            <div className="mt-16 p-8 border border-primary/30 bg-card/40 backdrop-blur-sm rounded-sm">
              <p className="text-center font-display text-xl text-primary tracking-widest uppercase mb-6">
                Acesso Requerido
              </p>
              <p className="text-center text-muted-foreground text-sm font-light mb-8 max-w-2xl mx-auto">
                O conteúdo completo desta pesquisa é restrito a parceiros e investidores qualificados. Faça login para acessar o relatório com toda a análise quantitativa, apêndices matemáticos e código de execução.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3 bg-primary text-background text-[10px] tracking-[0.2em] uppercase font-sans hover:bg-primary/90 transition-all duration-300 font-medium"
                >
                  Fazer Login
                </button>
                <Link
                  to="/acesso"
                  className="px-8 py-3 border border-primary/40 text-primary text-[10px] tracking-[0.2em] uppercase font-sans hover:border-primary/60 hover:bg-primary/5 transition-all duration-300"
                >
                  Solicitar Acesso
                </Link>
              </div>
            </div>
          </FadeIn>
        )}
      </article>

      <Footer />
    </main>
  );
}
