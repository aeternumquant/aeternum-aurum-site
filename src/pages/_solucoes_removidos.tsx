// ARQUIVO DE RASCUNHO - NAO E PAGINA ATIVA
// Blocos removidos da pagina Solucoes em 2026-06-25.
// Diagrama AeternumQ + Tres Eixos: integrar futuramente na pagina Tecnologia.
// Cinco Principios: integrar futuramente na pagina Execucao (refinados).
// Este arquivo nao e roteado. Serve so para preservar o codigo/copy
// ate a realocacao. Deletar apos integrar nas paginas destino.
//
// Nota: SectionHeader abaixo e uma copia local do componente interno de
// Framework.tsx, so para este rascunho compilar isolado. Ao reintegrar,
// use o componente de cabecalho da pagina de destino.

import type { ReactNode } from "react";
import { FadeIn } from "../components/common/FadeIn";
import MacroRiskModels from "../components/common/MacroRiskModels";
import FrameworkSection from "../components/common/Framework";

function SectionHeader({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  align?: "left" | "center";
}) {
  const isCenter = align === "center";
  return (
    <div className={`flex flex-col ${isCenter ? "items-center text-center" : "items-start text-left"}`}>
      <p
        className="font-sans uppercase text-[11px] tracking-[0.22em]"
        style={{ color: "rgba(198,168,90,0.60)" }}
      >
        {eyebrow}
      </p>
      <div
        className={`h-px w-9 mt-3 mb-5 ${isCenter ? "mx-auto" : ""}`}
        style={{ backgroundColor: "rgba(198,168,90,0.35)" }}
      />
      <h2
        className="font-display text-[28px] md:text-[34px] leading-[1.1] tracking-[-0.015em]"
        style={{ color: "#e8e6dd" }}
      >
        {title}
      </h2>
    </div>
  );
}

// Dados do Diagrama (antes em Framework.tsx)
const streams = [
  { icon: "◈", label: "Redes de Televisão Globais", desc: "CNN, Bloomberg, Reuters. Captura de eventos de alto impacto antes da digestão pelo mercado." },
  { icon: "◈", label: "Desenvolvimentos Militares", desc: "Movimentos de tropas, escaladas e sanções monitorados como preditores de prêmio de risco em commodities e câmbio." },
  { icon: "◈", label: "Anúncios Macroeconômicos", desc: "Fed, BCE, OPEP. Leitura antecipada de fluxos de liquidez e reposicionamento institucional." },
  { icon: "◈", label: "Choques de Oferta em Commodities", desc: "Estoques do EIA, dados CFTC, relatórios de safra USDA. Identificação de desequilíbrios estruturais." },
  { icon: "◈", label: "Geopolítica & Diplomacia", desc: "Sanções, acordos bilaterais e tensões regionais convertidos em sinais de posicionamento para o portfólio." },
  { icon: "◈", label: "Fluxos de Capital Institucional", desc: "Posicionamento de fundos soberanos, hedge funds e bancos centrais via dados de custódia e prime brokers." },
];

