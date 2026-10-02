import { Env, json } from "../_lib/db";
import { requireAuth } from "../_lib/auth";

async function ensureProfileSchema(env: Env) {
  const columns = await env.DB.prepare("PRAGMA table_info(users)").all();
  const names = new Set((columns.results || []).map((r:any) => String(r.name)));

  const additions: Array<[string,string]> = [
    ["avatar_url", "TEXT"],
    ["registration_bonus_idr", "REAL NOT NULL DEFAULT 0"],
    ["registration_bonus_granted", "INTEGER NOT NULL DEFAULT 0"],
  ];
  for (const [name, definition] of additions) {
    if (!names.has(name)) {
      try {
        await env.DB.prepare(`ALTER TABLE users ADD COLUMN ${name} ${definition}`).run();
      } catch (error) {
        console.error("profile schema repair skipped", { name, error: String(error) });
      }
    }
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
           COALESCE(referral_count,0) AS referralCount,
           COALESCE(registration_bonus_idr,0) AS registrationBonusIdr,
           COALESCE(registration_bonus_granted,0) AS registrationBonusGranted
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
    const hasUsername = Object.prototype.hasOwnProperty.call(body, "username");
    const hasAvatar = Object.prototype.hasOwnProperty.call(body, "avatarUrl");
    const hasDisplayName = Object.prototype.hasOwnProperty.call(body, "displayName");

    const username = hasUsername ? String(body.username || "").trim() : "";
    const avatarUrl = hasAvatar ? String(body.avatarUrl || "").trim() : "";
    const displayName = hasDisplayName
      ? String(body.displayName || "").trim()
      : (hasUsername ? username : "");

    if (hasUsername && !username) {
      return json({ success: false, error: "Username tidak boleh kosong." }, 400);
    }

    if (hasUsername && !/^[a-zA-Z0-9_]{3,32}$/.test(username)) {
      return json({ success: false, error: "Username 3-32 karakter: huruf, angka, underscore." }, 400);
    }

    if (hasUsername && username.toLowerCase() !== String(auth.user.username || "").toLowerCase()) {
      const exists = await env.DB.prepare(
        "SELECT id FROM users WHERE lower(username)=lower(?) AND id <> ? LIMIT 1"
      ).bind(username, String(auth.user.id)).first();
      if (exists) return json({ success: false, error: "Username sudah digunakan." }, 409);
    }

    // Update only fields explicitly supplied by the client. This prevents
    // saving username from accidentally clearing avatar_url (or vice versa).
    const sets: string[] = [];
    const values: any[] = [];

    if (hasUsername) {
      sets.push("username = ?");
      values.push(username);
    }
    if (hasDisplayName || hasUsername) {
      sets.push("display_name = ?");
      values.push(displayName);
    }
    if (hasAvatar) {
      sets.push("avatar_url = ?");
      values.push(avatarUrl || null);
    }

    if (sets.length > 0) {
      values.push(String(auth.user.id));
      await env.DB.prepare(
        `UPDATE users SET ${sets.join(", ")} WHERE id = ?`
      ).bind(...values).run();
    }

    return json({ success: true, user: await getProfile(env, String(auth.user.id)) });
  } catch (error) {
    console.error("profile update error", error);
    return json({ success: false, error: "Gagal menyimpan profile." }, 500);
  }
}
