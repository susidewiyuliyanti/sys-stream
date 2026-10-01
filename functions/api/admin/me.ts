import { Env, json } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  return json({success:true,admin:{authenticated:true}});
};
