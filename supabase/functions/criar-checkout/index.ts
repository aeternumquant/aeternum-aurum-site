// Edge Function: cria um Asaas Checkout (página hospedada) para a assinatura do
// Terminal-BR. Gateway PÚBLICO (verify_jwt=false); a autenticação é feita AQUI
// DENTRO: valido o JWT do usuário Supabase e derivo o externalReference do id
// VERIFICADO no servidor — nunca de input do cliente. Assim ninguém cria checkout
// vinculado à conta alheia. (O gateway de functions do projeto rejeita a anon do
// modelo novo de chaves; autenticar dentro contorna isso e é seguro.)
//
// Secrets: ASAAS_API_KEY, ASAAS_BASE_URL (default sandbox), SITE_URL (opcional).
// SUPABASE_URL e SERVICE_ROLE_KEY já vêm do ambiente da função.
//
// Deploy: supabase functions deploy criar-checkout --no-verify-jwt --project-ref <ref>
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY") ?? "";
const ASAAS_BASE = Deno.env.get("ASAAS_BASE_URL") ?? "https://sandbox.asaas.com/api/v3";
const SITE_URL = Deno.env.get("SITE_URL") ?? "https://aeternumaurum.com";

const PRECO = 249.0; // R$/mês do Terminal-BR

const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  // ── AUTH DENTRO DA FUNÇÃO: valida o JWT do usuário e pega o id VERIFICADO. ──
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return json({ error: "sem token" }, 401);
  const { data: u, error: uErr } = await db.auth.getUser(token);
  if (uErr || !u?.user) return json({ error: "token inválido" }, 401);
  const user = u.user;

  // ── monta o Checkout recorrente (assinatura) do Terminal-BR. ──
  const nextDueDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (hoje)

  // REGRA DO ASAAS (descoberta no sandbox): checkout RECURRENT aceita SÓ
  // CREDIT_CARD; PIX exige chargeType DETACHED (avulso). Assinatura recorrente por
  // Pix é o fluxo separado (Pix Automático / Jornada 3), não este checkout. Aqui:
  // cartão. NÃO enviamos customerData: não temos CPF/endereço do usuário (só email),
  // e enviar parcial faz o Asaas exigir todos os campos. A página hospedada coleta
  // do pagador; o vínculo com nosso usuário vem do externalReference (independente).
  const payload: Record<string, unknown> = {
    billingTypes: ["CREDIT_CARD"],
    chargeTypes: ["RECURRENT"],
    minutesToExpire: 60,
    callback: {
      successUrl: `${SITE_URL}/assinar?status=sucesso`,
      cancelUrl: `${SITE_URL}/assinar?status=cancelado`,
      expiredUrl: `${SITE_URL}/assinar?status=expirado`,
    },
    items: [
      { name: "Assinatura Terminal-BR", description: "5.570 municípios, 8 culturas, sequeiro e irrigado", quantity: 1, value: PRECO },
    ],
    subscription: { cycle: "MONTHLY", nextDueDate },
    // O VÍNCULO: id do usuário VERIFICADO no servidor. O webhook lê isto (ou a
    // assinatura, no fallback) para achar quem pagou. Cliente não influencia.
    externalReference: user.id,
  };

  let resp: Response;
  try {
    resp = await fetch(`${ASAAS_BASE}/checkouts`, {
      method: "POST",
      headers: { access_token: ASAAS_API_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    return json({ error: "falha ao contatar o Asaas", detail: String(e).slice(0, 200) }, 502);
  }

  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    // devolve o erro do Asaas p/ diagnóstico (ex.: campo obrigatório faltando)
    return json({ error: "o Asaas recusou o checkout", status: resp.status, asaas: data }, 400);
  }

  // URL da página hospedada. Confirmado no sandbox: o campo é `link`
  // (https://.../checkoutSession/show/<id>); mantenho o fallback construído.
  const id = data?.id;
  const url = data?.link ?? (id ? `${ASAAS_BASE.replace("/api/v3", "")}/checkoutSession/show/${id}` : null);

  // GRAVA O VÍNCULO: checkout_id -> user_id. É como o webhook vai achar quem pagou
  // (o payment traz checkoutSession = este id). Determinístico, sem depender de
  // propagação do Asaas. Best-effort: se falhar, não derruba o checkout.
  if (id) {
    const { error: mapErr } = await db.from("asaas_checkouts").insert({ checkout_id: id, user_id: user.id });
    if (mapErr) console.error("falha ao gravar asaas_checkouts:", mapErr.message);
  }

  return json({ id, url });
});
