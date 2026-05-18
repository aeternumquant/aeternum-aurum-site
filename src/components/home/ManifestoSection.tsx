import { RevealSection } from "./RevealSection";

const stats = [
  { number: "Modelos Quantitativos", label: "Foundation Models e Séries Temporais" },
  { number: "Decisão Institucional", label: "Apoio Tecnológico à Tesouraria" },
  { number: "Rigor Matemático", label: "Literatura Científica Peer-Reviewed" },
];

export default function ManifestoSection() {
  return (
    <section
      id="manifesto"
      className="relative z-10 py-20 md:py-28 px-4 sm:px-6"
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* H2 + lede entram juntos no primeiro RevealSection */}
        <RevealSection className="w-full flex flex-col items-center">
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary font-light leading-tight max-w-4xl mb-8">
            A Engenharia da Inevitabilidade Matemática, conectando o solo brasileiro à infraestrutura financeira do próximo século.
          </h2>

          <p className="font-sans text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-12">
            A Aeternum desenvolve a tecnologia quantitativa e a infraestrutura de dados que permitem a produtores, cooperativas, trading companies, tesourarias corporativas e instituições financeiras parceiras decidirem com rigor matemático fundamentado em literatura científica peer-reviewed. Em soja, milho, café, proteína, nióbio e terras raras, o solo brasileiro encontra a precisão matemática que move as maiores mesas institucionais do mundo.
          </p>
        </RevealSection>

        {/* Stats grid entra logo depois, com pequeno stagger */}
        <RevealSection delay={0.2} className="w-full">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="border border-primary/20 bg-primary/5 p-4 sm:p-6 rounded-sm hover:border-primary/40 transition-colors"
              >
                <div className="font-display text-xl sm:text-2xl text-primary mb-2 leading-tight">
                  {stat.number}
                </div>
                <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </RevealSection>
      </div>
    </section>
  );
}
