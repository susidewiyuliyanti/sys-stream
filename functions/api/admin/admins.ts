import { Env, json, readJson } from "../../_lib/db";
import { hashPassword } from "../../_lib/auth";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  const rows = await context.env.DB.prepare(
    `SELECT id,email,display_name AS displayName,role,active,created_at AS createdAt,updated_at AS updatedAt
     FROM admin_users ORDER BY created_at DESC LIMIT 200`
  ).all();
  return json({success:true,admins:rows.results || [],currentAdmin:auth.identity});
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  if (auth.identity.role !== "OWNER") return json({success:false,error:"Only the owner can add or manage admin accounts."},403);

  let stage = "REQUEST";
  try {
    const body = await readJson<{email?:string;displayName?:string;password?:string;role?:string}>(context.request);
    const email = String(body.email || "").trim().toLowerCase();
    const displayName = String(body.displayName || "").trim();
    const password = String(body.password || "");
    const role = String(body.role || "ADMIN").toUpperCase() === "OWNER" ? "OWNER" : "ADMIN";

    stage = "VALIDATE";
    if (!/^\S+@\S+\.\S+$/.test(email)) return json({success:false,error:"Email admin tidak valid."},400);
    if (displayName.length < 2 || displayName.length > 80) return json({success:false,error:"Nama admin 2-80 karakter."},400);
    if (password.length < 8) return json({success:false,error:"Password admin minimal 8 karakter."},400);

    stage = "CHECK_EMAIL";
    const existing = await context.env.DB.prepare("SELECT id FROM admin_users WHERE lower(email)=lower(?) LIMIT 1").bind(email).first();
    if (existing) return json({success:false,error:"Email admin sudah terdaftar."},409);

    const now = Math.floor(Date.now()/1000);
    const id = crypto.randomUUID();

    stage = "HASH_PASSWORD";
    const passwordHash = await hashPassword(password);

    stage = "INSERT_ADMIN";
    const insertResult = await context.env.DB.prepare(
      `INSERT INTO admin_users(id,sales_id,email,display_name,password_hash,role,active,created_at,updated_at)
       VALUES(?,?,?,?,?,?,1,?,?)`
    ).bind(id,salesId,email,displayName,passwordHash,role,now,now).run();

    if (Number(insertResult.meta?.changes || 0) !== 1) {
      throw new Error("ADMIN_INSERT_NO_CHANGE");
    }

    stage = "NOTIFY";
    await notifyAdmins(context.env,{type:"admin.created",title:"New admin account",message:`Admin ${displayName} (${email}) was created by ${auth.identity.displayName || "Owner"}.`,severity:"success",entityType:"admin",entityId:id,adminUserId:auth.identity.id});
    return json({success:true,admin:{id,email,displayName,role,active:1,createdAt:now}},201);
  } catch (error) {
    console.error("create admin error", {stage, error:String(error)});
    const code = stage === "HASH_PASSWORD" ? "ADMIN_HASH_FAILED"
      : stage === "INSERT_ADMIN" ? "ADMIN_DB_INSERT_FAILED"
      : stage === "CHECK_EMAIL" ? "ADMIN_DB_CHECK_FAILED"
      : "ADMIN_CREATE_FAILED";
    return json({success:false,error:"Gagal membuat akun admin.",code},500);
  }
};
