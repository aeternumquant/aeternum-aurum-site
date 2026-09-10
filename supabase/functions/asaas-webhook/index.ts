// Edge Function: recebe o webhook do Asaas, valida em 3 camadas, e ativa/desativa
// a assinatura na tabela subscriptions. NUNCA confia no payload — re-consulta o
// status real no Asaas. Pagamento órfão é LOGADO (não some) e devolve 200.
//
// Secrets (Supabase -> Edge Functions -> Secrets): ASAAS_API_KEY, ASAAS_WEBHOOK_TOKEN,
// ASAAS_BASE_URL (opcional; default sandbox). SUPABASE_URL e SERVICE_ROLE_KEY já
// vêm do ambiente da função.
//
// Deploy:  supabase functions deploy asaas-webhook --no-verify-jwt --project-ref <ref>
// Webhook no Asaas -> URL: https://<ref>.supabase.co/functions/v1/asaas-webhook
//   (canônica; a forma https://<ref>.functions.supabase.co/asaas-webhook tambem resolve)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.10";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ASAAS_API_KEY = Deno.env.get("ASAAS_API_KEY") ?? "";
const WEBHOOK_TOKEN = Deno.env.get("ASAAS_WEBHOOK_TOKEN") ?? "";
const ASAAS_BASE = Deno.env.get("ASAAS_BASE_URL") ?? "https://sandbox.asaas.com/api/v3";

