/**
 * PagamentosGlobais.tsx - rota /pagamentos-globais (rótulo de menu: "Liquidação")
 *
 * Estilo visual da Pesquisa (Research.tsx): Sistema A (fundos transparentes
 * + glow), cards escaneáveis, muito respiro. Cada card tem superfície mínima
 * (título + número-âncora + uma linha); a densidade fica recolhida no
 * Disclosure (2 a 3 pontos) ou migra para os artigos da Pesquisa.
 */
import { NavLink } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Footer from "../../components/common/Footer";
import Reveal from "../../components/common/Reveal";
import Disclosure from "../../components/common/Disclosure";
import { RouteSeo } from "../../lib/seo/RouteSeo";
import { YieldCurveChart, NodeGraphChart } from "../../components/liquidacao/CostVisuals";

const GOLD = "#C6A85A";

/* ── Helpers de layout (padrão Research/Sistema A) ── */
function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-sans text-[9px] uppercase tracking-[0.32em] mb-3" style={{ color: `${GOLD}85` }}>
      {children}
    </p>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display font-light uppercase tracking-widest leading-tight mb-4"
      style={{ fontSize: "clamp(1.3rem, 2.8vw, 1.9rem)", color: GOLD }}
    >
      {children}
    </h2>
  );
}

function GoldLine() {
  return <div className="h-px max-w-[80px] mb-8 shimmer-line" />;
}

/* Número-âncora, destaque discreto na superfície do card. */
function Anchor({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-sans text-[11px] tracking-wide font-normal normal-case" style={{ color: `${GOLD}b0` }}>
      {children}
    </span>
  );
}

/* Selo de encaixe (não de investimento): chip em destaque no topo do card. */
function Selo({ children }: { children: string }) {
  return (
    <span className="inline-block mb-2 font-sans text-[8.5px] tracking-[0.2em] uppercase border border-primary/25 text-primary/80 px-2 py-0.5">
      {children}
    </span>
  );
}

