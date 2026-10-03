import { Env, json } from "../../_lib/db";
import { createClearAuthCookie } from "../../_lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const token = (request.headers.get("Authorization") || "")
    .replace(/^Bearer\s+/i, "")
    .trim();

  // Force-invalidate the current bearer session server-side. This prevents
  // a previously issued token from being reused after logout.
  if (token) {
    try {
      await env.DB.prepare("DELETE FROM auth_sessions WHERE token = ?").bind(token).run();
    } catch (error) {
      console.error("logout session revoke failed", String(error));
    }
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Set-Cookie": createClearAuthCookie(),
    },
  });
}
