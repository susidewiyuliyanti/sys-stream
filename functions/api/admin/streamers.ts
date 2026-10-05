import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const result = await context.env.DB.prepare(`
      SELECT id, username, email, wallet_address AS walletAddress,
             COALESCE(role,'user') AS role, created_at AS createdAt
      FROM users
      WHERE LOWER(COALESCE(role,'user')) = 'streamer'
      ORDER BY created_at DESC
      LIMIT 500
    `).all();

    return json({ success:true, streamers:result.results || [] });
  } catch {
    return json({ success:false, error:"Failed to load streamers." },500);
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const body = await context.request.json() as any;
    const userId = String(body?.userId || "").trim();
    const action = String(body?.action || "promote").toLowerCase();

    if (!userId) return json({ success:false, error:"User ID wajib dipilih." },400);
    if (action !== "promote" && action !== "remove") {
      return json({ success:false, error:"Action streamer tidak valid." },400);
    }

    const user = await context.env.DB.prepare(
      "SELECT id, username, email, wallet_address AS walletAddress, COALESCE(role,'user') AS role FROM users WHERE id = ? LIMIT 1"
    ).bind(userId).first<any>();

    if (!user) return json({ success:false, error:"User tidak ditemukan." },404);

    const nextRole = action === "promote" ? "streamer" : "user";
    await context.env.DB.prepare("UPDATE users SET role = ? WHERE id = ?")
      .bind(nextRole,userId).run();

    await notifyAdmins(context.env,{type:action==="promote"?"streamer.promoted":"streamer.removed",title:action==="promote"?"Streamer promoted":"Streamer status removed",message:`${user.username || user.email || userId} was ${action==="promote"?"promoted to Official Streamer":"removed from Official Streamer"} by ${auth.identity.displayName || "Admin"}.`,severity:"info",entityType:"user",entityId:userId,adminUserId:auth.identity.id});
    return json({
      success:true,
      streamer:{
        id:String(user.id),
        username:String(user.username || ""),
        email:String(user.email || ""),
        walletAddress:String(user.walletAddress || ""),
        role:nextRole
      }
    });
  } catch (error:any) {
    return json({ success:false, error:error?.message || "Gagal mengubah status streamer." },500);
  }
};
