import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";

type SubmissionAction = "APPROVED" | "REJECTED";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const rows = await context.env.DB.prepare(
      `SELECT
         s.id,
         s.wallet_address AS walletAddress,
         s.task_id AS taskId,
         t.title AS taskTitle,
         t.category AS category,
         s.evidence_link AS evidenceLink,
         s.status AS status,
         s.reward_points AS rewardPoints,
         s.created_at AS createdAt
       FROM airdrop_submissions s
       LEFT JOIN airdrop_tasks t ON t.id=s.task_id
       ORDER BY
         CASE WHEN UPPER(s.status)='PENDING' THEN 0 ELSE 1 END,
         s.id DESC
       LIMIT 500`
    ).all();

    return json({ success: true, submissions: rows.results || [] });
  } catch (error) {
    console.error("admin airdrop submissions list", error);
    return json({ success: false, error: "Gagal memuat submission Airdrop." }, 500);
  }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const body = await context.request.json().catch(() => ({}));
    const id = Number(body.id);
    const action = String(body.action || "").trim().toUpperCase() as SubmissionAction;
    const note = String(body.note || "").trim();

    if (!Number.isInteger(id) || id <= 0) {
      return json({ success: false, error: "Submission ID tidak valid." }, 400);
    }
    if (action !== "APPROVED" && action !== "REJECTED") {
      return json({ success: false, error: "Action tidak valid." }, 400);
    }
    if (note.length > 500) {
      return json({ success: false, error: "Catatan terlalu panjang." }, 400);
    }

    const existing = await context.env.DB.prepare(
      `SELECT id,wallet_address AS walletAddress,task_id AS taskId,status,reward_points AS rewardPoints
       FROM airdrop_submissions WHERE id=?`
    ).bind(id).first<any>();

    if (!existing) {
      return json({ success: false, error: "Submission tidak ditemukan." }, 404);
    }

    const current = String(existing.status || "").toUpperCase();
    if (current !== "PENDING") {
      return json({
        success: false,
        error: `Submission sudah diproses dengan status ${current || "UNKNOWN"}.`
      }, 409);
    }

    const rewardPoints = Number(existing.rewardPoints || 0);
    const wallet = String(existing.walletAddress || "").trim().toLowerCase();

    await context.env.DB.prepare(
      "UPDATE airdrop_submissions SET status=? WHERE id=? AND UPPER(status)='PENDING'"
    ).bind(action, id).run();

    await notifyAdmins(context.env, {
      type: action === "APPROVED" ? "airdrop.submission.approved" : "airdrop.submission.rejected",
      title: action === "APPROVED" ? "Airdrop submission approved" : "Airdrop submission rejected",
      message: `Submission #${id} for wallet ${wallet} was ${action.toLowerCase()} by ${auth.identity.displayName || "Admin"}.${note ? ` Note: ${note}` : ""}`,
      severity: action === "APPROVED" ? "success" : "warning",
      entityType: "airdrop_submission",
      entityId: id,
      adminUserId: auth.identity.id
    });

    return json({
      success: true,
      status: action,
      rewardPoints: action === "APPROVED" ? rewardPoints : 0,
      walletAddress: wallet
    });
  } catch (error) {
    console.error("admin airdrop submission review", error);
    return json({ success: false, error: "Gagal memproses submission Airdrop." }, 500);
  }
};
