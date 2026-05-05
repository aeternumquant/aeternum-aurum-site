import Agro from "../../components/common/Agro";
import Footer from "../../components/common/Footer";
import { FadeIn } from "../../components/common/FadeIn";
import EscudoReal from "../../components/common/EscudoReal";
import GovernancaEstrategica from "../../components/GovernancaEstrategica";
import CommodityTerminal from "../../components/CommodityTerminal";

const stats = [
  { value: "20%", label: "Alocação em Commodities" },
  { value: "4", label: "Categorias cobertas" },
  { value: "12+", label: "Mercados monitorados" },
  { value: "Diária", label: "Frequência de rebalanceamento" },
];

const gatilhosOleo = [
  { num: "01", titulo: "Sanções & Embargos", desc: "Restrições a exportadores-chave (Irã, Venezuela, Rússia) reduzem a oferta global instantaneamente." },
  { num: "02", titulo: "Tensões no Estreito de Ormuz", desc: "Aproximadamente 20% do petróleo mundial transita pelo Estreito de Ormuz." },
  { num: "03", titulo: "Decisões da OPEP+", desc: "Cortes de produção coordenados elevam a backwardation, preço spot acima dos futuros." },
  { num: "04", titulo: "Pressão de Hedge de Refinarias", desc: "Refinarias são vendedores sistemáticos de futuros para proteger margens." },
];

export default function CommoditiesPage() {
  return (
    <main className="pt-14 min-h-screen">
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/4 via-background to-background z-0" />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Mercados Reais</p>
            <h1 className="font-display text-4xl sm:text-5xl text-primary uppercase tracking-widest mb-6">Commodities</h1>
            <p className="text-muted-foreground text-sm leading-relaxed font-light">Exposição estratégica a mercados de matérias-primas com vantagem informacional.</p>
          </FadeIn>
        </div>
      </section>
      <section className="py-16 border-b border-white/5 bg-card/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.1} direction="none">
                <div className="text-center px-4">
                  <div className="font-display text-3xl sm:text-4xl text-primary mb-2">{s.value}</div>
                  <div className="text-[10px] text-muted-foreground tracking-widest uppercase">{s.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto"><EscudoReal /></div>
      </section>
      <section className="py-20 sm:py-24 px-4 sm:px-6 lg:px-8 bg-card/10 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-4">Intervenção Quantitativa</p>
            <h2 className="font-display text-3xl text-primary uppercase tracking-widest mb-4">Hedge Estrutural & Assimetrias por Commodity</h2>
            <p className="text-muted-foreground text-sm leading-relaxed font-light max-w-2xl mb-12">
              Transformamos riscos em teses de proteção. Selecione o segmento abaixo para entender como a plataforma isola e protege o capital em cenários não-lineares.
            </p>
          </FadeIn>
          
          <FadeIn delay={0.2}>
            <CommodityTerminal />
          </FadeIn>
        </div>
      </section>
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background border-b border-white/5">
        <div className="max-w-5xl mx-auto"><GovernancaEstrategica /></div>
      </section>
      <Agro />
      <Footer />
    </main>
  );
}
