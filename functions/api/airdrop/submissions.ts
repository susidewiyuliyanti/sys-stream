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

export async function onRequestOptions({ request }: { request: Request }) {
  const origin = request.headers.get("Origin") || "";
  if (origin !== "https://airdrop.sysstreamer.asia") return new Response(null, { status: 403 });
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
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
    return response(context.request, { success: true, submissions: result.results || [] });
  } catch (error) {
    return response(context.request, { success: false, error: String(error), submissions: [] }, 500);
  }
}