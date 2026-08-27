/**
 * EscadaTextBlock — a "isca explicada" do terminal (o degrau do meio da escada
 * publica: MAPA -> TERMINAL -> PESQUISA). Um paragrafo curto que contextualiza a
 * serie longa dos graficos logo acima (historico de preco / tendencia L2), com um
 * "ler mais ->" que reusa a aba de Pesquisa (/research, o link que ja existe).
 *
 * REUSAVEL: recebe a chave da commodity (== assets.ts key) e busca o texto em
 * TERMINAL_TEXTS. GUARDA GRACIOSA: onde NAO ha texto, retorna null — o bloco some,
 * nao inventa, nao mostra placeholder feio.
 *
 * COMPLIANCE: o texto (de escadaTexts.ts, escrito pelo Gabriel) e educativo sobre
 * o DADO — o que a serie e, por que serve ao produtor/tesouraria, como alimenta o
 * modelo. Nunca recomendacao de investimento nem promessa de retorno.
 */
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { TERMINAL_TEXTS } from "../config/escadaTexts";

export default function EscadaTextBlock({ assetKey }: { assetKey: string }) {
  const text = TERMINAL_TEXTS[assetKey];
  if (!text) return null; // sem texto -> sem bloco (a escada so aparece com conteudo)

  return (
    // FECHO do card: fica no FIM (depois dos graficos e do editorial). Box-free,
    // com um separador sutil no topo — coerente com os ChartSection.
    <div className="mt-7 max-w-md border-t border-white/[0.07] pt-5">
      <p className="text-[11px] leading-relaxed text-muted-foreground/60 font-light">{text}</p>
      {/* "ler mais" -> Pesquisa (a pesquisa direcionada por commodity vem depois;
          hoje reusa a aba /research existente, o proximo degrau da escada). */}
      <Link
        to="/research"
        className="inline-flex items-center gap-1 mt-3 text-[10px] tracking-wide text-primary/70 hover:text-primary transition-colors"
      >
        ler mais
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}
