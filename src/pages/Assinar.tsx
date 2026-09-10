import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, Check, MapPin, Layers, Droplets, ArrowRight } from "lucide-react";
import Footer from "../components/common/Footer";
import { FadeIn } from "../components/common/FadeIn";
import { RouteSeo } from "../lib/seo/RouteSeo";
import { useAuth } from "../context/AuthContext";
import { useEntitlements } from "../hooks/useEntitlements";

/**
 * /assinar — a página de assinatura do Terminal-BR (e SÓ dele; nada de "em
 * expansão"). Concreta: 5.570 municípios, 8 culturas, sequeiro e irrigado, R$249/mês.
 * O botão chama a Edge Function criar-checkout (auth pelo JWT do usuário), recebe a
 * URL do checkout Asaas e redireciona. Na volta (?status=sucesso) faz poll do
 * refreshPlan até o webhook ativar a assinatura, então leva ao /terminal-br.
 */
const CHECKOUT_FN = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/criar-checkout`;

const INCLUI = [
  { icon: MapPin, t: "5.570 municípios", d: "o valor por município, não só o agregado por estado." },
  { icon: Layers, t: "8 culturas", d: "soja, milho 1ª e 2ª safra, algodão, feijão, arroz, trigo e café arábica." },
  { icon: Droplets, t: "Sequeiro e irrigado", d: "os dois manejos — o que a irrigação compra em janela de plantio." },
];

export default function AssinarPage() {
  const [params] = useSearchParams();
  const status = params.get("status");
  const navigate = useNavigate();
  const { session, isAuthenticated } = useAuth();
  const { isPaid, refreshPlan, loading: planLoading } = useEntitlements();

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmando, setConfirmando] = useState(status === "sucesso");
  const [demorou, setDemorou] = useState(false);

  // Volta do checkout com sucesso: o webhook ativa de forma ASSÍNCRONA (segundos
  // depois). Faz poll do plano; quando virar terminal, o efeito abaixo redireciona.
  useEffect(() => {
    if (status !== "sucesso") return;
    setConfirmando(true);
    let tries = 0;
    const iv = setInterval(async () => {
      tries += 1;
      await refreshPlan();
      if (tries >= 15) { clearInterval(iv); setConfirmando(false); setDemorou(true); } // ~30s
    }, 2000);
    return () => clearInterval(iv);
  }, [status, refreshPlan]);

  // Assim que o plano vira pago APÓS o checkout, entra no Terminal.
  useEffect(() => {
    if (isPaid && status === "sucesso") navigate("/terminal-br", { replace: true });
  }, [isPaid, status, navigate]);

  const assinar = useCallback(async () => {
    if (!isAuthenticated || !session?.access_token) {
      // Login usa location.state.from.pathname para voltar depois de entrar.
      navigate("/login", { state: { from: { pathname: "/assinar" } } });
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      const r = await fetch(CHECKOUT_FN, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
        body: "{}",
      });
      const d = await r.json().catch(() => ({}));
      const url: string | undefined = d?.url;
      if (!r.ok || !url) {
        setErro(d?.asaas?.errors?.[0]?.description ?? d?.error ?? "Não foi possível abrir o checkout. Tente novamente.");
        setLoading(false);
        return;
      }
      window.location.href = url; // vai para a página hospedada do Asaas
    } catch {
      setErro("Falha de rede ao abrir o checkout.");
      setLoading(false);
    }
  }, [isAuthenticated, session, navigate]);

  // ── Estados de retorno ──────────────────────────────────────────────
  if (confirmando) {
    return (
      <Shell>
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-6" />
          <h1 className="font-display text-2xl text-primary uppercase tracking-widest mb-3">Confirmando o pagamento</h1>
          <p className="text-muted-foreground text-sm font-light max-w-md mx-auto">
            Recebemos seu retorno do checkout. Estamos aguardando a confirmação do pagamento —
            leva alguns segundos. Assim que cair, o Terminal abre sozinho.
          </p>
        </div>
      </Shell>
    );
  }

  if (isPaid) {
    return (
      <Shell>
        <div className="text-center py-16">
          <div className="w-14 h-14 bg-primary/15 border border-primary/40 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-display text-2xl text-primary uppercase tracking-widest mb-3">Você já tem o Terminal</h1>
          <p className="text-muted-foreground text-sm font-light max-w-md mx-auto mb-8">
            Sua assinatura está ativa. O campo por município está liberado.
          </p>
          <Link to="/terminal-br" className="inline-flex items-center gap-2 py-3 px-8 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase hover:bg-primary hover:text-background transition-all duration-300">
            Abrir o Terminal-BR <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Shell>
    );
  }

  // ── Oferta ──────────────────────────────────────────────────────────
  return (
    <Shell>
      <FadeIn>
        <p className="text-[10px] text-muted-foreground tracking-[0.3em] uppercase mb-3">Assinatura</p>
        <h1 className="font-display text-3xl sm:text-4xl text-primary uppercase tracking-widest mb-3">Terminal-BR</h1>
        <p className="text-muted-foreground text-sm font-light leading-relaxed max-w-xl mb-10">
          O Brasil agrícola por município. O agregado por estado é aberto a todos; a assinatura
          libera o valor de cada município — o dado que sai do Postgres só para quem assina.
        </p>

        {(status === "cancelado" || status === "expirado" || demorou) && (
          <div className="border border-white/10 bg-card/60 p-4 mb-8 text-xs text-muted-foreground">
            {status === "cancelado" && "Checkout cancelado. Você pode tentar de novo quando quiser."}
            {status === "expirado" && "O checkout expirou. Gere um novo abaixo."}
            {demorou && "O pagamento ainda está sendo processado. Assim que confirmar, seu acesso libera — recarregue esta página em instantes ou tente o Terminal direto."}
          </div>
        )}

        <div className="border border-primary/25 bg-gradient-to-br from-primary/[0.06] to-transparent p-8 sm:p-10 max-w-xl">
          <div className="flex items-baseline gap-2 mb-8">
            <span className="font-display text-4xl text-primary">R$ 249</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>

          <ul className="space-y-5 mb-9">
            {INCLUI.map(({ icon: Icon, t, d }) => (
              <li key={t} className="flex gap-3">
                <Icon className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-foreground">{t}</p>
                  <p className="text-xs text-muted-foreground font-light leading-relaxed">{d}</p>
                </div>
              </li>
            ))}
          </ul>

          {erro && (
            <div className="border border-red-500/30 bg-red-500/5 p-3 mb-5 text-xs text-red-400">{erro}</div>
          )}

          <button
            onClick={assinar}
            disabled={loading || planLoading}
            className="w-full py-3.5 border border-primary text-primary text-[10px] tracking-[0.25em] uppercase bg-primary/0 hover:bg-primary hover:text-background transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Abrindo checkout…</>) : (
              isAuthenticated ? "Assinar com cartão" : "Entrar para assinar"
            )}
          </button>
          <p className="text-[10px] text-muted-foreground/60 mt-4 leading-relaxed">
            Assinatura mensal por cartão de crédito, processada pelo Asaas. Cancelável a qualquer
            momento. Informação analítica; não é recomendação de investimento.
          </p>
        </div>
      </FadeIn>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="pt-14 min-h-screen bg-background">
      <RouteSeo
        title="Assinar o Terminal-BR"
        description="Assine o Terminal-BR: o valor da janela de plantio (ZARC) por município — 5.570 municípios, 8 culturas, sequeiro e irrigado. R$249/mês."
        path="/assinar"
      />
      <section className="py-16 sm:py-24 px-4 sm:px-6 max-w-3xl mx-auto">{children}</section>
      <Footer />
    </main>
  );
}
