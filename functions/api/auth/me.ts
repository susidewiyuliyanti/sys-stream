import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";
import { syncMiningForUser } from "../mining";

function authResponse(request: Request, body: unknown, status = 200) {
  const origin = request.headers.get("Origin") || "";
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  // Airdrop is a same-site subdomain but a different origin. Allow only the
  // official Airdrop origin to validate the shared SYS STREAM session.
  if (origin === "https://airdrop.sysstreamer.asia") {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Access-Control-Allow-Credentials", "true");
    headers.set("Vary", "Origin");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export async function onRequestOptions({ request }: { request: Request }) {
  const origin = request.headers.get("Origin") || "";
  if (origin !== "https://airdrop.sysstreamer.asia") {
    return new Response(null, { status: 403 });
  }
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

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return authResponse(request, { success: false, error: "Unauthorized" }, 401);
  try {
    const mining = await syncMiningForUser(env, String(auth.user.id));
    return authResponse(request, {
      success: true,
      user: { ...auth.user, sysBalance: mining.sysBalance, miningEnabled: mining.enabled, miningStartedAt: mining.miningStartedAt, miningLastCreditedAt: mining.lastCreditedAt, miningLockedAmount: mining.lockedAmountIdr, miningAccruedSys: mining.accruedSys },
    });
  } catch {
    return authResponse(request, { success: true, user: auth.user });
  }
}
