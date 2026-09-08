import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do site.
 *
 * REGRA DE SEGURANCA: aqui entra SO a anon key. Ela e publica por design (o que
 * protege os dados e o RLS, nao o segredo da chave). A service-role NUNCA pode
 * aparecer em src/ nem no bundle do cliente.
 *
 * Auth real (DIA 1): persistSession/autoRefreshToken/detectSessionInUrl ligados —
 * a sessao sobrevive a reload, o token se renova sozinho, e os links de
 * confirmacao/recuperacao por e-mail sao consumidos ao voltar pro site.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigError: string | null =
  !url || !anonKey
    ? "Supabase nao configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (anon key publica, nunca a chave service-role)."
    : null;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: "pkce",
        },
      })
    : null;
