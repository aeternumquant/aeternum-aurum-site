import { useId, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Progressive disclosure sobrio e acessivel.
 *
 * A "superficie" (title + subtitle) fica sempre visivel; o conteudo denso
 * (children) e renderizado SEMPRE no DOM e apenas colapsado visualmente
 * (grid-template-rows: 0fr -> 1fr + overflow hidden). Isso preserva SEO e
 * leitura por tecnologias assistivas, com aria-expanded/aria-controls no
 * cabecalho. Respeita prefers-reduced-motion (via motion-reduce:transition-none).
 *
 * Generico o suficiente para os cards de rede da Onda 2 (title = selo + nome,
 * children = fontes e ressalvas).
 */
interface DisclosureProps {
  /** Superficie sempre visivel (pode ser selo + nome). */
  title: ReactNode;
  /** Linha de apoio sempre visivel, abaixo do title. */
  subtitle?: ReactNode;
  /** Conteudo denso, recolhido por padrao mas sempre no DOM. */
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export default function Disclosure({
  title,
  subtitle,
  children,
  defaultOpen = false,
  className = "",
}: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();
  const headerId = useId();

  return (
    <div
      className={`border rounded-sm bg-white/[0.01] transition-colors duration-300 ${
        open ? "border-primary/25" : "border-white/[0.08] hover:border-white/[0.16]"
      } ${className}`}
    >
      <button
        type="button"
        id={headerId}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((v) => !v)}
        className="group w-full flex items-start justify-between gap-4 text-left px-5 py-4"
      >
        <span className="min-w-0">
          <span className="block font-display text-base sm:text-lg text-foreground tracking-wide leading-snug">
            {title}
          </span>
          {subtitle && (
            <span className="block mt-1.5 text-xs sm:text-[13px] text-muted-foreground font-light leading-relaxed">
              {subtitle}
            </span>
          )}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={`mt-1 shrink-0 text-primary/60 transition-transform duration-300 ease-respira motion-reduce:transition-none group-hover:text-primary ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Colapso visual: o children continua no DOM (renderizado), so muda a altura. */}
      <div
        id={contentId}
        role="region"
        aria-labelledby={headerId}
        className={`grid transition-[grid-template-rows] duration-500 ease-respira motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden min-h-0">
          <div className="px-5 pb-5 border-t border-white/5">
            <div className="pt-4 text-sm text-muted-foreground font-light leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
