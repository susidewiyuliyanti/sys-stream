import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_events (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      event_name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'JOINED',
      joined_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )`).run();

    const body = await request.json().catch(() => ({}));
    const eventId = String(body.eventId || "").trim();
    const eventName = String(body.eventName || "").trim();
    const status = String(body.status || "JOINED").trim().toUpperCase();

    if (!eventId || !eventName) {
      return json({ success: false, error: "eventId dan eventName wajib diisi." }, 400);
    }

    const now = Date.now();
    const existing = await env.DB.prepare(
      "SELECT id FROM user_events WHERE user_id = ? AND event_id = ? LIMIT 1"
    ).bind(String(auth.user.id), eventId).first<any>();

    if (existing) {
      await env.DB.prepare(
        "UPDATE user_events SET event_name = ?, status = ?, updated_at = ? WHERE id = ?"
      ).bind(eventName, status || "JOINED", now, String(existing.id)).run();
    } else {
      await env.DB.prepare(
        "INSERT INTO user_events(id,user_id,event_id,event_name,status,joined_at,updated_at) VALUES(?,?,?,?,?,?,?)"
      ).bind(crypto.randomUUID(), String(auth.user.id), eventId, eventName, status || "JOINED", now, now).run();
    }

    return json({ success: true });
  } catch (error) {
    console.error("event participation error", error);
    return json({ success: false, error: "Gagal menyimpan status event." }, 500);
  }
}
