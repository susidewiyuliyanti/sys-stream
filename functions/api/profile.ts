import { Env, json } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

async function ensureProfileSchema(env: Env) {
  const columns = await env.DB.prepare("PRAGMA table_info(users)").all();
  const names = new Set((columns.results || []).map((r:any) => String(r.name)));

  if (!names.has("avatar_url")) {
    await env.DB.prepare("ALTER TABLE users ADD COLUMN avatar_url TEXT").run();
  }

  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS user_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    event_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'JOINED',
    joined_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();

  try {
    await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_user_events_user ON user_events(user_id)").run();
  } catch {}
}

async function getProfile(env: Env, userId: string) {
  return env.DB.prepare(`
    SELECT id, username, email, display_name AS displayName,
           role, referral_code AS referralCode, avatar_url AS avatarUrl,
           COALESCE(email_verified,0) AS emailVerified,
           COALESCE(available_balance,0) AS balance,
           COALESCE(total_locked,0) AS lockedBalance,
           COALESCE(referral_count,0) AS referralCount
    FROM users WHERE id = ? LIMIT 1
  `).bind(userId).first<any>();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    await ensureProfileSchema(env);
    const user = await getProfile(env, String(auth.user.id));
    const events = await env.DB.prepare(`
      SELECT event_id AS eventId, event_name AS eventName, status,
             joined_at AS joinedAt, updated_at AS updatedAt
      FROM user_events
      WHERE user_id = ?
      ORDER BY joined_at DESC
    `).bind(String(auth.user.id)).all();

    return json({
      success: true,
      user,
      events: events.results || [],
    });
  } catch (error) {
    console.error("profile get error", error);
    return json({ success: false, error: "Gagal mengambil profile." }, 500);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;

  try {
    await ensureProfileSchema(env);
    const body = await request.json().catch(() => ({}));
    const username = String(body.username || "").trim();
    const avatarUrl = String(body.avatarUrl || "").trim();
    const displayName = String(body.displayName || username || "").trim();

    if (username && !/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return json({ success: false, error: "Username 3-32 karakter: huruf, angka, underscore." }, 400);
    }

    if (username && username.toLowerCase() !== String(auth.user.username || "").toLowerCase()) {
      const exists = await env.DB.prepare(
        "SELECT id FROM users WHERE lower(username)=lower(?) AND id <> ? LIMIT 1"
      ).bind(username, String(auth.user.id)).first();
      if (exists) return json({ success: false, error: "Username sudah digunakan." }, 409);
    }

    await env.DB.prepare(`
      UPDATE users
      SET username = COALESCE(NULLIF(?, ''), username),
          display_name = COALESCE(NULLIF(?, ''), display_name),
          avatar_url = ?
      WHERE id = ?
    `).bind(username, displayName, avatarUrl || null, String(auth.user.id)).run();

    return json({ success: true, user: await getProfile(env, String(auth.user.id)) });
  } catch (error) {
    console.error("profile update error", error);
    return json({ success: false, error: "Gagal menyimpan profile." }, 500);
  }
}
