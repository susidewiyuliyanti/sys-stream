import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../lib/sound';
import {
  ArrowLeft,
  Bell,
  Trophy,
  Rocket,
  Copy,
  Check,
  ChevronRight,
  Users,
  Flame,
  Clock,
  Sparkles,
  Share2,
} from 'lucide-react';

interface LeaderboardProps {
  navigate?: (path: string) => void;
}

export default function LeaderboardPage({ navigate }: LeaderboardProps) {
  const { user, showToast, claimReferralRewards } = useGame();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'referral'>('leaderboard');
  const [copied, setCopied] = useState(false);

  const referralCode = user.referralCode || 'CYBER-9X7QK2';

  const handleCopyCode = () => {
    sound.playClick();
    navigator.clipboard?.writeText(referralCode);
    setCopied(true);
    showToast('Code Copied!', `Referral code ${referralCode} copied to clipboard.`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleInviteFriends = () => {
    sound.playWin();
    handleCopyCode();
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans pb-24 selection:bg-cyan-500 selection:text-black">
      <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-5">
        {/* Header Bar matching Screenshot 4 */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              sound.playClick();
              if (navigate) navigate('/room/main');
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <h1
            className="text-lg sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 tracking-wider uppercase text-center"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            LEADERBOARD & REFERRAL
          </h1>

          <button
            onClick={() => {
              sound.playClick();
              showToast('Notifications', 'Referral bonus season is live!', 'info');
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900/60 border border-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>

        {/* Top Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-cyan-500/20 text-xs font-black uppercase tracking-wider">
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('leaderboard');
            }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            LEADERBOARD
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setActiveTab('referral');
            }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'referral'
                ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            REFERRAL EVENT
          </button>
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Trophy className="w-4 h-4 text-cyan-400" />
          <span>TOP USERS RANKED</span>
        </div>

        {/* 3-PERSON PODIUM matching Screenshot 4 */}
        <div className="grid grid-cols-3 gap-2.5 items-end pt-3">
          {/* Rank 2: HEX_WOLF */}
          <div className="bg-slate-950/90 border border-cyan-500/40 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-lg relative">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500 text-cyan-400 font-mono font-black text-xs flex items-center justify-center -mt-5 mb-2 shadow">
              2
            </div>
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-cyan-500 to-blue-600 mb-2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"
                alt="HEX_WOLF"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="text-xs font-black text-white truncate max-w-full">HEX_WOLF</div>
            <div className="text-[11px] font-mono font-bold text-cyan-400 mt-0.5">10,920 pts</div>
          </div>

          {/* Rank 1: NOVA_K (Taller, illuminated purple/pink glowing frame) */}
          <div className="bg-gradient-to-b from-purple-950/60 to-slate-950 border-2 border-purple-500 rounded-3xl p-3 flex flex-col items-center text-center shadow-[0_0_25px_rgba(168,85,247,0.4)] relative -mt-4 pb-4">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white font-mono font-black text-sm flex items-center justify-center -mt-6 mb-2 shadow-lg shadow-purple-600/50">
              1
            </div>
            <div className="w-18 h-18 rounded-full p-1 bg-gradient-to-tr from-purple-500 via-pink-500 to-cyan-400 mb-2 overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=200&auto=format&fit=crop&q=80"
                alt="NOVA_K"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="text-sm font-black text-white truncate max-w-full">NOVA_K</div>
            <div className="text-xs font-mono font-black text-purple-300 mt-0.5">12,450 pts</div>
          </div>

          {/* Rank 3: ZX_DRAKE */}
          <div className="bg-slate-950/90 border border-purple-500/40 rounded-2xl p-2.5 flex flex-col items-center text-center shadow-lg relative">
            <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-500 text-pink-400 font-mono font-black text-xs flex items-center justify-center -mt-5 mb-2 shadow">
              3
            </div>
            <div className="w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-600 mb-2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80"
                alt="ZX_DRAKE"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="text-xs font-black text-white truncate max-w-full">ZX_DRAKE</div>
            <div className="text-[11px] font-mono font-bold text-pink-400 mt-0.5">9,810 pts</div>
          </div>
        </div>

        {/* RANK 4-5 LIST */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">RANK 4-5</div>

          {/* Rank 04 */}
          <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-cyan-400 text-sm">04</span>
              <div className="w-9 h-9 rounded-full p-0.5 bg-purple-500/40 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                  alt="LUMINA_R"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-white">LUMINA_R</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400">
              <span>7,340 pts</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </div>
          </div>

          {/* Rank 05 */}
          <div className="flex items-center justify-between p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-pink-400 text-sm">05</span>
              <div className="w-9 h-9 rounded-full p-0.5 bg-pink-500/40 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                  alt="VOID_KIT"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-white">VOID_KIT</span>
            </div>
            <div className="text-xs font-mono font-bold text-pink-400">
              6,210 pts
            </div>
          </div>
        </div>

        {/* REFERRAL EVENT CARD matching Screenshot 4 */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-[#0a0f24] to-[#040814] border-2 border-purple-500/40 rounded-3xl p-5 shadow-[0_0_30px_rgba(168,85,247,0.15)] space-y-4">
          {/* Card Header */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Rocket className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-purple-300 uppercase tracking-wider">
                REFERRAL EVENT — Invite Friends, Earn Bonus
              </h3>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Earn 500 CP for each friend you invite. Your friend gets 200 CP after they join & reach Level 5.
          </p>

          {/* Referral Code Box */}
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">
              YOUR REFERRAL CODE
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-950 border border-cyan-500/40 rounded-2xl">
              <span className="font-mono font-black text-cyan-400 text-sm tracking-widest select-all">
                {referralCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 bg-purple-600/30 hover:bg-purple-600/40 border border-purple-500/50 rounded-xl text-purple-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">TOTAL REFERRALS</div>
              <div className="text-lg font-black text-white font-mono mt-0.5">8</div>
              <div className="text-[10px] text-emerald-400 font-bold">+4,000 CP earned</div>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">BONUS BALANCE</div>
              <div className="text-lg font-black text-purple-300 font-mono mt-0.5">4,200 CP</div>
              <div className="text-[10px] text-slate-400">≈ $42.00 USD</div>
            </div>
          </div>

          {/* Gradient Glowing Button: INVITE FRIENDS — EARN NOW */}
          <button
            onClick={handleInviteFriends}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:opacity-95 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>INVITE FRIENDS — EARN NOW</span>
          </button>

          <div className="text-center text-[10px] text-slate-500 font-mono">
            Event ends: Nov 30, 2026 • 12 days left
          </div>
        </div>
      </div>
    </div>
  );
}
