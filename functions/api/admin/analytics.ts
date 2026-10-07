import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { idrToUsdt } from "../../_lib/bonuses";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const summary = await context.env.DB.prepare(`
      SELECT
        COUNT(*) AS totalUsers,
        COALESCE(SUM(COALESCE(available_balance,0)),0) AS totalAvailableBalance,
        COALESCE(SUM(COALESCE(total_locked,0)),0) AS totalLockedBalance,
        COALESCE(SUM(COALESCE(sys_balance,0)),0) AS totalSysBalance,
        COALESCE(SUM(CASE WHEN COALESCE(email_verified,0)=1 THEN 1 ELSE 0 END),0) AS verifiedUsers,
        COALESCE(SUM(CASE WHEN COALESCE(wallet_address,'')<>'' THEN 1 ELSE 0 END),0) AS walletUsers,
        COALESCE(SUM(CASE WHEN lower(COALESCE(role,'USER'))='streamer' THEN 1 ELSE 0 END),0) AS streamerUsers
      FROM users
    `).first<any>();

    const roles = await context.env.DB.prepare(`
      SELECT COALESCE(role,'USER') AS role, COUNT(*) AS users,
             COALESCE(SUM(COALESCE(available_balance,0)),0) AS availableBalance,
             COALESCE(SUM(COALESCE(total_locked,0)),0) AS lockedBalance,
             COALESCE(SUM(COALESCE(sys_balance,0)),0) AS sysBalance
      FROM users
      GROUP BY COALESCE(role,'USER')
      ORDER BY users DESC
    `).all();

    const users = await context.env.DB.prepare(`
      SELECT
        CAST(id AS TEXT) AS id,
        COALESCE(username,'') AS username,
        COALESCE(email,'') AS email,
        COALESCE(wallet_address,'') AS walletAddress,
        COALESCE(available_balance,0) AS availableBalance,
        COALESCE(total_locked,0) AS lockedBalance,
        COALESCE(sys_balance,0) AS sysBalance,
        COALESCE(referral_count,0) AS referralCount,
        COALESCE(role,'USER') AS role,
        COALESCE(email_verified,0) AS emailVerified,
        created_at AS createdAt
      FROM users
      ORDER BY created_at DESC, id DESC
    `).all();

    return json({
      success:true,
      summary:{
        totalUsers:Number(summary?.totalUsers||0),
        totalAvailableBalance:idrToUsdt(Number(summary?.totalAvailableBalance||0)),
        totalLockedBalance:idrToUsdt(Number(summary?.totalLockedBalance||0)),
        totalSysBalance:Number(summary?.totalSysBalance||0),
        verifiedUsers:Number(summary?.verifiedUsers||0),
        walletUsers:Number(summary?.walletUsers||0),
        streamerUsers:Number(summary?.streamerUsers||0)
      },
      roles:(roles.results||[]).map((r:any)=>({
        role:String(r.role||'USER'),
        users:Number(r.users||0),
        availableBalance:idrToUsdt(Number(r.availableBalance||0)),
        lockedBalance:idrToUsdt(Number(r.lockedBalance||0)),
        sysBalance:Number(r.sysBalance||0)
      })),
      users:(users.results||[]).map((u:any)=>({
        ...u,
        id:String(u.id||''),
        username:String(u.username||''),
        email:String(u.email||''),
        walletAddress:String(u.walletAddress||''),
        availableBalance:idrToUsdt(Number(u.availableBalance||0)),
        lockedBalance:idrToUsdt(Number(u.lockedBalance||0)),
        sysBalance:Number(u.sysBalance||0),
        referralCount:Number(u.referralCount||0),
        emailVerified:Number(u.emailVerified||0),
        role:String(u.role||'USER')
      }))
    });
  } catch (error) {
    console.error("owner analytics error", error);
    return json({success:false,error:"Failed to load owner analytics."},500);
  }
};