import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "../lib/supabase";

/**
 * AUTENTICACAO REAL (DIA 1) — substitui o AuthContext falso (que validava senha
 * no localStorage). Agora e Supabase de verdade: sessao persistida, JWT validado
 * com getClaims(), refresh automatico do token.
 *
 * PLANO: vem da TABELA (RPC current_plan, que le subscriptions por auth.uid()),
 * NAO de um claim no JWT. A tabela e a verdade — sempre fresca. Sem Access Token
 * Hook nesta fase: depois do pagamento (dia 5) o webhook grava na tabela e o
 * front so chama refreshPlan(); nao precisa reemitir token.
 */
export type Plan = "free" | "terminal" | "partners" | "aurum";
const PLANS: Plan[] = ["free", "terminal", "partners", "aurum"];
const asPlan = (v: unknown): Plan => (PLANS.includes(v as Plan) ? (v as Plan) : "free");

type Result = { success: boolean; message?: string };
type SignUpResult = Result & { needsConfirmation?: boolean };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  plan: Plan;
  planLoading: boolean;
  signIn: (email: string, password: string) => Promise<Result>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<Result>;
  updatePassword: (newPassword: string) => Promise<Result>;
  refreshPlan: () => Promise<void>;
  // compat com consumidores atuais (Header, ArticleReader, Login)
  login: (email: string, password: string) => Promise<Result>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return ctx;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<Plan>("free");
  const [planLoading, setPlanLoading] = useState(false);

  const fetchPlan = useCallback(async (isAuthed: boolean) => {
    if (!supabase || !isAuthed) { setPlan("free"); return; }
    setPlanLoading(true);
    const { data, error } = await supabase.rpc("current_plan");
    setPlan(error ? "free" : asPlan(data));
    setPlanLoading(false);
  }, []);

  useEffect(() => {
    // Higiene: apaga o vestigio do sistema de auth FALSO anterior, que guardava
    // e-mail/nome em localStorage['aeternum_user']. O AuthContext novo nao le
    // mais essa chave; isto so limpa o que ficou no navegador de quem ja usou.
    try { localStorage.removeItem("aeternum_user"); } catch { /* modo privado/SSR */ }
    if (!supabase) { setLoading(false); return; }
    let alive = true;
    // onAuthStateChange dispara INITIAL_SESSION no mount + reage a login/logout/refresh.
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      if (!alive) return;
      setSession(sess);
      // getClaims() valida o JWT localmente. So DERRUBA se o token estiver
      // comprovadamente invalido; num soluco de rede, mantem a sessao (fallback).
      let ok = !!sess;
      if (sess) {
        const { data, error } = await supabase!.auth.getClaims();
        if (!error) ok = !!(data as any)?.claims?.sub;
      }
      setAuthed(ok);
      await fetchPlan(ok);
      setLoading(false);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [fetchPlan]);

  const signIn = useCallback(async (email: string, password: string): Promise<Result> => {
    if (!supabase) return fail();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { success: false, message: traduz(error.message) } : { success: true };
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    if (!supabase) return fail();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/confirmar` },
    });
    if (error) return { success: false, message: traduz(error.message) };
    // se a confirmacao por e-mail estiver ligada, data.session vem null.
    return { success: true, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut();
    setPlan("free");
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<Result> => {
    if (!supabase) return fail();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/confirmar?tipo=recovery`,
    });
    return error ? { success: false, message: traduz(error.message) } : { success: true };
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<Result> => {
    if (!supabase) return fail();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return error ? { success: false, message: traduz(error.message) } : { success: true };
  }, []);

  // ARMADILHA (documentada): o plano vem da tabela, entao NAO ha claim cacheado
  // no JWT — depois do pagamento basta refreshPlan() (re-le a tabela). Se um dia
  // migrarmos pro Access Token Hook, aqui passaria a exigir refreshSession().
  const refreshPlan = useCallback(async () => { await fetchPlan(authed); }, [authed, fetchPlan]);

  const value = useMemo<AuthContextType>(() => ({
    user: session?.user ?? null,
    session,
    isAuthenticated: authed,
    loading,
    plan,
    planLoading,
    signIn, signUp, signOut, resetPassword, updatePassword, refreshPlan,
    login: signIn, logout: signOut,
  }), [session, authed, loading, plan, planLoading, signIn, signUp, signOut, resetPassword, updatePassword, refreshPlan]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function fail(): Result {
  return { success: false, message: supabaseConfigError ?? "Supabase indisponivel." };
}

function traduz(msg: string): string {
  const m = (msg || "").toLowerCase();
  if (m.includes("invalid login")) return "E-mail ou senha invalidos.";
  if (m.includes("email not confirmed")) return "Confirme seu e-mail antes de entrar.";
  if (m.includes("already registered") || m.includes("already been registered")) return "Este e-mail ja tem conta.";
  if (m.includes("rate limit") || m.includes("too many")) return "Muitas tentativas. Aguarde um instante.";
  if (m.includes("weak") || m.includes("at least") || m.includes("password")) return "Senha fraca: use ao menos 8 caracteres.";
  if (m.includes("unable to validate email") || m.includes("invalid email")) return "E-mail invalido.";
  return msg || "Erro inesperado.";
}