export default function SolucoesRemovidos() {
  return (
    <main className="pt-14 min-h-screen" style={{ backgroundColor: "#0A0A0A" }}>
      {/* ════════════════════════════════════════════════════════
          === DIAGRAMA AETERNUMQ ===  (destino futuro: pagina Tecnologia)
      ════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 md:px-10 border-b border-white/5" style={{ backgroundColor: "#0c0c0c" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <SectionHeader eyebrow="Operação Contínua" title="Inteligência em Tempo Real" />
            <p className="text-muted-foreground text-sm font-light max-w-2xl mt-6 mb-16">Agentes operam 24 horas por dia, 7 dias por semana, monitorando fluxos globais de informação relevantes para mercados macro.</p>
          </FadeIn>
          <FadeIn delay={0.15}>
            <div className="mb-12"><MacroRiskModels /></div>
          </FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {streams.map((s, i) => (
              <FadeIn key={i} delay={0.1 + i * 0.08}>
                <div className="p-5 border border-white/5 bg-card/30 hover:bg-card/60 transition-colors group">
                  <div className="flex items-start gap-3">
                    <span className="text-primary/40 text-xs mt-0.5 shrink-0">{s.icon}</span>
                    <div>
                      <p className="font-display text-sm text-primary tracking-wide mb-1">{s.label}</p>
                      <p className="text-muted-foreground text-xs font-light leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          === TRES EIXOS ===  (destino futuro: pagina Tecnologia)
          Componente <FrameworkSection /> de common/Framework.tsx
      ════════════════════════════════════════════════════════ */}
      <FrameworkSection />

      {/* ════════════════════════════════════════════════════════
          === CINCO PRINCIPIOS ===  (destino futuro: pagina Execucao, a refinar)
      ════════════════════════════════════════════════════════ */}
      <section className="py-14 md:py-24 px-6 md:px-10 border-b border-white/5" style={{ backgroundColor: "#0c0c0c" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn delay={0.4}>
            <SectionHeader eyebrow="Princípios" title="Cinco princípios que orientam toda decisão" />
            <div className="border border-primary/15 bg-primary/3 p-6 mt-10">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { num: "I", titulo: "Dados primeiro, sempre", corpo: "Toda decisão parte do dado, não da opinião. A intuição entra depois, calibrada pelo modelo, nunca antes." },
                  { num: "II", titulo: "Risco definido antes da entrada", corpo: "Cada decisão de capital tem perda máxima conhecida antes de ser tomada. Quando o cenário muda, o modelo recalibra; quando o risco muda, o cliente decide." },
                  { num: "III", titulo: "Diversificação real, não aparente", corpo: "Diversificação verdadeira começa onde as correlações dinâmicas começam. Ativos que parecem descorrelacionados em mercados calmos podem se mover juntos em crises. Os modelos medem isso continuamente, não assumem." },
                  { num: "IV", titulo: "Alertas antes do estresse, não depois", corpo: "Modelos de risco de cauda e detecção de regime sinalizam mudança estrutural antes que ela apareça nos preços. O cliente recebe o alerta com tempo de decidir, ajustar ou esperar." },
                  { num: "V", titulo: "Transparência total no processo", corpo: "Cada modelo carrega referência ao paper, à janela de validação e ao limite onde ele falha. O que entregamos é auditável do início ao fim." },
                ].map((p) => (
                  <div key={p.num} className="border border-white/8 bg-card/40 p-5 h-full">
                    <div className="font-display text-2xl text-primary/30 mb-2">{p.num}</div>
                    <h4 className="font-display text-sm text-foreground tracking-wide mb-2 leading-snug">{p.titulo}</h4>
                    <p className="text-muted-foreground text-xs leading-relaxed">{p.corpo}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </main>
  );
}

// === EM LINGUAGEM SIMPLES - CONCEITO VIX (removido 2026-06-25) ===
// Removido da Solucoes por ser basico demais. Preservado caso
// util em outra aba (ex: material didatico, FAQ).
export const conceitoVixRemovido = {
  icone: "◆",
  titulo: "O que é o 'medo do mercado' e por que importa?",
  corpo: `Existe um indicador chamado VIX, que chamamos de "termômetro do medo". Quando está alto,
    os grandes investidores estão com medo. Quando está baixo, estão confiantes demais.
    Ambos os extremos criam oportunidades. A Aeternum lê esse termômetro antes de qualquer decisão.`,
};

// === EM LINGUAGEM SIMPLES - PROTECAO (versao antiga, substituida 2026-06-25) ===
// Substituida pela Versao B aprovada pelo advogado. Preservada
// para historico.
export const conceitoProtecaoAntigo = {
  icone: "◆",
  titulo: "Como protegemos seu capital em crises?",
  corpo: `Usamos um sistema de proteção chamado hedge, como um seguro para seu investimento.
    Quando identificamos risco crescendo (o VIX subindo, por exemplo), compramos proteção
    preventiva. É o equivalente a colocar um seguro no carro antes de sair na chuva forte.`,
};

// === EM LINGUAGEM SIMPLES - PROTECAO (Versao B, substituida 2026-06-25) ===
// Versao aprovada anteriormente, substituida pela versao final
// curta aprovada pelo advogado. Preservada para historico.
export const conceitoProtecaoVersaoB = {
  icone: "◆",
  titulo: "Como proteger seu capital em crises",
  corpo: "Implementamos nosso modelo de proteção: um sistema que acompanha os sinais de estresse no mercado e antecipa quando o risco começa a crescer. É como um sistema de alerta meteorológico, ele não impede a tempestade, mas avisa a tempo de você se preparar. A decisão de operação permanece com o cliente.",
};
