import { Env, json } from "../../_lib/db";
import { requireAuth } from "../../_lib/auth";

type CloudflareLiveInput = {
  uid?: string;
  status?: string;
  rtmps?: { url?: string; streamKey?: string };
  playback?: { hls?: string; dash?: string };
  webRTC?: { url?: string };
  webRTCPlayback?: { url?: string };
};

async function ensureStreamTable(env: Env) {
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS live_streams (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL UNIQUE,
    provider TEXT NOT NULL DEFAULT 'cloudflare_stream',
    input_uid TEXT NOT NULL,
    ingest_url TEXT NOT NULL DEFAULT '',
    stream_key TEXT NOT NULL DEFAULT '',
    playback_url TEXT NOT NULL DEFAULT '',
    playback_hls TEXT NOT NULL DEFAULT '',
    playback_webrtc TEXT NOT NULL DEFAULT '',\n    whip_url TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'created',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`).run();
  await env.DB.prepare("ALTER TABLE live_streams ADD COLUMN whip_url TEXT NOT NULL DEFAULT ''").run().catch(() => {});
}

function roomIdFrom(request: Request) {
  const url = new URL(request.url);
  return (url.searchParams.get("roomId") || "main").trim().slice(0, 120) || "main";
}

function cloudflareConfigured(env: Env) {
  return Boolean(env.CLOUDFLARE_ACCOUNT_ID && env.CLOUDFLARE_STREAM_API_TOKEN);
}

async function cloudflareRequest(env: Env, path: string, init: RequestInit = {}) {
  const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({} as any));
  if (!response.ok || !data?.success) {
    throw new Error(data?.errors?.[0]?.message || "Cloudflare Stream API gagal.");
  }
  return data.result as CloudflareLiveInput;
}

function playbackIframeFromHls(hls: string, uid: string) {
  if (!hls) return "";
  return hls.replace(/\/manifest\/video\.m3u8(?:\?.*)?$/i, "/iframe");
}

export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    await ensureStreamTable(env);
    const roomId = roomIdFrom(request);
    const room = await env.DB.prepare("SELECT owner_user_id FROM live_rooms WHERE id=? LIMIT 1").bind(roomId).first<any>();
    if (!room) return json({ success:false, error:"Room belum tersedia." },404);

    const stream = await env.DB.prepare(
      "SELECT provider,input_uid,ingest_url,stream_key,playback_url,playback_hls,playback_webrtc,whip_url,status,updated_at FROM live_streams WHERE room_id=? LIMIT 1"
    ).bind(roomId).first<any>();
    if (!stream) return json({ success:true, configured:false, stream:null });

    let status = String(stream.status || "created");
    if (cloudflareConfigured(env)) {
      try {
        const live = await cloudflareRequest(env, `/live_inputs/${encodeURIComponent(String(stream.input_uid))}`, { method:"GET" });
        status = String(live?.status || status);
        await env.DB.prepare("UPDATE live_streams SET status=?,updated_at=? WHERE room_id=?")
          .bind(status,Math.floor(Date.now()/1000),roomId).run();
      } catch {}
    }

    const owner = String(room.owner_user_id) === String(auth.user.id);
    return json({
      success:true,
      configured:true,
      stream:{
        provider:String(stream.provider||"cloudflare_stream"),
        inputUid:String(stream.input_uid||""),
        playbackUrl:String(stream.playback_url||""),
        playbackHls:String(stream.playback_hls||""),
        playbackWebrtc:String(stream.playback_webrtc||""),\n        whipUrl:owner ? String(stream.whip_url||"") : "",
        status,
        ingestUrl:owner ? String(stream.ingest_url||"") : "",
        streamKey:owner ? String(stream.stream_key||"") : "",
        owner
      }
    });
  } catch (error) {
    console.error("live stream GET failed",error);
    return json({success:false,error:error instanceof Error ? error.message : "Status streaming gagal."},500);
  }
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const auth = await requireAuth(request, env);
  if (!auth.ok) return auth.response;
  try {
    await ensureStreamTable(env);
    if (!cloudflareConfigured(env)) {
      return json({
        success:false,
        error:"Streaming belum dikonfigurasi. Tambahkan CLOUDFLARE_ACCOUNT_ID dan CLOUDFLARE_STREAM_API_TOKEN pada Cloudflare Pages."
      },503);
    }

    const body = await request.json().catch(()=>({} as any));
    const roomId = String(body?.roomId || "main").trim().slice(0,120) || "main";
    const room = await env.DB.prepare("SELECT owner_user_id FROM live_rooms WHERE id=? LIMIT 1").bind(roomId).first<any>();
    if (!room) return json({success:false,error:"Room belum tersedia."},404);
    if (String(room.owner_user_id) !== String(auth.user.id)) {
      return json({success:false,error:"Hanya pemilik room yang dapat mengaktifkan streaming."},403);
    }

    const existing = await env.DB.prepare("SELECT input_uid FROM live_streams WHERE room_id=? LIMIT 1").bind(roomId).first<any>();
    if (existing?.input_uid) {
      return onRequestGet({request:new Request(new URL(`/api/live/stream?roomId=${encodeURIComponent(roomId)}`,request.url),{headers:request.headers}),env});
    }

    const now = Math.floor(Date.now()/1000);
    const title = String(body?.title || `SYS STREAM • ${roomId}`).slice(0,120);
    const live = await cloudflareRequest(env,"/live_inputs",{
      method:"POST",
      body:JSON.stringify({
        enabled:true,
        preferLowLatency:true,
        meta:{name:title,roomId,ownerUserId:String(auth.user.id)},
        recording:{mode:"automatic",timeoutSeconds:0}
      })
    });

    const uid=String(live?.uid||"");
    const ingestUrl=String(live?.rtmps?.url||"");
    const streamKey=String(live?.rtmps?.streamKey||"");
    const playbackHls=String(live?.playback?.hls||"");
    const whipUrl=String(live?.webRTC?.url||"");\n    const playbackWebrtc=String(live?.webRTCPlayback?.url||"");
    const playbackUrl=playbackIframeFromHls(playbackHls,uid);
    if (!uid || !ingestUrl || !streamKey || !playbackUrl) {
      return json({success:false,error:"Cloudflare tidak mengembalikan kredensial streaming lengkap."},502);
    }

    await env.DB.prepare(
      `INSERT INTO live_streams(id,room_id,provider,input_uid,ingest_url,stream_key,playback_url,playback_hls,playback_webrtc,whip_url,status,created_at,updated_at)
       VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      crypto.randomUUID(),roomId,"cloudflare_stream",uid,ingestUrl,streamKey,playbackUrl,playbackHls,playbackWebrtc,
      whipUrl,String(live?.status||"created"),now,now
    ).run();

    return json({
      success:true,
      stream:{provider:"cloudflare_stream",inputUid:uid,ingestUrl,streamKey,playbackUrl,playbackHls,playbackWebrtc,whipUrl,status:String(live?.status||"created"),owner:true}
    });
  } catch (error) {
    console.error("live stream POST failed",error);
    return json({success:false,error:error instanceof Error ? error.message : "Streaming gagal dibuat."},500);
  }
}
