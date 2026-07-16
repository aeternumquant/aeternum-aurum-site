import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase do lado do site publico.
 *
 * REGRA DE SEGURANCA: aqui entra SO a anon key. Ela e publica por design (o que
 * protege os dados internos e o RLS, nao o segredo da chave). A chave
 * service-role NUNCA pode aparecer em src/ nem no bundle do cliente.
 *
 * Se faltar env var, nao crashamos com undefined: expomos supabaseConfigError
 * para o hook mostrar um estado honesto ("Supabase nao configurado").
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigError: string | null =
  !url || !anonKey
    ? "Supabase nao configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no .env (anon key publica, nunca a chave service-role)."
    : null;

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, { auth: { persistSession: false } })
    : null;
