import { ModuleCard } from "../ModuleCard";
import type { ModuleCommand } from "../commands";

/**
 * GregasSlot — o slot de gregas no estado que ENSINA. Como o dado ao vivo é
 * license-gated (brapi: só derivado, e só com parecer jurídico), o slot já entrega
 * VALOR sem número: os 4 glifos explicam o CONCEITO de cada grega — uma forma + uma
 * frase. O público do agro que faz hedge pela primeira vez entende o que é vega
 * pela forma, não pela definição. Quando a licença permitir, o número entra ao lado.
 *
 * SVG puro (recharts fica fora do bundle do terminal). Glifos estáticos, sem dado.
 * Cor em tx (o dourado é só funcional; glifo é conteúdo, não acento).
 */
const GREGAS = [
  { key: "delta", nome: "Delta", frase: "quanto o preço da opção anda quando o ativo anda R$ 1", glyph: "delta" },
  { key: "gamma", nome: "Gamma", frase: "quão rápido o delta muda — a curvatura da resposta", glyph: "gamma" },
  { key: "vega", nome: "Vega", frase: "quanto a opção reage quando a volatilidade sobe", glyph: "vega" },
  { key: "theta", nome: "Theta", frase: "quanto a opção perde a cada dia que passa", glyph: "theta" },
] as const;

export default function GregasSlot({ cmd }: { cmd: ModuleCommand }) {
  return (
    <ModuleCard command={cmd} state="ready">
      <div className="p-4">
        <p className="font-sans text-[11px] leading-snug" style={{ color: "var(--t-tx-2)" }}>
          O que cada grega mede. A forma explica sem número — os valores ao vivo entram quando a licença permitir.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 mt-3">
          {GREGAS.map((g) => (
            <div key={g.key} className="flex items-start gap-2.5">
              <Glyph kind={g.glyph} />
              <div className="min-w-0">
                <div className="font-sans font-[510] text-[12px]" style={{ color: "var(--t-tx-1)" }}>{g.nome}</div>
                <div className="font-sans text-[10px] leading-snug mt-0.5" style={{ color: "var(--t-tx-3)" }}>{g.frase}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ModuleCard>
  );
}

/** o glifo de intuição — reta (delta), curva (gamma), cone (vega), decaimento (theta). */
function Glyph({ kind }: { kind: string }) {
  const s = "var(--t-tx-2)";
  const axis = "var(--t-line-soft)";
  return (
    <svg width="52" height="34" viewBox="0 0 52 34" fill="none" className="flex-shrink-0 mt-0.5" aria-hidden="true">
      <line x1="4" y1="30" x2="50" y2="30" stroke={axis} strokeWidth="1" />
      <line x1="4" y1="30" x2="4" y2="4" stroke={axis} strokeWidth="1" />
      {kind === "delta" && <line x1="5" y1="29" x2="49" y2="6" stroke={s} strokeWidth="1.5" strokeLinecap="round" />}
      {kind === "gamma" && <path d="M5 29 Q 36 29 49 5" stroke={s} strokeWidth="1.5" strokeLinecap="round" />}
      {kind === "vega" && (
        <>
          <path d="M6 17 L49 5" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
          <path d="M6 17 L49 29" stroke={s} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {kind === "theta" && <path d="M5 6 Q 26 28 49 29" stroke={s} strokeWidth="1.5" strokeLinecap="round" />}
    </svg>
  );
}
