import { Env } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

function response(request: Request, body: unknown, status = 200) {
  const origin = request.headers.get("Origin") || "";
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  if (origin === "https://airdrop.sysstreamer.asia") {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return response(context.request, { success: false, message: "Login diperlukan." }, 401);

  const db = context.env.DB;
  try {
    const body = await context.request.json().catch(() => ({}));
    if (String(body.action || "").trim().toLowerCase() !== "convert") {
      return response(context.request, { success: false, message: "Action tidak valid." }, 400);
    }

    const wallet = String(auth.user.walletAddress || "").trim().toLowerCase();
    const requested = Number(body.points);
    if (!wallet || !Number.isFinite(requested) || requested <= 0 || !Number.isInteger(requested)) {
      return response(context.request, { success: false, message: "Wallet atau jumlah points tidak valid." }, 400);
    }

    await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_point_conversions (id INTEGER PRIMARY KEY AUTOINCREMENT, wallet_address TEXT NOT NULL, points INTEGER NOT NULL, sys_amount REAL NOT NULL, rate REAL NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();

    const totals = await db.prepare("SELECT COALESCE(SUM(CASE WHEN status IN ('APPROVED','PAID') THEN reward_points ELSE 0 END),0) AS approved_points, COALESCE(SUM(CASE WHEN status='PAID' THEN reward_points ELSE 0 END),0) AS paid_points FROM airdrop_submissions WHERE wallet_address=?").bind(wallet).first<any>();
    const approvedPoints = Number(totals?.approved_points || 0);
    const paidPoints = Number(totals?.paid_points || 0);
    const available = Math.max(0, approvedPoints - paidPoints);
    if (requested > available) {
      return response(context.request, { success: false, message: "Points tidak mencukupi.", availablePoints: available }, 400);
    }

    const rate = 1000;
    const sysAmount = requested / rate;
    await db.prepare("INSERT INTO airdrop_point_conversions (wallet_address,points,sys_amount,rate) VALUES (?,?,?,?)").bind(wallet, requested, sysAmount, rate).run();

    return response(context.request, { success: true, message: "Conversion points berhasil dicatat.", convertedPoints: requested, sysAmount, conversionRate: "1 SYS = 1000 points", remainingPoints: available - requested });
  } catch (error) {
    return response(context.request, { success: false, error: String(error) }, 500);
  }
}

export async function onRequestOptions({ request }: { request: Request }) {
  const origin = request.headers.get("Origin") || "";
  if (origin !== "https://airdrop.sysstreamer.asia") return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin",
    },
  });
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return response(context.request, { success: false, error: "Unauthorized" }, 401);

  const wallet = String(auth.user.walletAddress || "").trim().toLowerCase();
  if (!wallet) return response(context.request, { success: true, submissions: [] });

  try {
    const result = await context.env.DB.prepare("SELECT s.id,s.task_id,t.title AS task_title,s.evidence_link,s.status,s.reward_points,s.created_at FROM airdrop_submissions s LEFT JOIN airdrop_tasks t ON t.id=s.task_id WHERE s.wallet_address=? ORDER BY s.id DESC").bind(wallet).all();
    const rows = (result.results || []) as any[];
    const approvedPoints = rows.filter(r => String(r.status).toUpperCase() === "APPROVED" || String(r.status).toUpperCase() === "PAID")
      .reduce((sum, r) => sum + Number(r.reward_points || 0), 0);
    const pendingPoints = rows.filter(r => String(r.status).toUpperCase() === "PENDING")
      .reduce((sum, r) => sum + Number(r.reward_points || 0), 0);
    const paidPoints = rows.filter(r => String(r.status).toUpperCase() === "PAID")
      .reduce((sum, r) => sum + Number(r.reward_points || 0), 0);
    return response(context.request, {
      success: true,
      submissions: rows,
      points: {
        approved: approvedPoints,
        pending: pendingPoints,
        paid: paidPoints,
        available: Math.max(0, approvedPoints - paidPoints),
      }
    });
  } catch (error) {
    return response(context.request, { success: false, error: String(error), submissions: [] }, 500);
  }
}