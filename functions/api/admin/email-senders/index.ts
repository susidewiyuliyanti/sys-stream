import { Env, json } from "../../../_lib/db";
import { requireAdmin } from "../../../_lib/admin";
import { brandedEmailHtml } from "../../../_lib/email";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DOMAIN = "sysstreamer.asia";

function clean(value: unknown, max = 320) {
  return String(value ?? "").trim().slice(0, max);
}
function mapRow(row: any) {
  return {
    id: String(row.id), email: String(row.email),
    displayName: String(row.display_name || ""), purpose: String(row.purpose || "general"),
    active: Number(row.active) === 1, createdBy: row.created_by ? String(row.created_by) : null,
    createdAt: Number(row.created_at), updatedAt: Number(row.updated_at),
  };
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  const result = await env.DB.prepare(
    `SELECT id,email,display_name,purpose,active,created_by,created_at,updated_at
     FROM email_senders ORDER BY active DESC, purpose ASC, email ASC`
  ).all();
  return json({ success: true, senders: (result.results || []).map(mapRow), canManage: auth.identity.role === "OWNER" });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (auth.identity.role !== "OWNER") return json({ success:false, error:"Hanya OWNER yang dapat mengelola alamat email pengirim." },403);

  const body = await request.json().catch(() => ({} as any));
  const action = clean(body?.action, 32).toLowerCase();

  if (action === "test") {
    const senderId = clean(body?.id, 100);
    const recipient = clean(body?.recipient).toLowerCase();
    if (!senderId || !EMAIL_RE.test(recipient)) return json({ success:false, error:"Sender dan alamat penerima yang valid wajib diisi." },400);
    if (!env.RESEND_API_KEY) return json({ success:false, error:"RESEND_API_KEY belum terpasang di Production." },503);

    const row = await env.DB.prepare("SELECT id,email,display_name,active FROM email_senders WHERE id = ? LIMIT 1").bind(senderId).first<any>();
    if (!row) return json({ success:false, error:"Alamat pengirim tidak ditemukan." },404);
    if (Number(row.active) !== 1) return json({ success:false, error:"Alamat pengirim sedang nonaktif." },400);

    const from = `${String(row.display_name || "SYS STREAM")} <${String(row.email)}>`;
    const resend = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{ "Authorization":`Bearer ${env.RESEND_API_KEY}`, "Content-Type":"application/json" },
      body:JSON.stringify({
        from, to:[recipient], subject:"SYS STREAM — Test Email",
        html:brandedEmailHtml(`<h2 style="margin:0 0 12px;color:#f5c451">SYS STREAMER Test Email</h2><p style="line-height:1.7">Ini adalah test email dari <strong>${from}</strong>.</p><p style="line-height:1.7">Jika email ini diterima, konfigurasi Resend dan sender SYS STREAMER sudah dapat digunakan.</p>`, "SYS STREAMER test email")
      })
    });
    const data = await resend.json().catch(() => ({}));
    if (!resend.ok) return json({ success:false, error:String((data as any)?.message || (data as any)?.error || "Resend menolak pengiriman test email.") },502);
    return json({ success:true, message:`Test email berhasil dikirim ke ${recipient}.`, resendId:(data as any)?.id || null });
  }

  if (action && action !== "create") return json({ success:false, error:"Action tidak valid." },400);

  const email = clean(body?.email).toLowerCase();
  const displayName = clean(body?.displayName,100) || "SYS STREAM";
  const purpose = clean(body?.purpose,40).toLowerCase() || "general";
  if (!EMAIL_RE.test(email)) return json({ success:false, error:"Format alamat email tidak valid." },400);
  if (!email.endsWith(`@${DOMAIN}`)) return json({ success:false, error:`Alamat pengirim harus menggunakan domain @${DOMAIN} yang sudah diverifikasi di Resend.` },400);

  const now = Math.floor(Date.now()/1000), id = crypto.randomUUID();
  try {
    await env.DB.prepare(`INSERT INTO email_senders
      (id,email,display_name,purpose,active,created_by,created_at,updated_at)
      VALUES (?,?,?,?,1,?,?,?)`).bind(id,email,displayName,purpose,auth.identity.id || auth.identity.email,now,now).run();
  } catch (error:any) {
    if (/UNIQUE|constraint/i.test(String(error?.message || error))) return json({ success:false, error:"Alamat email tersebut sudah terdaftar." },409);
    throw error;
  }
  return json({ success:true, sender:{id,email,displayName,purpose,active:true,createdBy:auth.identity.id || auth.identity.email,createdAt:now,updatedAt:now} },201);
}

export async function onRequestPatch({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (auth.identity.role !== "OWNER") return json({ success:false, error:"Hanya OWNER yang dapat mengelola alamat email pengirim." },403);

  const body = await request.json().catch(() => ({} as any));
  const id = clean(body?.id,100);
  if (!id) return json({ success:false,error:"ID sender wajib diisi." },400);
  const current = await env.DB.prepare(`SELECT id,email,display_name,purpose,active,created_by,created_at,updated_at
    FROM email_senders WHERE id = ? LIMIT 1`).bind(id).first<any>();
  if (!current) return json({ success:false,error:"Alamat pengirim tidak ditemukan." },404);

  const displayName = clean(body?.displayName,100) || String(current.display_name || "SYS STREAM");
  const purpose = clean(body?.purpose,40).toLowerCase() || String(current.purpose || "general");
  const active = body?.active === undefined ? Number(current.active) : (body.active ? 1 : 0);
  const now = Math.floor(Date.now()/1000);
  await env.DB.prepare(`UPDATE email_senders SET display_name=?,purpose=?,active=?,updated_at=? WHERE id=?`)
    .bind(displayName,purpose,active,now,id).run();
  return json({ success:true, sender:mapRow({...current,display_name:displayName,purpose,active,updated_at:now}) });
}

export async function onRequestDelete({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAdmin(request, env);
  if (!auth.ok) return auth.response;
  if (auth.identity.role !== "OWNER") return json({ success:false,error:"Hanya OWNER yang dapat mengelola alamat email pengirim." },403);
  const id = clean(new URL(request.url).searchParams.get("id"),100);
  if (!id) return json({ success:false,error:"ID sender wajib diisi." },400);
  const result = await env.DB.prepare("DELETE FROM email_senders WHERE id=?").bind(id).run();
  if (!Number((result as any).meta?.changes || 0)) return json({ success:false,error:"Alamat pengirim tidak ditemukan." },404);
  return json({ success:true,id });
}
