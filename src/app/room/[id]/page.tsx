"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGame } from "../../../context/GameContext";
import { useLanguage } from "../../../i18n";
import { Heart, Send, Radio, Users, MessageCircle, User, LogIn } from "lucide-react";

import type { Participant, RoomMessage, RoomState, RoomStream } from "./roomTypes";

export default function Room({
  roomId = "main",
  navigate,
}: {
  roomId?: string;
  navigate?: (path: string) => void;
}) {
  const { user, isLoggedIn, requireAuth, showToast } = useGame();
  const { t } = useLanguage();
  const [room, setRoom] = useState<RoomState | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [stream, setStream] = useState<RoomStream | null>(null);
  const [streamBusy, setStreamBusy] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [roomMissing, setRoomMissing] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [roomTitle, setRoomTitle] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "viewers">("chat");
  const chatRef = useRef<HTMLDivElement>(null);

  const effectiveRoomId = useMemo(() => String(roomId || "main"), [roomId]);

  const loadRoom = useCallback(async (silent = false) => {
    const token = localStorage.getItem("sys_stream_auth_token");
    if (!token) {
      if (!silent) setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/live/room?roomId=" + encodeURIComponent(effectiveRoomId), {
        headers: { Authorization: "Bearer " + token },
        cache: "no-store",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        setRoomMissing(response.status === 404);
        throw new Error(data?.error || "Live room tidak dapat dimuat.");
      }
      setRoomMissing(false);
      setRoom(data.room || null);
      setParticipants(Array.isArray(data.participants) ? data.participants : []);
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setStream(data.stream || null);
    } catch (error: any) {
      if (!silent) showToast(t("Live Room"), error?.message || t("Gagal memuat live room."), "error");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [effectiveRoomId, showToast, t]);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    void loadRoom();
    const interval = window.setInterval(() => void loadRoom(true), 3000);
    return () => window.clearInterval(interval);
  }, [isLoggedIn, loadRoom]);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const postRoomAction = async (action: string, payload: Record<string, unknown> = {}) => {
    const token = localStorage.getItem("sys_stream_auth_token");
    if (!token) return null;
    const response = await fetch("/api/live/room", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ roomId: effectiveRoomId, action, ...payload }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.success) throw new Error(data?.error || t("Aksi live room gagal."));
    return data;
  };

  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault();
    const message = chatInput.trim();
    if (!message || sending) return;

    requireAuth(() => {
      setSending(true);
      void postRoomAction("message", { message })
        .then((data: any) => {
          if (data?.message) setMessages(prev => [...prev, data.message].slice(-100));
          setChatInput("");
        })
        .catch((error: any) => showToast(t("Chat"), error?.message || t("Pesan gagal dikirim."), "error"))
        .finally(() => setSending(false));
    });
  };

  const likeRoom = () => {
    requireAuth(() => {
      void postRoomAction("like")
        .then((data: any) => {
          setRoom(prev => prev ? { ...prev, likes: Number(data?.likes || prev.likes) } : prev);
        })
        .catch((error: any) => showToast(t("Live"), error?.message || t("Like gagal dikirim."), "error"));
    });
  };

  const currentUserId = String(user?.id || "");
  const currentUser = participants.find(p => p.userId === currentUserId);
  const displayCurrentName = currentUser?.username || user?.username || "User";
  const canCreateRoom = ["streamer","admin","owner"].includes(String(user?.role || "").toLowerCase());

  const createRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!roomTitle.trim() || creatingRoom) return;
    setCreatingRoom(true);
    try {
      const data = await postRoomAction("create_room", {
        title: roomTitle.trim(),
        description: roomDescription.trim()
      });
      if (data?.room) {
        setRoomMissing(false);
        setRoom(data.room);
        setParticipants([]);
        setMessages([]);
        showToast(t("Live"), t("Room berhasil dibuat."), "success");
        void loadRoom(true);
      }
    } catch (error: any) {
      showToast(t("Live"), error?.message || t("Gagal membuat room."), "error");
    } finally {
      setCreatingRoom(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/80 p-7 text-center">
          <LogIn className="w-10 h-10 mx-auto text-cyan-400 mb-4" />
          <h1 className="text-xl font-black">{t("Masuk untuk bergabung ke Live Room")}</h1>
          <p className="text-sm text-slate-400 mt-2">{t("Setiap akun memiliki profil dan identitasnya sendiri di dalam room.")}</p>
          <button
            onClick={() => requireAuth(() => undefined)}
            className="mt-6 w-full rounded-xl bg-cyan-500 px-4 py-3 font-black text-slate-950"
          >
            LOGIN / REGISTER
          </button>
        </div>
      </div>
    );
  }

  if (roomMissing && canCreateRoom) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-6">
        <form onSubmit={createRoom} className="w-full max-w-lg rounded-3xl border border-cyan-500/20 bg-slate-950/90 p-7">
          <div className="text-xs uppercase tracking-wider text-cyan-400 font-black">{t("OFFICIAL STREAMER")}</div>
          <h1 className="text-2xl font-black mt-2">{t("Buat Live Room")}</h1>
          <p className="text-sm text-slate-400 mt-2">
            {t("Room belum tersedia. Buat room ini untuk menjadi pemiliknya.")} <span className="text-cyan-300 font-bold">{effectiveRoomId}</span>
          </p>
          <input value={roomTitle} onChange={e=>setRoomTitle(e.target.value)} maxLength={120}
            placeholder={t("Judul Live Room")} required
            className="mt-6 w-full rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
          <textarea value={roomDescription} onChange={e=>setRoomDescription(e.target.value)} maxLength={500}
            placeholder={t("Deskripsi room (opsional)")}
            className="mt-3 w-full min-h-28 rounded-xl bg-slate-900 border border-slate-700 px-4 py-3 text-sm outline-none focus:border-cyan-400" />
          <button disabled={creatingRoom}
            className="mt-4 w-full rounded-xl bg-cyan-400 px-4 py-3 font-black text-slate-950 disabled:opacity-50">
            {creatingRoom ? t("MEMBUAT ROOM...") : t("BUAT ROOM")}
          </button>
        </form>
      </div>
    );
  }

  if (roomMissing) {
    return (
      <div className="min-h-screen bg-[#050814] text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-950/90 p-7 text-center">
          <Radio className="w-10 h-10 mx-auto text-slate-500 mb-4" />
          <h1 className="text-xl font-black">{t("Room belum tersedia")}</h1>
          <p className="text-sm text-slate-500 mt-2">{t("Room ini belum dibuat oleh Official Streamer.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050814] text-white pb-20">
      <div className="w-full max-w-7xl mx-auto px-0 lg:px-5">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-900 bg-[#050814]/95 backdrop-blur-md p-3">
          <div className="flex items-center gap-3 min-w-0">
            <Radio className="w-5 h-5 text-pink-500 shrink-0" />
            <div className="min-w-0">
              <div className="font-black truncate">{room?.title || t('Live Room')}</div>
              <div className="text-[11px] text-slate-500 truncate">{t('Room')}: {effectiveRoomId}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-400" />{room?.participantCount || 0}</span>
            <button onClick={likeRoom} className="flex items-center gap-1 text-pink-400 hover:text-pink-300">
              <Heart className="w-4 h-4" />{room?.likes || 0}
            </button>
          </div>
        </header>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_380px] gap-5 mt-4">
          <main className="min-w-0">
            <section className="aspect-video rounded-2xl border border-slate-800 bg-black overflow-hidden relative">
              {stream?.playbackUrl ? (
                <iframe
                  src={stream.playbackUrl}
                  title={room?.title || t("SYS STREAM Live")}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center px-6">
                    <Radio className="w-12 h-12 mx-auto text-cyan-400 mb-4" />
                    <h2 className="font-black text-lg">{t("Streaming belum aktif")}</h2>
                    <p className="text-sm text-slate-500 mt-2">
                      {t("Belum ada video live produksi pada room ini.")}
                    </p>
                  </div>
                </div>
              )}
              {stream && (
                <div className="absolute left-3 top-3 flex items-center gap-2 rounded-lg bg-black/70 px-2.5 py-1 text-[10px] font-black">
                  <span className={stream.status === "connected" || stream.status === "reconnected" ? "w-2 h-2 rounded-full bg-emerald-400 animate-pulse" : "w-2 h-2 rounded-full bg-amber-400"} />
                  {stream.status === "connected" || stream.status === "reconnected" ? t("LIVE") : stream.status.toUpperCase()}
                </div>
              )}
            </section>
            {stream?.owner && (
              <section className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-rose-300 font-black">{t("STREAMER CONTROL")}</div>
                    <div className="text-sm font-bold mt-1">
                      {stream.status === "connected" || stream.status === "reconnected" ? t("Streaming sedang berjalan") : t("Kirim video dari OBS ke server")}
                    </div>
                  </div>
                  <button
                    disabled={streamBusy || !room.owner}
                    onClick={() => {
                      setStreamBusy(true);
                      void fetch("/api/live/stream?roomId=" + encodeURIComponent(effectiveRoomId), {
                        headers: { Authorization: "Bearer " + (localStorage.getItem("sys_stream_auth_token") || "") },
                        cache: "no-store"
                      }).then(r => r.json()).then(data => {
                        if (data?.success) setStream(data.stream || null);
                        else showToast(t("Live"), data?.error || t("Status streaming gagal."), "error");
                      }).catch(() => showToast(t("Live"), t("Status streaming gagal."), "error")).finally(() => setStreamBusy(false));
                    }}
                    className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-black hover:border-cyan-400 disabled:opacity-50"
                  >
                    {streamBusy ? t("CHECK...") : t("CHECK STATUS")}
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 mt-4">
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                    <div className="text-[10px] text-slate-500">{t("RTMPS SERVER")}</div>
                    <div className="text-xs text-cyan-300 break-all mt-1 select-all">{stream.ingestUrl || "-"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                    <div className="text-[10px] text-slate-500">{t("STREAM KEY")}</div>
                    <div className="text-xs text-amber-300 break-all mt-1 select-all">{stream.streamKey || "-"}</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 mt-3">
                  {t("Gunakan OBS: Settings → Stream → Service Custom → masukkan RTMPS Server dan Stream Key di atas.")}
                </p>
              </section>
            )}
            {room?.owner && (
              <section className="mt-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-wider text-cyan-400 font-black">{t("AKTIFKAN STREAMING")}</div>
                  <div className="text-sm font-bold mt-1">{t("Buat Live Input Cloudflare untuk room ini.")}</div>
                  <div className="text-[11px] text-slate-500 mt-1">{t("Setelah dibuat, gunakan RTMPS Server + Stream Key pada OBS.")}</div>
                </div>
                <button
                  disabled={streamBusy}
                  onClick={() => {
                    setStreamBusy(true);
                    const token = localStorage.getItem("sys_stream_auth_token") || "";
                    void fetch("/api/live/stream", {
                      method: "POST",
                      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                      body: JSON.stringify({ roomId: effectiveRoomId, title: room?.title || ("SYS STREAM • " + effectiveRoomId) })
                    }).then(r => r.json()).then(data => {
                      if (data?.success) {
                        setStream(data.stream || null);
                        showToast(t("Live"), t("Live Input berhasil dibuat. Gunakan kredensial OBS di bawah video."), "success");
                      } else {
                        showToast(t("Live"), data?.error || t("Gagal membuat Live Input."), "error");
                      }
                    }).catch(() => showToast(t("Live"), t("Gagal terhubung ke streaming server."), "error")).finally(() => setStreamBusy(false));
                  }}
                  className="rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-slate-950 hover:bg-cyan-300 disabled:opacity-50 shrink-0"
                >
                  {!room.owner ? t("KHUSUS PEMILIK ROOM") : streamBusy ? t("MEMBUAT...") : t("AKTIFKAN STREAMING")}
                </button>
              </section>
            )}

            <section className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                  {currentUser?.avatarUrl || user?.avatar ? (
                    <img src={currentUser?.avatarUrl || user.avatar} alt={displayCurrentName} className="w-full h-full object-cover" />
                  ) : <User className="w-5 h-5 text-slate-500" />}
                </div>
                <div className="min-w-0">
                  <div className="font-black truncate">{displayCurrentName}</div>
                  <div className="text-[11px] text-cyan-400">{t("Profil akun Anda")}</div>
                </div>
              </div>
              {room?.description && <p className="text-sm text-slate-400 mt-3">{room.description}</p>}
              {!room?.description && <p className="text-sm text-slate-500 mt-3">{t("Belum ada deskripsi room dari pemilik room.")}</p>}
            </section>

            <section className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="font-black">{t("Peserta Live")}</h2>
                  <p className="text-[11px] text-slate-500">{t("Hanya akun yang benar-benar bergabung yang ditampilkan.")}</p>
                </div>
                <span className="text-xs text-cyan-400">{participants.length} {t("aktif")}</span>
              </div>
              {loading && participants.length === 0 ? (
                <div className="text-sm text-slate-500 py-6 text-center">{t("Memuat peserta...")}</div>
              ) : participants.length === 0 ? (
                <div className="text-sm text-slate-500 py-6 text-center">{t("Belum ada peserta lain.")}</div>
              ) : (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {participants.map(p => (
                    <div key={p.userId} className="shrink-0 w-20 text-center">
                      <div className="w-11 h-11 mx-auto rounded-full overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center">
                        {p.avatarUrl ? <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-slate-500" />}
                      </div>
                      <div className="text-[10px] text-slate-300 truncate mt-1">{p.username}{p.userId === currentUserId ? ` (${t("Anda")})` : ""}</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="min-w-0 lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)] rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 border-b border-slate-800">
              <button onClick={() => setActiveTab("chat")} className={`py-3 text-xs font-black ${activeTab === "chat" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-500"}`}>
                <MessageCircle className="w-3.5 h-3.5 inline mr-1" /> CHAT
              </button>
              <button onClick={() => setActiveTab("viewers")} className={`py-3 text-xs font-black ${activeTab === "viewers" ? "text-cyan-400 border-b-2 border-cyan-400" : "text-slate-500"}`}>
                <Users className="w-3.5 h-3.5 inline mr-1" /> PESERTA
              </button>
            </div>

            {activeTab === "chat" ? (
              <>
                <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-sm text-slate-500 px-5">
                      {t("Belum ada pesan. Jadilah pengguna pertama yang berkontribusi di room ini.")}
                    </div>
                  ) : messages.map(m => (
                    <div key={m.id} className="flex gap-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-900 border border-slate-800 shrink-0 flex items-center justify-center">
                        {m.avatarUrl ? <img src={m.avatarUrl} alt={m.username} className="w-full h-full object-cover" /> : <User className="w-3.5 h-3.5 text-slate-500" />}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-black text-cyan-300">{m.username}{m.userId === currentUserId ? ` • ${t("Anda")}` : ""}</div>
                        <div className="text-xs text-slate-200 break-words">{m.message}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={sendMessage} className="p-3 border-t border-slate-800 flex gap-2">
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    maxLength={1000}
                    placeholder={`${t('Tulis sebagai')} @${displayCurrentName}`}
                    className="flex-1 min-w-0 rounded-xl bg-slate-900 border border-slate-700 px-3 py-2.5 text-xs outline-none focus:border-cyan-400"
                  />
                  <button disabled={sending || !chatInput.trim()} className="rounded-xl bg-cyan-500 text-slate-950 px-3 disabled:opacity-40">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 overflow-y-auto p-3">
                {participants.length === 0 ? (
                  <div className="text-sm text-slate-500 text-center py-8">{t("Belum ada peserta.")}</div>
                ) : participants.map(p => (
                  <div key={p.userId} className="flex items-center gap-3 py-2 border-b border-slate-900">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center">
                      {p.avatarUrl ? <img src={p.avatarUrl} alt={p.username} className="w-full h-full object-cover" /> : <User className="w-4 h-4 text-slate-500" />}
                    </div>
                    <div className="text-xs font-bold truncate">{p.username}{p.userId === currentUserId ? ` (${t("Anda")})` : ""}</div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
