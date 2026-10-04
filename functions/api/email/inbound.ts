import { Env, json } from "../../_lib/db";
import { verifyResendWebhook } from "../../_lib/resend-webhook";

const DOMAIN = "sysstreamer.asia";

function clean(value: unknown, max=500000) { return String(value ?? "").trim().slice(0,max); }
function parseAddress(value: string) {
  const raw=clean(value,1000);
  const m=raw.match(/^(.*?)<([^<>]+)>$/);
  return m ? {name:m[1].trim().replace(/^["']|["']$/g,""),email:m[2].trim().toLowerCase()} : {name:"",email:raw.toLowerCase()};
}
function htmlToText(html:string) {
  return html
    .replace(/<style[\\s\\S]*?<\\/style>/gi, " ")
    .replace(/<script[\\s\\S]*?<\\/script>/gi, " ")
    .replace(/<br\\s*\\/?\s*>/gi, "\\n")
    .replace(/<\\/p\\s*>/gi, "\\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\\s+\\n/g, "\\n")
    .replace(/\\n\\s+/g, "\\n")
    .trim();
}
function headersObject(headers:any) {
  if(Array.isArray(headers)){const out:any={};for(const item of headers){const k=clean(item?.name||item?.key,200);if(k)out[k]=clean(item?.value,10000)}return out;}
  return headers && typeof headers==="object" ? headers : {};
}
function getHeader(headers:any,names:string[]) {
  for(const n of names){const k=Object.keys(headers||{}).find(x=>x.toLowerCase()===n.toLowerCase());if(k&&headers[k])return String(headers[k]);}
  return "";
}

export async function onRequestPost({request,env}:{request:Request;env:Env}) {
  const secret=String((env as any).RESEND_WEBHOOK_SECRET||"").trim();
  if(!secret)return json({success:false,error:"RESEND_WEBHOOK_SECRET belum dikonfigurasi."},503);
  const payload=await request.text();
  if(!(await verifyResendWebhook(payload,request.headers,secret)))return json({success:false,error:"Invalid webhook signature."},401);
  let event:any;try{event=JSON.parse(payload)}catch{return json({success:false,error:"Invalid JSON."},400);}
  if(event?.type!=="email.received")return json({success:true,ignored:true});
  const meta=event.data||{}, resendEmailId=clean(meta.email_id,200);
  if(!resendEmailId)return json({success:false,error:"email_id tidak ditemukan."},400);
  const duplicate=await env.DB.prepare("SELECT id FROM email_inbox_messages WHERE resend_email_id=? LIMIT 1").bind(resendEmailId).first<any>();
  if(duplicate)return json({success:true,duplicate:true});

  const toList=Array.isArray(meta.to)?meta.to.map((v:any)=>parseAddress(String(v)).email):[];
  const candidates=toList.filter((v:string)=>v.endsWith("@"+DOMAIN));
  if(!candidates.length)return json({success:true,ignored:true});
  const placeholders=candidates.map(()=>"?").join(",");
  const managed=await env.DB.prepare("SELECT email FROM email_senders WHERE active=1 AND email IN ("+placeholders+")").bind(...candidates).all();
  const active=new Set((managed.results||[]).map((r:any)=>String(r.email).toLowerCase()));
  const mailbox=candidates.find((v:string)=>active.has(v));
  if(!mailbox)return json({success:true,ignored:true,reason:"mailbox_not_active"});

  const apiKey=String(env.RESEND_API_KEY||"").trim();
  if(!apiKey)return json({success:false,error:"RESEND_API_KEY belum terpasang."},503);
  const response=await fetch("https://api.resend.com/emails/receiving/"+encodeURIComponent(resendEmailId),{headers:{Authorization:"Bearer "+apiKey}});
  if(!response.ok){console.error("Resend receiving get failed",response.status);return json({success:false,error:"Gagal mengambil isi email dari Resend."},502);}
  const received:any=await response.json();
  const from=parseAddress(String(received.from||meta.from||""));
  const hdr=headersObject(received.headers);
  const inReplyTo=getHeader(hdr,["In-Reply-To"]);
  const references=getHeader(hdr,["References"]);
  const subject=clean(received.subject||meta.subject||"",998);
  const html=clean(received.html||"");
  const text=clean(received.text||(html?htmlToText(html):""));
  const messageId=clean(received.message_id||meta.message_id||"",1000);
  const now=Math.floor(Date.now()/1000);
  let threadId=crypto.randomUUID();
  const parentRef=inReplyTo||references.split(/\\s+/).filter(Boolean).pop()||"";
  if(parentRef){const parent=await env.DB.prepare("SELECT thread_id FROM email_inbox_messages WHERE message_id=? ORDER BY created_at DESC LIMIT 1").bind(parentRef).first<any>();if(parent?.thread_id)threadId=String(parent.thread_id);}
  const id=crypto.randomUUID();
  const receivedAt=Math.floor(new Date(String(received.created_at||meta.created_at||Date.now())).getTime()/1000)||now;
  await env.DB.prepare("INSERT INTO email_inbox_messages (id,resend_email_id,message_id,thread_id,direction,mailbox,from_email,from_name,to_email,subject,text_body,html_body,headers_json,attachments_json,status,in_reply_to,references_header,received_at,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .bind(id,resendEmailId,messageId,threadId,"inbound",mailbox,from.email,from.name,mailbox,subject,text,html,JSON.stringify(hdr),JSON.stringify(meta.attachments||received.attachments||[]),"unread",inReplyTo,references,receivedAt,now,now).run();
  return json({success:true,id,mailbox,threadId});
}
