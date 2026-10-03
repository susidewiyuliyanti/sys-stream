"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../../context/GameContext";
import { sound } from "../../../lib/sound";
import {
  Radio,
  Eye,
  Heart,
  Share2,
  Tv,
  X,
  Plus,
  Target,
  Clock,
  Send,
  Gift,
  Smile,
  RotateCw,
  Coins,
  CheckCircle,
  User,
  Sparkles,
  ChevronRight,
  Flame,
  Lock,
} from "lucide-react";
import confetti from "canvas-confetti";

interface ChatItem {
  user: string;
  badge: "USER" | "TikTok" | "VIP";
  text: string;
  timeAgo: string;
  avatar?: string;
  isSystem?: boolean;
}

const PARTICIPANTS = [
  { name: "reno_x92", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80", tiktok: true },
  { name: "lina.neon", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80", tiktok: false },
  { name: "ghostbyte", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80", tiktok: false },
  { name: "alex_cyber", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80", tiktok: true },
  { name: "valk_77", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80", tiktok: false },
  { name: "neo_fox", avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80", tiktok: true },
  { name: "shadow_k", avatar: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=100&auto=format&fit=crop&q=80", tiktok: false },
  { name: "matrix_88", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80", tiktok: true },
];

export default function Room({
  roomId = "ROOM-777",
  navigate,
}: {
  roomId?: string;
  navigate?: (path: string) => void;
}) {
  const { user, updateCoins, requireAuth, showToast } = useGame();

  const [activeTab, setActiveTab] = useState<"chat" | "viewers">("chat");
  const [tebakInput, setTebakInput] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [timerSeconds, setTimerSeconds] = useState(28);
  const [likes, setLikes] = useState(1200);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const [chatList, setChatList] = useState<ChatItem[]>([
    {
      user: "@reno_x92",
      badge: "USER",
      text: "gasss 42 dong!! 🔥",
      timeAgo: "baru saja",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    },
    {
      user: "@lina.neon",
      badge: "TikTok",
      text: "77 mungkin? aku ikut spin juga",
      timeAgo: "1m",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80",
    },
    {
      user: "@ghostbyte_",
      badge: "USER",
      text: "streamer keren banget kak!! ✨",
      timeAgo: "2m",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    },
  ]);

  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTimerSeconds((prev) => (prev <= 1 ? 60 : prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Periodic random live comments
  useEffect(() => {
    const liveInterval = setInterval(() => {
      const randomComments = [
        { u: "@cyber_dave", b: "TikTok" as const, t: "Prediksi 55 tembus nih! 🚀" },
        { u: "@rina_cute", b: "USER" as const, t: "Sent 1x Rose 🌹 streamer makasi!" },
        { u: "@nexus_whale", b: "VIP" as const, t: "Spin lagi dong hadiahnya mantep!" },
      ];
      const pick = randomComments[Math.floor(Math.random() * randomComments.length)];
      setChatList((prev) => [
        ...prev.slice(-25),
        {
          user: pick.u,
          badge: pick.b,
          text: pick.t,
          timeAgo: "baru saja",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
        },
      ]);
      setLikes((prev) => prev + 1);
    }, 5500);

    return () => clearInterval(liveInterval);
  }, []);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatList]);

  // Protected Tebak Submission
  const handleSendTebak = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      const num = parseInt(tebakInput);
      if (isNaN(num) || num < 1 || num > 100) {
        showToast("Invalid Input", "Masukkan angka antara 1 sampai 100.", "error");
        return;
      }

      sound.playClick();
      setChatList((prev) => [
        ...prev,
        {
          user: `@${user.username || "neo_user_922"}`,
          badge: "USER",
          text: `🎯 Tebak Angka: ${num}! Semoga tembus 500 Coins!`,
          timeAgo: "baru saja",
          avatar: user.avatar,
        },
      ]);

      setTebakInput("");
      sound.playDiceRoll();

      setTimeout(() => {
        const winningNumber = 42;
        if (num === winningNumber) {
          updateCoins(500);
          sound.playJackpot();
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          showToast("Tebakan Tepat!", `Angka rahasia adalah ${winningNumber}! Menang +500 Coins!`, "jackpot");
        } else {
          showToast("Tebakan Terkirim", `Tebakan ${num} tercatat. Hasil diundi sebentar lagi!`, "info");
        }
      }, 1200);
    });
  };

  // Protected Spin Action
  const handleSpinAndWin = () => {
    requireAuth(() => {
      if (isSpinning) return;
      setIsSpinning(true);
      sound.playWheelTick(700);

      setTimeout(() => {
        setIsSpinning(false);
        const rewards = [
          { name: "100 Coins", coins: 100 },
          { name: "Skin Cyberpunk Neon Visor", coins: 250 },
          { name: "2x Staking Booster", coins: 150 },
        ];
        const won = rewards[Math.floor(Math.random() * rewards.length)];
        updateCoins(won.coins);
        sound.playWin();
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.5 } });
        showToast("Spin Berhasil!", `Selamat! Mendapatkan ${won.name} (+${won.coins} Coins)!`, "success");
      }, 2500);
    });
  };

  // Protected Chat Message
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    requireAuth(() => {
      sound.playClick();
      setChatList((prev) => [
        ...prev,
        {
          user: `@${user.username || "neo_user_922"}`,
          badge: "USER",
          text: chatInput.trim(),
          timeAgo: "baru saja",
          avatar: user.avatar,
        },
      ]);
      setChatInput("");
    });
  };

  const handleLikeStream = () => {
    sound.playClick(900);
    setLikes((l) => l + 1);
  };

  return (
    <div className="min-h-screen bg-[#050814] text-white font-sans pb-20 selection:bg-pink-500 selection:text-white">
      <div className="w-full max-w-md lg:max-w-7xl mx-auto relative flex flex-col min-h-screen px-0 lg:px-5">
        {/* TOP STATUS BAR & TIKTOK LIVE HEADER matching Screenshot 3 */}
        <div className="p-3 pb-2 flex items-center justify-between text-xs border-b border-slate-900 bg-[#050814]/90 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            {/* Pink LIVE badge */}
            <span className="px-2 py-0.5 rounded-lg bg-pink-600 text-white font-black text-[11px] shadow-[0_0_10px_rgba(219,39,119,0.8)] tracking-wider animate-pulse flex items-center gap-1">
              LIVE
            </span>

            {/* TikTok LIVE Branding */}
            <div className="flex items-center gap-1 font-black text-white text-xs tracking-tight">
              <span className="text-cyan-400 font-bold">♪</span>
              <span>TikTok</span>
              <span className="text-pink-500">LIVE</span>
            </div>
          </div>

          {/* Metrics & Actions */}
          <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <strong className="text-white">12.4K</strong>
            </span>

            <button
              onClick={handleLikeStream}
              className="flex items-center gap-1 text-pink-400 hover:scale-110 transition-transform cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-pink-500" />
              <strong className="text-white">{(likes / 1000).toFixed(1)}K</strong>
            </button>

            <button className="text-slate-400 hover:text-white">
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button className="text-slate-400 hover:text-white">
              <Tv className="w-3.5 h-3.5" />
            </button>
            <button className="text-slate-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-5 lg:items-start">
          <div className="min-w-0">
        {/* STREAMER VIDEO VIEWPORT matching Screenshot 3 */}
        <div className="relative aspect-[16/11] lg:aspect-video bg-slate-950 overflow-hidden border-b border-cyan-500/20 shadow-2xl">
          {/* Cyberpunk Anime Streamer Girl */}
          <img
            src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80"
            alt="CyberNeko Streamer"
            className="w-full h-full object-cover object-top filter brightness-95"
          />

          {/* Ambient Lighting Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050814] via-transparent to-black/30 pointer-events-none" />

          {/* Floating Neon Streamer Tag in Stream */}
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-xl border border-pink-500/40 flex items-center gap-2 text-[11px]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white">Stream: 1080p 60FPS</span>
          </div>
        </div>

        {/* STREAMER PROFILE INFO & FOLLOW BUTTON */}
        <div className="p-3.5 flex items-center justify-between border-b border-slate-900 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 via-purple-500 to-cyan-400 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80"
                alt="CYBERNEKO"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-wide">
                  CYBERNEKO • LIVE
                </span>
                <CheckCircle className="w-3.5 h-3.5 fill-cyan-400 text-slate-950" />
              </div>
              <p className="text-[11px] text-slate-400">
                Cyberpunk vibes • Main tebak nomer & spin! 🎮
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              setIsFollowing(!isFollowing);
              showToast(isFollowing ? "Unfollowed" : "Following!", isFollowing ? "You unfollowed CYBERNEKO." : "You are now following CYBERNEKO!", "success");
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              isFollowing
                ? "bg-slate-800 text-slate-300 border border-slate-700"
                : "bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_12px_rgba(219,39,119,0.5)]"
            }`}
          >
            {isFollowing ? "Followed" : "Follow +"}
          </button>
        </div>

        {/* PARTICIPANTS HORIZONTAL ROW matching Screenshot 3 */}
        <div className="px-3.5 py-2.5 border-b border-slate-900 bg-[#050814]/90">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
            <span className="font-bold text-white">Peserta (8)</span>
            <span className="text-cyan-400 hover:underline flex items-center gap-0.5 cursor-pointer">
              +276 lainnya <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
            {PARTICIPANTS.map((p, i) => (
              <div key={i} className="relative shrink-0">
                <div className="w-9 h-9 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-purple-600 overflow-hidden">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                {p.tiktok && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-black rounded-full border border-pink-500 flex items-center justify-center text-[7px] text-cyan-400 font-bold">
                    ♪
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CHAT LIVE vs PENONTON TABS */}
        <div className="grid grid-cols-2 text-xs font-black uppercase tracking-wider border-b border-slate-900">
          <button
            onClick={() => setActiveTab("chat")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "chat"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/5 font-extrabold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            CHAT LIVE
          </button>
          <button
            onClick={() => setActiveTab("viewers")}
            className={`py-2.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "viewers"
                ? "border-cyan-400 text-cyan-400 bg-cyan-500/5 font-extrabold"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            PENONTON (284)
          </button>
        </div>

        {/* INTERACTIVE EVENT CARDS matching Screenshot 3 */}
        <div className="p-3.5 space-y-3">
          {/* Card 1: TEBAK NOMER - EVENT LIVE */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#0c1228] to-[#120e24] border-2 border-pink-500/40 rounded-2xl p-3.5 shadow-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500/50 flex items-center justify-center text-pink-400">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 tracking-wide uppercase">
                    TEBAK NOMER
                  </h3>
                  <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    EVENT LIVE
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono font-bold text-[11px]">
                <Clock className="w-3 h-3" />
                <span>00:{timerSeconds.toString().padStart(2, "0")}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300">
              Aku pikir angka 1-100... Tebak sekarang!{" "}
              <strong className="text-yellow-400">Hadiah: 500 Coins</strong>
            </p>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[9px] font-mono text-cyan-400">
                <span>60%</span>
                <span>60%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-gradient-to-r from-cyan-400 to-pink-500 rounded-full shadow-[0_0_8px_rgba(236,72,153,0.8)]" />
              </div>
            </div>

            {/* Guess Input & Pink KIRIM Button */}
            <form onSubmit={handleSendTebak} className="flex gap-2 pt-1">
              <input
                type="number"
                min="1"
                max="100"
                placeholder="Masukkan tebakanmu (1-100)"
                value={tebakInput}
                onChange={(e) => setTebakInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-slate-950/90 border border-cyan-500/50 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-pink-600 to-pink-500 hover:from-pink-500 hover:to-pink-400 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_12px_rgba(219,39,119,0.6)] cursor-pointer"
              >
                KIRIM
              </button>
            </form>
          </div>

          {/* Card 2: SPIN & WIN */}
          <div className="relative overflow-hidden bg-gradient-to-r from-[#06152a] to-[#0d1326] border-2 border-cyan-500/40 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-cyan-300 uppercase tracking-wide">
                  SPIN & WIN
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">
                  Spin untuk hadiah: Skin Cyberpunk, 100 Coins, Booster!
                </p>
              </div>
            </div>

            <button
              onClick={handleSpinAndWin}
              disabled={isSpinning}
              className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-95 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-xl shadow-[0_0_10px_rgba(6,182,212,0.4)] whitespace-nowrap cursor-pointer flex items-center gap-1.5"
            >
              <RotateCw className={`w-3 h-3 text-slate-950 ${isSpinning ? "animate-spin" : ""}`} />
              <span>PUTAR SEKARANG</span>
            </button>
          </div>
        </div>

          </div>

          <aside className="min-w-0 lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:flex lg:flex-col lg:rounded-2xl lg:border lg:border-slate-800 lg:bg-slate-950/70 lg:overflow-hidden">
        {/* LIVE CHAT MESSAGES FEED matching Screenshot 3 */}
        <div
          ref={chatScrollRef}
          className="flex-1 px-3.5 space-y-2 overflow-y-auto max-h-56 lg:max-h-none lg:min-h-0 scrollbar-none text-xs"
        >
          {chatList.map((c, i) => (
            <div key={i} className="flex items-start gap-2 py-0.5 animate-in fade-in-50">
              {c.avatar && (
                <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 mt-0.5">
                  <img src={c.avatar} alt={c.user} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center gap-1.5 leading-none">
                  <span
                    className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                      c.badge === "TikTok"
                        ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40"
                        : c.badge === "VIP"
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-pink-600 text-white"
                    }`}
                  >
                    {c.badge}
                  </span>
                  <span className="font-bold text-slate-300 text-[11px]">{c.user}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{c.timeAgo}</span>
                </div>
                <div className="text-white text-xs mt-1 leading-snug break-words">
                  {c.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* SYSTEM TICKER ANNOUNCEMENT */}
        <div className="px-3.5 py-1 text-[10px] text-yellow-400 flex items-center gap-1 bg-yellow-500/10 border-t border-b border-yellow-500/20 font-semibold">
          <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
          <span className="truncate">
            [SYSTEM] 23 orang ikut Tebak Nomer. Tinggal {timerSeconds} detik!
          </span>
        </div>

        {/* BOTTOM LIVE BAR INPUT matching Screenshot 3 */}
        <div className="p-3 bg-[#050814]/95 border-t border-slate-900 sticky bottom-14 lg:bottom-auto lg:mt-auto z-30">
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            {/* Gift Icon Button */}
            <button
              type="button"
              onClick={() => {
                sound.playWin();
                showToast("Send Gift", "Pilih gift rose 🌹 atau crown 👑!", "info");
              }}
              className="p-2.5 rounded-xl bg-pink-500/20 border border-pink-500/40 text-pink-400 hover:text-white transition-colors cursor-pointer"
            >
              <Gift className="w-4 h-4" />
            </button>

            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setChatInput((prev) => prev + " 🔥")}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Smile className="w-4 h-4" />
            </button>

            {/* Chat Input Pill */}
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Kirim komentar..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-950 border border-cyan-500/30 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 p-1.5 text-pink-500 hover:text-pink-400"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
          </div>
        </aside>
        </div>
      </div>
    </div>
  );
}
