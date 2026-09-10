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

  // ── CHECKOUT_PAID: no checkout hospedado o externalReference (= nosso usuário)
  // NÃO desce pro pagamento nem pra assinatura — fica só no checkout (comprovado
  // no sandbox). Este é o único evento que o carrega. Re-consultamos o checkout
  // (Camada 2) e ativamos. O objeto cru fica em payload p/ mapear customer/sub. ──
  if (event === "CHECKOUT_PAID") {
    const chkId: string | undefined = body?.checkout?.id;
    let chk: any = body?.checkout ?? {};
    if (chkId) {
      try {
        const r = await fetch(`${ASAAS_BASE}/checkouts/${chkId}`, { headers: { access_token: ASAAS_API_KEY } });
        if (r.ok) chk = await r.json();
      } catch { /* re-consulta falhou: usa o payload do evento */ }
    }
    const extRef: string | undefined = chk?.externalReference ?? body?.checkout?.externalReference;
    if (!extRef || !UUID.test(extRef)) { await log("orphan", `CHECKOUT_PAID externalReference inválido: ${JSON.stringify(extRef)}`); return ok(); }
    const { data: uRes, error: uErr } = await db.auth.admin.getUserById(extRef);
    if (uErr || !uRes?.user) { await log("orphan", `CHECKOUT_PAID user inexistente para ${extRef}`); return ok(); }
    const custRef = (typeof chk?.customer === "string" ? chk.customer : chk?.customer?.id) ?? null;
    const subRef = (typeof chk?.subscription === "string" ? chk.subscription : chk?.subscription?.id) ?? null;
    await upsertActive(uRes.user.id, subRef, custRef);
    await log("processed", `checkout pago -> ativado (chk=${chkId} sub=${subRef ?? "-"} cust=${custRef ?? "-"} status=${chk?.status ?? "?"})`);
    return ok("ativado via checkout");
  }

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

  // externalReference liga o pagamento ao usuário Supabase. No pagamento DIRETO
  // ele vem em payment.externalReference. No checkout RECORRENTE a doc do Asaas
  // NÃO garante que ele desça pro pagamento — pode estar só na assinatura. Então:
  //  1) tenta o do pagamento;  2) fallback: consulta a assinatura e usa o dela.
  // refSource registra QUAL caminho resolveu (visível no log p/ auditar).
  let extRef: string | undefined = real?.externalReference ?? payment?.externalReference;
  let refSource = "payment";
  const subId: string | undefined = real?.subscription ?? payment?.subscription;
  if ((!extRef || !UUID.test(extRef)) && subId) {
    try {
      const rs = await fetch(`${ASAAS_BASE}/subscriptions/${subId}`, { headers: { access_token: ASAAS_API_KEY } });
      if (rs.ok) {
        const sub = await rs.json();
        if (sub?.externalReference) { extRef = sub.externalReference; refSource = "subscription-fallback"; }
      }
    } catch { /* segue; se ainda inválido, cai no órfão abaixo */ }
  }

  // 3) MAPA (renovação/estorno do checkout): o externalReference não desce no
  // fluxo de checkout, mas o CHECKOUT_PAID gravou provider_subscription_id/customer.
  // Então resolvemos o usuário por payment.subscription ou payment.customer -> a
  // nossa tabela subscriptions. Só casa com assinaturas NOSSAS já gravadas.
  let userId: string | null = null;
  if (!extRef || !UUID.test(extRef)) {
    const custId: string | undefined = real?.customer ?? payment?.customer;
    const orClauses = [subId ? `provider_subscription_id.eq.${subId}` : null, custId ? `provider_customer_id.eq.${custId}` : null].filter(Boolean).join(",");
    if (orClauses) {
      const { data: map } = await db.from("subscriptions").select("user_id").or(orClauses).limit(1).maybeSingle();
      if (map?.user_id) { userId = map.user_id; refSource = subId ? "map-subscription" : "map-customer"; }
    }
  }

  // resolve por externalReference se o mapa não pegou
  if (!userId) {
    if (!extRef || !UUID.test(extRef)) { await log("orphan", `externalReference inválido: ${JSON.stringify(extRef)} (sub=${subId ?? "-"})`); return ok(); }
    const { data: userRes, error: userErr } = await db.auth.admin.getUserById(extRef);
    if (userErr || !userRes?.user) { await log("orphan", `user inexistente para ${extRef}`); return ok(); }
    userId = userRes.user.id;
  }

  // ── AÇÃO ──
  if (ACTIVATE.includes(event)) {
    if (!["CONFIRMED", "RECEIVED", "RECEIVED_IN_CASH"].includes(real.status)) { await log("ignored", `status real ${real.status} não ativa`); return ok(); }
    await upsertActive(userId, real.subscription ?? null, real.customer ?? null);
    await log("processed", `ativado (${real.status}) [ref via ${refSource}]`);
    return ok("ativado");
  }

  // REVOKE: refund/estorno/chargeback -> cancela e corta o acesso
  await db.from("subscriptions").update({ status: "canceled", expires_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq("user_id", userId);
  await log("processed", `desativado (${event})`);
  return ok("desativado");
});
