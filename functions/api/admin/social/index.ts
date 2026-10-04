import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";

const PLATFORMS = [
  "tiktok",
  "youtube",
  "instagram",
  "x",
  "telegram",
  "discord",
];

export async function onRequestGet({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  const result = await env.DB.prepare(
    `SELECT id, platform, account_id AS accountId,
            account_name AS accountName, status, scopes,
            connected_at AS connectedAt, updated_at AS updatedAt
     FROM social_connections
     ORDER BY platform ASC`
  ).all();

  const existing = new Map(
    (result.results || []).map((row: any) => [
      String(row.platform),
      row,
    ]),
  );

  const connections = PLATFORMS.map((platform) => {
    const row = existing.get(platform) as any;

    return (
      row || {
        id: null,
        platform,
        accountId: null,
        accountName: null,
        status: "DISCONNECTED",
        scopes: null,
        connectedAt: null,
        updatedAt: null,
      }
    );
  });

  return json({
    success: true,
    connections,
  });
}

export async function onRequestPost({
  request,
  env,
}: {
  request: Request;
  env: Env;
}) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;

  if (auth.identity.role !== "OWNER") {
    return json(
      {
        success: false,
        error: "Hanya OWNER yang dapat mengubah koneksi social media.",
      },
      403,
    );
  }

  const body = await request.json().catch(() => ({} as any));
  const platform = String(body?.platform || "").trim().toLowerCase();
  const action = String(body?.action || "").trim().toLowerCase();

  if (!PLATFORMS.includes(platform)) {
    return json(
      {
        success: false,
        error: "Platform social media tidak valid.",
      },
      400,
    );
  }

  if (action === "disconnect") {
    await env.DB.prepare(
      `DELETE FROM social_connections WHERE platform = ?`,
    )
      .bind(platform)
      .run();

    return json({
      success: true,
      platform,
      status: "DISCONNECTED",
    });
  }

  if (action !== "prepare") {
    return json(
      {
        success: false,
        error: "Action tidak valid. Gunakan prepare atau disconnect.",
      },
      400,
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO social_connections
      (id, platform, status, updated_at)
     VALUES (?, ?, 'PENDING', ?)
     ON CONFLICT(platform, account_id)
     DO UPDATE SET status='PENDING', updated_at=excluded.updated_at`
  )
    .bind(id, platform, now)
    .run();

  return json({
    success: true,
    platform,
    status: "PENDING",
    message:
      "Connector siap untuk OAuth resmi. OAuth provider akan ditambahkan pada tahap berikutnya.",
  });
}
