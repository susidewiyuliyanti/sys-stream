import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth=await requireAuth(request,env);
  if(!auth.ok) return auth.response;
  return json({success:true,user:auth.user});
}
