import { Env, withDb } from "../../_lib/db";
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

    // $20 mining task eligibility: any lock amount qualifies, but the lock must
    // have a duration of at least 30 days and have completed 30 full days.
    const isMiningTask = /mining/i.test(String(task.title || "")) || /mining/i.test(taskKey);
    if (isMiningTask) {
      const lockRows = await withDb(context.env, client => client.query(
        "SELECT id, duration_days AS durationDays, start_date AS startDate, status FROM deposits WHERE user_id = $1 AND COALESCE(duration_days,0) >= 30",
        [String(auth.user.id)]
      ));
      const nowSeconds = Math.floor(Date.now() / 1000);
      const eligibleLock = lockRows.rows.some((lock: any) => {
        const status = String(lock.status || "").toUpperCase();
        if (["CANCELLED", "CANCELED", "REJECTED", "FAILED", "PENDING"].includes(status)) return false;
        const raw = lock.startDate;
        const startSeconds = typeof raw === "number"
          ? (raw > 2_000_000_000 ? Math.floor(raw / 1000) : Math.floor(raw))
          : Math.floor(Date.parse(String(raw || "")) / 1000);
        return Number.isFinite(startSeconds) && startSeconds > 0 && nowSeconds - startSeconds >= 30 * 86400;
      });
      if (!eligibleLock) {
        return response(context.request, {
          success: false,
          message: "Task Mining $20 USDT dapat diklaim setelah Blind Box Lock berdurasi minimal 30 hari telah berjalan penuh selama 30 hari. Jumlah lock bebas.",
          eligibleAfterDays: 30,
        }, 403);
      }
    }

    const isCheckin = String(taskKey).toLowerCase() === "checkin" || /check.?in/i.test(String(task.title || ""));
    if (!isCheckin && !link) {
      return response(context.request, { success: false, message: "Bukti wajib diisi untuk task ini" }, 400);
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