const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
const ok = (msg = "ok") => new Response(msg, { status: 200 }); // 200 sempre que não for ataque, p/ o Asaas não reenviar infinito
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ACTIVATE = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
const REVOKE = ["PAYMENT_REFUNDED", "PAYMENT_DELETED", "PAYMENT_CHARGEBACK_REQUESTED"]; // estorno TOTAL/chargeback -> corta
const NOTE = ["PAYMENT_PARTIALLY_REFUNDED", "PAYMENT_REFUND_IN_PROGRESS"];               // parcial / em andamento -> só loga, NÃO corta

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  // ── CAMADA 1: o token. Barra o POST forjado ("fulano pagou"). ──
  if (!WEBHOOK_TOKEN || req.headers.get("asaas-access-token") !== WEBHOOK_TOKEN) {
    return new Response("unauthorized", { status: 401 }); // 401 (não 200): não é o Asaas
  }

  let body: any;
  try { body = await req.json(); } catch { return new Response("bad json", { status: 400 }); }
  const eventId: string | undefined = body?.id;
  const event: string | undefined = body?.event;
  const payment = body?.payment;
  if (!eventId || !event) return ok("sem event/id");

  const log = (status: string, detail: string) =>
    db.from("asaas_webhooks").insert({
      event_id: eventId, event, payment_id: payment?.id ?? null,
      subscription_id: payment?.subscription ?? null,
      // captura o externalReference venha do pagamento OU do checkout
      external_reference: payment?.externalReference ?? body?.checkout?.externalReference ?? null,
      status, detail, payload: body,
    });

  // ativa/renova a assinatura terminal do usuário. +33d (mês + folga); cada
  // pagamento estende. Preserva started_at original na renovação.
  const upsertActive = async (userId: string, subRef: string | null, custRef: string | null) => {
    const now = new Date();
    const row = {
      user_id: userId, plan: "terminal", status: "active",
      started_at: now.toISOString(), expires_at: new Date(now.getTime() + 33 * 864e5).toISOString(),
      provider: "asaas", provider_subscription_id: subRef, provider_customer_id: custRef,
      updated_at: now.toISOString(),
    };
    const { data: existing } = await db.from("subscriptions").select("id").eq("user_id", userId).limit(1).maybeSingle();
    if (existing) { const { started_at: _s, ...upd } = row; await db.from("subscriptions").update(upd).eq("id", existing.id); }
    else await db.from("subscriptions").insert(row);
  };

  // ── idempotência: já vimos esse event.id? 200 e sai. ──
  const { data: seen } = await db.from("asaas_webhooks").select("event_id").eq("event_id", eventId).maybeSingle();
  if (seen) return ok("duplicado");

  // estorno PARCIAL / refund em andamento: LOGA (fica visível), mas NÃO corta o
  // acesso — parcial != cancelamento, e "em andamento" não é final (o REFUNDED
  // final é que corta). Assim um cliente pagante não perde acesso por evento ambíguo.
  if (NOTE.includes(event)) { await log("noted", `${event}: registrado, acesso mantido`); return ok(); }

  // só ativação/desativação (total) nos importa agir
  if (!ACTIVATE.includes(event) && !REVOKE.includes(event)) { await log("ignored", "fora do escopo"); return ok(); }
  if (!payment?.id) { await log("orphan", "sem payment.id"); return ok(); }

  // ── CAMADA 2: NÃO confiar no payload — re-consultar o status real no Asaas. ──
  let real: any;
  try {
    const r = await fetch(`${ASAAS_BASE}/payments/${payment.id}`, { headers: { access_token: ASAAS_API_KEY } });
    if (!r.ok) { await log("error", `re-consulta HTTP ${r.status}`); return ok(); }
    real = await r.json();
  } catch (e) { await log("error", `re-consulta falhou: ${String(e).slice(0, 120)}`); return ok(); }

  // Resolver QUEM pagou — DETERMINÍSTICO, pelos NOSSOS dados (nenhum GET no Asaas
  // p/ o vínculo: o vínculo nós criamos, nós resolvemos). Ordem:
  //  1) externalReference do pagamento          -> pagamento DIRETO (ex. RECEIVED_IN_CASH)
  //  2) checkoutSession -> asaas_checkouts       -> compra via CHECKOUT (mapa que o
  //     criar-checkout gravou no ato: checkout_id -> user_id)
  //  3) subscription/customer -> subscriptions   -> RENOVAÇÃO/estorno (não trazem ref)
  // refSource audita qual via resolveu (visível no log).
  const extRef: string | undefined = real?.externalReference ?? payment?.externalReference;
  let refSource = "payment";
  const subId: string | undefined = real?.subscription ?? payment?.subscription;
  const custId: string | undefined = real?.customer ?? payment?.customer;
  const checkoutId: string | undefined = real?.checkoutSession ?? payment?.checkoutSession;

  let userId: string;
  if (extRef && UUID.test(extRef)) {
    const { data: userRes, error: userErr } = await db.auth.admin.getUserById(extRef);
    if (userErr || !userRes?.user) { await log("orphan", `user inexistente para ${extRef}`); return ok(); }
    userId = userRes.user.id;
  } else {
    let mapped: string | null = null;
    if (checkoutId) {
      const { data: cm } = await db.from("asaas_checkouts").select("user_id").eq("checkout_id", checkoutId).maybeSingle();
      if (cm?.user_id) { mapped = cm.user_id; refSource = "checkout-map"; }
    }
    if (!mapped) {
      const orClauses = [subId ? `provider_subscription_id.eq.${subId}` : null, custId ? `provider_customer_id.eq.${custId}` : null].filter(Boolean).join(",");
      if (orClauses) {
        const { data: sm } = await db.from("subscriptions").select("user_id").or(orClauses).limit(1).maybeSingle();
        if (sm?.user_id) { mapped = sm.user_id; refSource = subId ? "map-subscription" : "map-customer"; }
      }
    }
    if (!mapped) { await log("orphan", `sem ref/checkout-map/sub-map (chk=${checkoutId ?? "-"} sub=${subId ?? "-"} cust=${custId ?? "-"})`); return ok(); }
    userId = mapped;
  }

  // ── AÇÃO ──
  if (ACTIVATE.includes(event)) {
    if (!["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(real.status)) { await log("ignored", `status real ${real.status} não ativa`); return ok(); }
    await upsertActive(userId, subId ?? null, custId ?? null); // grava ids -> alimenta o mapa de renovação
    await log("processed", `ativado (${real.status}) [ref via ${refSource}]`);
    return ok("ativado");
  }

  // REVOKE: refund/estorno/chargeback -> cancela e corta o acesso
  await db.from("subscriptions").update({ status: "canceled", expires_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("user_id", userId);
  await log("processed", `desativado (${event})`);
  return ok("desativado");
});
