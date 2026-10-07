import { Env, json, readJson } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";
import { usdtToIdr } from "../../_lib/bonuses";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  const result = await context.env.DB.prepare(
    `SELECT j.id,j.user_id AS userId,u.username,u.email,j.amount,j.currency,j.note,
            j.admin_user_id AS adminUserId,j.created_at AS createdAt,
            COALESCE(a.display_name,'Owner') AS adminName
     FROM jackpot_grants j
     LEFT JOIN users u ON u.id=j.user_id
     LEFT JOIN admin_users a ON a.id=j.admin_user_id
     ORDER BY j.created_at DESC LIMIT 200`
  ).all();
  return json({success:true,grants:result.results || []});
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;

  try {
    const body = await readJson<{userId?:string;amount?:number;note?:string}>(context.request);
    const userId = String(body.userId || "").trim();
    const amount = Number(body.amount);
    const note = String(body.note || "").trim();

    if (!userId) return json({success:false,error:"User tujuan wajib dipilih."},400);
    if (!Number.isFinite(amount) || amount <= 0) return json({success:false,error:"Nilai jackpot harus lebih besar dari 0."},400);
    if (amount > 1000000000) return json({success:false,error:"Nilai terlalu besar untuk satu grant. Pecah menjadi grant yang terkontrol."},400);
    if (note.length > 500) return json({success:false,error:"Catatan maksimal 500 karakter."},400);

    const user = await context.env.DB.prepare(
      "SELECT id,username,email FROM users WHERE id=? LIMIT 1"
    ).bind(userId).first<any>();
    if (!user) return json({success:false,error:"User tidak ditemukan."},404);

    const now = Math.floor(Date.now()/1000);
    const grantId = crypto.randomUUID();
    const amountIdr = usdtToIdr(amount);

    await context.env.DB.batch([
      context.env.DB.prepare(
        `INSERT INTO jackpot_grants(id,user_id,amount,currency,note,admin_user_id,created_at)
         VALUES(?,?,?,'USDT',?,?,?)`
      ).bind(grantId,userId,amount,note || null,auth.identity.id,now),
      context.env.DB.prepare(
        "UPDATE users SET available_balance = COALESCE(available_balance,0) + ?, balance = COALESCE(available_balance,0) + ? WHERE id=?"
      ).bind(amountIdr, amountIdr, userId),
    ]);

    await notifyAdmins(context.env,{type:"jackpot.grant",title:"Jackpot grant created",message:`${auth.identity.displayName || "Admin"} granted ${amount} USDT to ${user.username || user.email || userId}.`,severity:"success",entityType:"jackpot_grant",entityId:grantId,adminUserId:auth.identity.id});
    return json({
      success:true,
      grant:{id:grantId,userId,username:user.username,email:user.email,amount,currency:"USDT",note,createdAt:now,adminName:auth.identity.displayName}
    },201);
  } catch (error) {
    console.error("jackpot grant error", error);
    return json({success:false,error:"Jackpot grant gagal diproses."},500);
  }
};
