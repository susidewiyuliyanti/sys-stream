import { Env } from "../../_lib/db";
import { requireAuth, createAuthCookie } from "../../_lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  return new Response(JSON.stringify({ success: true, user: auth.user }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": createAuthCookie(auth.token),
    },
  });
}
