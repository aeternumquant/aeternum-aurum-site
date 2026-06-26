import { useEffect, useRef, useState, type ReactNode } from "react";

interface SideModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

/**
 * Painel lateral deslizante (slide da direita).
 *
 * Abordagem de montagem: o componente fica SEMPRE montado no DOM. A
 * visibilidade e a interatividade sao controladas por isOpen via
 * transicoes CSS (transform + opacity + visibility). Quando fechado:
 * pointer-events-none + aria-hidden + visibility:hidden (apos o slide
 * de saida), o que tira o painel do fluxo de foco/tab. Isso permite
 * animar tanto a entrada quanto a saida sem logica de mount/unmount.
 */
export default function SideModal({ isOpen, onClose, title, children, footer }: SideModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const titleId = "sidemodal-title";

  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Lock de scroll do body + salvar/restaurar foco do elemento que abriu.
  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeBtnRef.current?.focus(), 60);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
      openerRef.current?.focus?.();
    };
  }, [isOpen]);

  // Esc fecha + trap de foco (Tab cicla dentro do painel).
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const panel = panelRef.current;
        if (!panel) return;
        const focusables = panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const slide = reducedMotion ? "none" : "transform 350ms var(--ease-medio)";

  return (
    <div
      className={`fixed inset-0 z-[100] ${isOpen ? "" : "pointer-events-none"}`}
      aria-hidden={isOpen ? undefined : true}
    >
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.55)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          transition: reducedMotion ? "none" : "opacity 350ms var(--ease-medio)",
        }}
      />

      {/* Painel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute top-0 right-0 h-full w-full sm:w-[560px] max-w-[560px] flex flex-col"
        style={{
          backgroundColor: "#0c0c0c",
          borderLeft: "1px solid rgba(198,168,90,0.20)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          visibility: isOpen ? "visible" : "hidden",
          transition: isOpen ? slide : `${slide}, visibility 0s linear 350ms`,
          willChange: "transform",
        }}
      >
        {/* Topo: titulo + botao fechar */}
        <div className="flex items-start justify-between gap-4 px-6 md:px-8 pt-8 pb-5">
          <h2 id={titleId} className="font-display text-[26px] leading-tight" style={{ color: "#e8e6dd" }}>
            {title}
          </h2>
          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 -mr-2 -mt-1 p-2 text-muted-foreground hover:text-foreground"
            style={{ transition: "color 200ms var(--ease-rapido)" }}
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        {/* Linha dourada divisoria */}
        <div className="mx-6 md:mx-8 h-px shrink-0" style={{ backgroundColor: "rgba(198,168,90,0.25)" }} />

        {/* Corpo com scroll proprio */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6">{children}</div>

        {/* Rodape (CTA opcional) */}
        {footer && <div className="shrink-0 px-6 md:px-8 py-5 border-t border-white/5">{footer}</div>}
      </div>
    </div>
  );
}