/* Ponto curto dentro do Disclosure. */
function Ponto({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary/50" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}

function Fonte({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-4 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/45">{children}</p>
  );
}

function PesquisaLink({
  to = "/research",
  children = "Fundamentação na Pesquisa",
}: {
  to?: string;
  children?: string;
}) {
  return (
    <NavLink
      to={to}
      className="inline-flex items-center gap-1 mt-4 text-[10px] uppercase tracking-[0.2em] text-primary/70 hover:text-primary transition-colors"
    >
      {children}
      <ArrowUpRight className="w-3 h-3" />
    </NavLink>
  );
}

/* Rodapé de compliance reutilizável. */
function ComplianceNote({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] text-muted-foreground/45 font-light leading-relaxed">{children}</p>
  );
}

/* ────────────────────────────────────────────────────────────
   PÁGINA
──────────────────────────────────────────────────────────── */
export default function PagamentosGlobais() {
  return (
    <main className="pt-14 min-h-screen">
      <RouteSeo
        title="Liquidação"
        fullTitle="Liquidação · Pagamentos Globais · Aeternum Aurum Partners"
        description="Liquidação e pagamentos globais em três camadas: mensageria (ISO 20022), liquidação (stablecoins, depósitos tokenizados, CBDCs, Nexus) e ativo (tokenização de RWA), com redes, casos e a janela regulatória brasileira de 2026."
        path="/pagamentos-globais"
      />

      {/* ═══════════════ HERO (PASSO 3) ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-white/5 relative">
        <div
          className="absolute inset-0 z-0"
          style={{ background: `radial-gradient(ellipse at top, ${GOLD}09 0%, transparent 60%)` }}
        />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <Reveal>
            <p className="font-sans text-[9px] tracking-[0.35em] uppercase mb-4" style={{ color: `${GOLD}80` }}>
              Infraestrutura de pagamentos globais
            </p>
            <h1
              className="font-display font-light uppercase tracking-widest mb-6"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", color: GOLD }}
            >
              Liquidação
            </h1>
            <p className="text-sm leading-relaxed font-light max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.4)" }}>
              A maior reconfiguração da infraestrutura de pagamentos em décadas, em três camadas.
            </p>
          </Reveal>

          {/* Três camadas: três palavras-chave */}
          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-col sm:flex-row items-stretch justify-center gap-3 sm:gap-0 sm:divide-x divide-white/10">
              {[
                { k: "Mensageria", v: "ISO 20022" },
                { k: "Liquidação", v: "Quatro trilhos" },
                { k: "Ativo", v: "Tokenização de RWA" },
              ].map((c) => (
                <div key={c.k} className="px-6">
                  <p className="font-sans text-[9px] tracking-[0.3em] uppercase mb-1.5" style={{ color: `${GOLD}80` }}>
                    {c.k}
                  </p>
                  <p className="font-display text-base text-foreground/85 tracking-wide">{c.v}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ PONTO DE PARTIDA (PASSOS 4 e 5) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Ponto de partida</SectionLabel>
            <SectionTitle>O padrão e o vácuo</SectionTitle>
            <GoldLine />
          </Reveal>

          <div className="space-y-3">
            {/* Card: Brasil já é ISO 20022 */}
            <Reveal>
              <Disclosure
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>O Brasil já é ISO 20022</span>
                    <Anchor>Pix nativo desde 2016</Anchor>
                  </span>
                }
                subtitle="O Pix nasceu nativo no padrão (BCB, 2016). O mundo chegou em novembro de 2025."
              >
                <ul className="space-y-2">
                  <Ponto>O estudo BCB SG-ISO20022-TF (2016) embasou o ISO 20022 no Pix.</Ponto>
                  <Ponto>A SWIFT encerrou a coexistência MT/MX cross-border em novembro de 2025.</Ponto>
                  <Ponto>Escala do padrão: de cerca de 100 para cerca de 9.000 caracteres por mensagem.</Ponto>
                </ul>
                <PesquisaLink />
              </Disclosure>
            </Reveal>

            {/* Card: A causa raiz */}
            <Reveal delay={0.05}>
              <Disclosure
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>O vácuo que tudo preenche</span>
                    <Anchor>-20% a -30%</Anchor>
                  </span>
                }
                subtitle="O correspondent banking encolheu desde 2011. A América Latina foi a mais afetada."
              >
                <ul className="space-y-2">
                  <Ponto>CPMI/BIS: cerca de 22% de queda já em 2020; a BAFT estima cerca de 29% em 2025.</Ponto>
                  <Ponto>Causa: custo de compliance AML/CFT.</Ponto>
                  <Ponto>
                    Só 35% dos pagamentos cross-border cumpriam a meta do G20 em 2025 (FSB). Stablecoins,
                    Nexus, mBridge e Agorá respondem ao mesmo vácuo.
                  </Ponto>
                </ul>
              </Disclosure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ OS QUATRO TRILHOS (PASSO 6) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Camada de liquidação</SectionLabel>
            <SectionTitle>Os quatro trilhos</SectionTitle>
            <GoldLine />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Reveal>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>Stablecoins</span>
                    <Anchor>~US$ 10,8 tri/ano</Anchor>
                  </span>
                }
                subtitle="Onde o volume está."
              >
                <ul className="space-y-2">
                  <Ponto>USDC move mais dinheiro (institucional); USDT move mais transações (varejo).</Ponto>
                  <Ponto>Cerca de US$ 400 bi cross-border por ano (BIS).</Ponto>
                </ul>
                <Fonte>Ref.: brutos 2025, ajuste pela metodologia Visa · Confiança: alta</Fonte>
              </Disclosure>
            </Reveal>

            <Reveal delay={0.05}>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>Depósitos tokenizados</span>
                    <Anchor>~US$ 3 bi/dia</Anchor>
                  </span>
                }
                subtitle="O trilho dos bancos (Kinexys/JPMorgan)."
              >
                <ul className="space-y-2">
                  <Ponto>Claim contra o banco, dentro do perímetro regulatório.</Ponto>
                  <Ponto>O token JPMD foi levado à Base, uma blockchain pública.</Ponto>
                </ul>
                <Fonte>Ref.: 2025/2026 (JPMorgan) · Confiança: alta</Fonte>
              </Disclosure>
            </Reveal>

            <Reveal delay={0.1}>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>CBDCs de atacado</span>
                    <Anchor>mBridge vs Agorá</Anchor>
                  </span>
                }
                subtitle="A bifurcação geopolítica."
              >
                <ul className="space-y-2">
                  <Ponto>
                    mBridge (~US$ 55,5 bi, ~95% yuan, sem bancos centrais ocidentais) substitui o
                    correspondente.
                  </Ponto>
                  <Ponto>Agorá (G7 ampliado e SWIFT) preserva o correspondente.</Ponto>
                </ul>
                <Fonte>Ref.: out 2024 (BIS) · Confiança: média-alta (número do mBridge merece dupla checagem)</Fonte>
              </Disclosure>
            </Reveal>

            <Reveal delay={0.15}>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>Nexus</span>
                    <Anchor>liquidação em ~60s</Anchor>
                  </span>
                }
                subtitle="O Pix internacional."
              >
                <ul className="space-y-2">
                  <Ponto>Conecta sistemas de pagamento instantâneo domésticos; nativo ISO 20022.</Ponto>
                  <Ponto>Brasil como observador; sem data oficial de lançamento.</Ponto>
                </ul>
                <Fonte>Ref.: desenho consolidado · Confiança: alta no desenho, baixa em cronograma</Fonte>
              </Disclosure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ NARRATIVA vs REALIDADE (PASSO 7) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>O método Aeternum</SectionLabel>
            <SectionTitle>O teste que separa narrativa de realidade</SectionTitle>
            <GoldLine />
          </Reveal>

          <Reveal>
            <Disclosure
              title="Três redes, o mesmo vocabulário, os mesmos logos"
              subtitle="O que as separa é o volume real."
            >
              <ul className="space-y-2">
                <Ponto>RWA mais ISO 20022 virou o script de marketing padrão do setor.</Ponto>
                <Ponto>
                  O diferenciador não é a narrativa (idêntica), é o volume liquidado e a existência de caso
                  concreto no mercado-alvo.
                </Ponto>
              </ul>

              {/* Micro-tabela de escala honesta */}
              <div className="mt-4 border border-white/5" style={{ backgroundColor: "rgba(10,8,4,0.4)" }}>
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
                  <span className="text-xs text-foreground/80">Stablecoins</span>
                  <span className="text-xs" style={{ color: `${GOLD}b0` }}>~US$ 10,8 tri/ano</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs text-muted-foreground/70">XRP · XLM · XDC · HBAR</span>
                  <span className="text-xs text-muted-foreground/60">volumes documentados menores, nem sempre auditáveis</span>
                </div>
              </div>
              <p className="mt-3 text-foreground/70">É este teste que a Aeternum aplica como método.</p>
            </Disclosure>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ AS REDES E SEUS ENCAIXES (PASSO 8) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Redes e encaixes</SectionLabel>
            <SectionTitle>Onde cada rede encaixa</SectionTitle>
            <GoldLine />
          </Reveal>

          <div className="space-y-3">
            {/* Algorand */}
            <Reveal>
              <Disclosure
                title={
                  <span className="block">
                    <Selo>Operação agrícola brasileira documentada</Selo>
                    <span className="block">Algorand</span>
                  </span>
                }
                subtitle="Agrotoken tokeniza soja, milho e trigo com lastro 1:1 em armazém."
              >
                <ul className="space-y-2">
                  <Ponto>
                    Visa cocriou o cartão (pagar com grãos tokenizados) e investiu ~US$ 2 mi; a Bunge liderou
                    a pré-série A (US$ 4 mi). Parceiros: Raízen, Santander.
                  </Ponto>
                  <Ponto>
                    Operação BR: a AgroGalaxy tokenizou 2.000 t de soja; o Brasil é o 2º país com o cartão
                    Agrotoken Visa.
                  </Ponto>
                  <Ponto>
                    Ressalva: a 1ª operação BR rodou em Polygon; a Algorand é parte da infra multichain e
                    parceira do cartão. Não afirmamos que o agro brasileiro roda em ALGO.
                  </Ponto>
                </ul>
                <Fonte>Fontes: The AgriBiz (jan 2024), Visa Brasil, InfoMoney (2022)</Fonte>
              </Disclosure>
            </Reveal>

            {/* XDC */}
            <Reveal delay={0.05}>
              <Disclosure
                title={
                  <span className="block">
                    <Selo>Financiamento de comércio exterior (trade finance)</Selo>
                    <span className="block">XDC</span>
                  </span>
                }
                subtitle="TradeFinex tokeniza warehouse receipts e cartas de crédito."
              >
                <ul className="space-y-2">
                  <Ponto>
                    Integra a Contour Network (MUFG, ICBC, Bank of China, DBS); primeiro L1 no Trade Finance
                    Distribution Initiative da ITFA.
                  </Ponto>
                  <Ponto>Circle com USDC nativo; ETP da 21Shares na bolsa suíça.</Ponto>
                  <Ponto>
                    Ressalva de escala: cerca de US$ 64,2 mi em RWA on-chain (modesto). Sem caso agro
                    brasileiro verificado.
                  </Ponto>
                  <Ponto>
                    Encaixe: warehouse receipt e carta de crédito financiam a exportação de grão brasileiro.
                  </Ponto>
                </ul>
                <Fonte>Ref.: ITFA, Contour, 21Shares (2024/2025)</Fonte>
              </Disclosure>
            </Reveal>

            {/* Hedera */}
            <Reveal delay={0.1}>
              <Disclosure
                title={
                  <span className="block">
                    <Selo>Tokenização de RWA de alto valor</Selo>
                    <span className="block">Hedera</span>
                  </span>
                }
                subtitle="Governança por conselho corporativo; RWA físico de alto valor unitário."
              >
                <ul className="space-y-2">
                  <Ponto>
                    Conselho: Google, Dell, IBM, LG, EDF; entradas recentes de Accenture, FedEx, McLaren.
                    Código sob a Linux Foundation.
                  </Ponto>
                  <Ponto>
                    Caso sólido: Diamond Standard (diamante fungível certificado IGI), ~US$ 50 mi em ativos,
                    ~US$ 2,5 mi de volume. Lloyds usou ativos tokenizados como colateral de FX.
                  </Ponto>
                  <Ponto>
                    Ressalva: gema não é commodity agrícola; o caso diamante não transfere para soja. A
                    iniciativa WGI/Vaultik de US$ 3 bi é meta anunciada, não valor liquidado.
                  </Ponto>
                </ul>
                <Fonte>Ref.: Hedera Council, Diamond Standard, Lloyds (2024/2025)</Fonte>
              </Disclosure>
            </Reveal>
          </div>

          {/* Rodapé dos cards de rede (obrigatório) */}
          <Reveal delay={0.1}>
            <div className="mt-5 pt-4 border-t border-white/5">
              <ComplianceNote>
                Os cards apresentam tecnologia, infraestrutura e casos de uso, não recomendação de
                investimento. O benefício é operacional (pagar, liquidar, colateralizar, tokenizar). Cada
                afirmação tem fonte e data de referência.
              </ComplianceNote>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ CASOS-ÂNCORA (PASSO 9) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Casos concretos</SectionLabel>
            <SectionTitle>Casos-âncora</SectionTitle>
            <GoldLine />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Reveal>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>Franklin Templeton / BENJI</span>
                    <Anchor>US$ 1,98 bi AUM</Anchor>
                  </span>
                }
                subtitle="Fundo mútuo dos EUA com blockchain pública como registro oficial (Stellar)."
              >
                <ul className="space-y-2">
                  <Ponto>Primeiro fundo do tipo (abril de 2021); mais de US$ 211 mi em transferências P2P.</Ponto>
                  <Ponto>Versão UCITS europeia (gBENJI).</Ponto>
                </ul>
                <Fonte>Fonte: SEC, site da gestora</Fonte>
              </Disclosure>
            </Reveal>

            <Reveal delay={0.05}>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>Santander bond 2019</span>
                    <Anchor>US$ 20 mi on-chain</Anchor>
                  </span>
                }
                subtitle="Bond emitido ponta a ponta na Ethereum pública (DvP on-chain)."
              >
                <ul className="space-y-2">
                  <Ponto>Caixa tokenizado, cupom 1,98%, resgatado on-chain em dezembro de 2019.</Ponto>
                  <Ponto>
                    Ressalva: emitido para si mesmo, sem mercado secundário. É o antecessor da CPR tokenizada
                    e do BUIDL.
                  </Ponto>
                </ul>
                <Fonte>Ref.: Santander (2019)</Fonte>
              </Disclosure>
            </Reveal>

            <Reveal delay={0.1}>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>CPR tokenizada no Brasil</span>
                    <Anchor>R$ 1,15 bi</Anchor>
                  </span>
                }
                subtitle="O ativo mais tokenizado do país em 2025."
              >
                <ul className="space-y-2">
                  <Ponto>Precedente CVM (Vert/Vórtx, processo de 2024).</Ponto>
                  <Ponto>
                    Mercado BR de tokenização em cerca de R$ 4 bi em 2025 (RWA Monitor); a B3 planeja
                    tokenizadora em 2026.
                  </Ponto>
                  <Ponto>O caso mais original para o público da Aeternum.</Ponto>
                </ul>
                <Fonte>Ref.: CVM, RWA Monitor (2024/2025)</Fonte>
              </Disclosure>
            </Reveal>

            <Reveal delay={0.15}>
              <Disclosure
                className="h-full"
                title={
                  <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span>mBridge vs Agorá</span>
                    <Anchor>rota de colisão</Anchor>
                  </span>
                }
                subtitle="Duas visões de CBDC de atacado, em colisão geopolítica."
              >
                <ul className="space-y-2">
                  <Ponto>mBridge (~US$ 55,5 bi, 95% yuan, sem bancos centrais ocidentais) substitui o correspondente.</Ponto>
                  <Ponto>Agorá (Fed NY, BCE, BoE, Japão, Suíça, Coreia, México e SWIFT) o preserva.</Ponto>
                </ul>
                <Fonte>Ref.: BIS (2024) · número do mBridge merece dupla checagem</Fonte>
              </Disclosure>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ JANELA REGULATÓRIA 2026 (PASSO 10) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Marco regulatório brasileiro</SectionLabel>
            <SectionTitle>A janela de 2026</SectionTitle>
            <GoldLine />
            <p className="text-sm font-light leading-relaxed max-w-2xl mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
              Entre fevereiro e outubro de 2026, stablecoin virou câmbio no Brasil. É o vão entre a regra e a
              implementação.
            </p>
          </Reveal>

          {/* Timeline sóbria */}
          <Reveal>
            <div className="relative grid grid-cols-2 sm:grid-cols-5 gap-y-6 gap-x-3 mb-8">
              <div className="hidden sm:block absolute top-[5px] left-0 right-0 h-px bg-white/10" aria-hidden="true" />
              {[
                { d: "10 nov 2025", l: "Resoluções 519/520/521" },
                { d: "2 fev 2026", l: "Entra em vigor" },
                { d: "4 mai 2026", l: "Regras de câmbio" },
                { d: "jul 2026", l: "DeCripto (RFB)" },
                { d: "30 out 2026", l: "Fim de operar com não autorizadas" },
              ].map((m) => (
                <div key={m.d} className="relative">
                  <span className="block h-2.5 w-2.5 rounded-full bg-primary/70 mb-3 shadow-[0_0_10px_rgba(198,167,92,0.4)]" aria-hidden="true" />
                  <p className="font-sans text-[10px] tracking-[0.15em] uppercase mb-1" style={{ color: `${GOLD}b0` }}>
                    {m.d}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-light leading-snug">{m.l}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal>
            <Disclosure
              title="O que muda para o cliente"
              subtitle="Stablecoin passa a ser câmbio, com uma nuance que a versão idealizada omite."
            >
              <ul className="space-y-2">
                <Ponto>
                  Passam a ser câmbio: pagamentos internacionais com ativos virtuais e compra/venda de
                  stablecoins. Limites de US$ 100 mil (US$ 500 mil para corretoras).
                </Ponto>
                <Ponto>
                  Nuance: usar stablecoin não elimina a obrigação cambial na conversão para reais (Lei
                  14.286).
                </Ponto>
                <Ponto>
                  Prova doméstica (Receita, 2026): R$ 1,13 tri em stablecoins declarados (71,7% do total
                  cripto); USDT igual a 88,7%. Fato consumado, não tendência.
                </Ponto>
                <Ponto>Drex reposicionado (nov 2025): pagamentos deixaram de ser prioridade.</Ponto>
              </ul>
              <Fonte>Ref.: BCB e Receita Federal (2025/2026) · Confiança: alta</Fonte>
            </Disclosure>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ BENEFÍCIOS POR PERFIL (PASSO 11.1) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>Encaixe operacional</SectionLabel>
            <SectionTitle>Benefícios por perfil</SectionTitle>
            <GoldLine />
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                perfil: "Produtor rural",
                beneficio: "Safra armazenada como meio de pagamento e colateral",
                apoio: "Caso Agrotoken com Visa e Santander. A Aeternum integra e estrutura a operação.",
              },
              {
                perfil: "Exportador",
                beneficio: "Liquidação internacional dentro do marco 519/520/521",
                apoio: "A Aeternum desenha a operação cambial no novo arcabouço do BCB.",
              },
              {
                perfil: "Tesouraria",
                beneficio: "Gestão de caixa on-chain e tokenização doméstica",
                apoio: "Padrão Franklin Templeton (BENJI) e o marco CVM 88. A Aeternum estrutura e analisa.",
              },
            ].map((b, i) => (
              <Reveal key={b.perfil} delay={i * 0.05}>
                <div
                  className="h-full border border-white/5 p-6 transition-colors duration-200 hover:border-primary/20"
                  style={{ backgroundColor: "rgba(10,8,4,0.5)" }}
                >
                  <p className="font-sans text-[9px] tracking-[0.25em] uppercase mb-3" style={{ color: `${GOLD}b0` }}>
                    {b.perfil}
                  </p>
                  <p className="font-display text-base text-foreground/90 leading-snug mb-3">{b.beneficio}</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">{b.apoio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CUSTO REAL (PASSO 11.2) ═══════════════ */}
      <section className="py-14 px-4 sm:px-6 lg:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <Reveal>
            <SectionLabel>O custo real</SectionLabel>
            <SectionTitle>O custo está nas pontas</SectionTitle>
            <GoldLine />
            <p className="text-sm font-light leading-relaxed max-w-2xl mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
              O on-chain custa centavos. O custo real vive no on-ramp, no off-ramp e no spread FX.
            </p>
          </Reveal>

          <Reveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <NodeGraphChart />
              <YieldCurveChart />
            </div>
          </Reveal>

          <Reveal>
            <Disclosure
              title="Onde o custo realmente vive"
              subtitle="A comparação justa não é contra o pior banco."
            >
              <ul className="space-y-2">
                <Ponto>Média global de 6,36% por remessa (referência de custo).</Ponto>
                <Ponto>On-chain custa centavos; o custo vive no on-ramp, no off-ramp e no spread FX.</Ponto>
                <Ponto>Comparação justa é contra a Wise (~0,5 a 1%), não contra o pior banco (8,8%).</Ponto>
              </ul>
            </Disclosure>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FECHO + CTA + COMPLIANCE (PASSO 11.3 e 11.4) ═══════════════ */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-px shimmer-line" />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: `radial-gradient(circle, ${GOLD}0a 0%, transparent 60%)` }}
        />

        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <Reveal>
            <SectionLabel>Posição estratégica</SectionLabel>
            <h2
              className="font-display font-light uppercase tracking-widest leading-tight mb-6"
              style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", color: GOLD }}
            >
              Quem se alinha agora, lidera
            </h2>
            <p className="text-sm leading-relaxed font-light mb-8" style={{ color: "rgba(255,255,255,0.45)" }}>
              As três camadas e a janela de 2026 desenham um mesmo trabalho: transformar norma publicada em
              operação rodando. A Aeternum atua como integradora e viabilizadora técnica: leitura de dados
              ISO 20022, desenho da operação dentro do marco 519/520/521 e análise quantitativa de ativos
              tokenizados. O benefício é sempre operacional: pagar, liquidar, colateralizar, tokenizar.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink
                to="/acesso"
                className="inline-flex items-center gap-2 px-8 py-3 border font-sans text-[10px] tracking-[0.25em] uppercase transition-all duration-200 group"
                style={{ borderColor: `${GOLD}40`, color: GOLD }}
              >
                Solicitar acesso
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </NavLink>
              <NavLink
                to="/research/pagamentos-transfronteiricos-ledgers"
                className="inline-flex items-center gap-2 px-8 py-3 border border-white/10 text-muted-foreground font-sans text-[10px] tracking-[0.25em] uppercase hover:border-white/25 hover:text-foreground transition-all duration-200 group"
              >
                Fundamentação na Pesquisa
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </NavLink>
            </div>
          </Reveal>

          {/* Rodapé de compliance (fixo) */}
          <Reveal delay={0.1}>
            <div className="mt-16 pt-6 border-t border-white/5">
              <ComplianceNote>
                Esta página apresenta tecnologia, infraestrutura e casos de uso. Não constitui recomendação de
                investimento. Os benefícios descritos são operacionais (pagar, liquidar, colateralizar,
                tokenizar), não financeiro-especulativos. Dados com data de referência indicada; fontes
                primárias quando disponíveis.
              </ComplianceNote>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
