import { Env, json } from "../../../_lib/db";
import { requireAdmin } from "../../../_lib/admin";

function clean(v:unknown,max=200000){return String(v??"").trim().slice(0,max);}
function emailOk(v:string){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);}
function mapCampaign(r:any){return {id:String(r.id),name:String(r.name),subject:String(r.subject),fromEmail:String(r.from_email),fromName:String(r.from_name),audienceType:String(r.audience_type),status:String(r.status),totalRecipients:Number(r.total_recipients||0),sentCount:Number(r.sent_count||0),failedCount:Number(r.failed_count||0),createdAt:Number(r.created_at),updatedAt:Number(r.updated_at),sentAt:r.sent_at?Number(r.sent_at):null};}
function parseRecipients(raw:string){
 const seen=new Set<string>(); const out:{email:string;name:string|null}[]=[];
 for(const token of raw.split(/[\n,;]+/)){const value=token.trim();if(!value)continue;const match=value.match(/^(.*?)\s*<([^<>]+)>$/);const email=(match?match[2]:value).trim().toLowerCase();const name=match?match[1].trim().replace(/^["']|["']$/g,""):null;if(!emailOk(email)||seen.has(email))continue;seen.add(email);out.push({email,name:name||null});}
 return out;
}
export async function onRequestGet({request,env}:{request:Request;env:Env}){
 const auth=await requireAdmin(request,env);if(!auth.ok)return auth.response;
 const url=new URL(request.url),id=clean(url.searchParams.get("id"),100);
 if(id){const c=await env.DB.prepare("SELECT * FROM email_campaigns WHERE id=? LIMIT 1").bind(id).first<any>();if(!c)return json({success:false,error:"Campaign tidak ditemukan."},404);const r=await env.DB.prepare("SELECT id,email,name,status,resend_id,error,sent_at FROM email_campaign_recipients WHERE campaign_id=? ORDER BY created_at ASC").bind(id).all();return json({success:true,campaign:mapCampaign(c),recipients:r.results||[]});}
 const rows=await env.DB.prepare("SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT 100").all();return json({success:true,campaigns:(rows.results||[]).map(mapCampaign)});
}
export async function onRequestPost({request,env}:{request:Request;env:Env}){
 const auth=await requireAdmin(request,env);if(!auth.ok)return auth.response;
 const body:any=await request.json().catch(()=>({}));const action=clean(body?.action,30).toLowerCase();const apiKey=String(env.RESEND_API_KEY||"").trim();
 if(action==="test"){
  const recipient=clean(body?.recipient,320).toLowerCase(),subject=clean(body?.subject,998),html=clean(body?.html,500000),text=clean(body?.text,100000),fromEmail=clean(body?.fromEmail,320).toLowerCase(),fromName=clean(body?.fromName,100);
  if(!emailOk(recipient)||!emailOk(fromEmail)||!subject||!html)return json({success:false,error:"Sender, penerima, subject dan isi email wajib diisi."},400);
  if(!apiKey)return json({success:false,error:"RESEND_API_KEY belum terpasang."},503);
  const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify({from:fromName+" <"+fromEmail+">",to:[recipient],subject,html,text:text||undefined})});
  const data:any=await response.json().catch(()=>({}));if(!response.ok)return json({success:false,error:String(data?.message||"Resend menolak test email.")},502);return json({success:true,message:"Test email berhasil dikirim.",resendId:data?.id||null});
 }
 if(action!=="create"&&action!=="send")return json({success:false,error:"Action tidak valid."},400);
 if(action==="create"){
  const name=clean(body?.name,160),subject=clean(body?.subject,998),html=clean(body?.html,500000),text=clean(body?.text,100000),fromEmail=clean(body?.fromEmail,320).toLowerCase(),fromName=clean(body?.fromName,100),audienceType=clean(body?.audienceType,20).toLowerCase();
  if(!name||!subject||!html||!emailOk(fromEmail)||!fromName)return json({success:false,error:"Nama campaign, sender, subject dan isi email wajib diisi."},400);
  if(!["manual","users"].includes(audienceType))return json({success:false,error:"Audience tidak valid."},400);
  let recipients:{email:string;name:string|null}[]=[];
  if(audienceType==="users"){const rows=await env.DB.prepare("SELECT email,display_name FROM users WHERE email IS NOT NULL AND TRIM(email)<>''").all<any>();const seen=new Set<string>();for(const r of rows.results||[]){const email=String(r.email||"").trim().toLowerCase();if(emailOk(email)&&!seen.has(email)){seen.add(email);recipients.push({email,name:r.display_name?String(r.display_name):null});}}}else recipients=parseRecipients(clean(body?.recipients,300000));
  if(!recipients.length)return json({success:false,error:"Belum ada penerima email yang valid."},400);
  if(recipients.length>500)return json({success:false,error:"Maksimal 500 penerima per campaign."},400);
  const sender=await env.DB.prepare("SELECT email,display_name,active FROM email_senders WHERE email=? LIMIT 1").bind(fromEmail).first<any>();if(!sender||Number(sender.active)!==1)return json({success:false,error:"Sender tidak ditemukan atau sedang nonaktif."},400);
  const now=Math.floor(Date.now()/1000),id=crypto.randomUUID();await env.DB.prepare("INSERT INTO email_campaigns (id,name,subject,from_email,from_name,html_body,text_body,audience_type,status,total_recipients,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(id,name,subject,fromEmail,fromName,html,text||"",audienceType,"draft",recipients.length,auth.identity.id||auth.identity.email,now,now).run();
  for(const r of recipients)await env.DB.prepare("INSERT INTO email_campaign_recipients (id,campaign_id,email,name,status,created_at,updated_at) VALUES (?,?,?,?,?,?,?)").bind(crypto.randomUUID(),id,r.email,r.name,"pending",now,now).run();
  return json({success:true,campaign:{id,name,totalRecipients:recipients.length,status:"draft"}},201);
 }
 const id=clean(body?.id,100);if(!id)return json({success:false,error:"Campaign ID wajib diisi."},400);const campaign=await env.DB.prepare("SELECT * FROM email_campaigns WHERE id=? LIMIT 1").bind(id).first<any>();if(!campaign)return json({success:false,error:"Campaign tidak ditemukan."},404);
 if(["sent","sending"].includes(String(campaign.status)))return json({success:false,error:"Campaign sudah dikirim atau sedang diproses."},409);if(!apiKey)return json({success:false,error:"RESEND_API_KEY belum terpasang."},503);
 const rows=(await env.DB.prepare("SELECT * FROM email_campaign_recipients WHERE campaign_id=? AND status='pending' ORDER BY created_at ASC").bind(id).all()).results||[];if(!rows.length)return json({success:false,error:"Tidak ada penerima pending."},400);
 await env.DB.prepare("UPDATE email_campaigns SET status='sending',updated_at=? WHERE id=?").bind(Math.floor(Date.now()/1000),id).run();
 let sent=0,failed=0;
 for(let i=0;i<rows.length;i+=100){
  const chunk=(rows as any[]).slice(i,i+100),batch=chunk.map(r=>({from:String(campaign.from_name)+" <"+String(campaign.from_email)+">",to:[String(r.email)],subject:String(campaign.subject),html:String(campaign.html_body),text:String(campaign.text_body||"")||undefined}));
  try{
   const response=await fetch("https://api.resend.com/emails/batch",{method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify(batch)});const data:any=await response.json().catch(()=>({}));if(!response.ok)throw new Error(String(data?.message||"Resend batch gagal."));
   const ids=Array.isArray(data?.data)?data.data.map((x:any)=>String(x?.id||"")):[],now=Math.floor(Date.now()/1000);
   for(let j=0;j<chunk.length;j++){const r=chunk[j];await env.DB.prepare("UPDATE email_campaign_recipients SET status='sent',resend_id=?,sent_at=?,updated_at=? WHERE id=?").bind(ids[j]||"",now,now,String(r.id)).run();sent++;}
  }catch(error){const msg=String(error instanceof Error?error.message:error).slice(0,1000),now=Math.floor(Date.now()/1000);for(const r of chunk){await env.DB.prepare("UPDATE email_campaign_recipients SET status='failed',error=?,updated_at=? WHERE id=?").bind(msg,now,String(r.id)).run();failed++;}}
 }
 const finalStatus=failed===0?"sent":sent>0?"partial":"failed",now=Math.floor(Date.now()/1000);await env.DB.prepare("UPDATE email_campaigns SET status=?,sent_count=?,failed_count=?,sent_at=?,updated_at=? WHERE id=?").bind(finalStatus,sent,failed,now,now,id).run();
 return json({success:true,status:finalStatus,sent,failed,message:"Campaign selesai: "+sent+" terkirim, "+failed+" gagal."});
}
