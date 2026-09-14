import type { ReactNode } from "react";

/**
 * <Stage> — a CASCA reusável do "mapa como palco" (Arranjo 2). O mapa preenche o
 * palco; o chrome FLUTUA em slots de vidro por cima — não empilha, não rouba área.
 *
 * Slots (todos opcionais):
 *  - map        : preenche o palco (fundo). É o CommodityFlowMap cru no mundo;
 *                 o BrazilMap no Brasil.
 *  - topLeft    : título + seletor de commodity (sup-esq, sobre o mapa).
 *  - sidePanel  : preço/detalhe (coluna direita, altura cheia). Largura = `sideWidth`
 *                 = o "220px de reserva" que o mapa deve respirar (o conteúdo-chave
 *                 não fica sob o vidro). A casca só declara o espaço; CENTRAR o mapa
 *                 pra fora dessa faixa é responsabilidade do mapa.
 *  - bottomBand : ranking/footers (faixa inferior, à esquerda do sidePanel).
 *
 * Genérico de propósito: mundo e Brasil usam a MESMA casca, só trocam o `map` e o
 * conteúdo dos slots. `ratio` = largura:altura (mundo = 2.14, do Mercator 70N/55S).
 */
export type StageProps = {
  map: ReactNode;
  topLeft?: ReactNode;
  sidePanel?: ReactNode;
  bottomBand?: ReactNode;
  ratio?: number;       // largura:altura do palco (mundo = 2.14)
  maxHeight?: string;   // teto de altura (viewport) p/ não estourar a dobra
  sideWidth?: number;   // largura do sidePanel (px) = reserva do mapa
};

const GAP = 12; // px — respiro dos slots à borda (top-3/left-3…)

export default function Stage({
  map,
  topLeft,
  sidePanel,
  bottomBand,
  ratio = 2.14,
  maxHeight = "72vh",
  sideWidth = 220,
}: StageProps) {
  // a faixa inferior termina antes da coluna direita, pra não colidir com o painel
  const bandRight = sidePanel ? sideWidth + GAP * 2 : GAP;
  return (
    <section
      className="relative w-full overflow-hidden rounded-sm bg-[var(--t-s1)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.055)]"
      style={{ aspectRatio: `${ratio} / 1`, maxHeight }}
    >
      {/* MAPA — preenche o palco (fundo) */}
      <div className="absolute inset-0">{map}</div>

      {/* topLeft — título/seletor, sup-esq */}
      {topLeft && (
        <div className="absolute z-20 max-w-[min(52%,560px)]" style={{ top: GAP, left: GAP }}>
          {topLeft}
        </div>
      )}

      {/* sidePanel — preço/detalhe, coluna direita de altura cheia */}
      {sidePanel && (
        <div
          className="absolute z-20 overflow-y-auto"
          style={{ top: GAP, right: GAP, bottom: GAP, width: sideWidth }}
        >
          {sidePanel}
        </div>
      )}

      {/* bottomBand — ranking/footers, faixa inferior à esquerda do painel */}
      {bottomBand && (
        <div className="absolute z-20" style={{ left: GAP, right: bandRight, bottom: GAP }}>
          {bottomBand}
        </div>
      )}
    </section>
  );
}
