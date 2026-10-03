import { Env } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

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

    if (!wallet || (!taskKey && !rawTaskId) || !link) {
      return response(context.request, { success: false, message: "Wallet, task, dan bukti wajib diisi" }, 400);
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

    const existing = await db.prepare("SELECT id,status FROM airdrop_submissions WHERE wallet_address=? AND task_id=? AND status IN ('PENDING','APPROVED') ORDER BY id DESC LIMIT 1").bind(wallet, task.id).first<{ id: number; status: string }>();
    if (existing) return response(context.request, { success: false, message: "Task ini sudah pernah diajukan untuk wallet tersebut", status: existing.status }, 409);

    await db.prepare("INSERT INTO airdrop_submissions (wallet_address,email,task_id,evidence_link,status,reward_points) VALUES (?,?,?,?,?,?)").bind(wallet, wallet, task.id, link, "PENDING", Number(task.reward_points || 0)).run();

    return response(context.request, { success: true, message: "Submission berhasil dan menunggu review", status: "PENDING", taskId: task.id });
  } catch (error) {
    return response(context.request, { success: false, error: String(error) }, 500);
  }
}