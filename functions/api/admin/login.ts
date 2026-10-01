import { Env, json, readJson } from "../../_lib/db";
import { createAdminSession } from "../../_lib/admin";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  if (!context.env.ADMIN_API_KEY) return json({success:false,error:"Admin authentication is not configured."},503);
  const body = await readJson<{password?:string}>(context.request);
  const password = String(body.password || "");
  if (!password || password !== context.env.ADMIN_API_KEY) {
    return json({success:false,error:"Invalid admin credentials."},401);
  }
  const token = await createAdminSession(context.env);
  return json({success:true,token});
};
