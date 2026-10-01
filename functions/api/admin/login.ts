import { Env, json, readJson } from "../../_lib/db";
import { adminSessionCookie, createAdminSession } from "../../_lib/admin";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.ADMIN_API_KEY) {
    return json({success:false,error:"Admin authentication is not configured."},503);
  }

  let body: {password?: string};
  try {
    body = await readJson(context.request);
  } catch {
    return json({success:false,error:"Invalid request body."},400);
  }

  const password = String(body.password || "");
  if (!password || password !== context.env.ADMIN_API_KEY) {
    return json({success:false,error:"Invalid admin credentials."},401);
  }

  const session = await createAdminSession(context.env);
  return new Response(JSON.stringify({success:true}), {
    status:200,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      "Set-Cookie":adminSessionCookie(session.token)
    }
  });
};
