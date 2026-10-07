import { Env } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";
import { notifyAdmins } from "../../_lib/admin-notifications";

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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Vary": "Origin",
    },
  });
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const auth = await requireAuth(context.request, context.env);
  if (!auth.ok) return response(context.request, { success: false, message: "Login diperlukan." }, 401);

  const db = context.env.DB;
  try {
    const body = await context.request.json().catch(() => ({}));
    const wallet = String(auth.user.walletAddress || "").trim().toLowerCase();
    const taskKey = String(body.taskKey || "").trim();
    const rawTaskId = String(body.taskId || "").trim();
    const link = String(body.link || "").trim();
    const socialPlatform = String(body.socialPlatform || "").trim().toLowerCase();
    const socialAccount = String(body.socialAccount || "").trim();

    if (!wallet || (!taskKey && !rawTaskId)) {
      return response(context.request, { success: false, message: "Wallet dan task wajib diisi" }, 400);
    }

    let task: any = null;
    if (/^\d+$/.test(rawTaskId)) {
      task = await db.prepare("SELECT id,title,reward_points FROM airdrop_tasks WHERE id=? AND active=1").bind(Number(rawTaskId)).first();
    }
    if (!task && taskKey) {
      task = await db.prepare("SELECT id,title,reward_points FROM airdrop_tasks WHERE active=1 AND lower(category)=lower(?) LIMIT 1").bind(taskKey).first();
    }
    if (!task && taskKey) {
      task = await db.prepare("SELECT id,title,reward_points FROM airdrop_tasks WHERE active=1 AND lower(title) LIKE ? LIMIT 1").bind("%" + taskKey.toLowerCase() + "%").first();
    }
    if (!task) return response(context.request, { success: false, message: "Task tidak ditemukan atau belum diaktifkan" }, 404);

    const isCheckin = String(taskKey).toLowerCase() === "checkin" || /check.?in/i.test(String(task.title || ""));
    if (!isCheckin && !link) {
      return response(context.request, { success: false, message: "Bukti wajib diisi untuk task ini" }, 400);
    }

    // Never trust a client-supplied follow flag. The gate is derived only
    // from server-side verified platform records.
    await db.prepare("CREATE TABLE IF NOT EXISTS airdrop_follow_status (wallet_address TEXT NOT NULL, platform TEXT NOT NULL, confirmed INTEGER NOT NULL DEFAULT 0, verification_method TEXT, verified_at TEXT, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(wallet_address, platform))").run();
    try { await db.prepare("ALTER TABLE airdrop_follow_status ADD COLUMN verification_method TEXT").run(); } catch {}
    try { await db.prepare("ALTER TABLE airdrop_follow_status ADD COLUMN verified_at TEXT").run(); } catch {}

    const requiredPlatforms = ["instagram","youtube","telegram","facebook","discord","twitter"];
    const verifiedRows = await db.prepare(
      "SELECT platform,confirmed,verification_method FROM airdrop_follow_status WHERE wallet_address=?"
    ).bind(wallet).all();
    const verifiedStatus:Record<string,boolean> = {};
    for (const row of (verifiedRows.results || []) as any[]) {
      verifiedStatus[String(row.platform)] =
        Number(row.confirmed || 0) === 1 && Boolean(String(row.verification_method || "").trim());
    }
    const allFollowed = requiredPlatforms.every(platform => verifiedStatus[platform] === true);

    if (!allFollowed) {
      return response(context.request, {
        success: false,
        message: "Hubungkan akun sosial dan selesaikan verifikasi follow resmi pada semua platform terlebih dahulu."
      }, 403);
    }

    const socialPlatforms = new Set(["tiktok","instagram","youtube","shorts","twitter","facebook","telegram","discord","social"]);
    const normalizedCategory = String(task.category || taskKey || "").toLowerCase();
    const requiresFollow = !isCheckin && (socialPlatforms.has(normalizedCategory) || socialPlatforms.has(String(taskKey).toLowerCase()));
    if (requiresFollow) {
      if (!socialPlatform || !socialAccount || !verifiedStatus[socialPlatform]) {
        return response(context.request, { success: false, message: "Follow untuk platform task ini belum diverifikasi oleh server." }, 400);
      }
      await db.prepare(`CREATE TABLE IF NOT EXISTS airdrop_social_accounts (wallet_address TEXT NOT NULL, platform TEXT NOT NULL, account TEXT NOT NULL, updated_at TEXT DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY(wallet_address, platform))`).run();
      const connected = await db.prepare("SELECT account FROM airdrop_social_accounts WHERE wallet_address=? AND platform=?").bind(wallet, socialPlatform).first<{account:string}>();
      if (!connected || String(connected.account || "").trim() !== socialAccount) {
        return response(context.request, { success: false, message: "Akun media sosial belum terhubung untuk platform task ini." }, 400);
      }
    }
    if (isCheckin) {
      // Check-in is repeatable once per calendar day, unlike normal campaign tasks.
      const existingToday = await db.prepare(`
        SELECT id,status
        FROM airdrop_submissions
        WHERE wallet_address=? AND task_id=?
          AND date(created_at)=date('now')
        ORDER BY id DESC LIMIT 1
      `).bind(wallet, task.id).first<{ id: number; status: string }>();
      if (existingToday) {
        return response(context.request, { success: false, message: "Check-in hari ini sudah dilakukan.", status: existingToday.status }, 409);
      }
    } else {
      // Every normal campaign task is single-submit per user, regardless of
      // whether the previous submission is pending, approved, or rejected.
      const existing = await db.prepare(
        "SELECT id,status FROM airdrop_submissions WHERE wallet_address=? AND task_id=? ORDER BY id ASC LIMIT 1"
      ).bind(wallet, task.id).first<{ id: number; status: string }>();
      if (existing) {
        return response(context.request, {
          success: false,
          message: "Task ini hanya dapat dikirim satu kali untuk setiap user.",
          status: existing.status
        }, 409);
      }
    }

    if (isCheckin) {
      const rewardPoints = Number(task.reward_points || 0);
      const inserted = await db.prepare(
        `INSERT INTO airdrop_submissions (wallet_address,email,task_id,evidence_link,status,reward_points)
         SELECT ?,?,?,?,?,?
         WHERE NOT EXISTS (
           SELECT 1 FROM airdrop_submissions
           WHERE wallet_address=? AND task_id=? AND date(created_at)=date('now')
         )`
      ).bind(wallet, wallet, task.id, link || "daily-checkin", "APPROVED", rewardPoints, wallet, task.id).run();

      if (!inserted.meta?.changes) {
        return response(context.request, { success: false, message: "Check-in hari ini sudah dilakukan.", status: "APPROVED" }, 409);
      }

      await db.prepare(
        "INSERT INTO airdrop_points_history (wallet_address,points,reason) VALUES (?,?,?)"
      ).bind(wallet, rewardPoints, `Daily Check-in #${task.id}`).run();

      return response(context.request, {
        success: true,
        message: "Check-in berhasil. Reward points langsung ditambahkan.",
        status: "APPROVED",
        taskId: task.id,
        rewardPoints,
      });
    }

    const inserted = await db.prepare("INSERT INTO airdrop_submissions (wallet_address,email,task_id,evidence_link,status,reward_points) VALUES (?,?,?,?,?,?)").bind(wallet, wallet, task.id, link, "PENDING", Number(task.reward_points || 0)).run();
    await notifyAdmins(context.env,{type:"airdrop.submission",title:"New airdrop submission",message:`Wallet ${wallet} submitted "${task.title}" for review.`,severity:"warning",entityType:"airdrop_submission",entityId:inserted.meta?.last_row_id});

    return response(context.request, { success: true, message: "Submission berhasil dan menunggu review", status: "PENDING", taskId: task.id });
  } catch (error) {
    return response(context.request, { success: false, error: String(error) }, 500);
  }
}