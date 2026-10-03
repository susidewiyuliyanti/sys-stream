import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

type AuthUser = {
  id: string;
  username?: string;
  displayName?: string;
  avatarUrl?: string;
};

async function ensureLiveSchema(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS live_rooms (
    id TEXT PRIMARY KEY,
    owner_user_id TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'LIVE',
    likes INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS live_room_members (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    joined_at INTEGER NOT NULL,
    last_seen_at INTEGER NOT NULL,
    UNIQUE(room_id, user_id)
  )`).run();
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS live_room_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_live_members_room_seen ON live_room_members(room_id,last_seen_at)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_live_messages_room_created ON live_room_messages(room_id,created_at)").run();
}

function roomIdFrom(request: Request) {
  const url = new URL(request.url);
  return (url.searchParams.get("roomId") || "main").trim().slice(0, 120) || "main";
}

async function currentUser(env: Env, request: Request) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return { ok: false as const, response: auth.response };
  return { ok: true as const, user: auth.user as AuthUser };
}

async function ensureRoom(env: Env, roomId: string, userId: string, now: number) {
  const room = await env.DB.prepare("SELECT id FROM live_rooms WHERE id = ? LIMIT 1").bind(roomId).first<any>();
  if (!room) {
    await env.DB.prepare(
      "INSERT INTO live_rooms(id,owner_user_id,title,description,status,likes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)"
    ).bind(roomId, userId, "", "", "LIVE", 0, now, now).run();
  }
  await env.DB.prepare(
    `INSERT INTO live_room_members(id,room_id,user_id,joined_at,last_seen_at)
     VALUES(?,?,?,?,?)
     ON CONFLICT(room_id,user_id) DO UPDATE SET last_seen_at=excluded.last_seen_at`
  ).bind(crypto.randomUUID(), roomId, userId, now, now).run();
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await currentUser(env, request);
  if (!auth.ok) return auth.response;
  try {
    await ensureLiveSchema(env);
    const roomId = roomIdFrom(request);
    const now = Math.floor(Date.now() / 1000);
    await ensureRoom(env, roomId, String(auth.user.id), now);

    const room = await env.DB.prepare(
      "SELECT id,owner_user_id,title,description,status,likes FROM live_rooms WHERE id=? LIMIT 1"
    ).bind(roomId).first<any>();

    const members = await env.DB.prepare(
      `SELECT m.user_id AS userId,
              COALESCE(NULLIF(u.username,''),NULLIF(u.display_name,''),'user') AS username,
              COALESCE(u.display_name,'') AS displayName,
              COALESCE(u.avatar_url,u.photo_url,'') AS avatarUrl,
              m.joined_at AS joinedAt
       FROM live_room_members m
       LEFT JOIN users u ON u.id=m.user_id
       WHERE m.room_id=? AND m.last_seen_at>=?
       ORDER BY m.joined_at ASC LIMIT 100`
    ).bind(roomId, now - 90).all<any>();

    const messages = await env.DB.prepare(
      `SELECT m.id,m.user_id AS userId,
              COALESCE(NULLIF(u.username,''),NULLIF(u.display_name,''),'user') AS username,
              COALESCE(u.display_name,'') AS displayName,
              COALESCE(u.avatar_url,u.photo_url,'') AS avatarUrl,
              m.message,m.created_at AS createdAt
       FROM live_room_messages m
       LEFT JOIN users u ON u.id=m.user_id
       WHERE m.room_id=? ORDER BY m.created_at DESC LIMIT 100`
    ).bind(roomId).all<any>();

    return json({
      success:true,
      room:{
        id:String(room.id), ownerUserId:String(room.owner_user_id),
        title:String(room.title||""), description:String(room.description||""),
        status:String(room.status||"LIVE"), likes:Number(room.likes||0),
        participantCount:(members.results||[]).length
      },
      participants:members.results||[],
      messages:(messages.results||[]).reverse(),
      currentUserId:String(auth.user.id)
    });
  } catch(error) {
    console.error("live room GET failed",error);
    return json({success:false,error:"Live room tidak dapat dimuat."},500);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await currentUser(env, request);
  if (!auth.ok) return auth.response;
  try {
    await ensureLiveSchema(env);
    const body = await request.json().catch(()=>({} as any));
    const roomId=String(body?.roomId||"main").trim().slice(0,120)||"main";
    const action=String(body?.action||"").trim().toLowerCase();
    const now=Math.floor(Date.now()/1000);
    const userId=String(auth.user.id);
    await ensureRoom(env,roomId,userId,now);

    if(action==="message"){
      const message=String(body?.message||"").trim();
      if(!message) return json({success:false,error:"Pesan tidak boleh kosong."},400);
      if(message.length>1000) return json({success:false,error:"Pesan maksimal 1000 karakter."},400);
      const id=crypto.randomUUID();
      await env.DB.prepare(
        "INSERT INTO live_room_messages(id,room_id,user_id,message,created_at) VALUES(?,?,?,?,?)"
      ).bind(id,roomId,userId,message,now).run();
      return json({success:true,message:{
        id,userId,username:String(auth.user.username||auth.user.displayName||"user"),
        displayName:String(auth.user.displayName||""),avatarUrl:String(auth.user.avatarUrl||""),
        message,createdAt:now
      }});
    }

    if(action==="like"){
      await env.DB.prepare("UPDATE live_rooms SET likes=likes+1,updated_at=? WHERE id=?").bind(now,roomId).run();
      const updated=await env.DB.prepare("SELECT likes FROM live_rooms WHERE id=? LIMIT 1").bind(roomId).first<any>();
      return json({success:true,likes:Number(updated?.likes||0)});
    }

    if(action==="heartbeat") return json({success:true});
    return json({success:false,error:"Aksi live room tidak dikenal."},400);
  } catch(error) {
    console.error("live room POST failed",error);
    return json({success:false,error:"Live room tidak dapat memproses kontribusi."},500);
  }
}
