import { Env, json } from "../../_lib/db";
import { requireAdmin, revokeAdminSession, clearAdminSessionCookie } from "../../_lib/admin";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth.ok) await revokeAdminSession(context.env, auth.token);
  return new Response(JSON.stringify({success:true}), {
    status:200,
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Cache-Control":"no-store",
      "Set-Cookie":clearAdminSessionCookie()
    }
  });
};
