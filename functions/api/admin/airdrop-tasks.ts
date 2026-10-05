import { Env, json, readJson } from "../../_lib/db";
import { requireAdmin } from "../../_lib/admin";
import { notifyAdmins } from "../../_lib/admin-notifications";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  const rows = await context.env.DB.prepare(
    `SELECT id,title,description,category,reward_points AS rewardPoints,active,created_at AS createdAt
     FROM airdrop_tasks ORDER BY id DESC`
  ).all();
  return json({success:true,tasks:rows.results||[]});
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  try {
    const body=await readJson<{title?:string;description?:string;category?:string;rewardPoints?:number;active?:boolean}>(context.request);
    const title=String(body.title||"").trim(), description=String(body.description||"").trim(), category=String(body.category||"social").trim();
    const rewardPoints=Number(body.rewardPoints??0);
    if(!title) return json({success:false,error:"Nama task wajib diisi."},400);
    if(title.length>160||description.length>2000||category.length>60) return json({success:false,error:"Data task terlalu panjang."},400);
    if(!Number.isInteger(rewardPoints)||rewardPoints<0||rewardPoints>1000000000) return json({success:false,error:"Reward points tidak valid."},400);
    const r=await context.env.DB.prepare(
      `INSERT INTO airdrop_tasks(title,description,category,reward_points,active) VALUES(?,?,?,?,?)`
    ).bind(title,description,category,rewardPoints,body.active===false?0:1).run();
    await notifyAdmins(context.env,{type:"airdrop.task.created",title:"Airdrop task created",message:`Task "${title}" was created by ${auth.identity.displayName || "Admin"}.`,severity:"success",entityType:"airdrop_task",entityId:r.meta.last_row_id,adminUserId:auth.identity.id});
    return json({success:true,id:r.meta.last_row_id},201);
  } catch(error){ console.error("admin airdrop task create",error); return json({success:false,error:"Gagal membuat task."},500); }
};

export const onRequestPatch: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  try {
    const body=await readJson<{id?:number;title?:string;description?:string;category?:string;rewardPoints?:number;active?:boolean}>(context.request);
    const id=Number(body.id);
    if(!Number.isInteger(id)||id<=0) return json({success:false,error:"Task ID tidak valid."},400);
    const existing=await context.env.DB.prepare("SELECT id FROM airdrop_tasks WHERE id=?").bind(id).first();
    if(!existing) return json({success:false,error:"Task tidak ditemukan."},404);
    const title=String(body.title||"").trim(), description=String(body.description||"").trim(), category=String(body.category||"social").trim();
    const rewardPoints=Number(body.rewardPoints??0);
    if(!title||title.length>160||description.length>2000||category.length>60||!Number.isInteger(rewardPoints)||rewardPoints<0||rewardPoints>1000000000) return json({success:false,error:"Data task tidak valid."},400);
    await context.env.DB.prepare(
      `UPDATE airdrop_tasks SET title=?,description=?,category=?,reward_points=?,active=? WHERE id=?`
    ).bind(title,description,category,rewardPoints,body.active===false?0:1,id).run();
    await notifyAdmins(context.env,{type:"airdrop.task.updated",title:"Airdrop task updated",message:`Task "${title}" was updated by ${auth.identity.displayName || "Admin"}.`,severity:"info",entityType:"airdrop_task",entityId:id,adminUserId:auth.identity.id});
    return json({success:true});
  } catch(error){ console.error("admin airdrop task update",error); return json({success:false,error:"Gagal memperbarui task."},500); }
};

export const onRequestDelete: PagesFunction<Env> = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (!auth.ok) return auth.response;
  try {
    const id=Number(new URL(context.request.url).searchParams.get("id"));
    if(!Number.isInteger(id)||id<=0) return json({success:false,error:"Task ID tidak valid."},400);
    const used=await context.env.DB.prepare("SELECT COUNT(*) AS count FROM airdrop_submissions WHERE task_id=?").bind(id).first<any>();
    if(Number(used?.count||0)>0) return json({success:false,error:"Task sudah memiliki submission. Nonaktifkan task agar riwayat produksi tetap aman."},409);
    await context.env.DB.prepare("DELETE FROM airdrop_tasks WHERE id=?").bind(id).run();
    await notifyAdmins(context.env,{type:"airdrop.task.deleted",title:"Airdrop task deleted",message:`Airdrop task #${id} was deleted by ${auth.identity.displayName || "Admin"}.`,severity:"warning",entityType:"airdrop_task",entityId:id,adminUserId:auth.identity.id});
    return json({success:true});
  } catch(error){ console.error("admin airdrop task delete",error); return json({success:false,error:"Gagal menghapus task."},500); }
};