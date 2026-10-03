import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

function normalizeStatus(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    const url = new URL(request.url);
    const paymentId = String(url.searchParams.get("payment_id") || "").trim();
    if (!paymentId) return json({ success: false, error: "payment_id wajib diisi." }, 400);

    const apiKey = String(env.NOWPAYMENTS_API_KEY || "").trim();
    if (!apiKey) return json({ success: false, error: "NOWPayments belum dikonfigurasi di server." }, 503);

    const tx = await env.DB.prepare(
      "SELECT id,user_id,amount,status,reference,metadata FROM transactions WHERE type='DEPOSIT' AND user_id=? AND payment_id=? LIMIT 1"
    ).bind(auth.user.id, paymentId).first<any>();

    if (!tx) return json({ success: false, error: "Payment tidak ditemukan untuk akun ini." }, 404);

    const response = await fetch("https://api.nowpayments.io/v1/payment/" + encodeURIComponent(paymentId), {
      headers: { "x-api-key": apiKey, "Accept": "application/json" },
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return json({
        success: false,
        error: String(data?.message || data?.error || "NOWPayments gagal membaca status payment."),
        provider_status: response.status,
        provider_code: data?.code || null,
      }, response.status >= 400 && response.status < 500 ? response.status : 502);
    }

    return json({
      success: true,
      payment: {
        payment_id: String(data?.payment_id || paymentId),
        payment_status: normalizeStatus(data?.payment_status),
        pay_amount: Number(data?.pay_amount || 0),
        pay_currency: String(data?.pay_currency || ""),
        order_id: String(data?.order_id || tx.reference || ""),
        price_amount: Number(data?.price_amount || tx.amount || 0),
      },
      transaction: { status: String(tx.status || "PENDING").toUpperCase() },
    });
  } catch (error) {
    console.error("NOWPayments status error", error);
    return json({ success: false, error: "Gagal mengambil status payment." }, 500);
  }
}