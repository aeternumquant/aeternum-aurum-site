interface DisclaimerLegalProps {
  variant?: "footer" | "page";
  className?: string;
}

/**
 * Disclaimer regulatório institucional Aeternum Aurum Partners.
 * Caminho C: institucional sem números de CNAE.
 * Aparece globalmente via Footer, opcionalmente em páginas
 * específicas com mais destaque (variant="page").
 */
export function DisclaimerLegal({
  variant = "footer",
  className = "",
}: DisclaimerLegalProps) {
  const wrapperClasses =
    variant === "footer"
      ? "max-w-md mx-auto space-y-2 text-[9px] text-muted-foreground/40 leading-relaxed font-light text-center"
      : "relative z-10 py-12 px-4 sm:px-6 bg-[#0a0a0a] border-t border-white/5";

  const paragraphClasses =
    variant === "footer"
      ? ""
      : "text-[9px] sm:text-[10px] text-white/30 leading-relaxed font-light text-justify sm:text-center max-w-5xl mx-auto mb-4 last:mb-0";

  return (
    <aside
      className={`${wrapperClasses} ${className}`.trim()}
      role="note"
      aria-label="Aviso legal"
    >
      <p className={paragraphClasses}>
        A Aeternum Aurum Partners é uma plataforma de tecnologia
        quantitativa e serviços auxiliares ao mercado financeiro.
        Não atua como gestora de recursos, consultora de valores
        mobiliários ou analista registrada nos termos das
        Resoluções CVM 20 e 21.
      </p>
      <p className={paragraphClasses}>
        Todo conteúdo deste site tem caráter informativo e técnico,
        não constituindo recomendação de investimento, oferta de
        valores mobiliários ou aconselhamento financeiro. Resultados
        históricos de modelagem não garantem desempenho futuro.
      </p>
    </aside>
  );
}
