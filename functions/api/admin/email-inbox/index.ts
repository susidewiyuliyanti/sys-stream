import { Env, json } from "../../../_lib/db";
import { requireAdmin } from "../../../_lib/admin";
import { brandedEmailHtml } from "../../../_lib/email";

function clean(v:unknown,max=100000){return String(v??"").trim().slice(0,max);}
function mapRow(r:any){return {id:String(r.id),resendEmailId:r.resend_email_id?String(r.resend_email_id):null,messageId:r.message_id?String(r.message_id):null,threadId:String(r.thread_id),direction:String(r.direction),mailbox:String(r.mailbox),fromEmail:String(r.from_email),fromName:r.from_name?String(r.from_name):"",toEmail:String(r.to_email),subject:String(r.subject||""),textBody:String(r.text_body||""),htmlBody:String(r.html_body||""),status:String(r.status||"unread"),inReplyTo:r.in_reply_to?String(r.in_reply_to):null,receivedAt:Number(r.received_at),createdAt:Number(r.created_at),attachments:(()=>{try{return JSON.parse(r.attachments_json||"[]")}catch{return[]}})()};}

export async function onRequestGet({request,env}:{request:Request;env:Env}){
 const auth=await requireAdmin(request,env);if(!auth.ok)return auth.response;
 const url=new URL(request.url),id=clean(url.searchParams.get("id"),100);
 if(id){const rows=await env.DB.prepare("SELECT * FROM email_inbox_messages WHERE id=? OR thread_id=? ORDER BY received_at ASC").bind(id,id).all();return json({success:true,messages:(rows.results||[]).map(mapRow)});}
 const mailbox=clean(url.searchParams.get("mailbox"),320).toLowerCase(),status=clean(url.searchParams.get("status"),30).toLowerCase(),limit=Math.min(Math.max(Number(url.searchParams.get("limit")||100),1),200);
 const clauses:string[]=[],params:any[]=[];if(mailbox){clauses.push("mailbox=?");params.push(mailbox);}if(status){clauses.push("status=?");params.push(status);}
 const where=clauses.length?" WHERE "+clauses.join(" AND "):"";
 const rows=await env.DB.prepare("SELECT * FROM email_inbox_messages"+where+" ORDER BY received_at DESC LIMIT "+limit).bind(...params).all();
 const counts=await env.DB.prepare("SELECT mailbox,status,COUNT(*) AS count FROM email_inbox_messages GROUP BY mailbox,status").all();
 return json({success:true,messages:(rows.results||[]).map(mapRow),counts:counts.results||[]});
}

export async function onRequestPatch({request,env}:{request:Request;env:Env}){
 const auth=await requireAdmin(request,env);if(!auth.ok)return auth.response;
 const body=await request.json().catch(()=>({} as any)),id=clean(body?.id,100),status=clean(body?.status,30).toLowerCase();
 if(!id||!["read","unread","replied","archived"].includes(status))return json({success:false,error:"ID atau status tidak valid."},400);
 await env.DB.prepare("UPDATE email_inbox_messages SET status=?,updated_at=? WHERE id=?").bind(status,Math.floor(Date.now()/1000),id).run();
 return json({success:true});
}

function escapeHtml(v:string){return v.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\n/g,"<br/>");}

export async function onRequestPost({request,env}:{request:Request;env:Env}){
 const auth=await requireAdmin(request,env);if(!auth.ok)return auth.response;
 const body=await request.json().catch(()=>({} as any));
 if(clean(body?.action,30).toLowerCase()!=="reply")return json({success:false,error:"Action tidak valid."},400);
 const id=clean(body?.id,100),text=clean(body?.text,100000);
 if(!id||!text)return json({success:false,error:"Email dan isi balasan wajib diisi."},400);
 const target=await env.DB.prepare("SELECT * FROM email_inbox_messages WHERE id=? LIMIT 1").bind(id).first<any>();
 if(!target)return json({success:false,error:"Email tidak ditemukan."},404);
 const sender=await env.DB.prepare("SELECT email,display_name,active FROM email_senders WHERE email=? LIMIT 1").bind(String(target.mailbox)).first<any>();
 if(!sender||Number(sender.active)!==1)return json({success:false,error:"Mailbox pengirim sedang tidak aktif."},400);
 const apiKey=String(env.RESEND_API_KEY||"").trim();if(!apiKey)return json({success:false,error:"RESEND_API_KEY belum terpasang."},503);
 const subjectRaw=String(target.subject||""),subject=/^\s*re:/i.test(subjectRaw)?subjectRaw:"Re: "+subjectRaw;
 const headers:any={};if(target.message_id){headers["In-Reply-To"]=String(target.message_id);headers["References"]=String(target.references_header||target.message_id);}
 const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+apiKey,"Content-Type":"application/json"},body:JSON.stringify({from:String(sender.display_name||"SYS STREAM")+" <"+String(sender.email)+">",to:[String(target.from_email)],subject,text,html:brandedEmailHtml("<div style=\"font-family:Arial,sans-serif;line-height:1.7;color:#e5e7eb\">"+escapeHtml(text)+"</div>", subject),headers})});
 const data:any=await response.json().catch(()=>({}));if(!response.ok)return json({success:false,error:String(data?.message||"Resend menolak balasan.")},502);
 const now=Math.floor(Date.now()/1000),replyId=crypto.randomUUID(),resendId=String(data?.id||"");
 await env.DB.prepare("UPDATE email_inbox_messages SET status='replied',updated_at=? WHERE id=?").bind(now,id).run();
 await env.DB.prepare("INSERT INTO email_inbox_messages (id,resend_email_id,message_id,thread_id,direction,mailbox,from_email,from_name,to_email,subject,text_body,html_body,headers_json,attachments_json,status,in_reply_to,references_header,resend_message_id,admin_user_id,received_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(replyId,resendId,"outbound-"+replyId,String(target.thread_id),"outbound",String(sender.email),String(sender.email),String(sender.display_name||"SYS STREAM"),String(target.from_email),subject,text,"<div style=\"font-family:Arial,sans-serif;line-height:1.6\">"+escapeHtml(text)+"</div>",JSON.stringify(headers),"[]","replied",target.message_id||null,target.references_header||target.message_id||null,resendId,auth.identity.id||auth.identity.email,now,now,now).run();
 return json({success:true,replyId,resendId});
}
