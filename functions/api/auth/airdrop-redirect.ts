import { Env } from "../../_lib/db";
import { requireAuth, createAuthCookie } from "../../_lib/auth";

const ALLOWED_LANGUAGES = new Set(["id", "en", "es", "pt", "zh", "ja", "ko", "ar"]);

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) {
    return Response.redirect("https://sysstreamer.asia/login?return=%2Fdashboard", 302);
  }

  const url = new URL(request.url);
  const requestedLanguage = String(url.searchParams.get("lang") || "id").toLowerCase();
  const language = ALLOWED_LANGUAGES.has(requestedLanguage) ? requestedLanguage : "id";

  return new Response(null, {
    status: 302,
    headers: {
      "Cache-Control": "no-store",
      "Set-Cookie": createAuthCookie(auth.token),
      "Location": `https://airdrop.sysstreamer.asia/?lang=${encodeURIComponent(language)}`,
    },
  });
}
