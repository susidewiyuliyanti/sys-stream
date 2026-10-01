import { Env, json, readJson } from "../../_lib/db";
import { hashPassword, verifyPassword } from "../../_lib/auth";
import { adminSessionCookie, createAdminSession } from "../../_lib/admin";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    let body: { email?: string; password?: string };
    try {
      body = await readJson(context.request);
    } catch {
      return json({success:false,error:"Invalid request body."},400);
    }

    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    // Backward-compatible owner bootstrap: the existing ADMIN_API_KEY remains
    // available only as the owner-level bootstrap credential.
    if (context.env.ADMIN_API_KEY && password && password === context.env.ADMIN_API_KEY && !email) {
      const session = await createAdminSession(context.env, {
        id: null,
        email: "owner-api-key",
        displayName: "Owner",
        role: "OWNER",
        source: "api_key",
      });
      return new Response(JSON.stringify({success:true,admin:{displayName:"Owner",role:"OWNER"}}), {
        status:200,
        headers:{
          "Content-Type":"application/json; charset=utf-8",
          "Cache-Control":"no-store",
          "Set-Cookie":adminSessionCookie(session.token)
        }
      });
    }

    if (!email || !password) return json({success:false,error:"Email and password are required."},400);

    const admin = await context.env.DB.prepare(
      `SELECT id,email,display_name AS displayName,password_hash AS passwordHash,role
       FROM admin_users
       WHERE lower(email)=lower(?) AND active=1
       LIMIT 1`
    ).bind(email).first<any>();

    if (!admin || !(await verifyPassword(password, String(admin.passwordHash || "")))) {
      return json({success:false,error:"Invalid admin credentials."},401);
    }

    const role = String(admin.role || "ADMIN").toUpperCase() === "OWNER" ? "OWNER" : "ADMIN";
    const session = await createAdminSession(context.env, {
      id:String(admin.id),
      email:String(admin.email),
      displayName:String(admin.displayName || admin.email),
      role,
      source:"account",
    });

    return new Response(JSON.stringify({
      success:true,
      admin:{id:String(admin.id),email:String(admin.email),displayName:String(admin.displayName || ""),role}
    }), {
      status:200,
      headers:{
        "Content-Type":"application/json; charset=utf-8",
        "Cache-Control":"no-store",
        "Set-Cookie":adminSessionCookie(session.token)
      }
    });
  } catch (error) {
    console.error("admin login error", error);
    return json({success:false,error:"Admin authentication failed."},500);
  }
};
