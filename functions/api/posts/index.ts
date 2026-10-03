import { Env, json, readJson } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

async function ensurePosts(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    post_type TEXT NOT NULL DEFAULT 'text',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC, id DESC)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_posts_user ON posts(user_id, created_at DESC)").run();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    await ensurePosts(env);
    const rows = await env.DB.prepare(`
      SELECT p.id, p.content, p.media_url AS mediaUrl, p.post_type AS postType,
             p.created_at AS createdAt, p.updated_at AS updatedAt,
             u.id AS userId, u.username, u.display_name AS displayName, u.avatar_url AS avatarUrl
      FROM posts p
      JOIN users u ON u.id = p.user_id
      ORDER BY p.id DESC
      LIMIT 50
    `).all();
    return json({ success: true, posts: rows.results || [] });
  } catch (error) {
    console.error("posts get error", error);
    return json({ success: false, error: "Gagal mengambil postingan." }, 500);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    await ensurePosts(env);
    const body = await readJson<{ content?: string; mediaUrl?: string; postType?: string }>(request);
    const content = String(body?.content || "").trim();
    const mediaUrl = String(body?.mediaUrl || "").trim() || null;
    const postType = body?.postType === "media" ? "media" : "text";

    if (!content && !mediaUrl) {
      return json({ success: false, error: "Tulisan atau media wajib diisi." }, 400);
    }
    if (content.length > 5000) {
      return json({ success: false, error: "Tulisan maksimal 5.000 karakter." }, 400);
    }
    if (mediaUrl && mediaUrl.length > 2048) {
      return json({ success: false, error: "URL media terlalu panjang." }, 400);
    }

    const result = await env.DB.prepare(`
      INSERT INTO posts(user_id, content, media_url, post_type)
      VALUES(?,?,?,?)
    `).bind(auth.user.id, content, mediaUrl, postType).run();

    const id = Number(result.meta?.last_row_id || 0);
    const post = await env.DB.prepare(`
      SELECT p.id, p.content, p.media_url AS mediaUrl, p.post_type AS postType,
             p.created_at AS createdAt, p.updated_at AS updatedAt,
             u.id AS userId, u.username, u.display_name AS displayName, u.avatar_url AS avatarUrl
      FROM posts p JOIN users u ON u.id = p.user_id WHERE p.id = ? LIMIT 1
    `).bind(id).first<any>();

    return json({ success: true, post }, 201);
  } catch (error) {
    console.error("posts post error", error);
    return json({ success: false, error: "Gagal membuat postingan." }, 500);
  }
}
