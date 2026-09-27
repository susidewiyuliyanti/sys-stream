import React, { useEffect } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Gift,
  X,
  ArrowRight,
  TrendingUp,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { playWinnerFanfare } from '../services/sound';

interface LoginLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

interface TopStreamerData {
  rank: number;
  name: string;
  handle: string;
  avatar: string;
  badge: string;
  isOwner?: boolean;
  sessions: number;
  totalDistributed: string;
  monthlyPrize: string;
}

// Papan peringkat default kosong, otomatis ter-update setiap minggu
const TOP_STREAMERS: TopStreamerData[] = [];

export const LoginLeaderboardModal: React.FC<LoginLeaderboardModalProps> = ({
  isOpen,
  onClose,
  onLoginClick
}) => {
  useEffect(() => {
    if (isOpen) {
      try {
        playWinnerFanfare();
      } catch (e) {
        // audio might be blocked if user hasn't interacted yet
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      id="login-leaderboard-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300 select-none"
    >
      <div
        id="login-leaderboard-modal-container"
        className="relative w-full max-w-2xl max-h-[90vh] bg-gradient-to-b from-[#141a29] via-[#0b0f1a] to-[#060911] border-2 border-amber-500/50 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden text-white font-['Poppins']"
      >
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent blur-xs" />

        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-amber-950/40 via-neutral-900/60 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 ring-2 ring-yellow-300/40">
              <Trophy className="w-6 h-6 fill-current stroke-1" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-1.5">
                  <span>Weekly Leaderboard (Top Referrals)</span>
                </h2>
              </div>
              <p className="text-[11px] text-amber-300/90 flex items-center gap-1 font-medium">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-current" />
                <span>Automatically updated every week • Total Prizes $350+ and SYS Trophy</span>
              </p>
            </div>
          </div>

          <button
            id="close-login-leaderboard-btn"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 transition-colors"
            title="Close Leaderboard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 scrollbar-thin scrollbar-thumb-white/20">
          {/* Highlight Notification Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-amber-200 block text-xs">
                  Weekly Host Reward Program
                </span>
                <span className="text-[11px] text-white/70">
                  Updated automatically every week by top referrals. All active streamers are eligible to win cash bonuses.
                </span>
              </div>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] tracking-wider uppercase shadow-sm">
              WEEKLY
            </span>
          </div>

          {TOP_STREAMERS.length === 0 ? (
            <div className="py-12 px-4 text-center rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-bold text-white">Weekly Leaderboard is Empty</h4>
                <p className="text-xs text-white/60">
                  No referral entries recorded for this weekly cycle yet. Sign in and share your referral code to lead the ranks!
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Top 3 Podium Cards */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Season Champion Podium</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* RANK 1 */}
                  <div className="relative p-3.5 rounded-2xl bg-gradient-to-b from-amber-500/20 via-neutral-900 to-neutral-950 border-2 border-amber-400/60 shadow-lg shadow-amber-500/15 flex flex-col items-center text-center order-1 sm:order-2">
                    <div className="absolute -top-3 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[10px] uppercase shadow-md flex items-center gap-1">
                      <span>🥇 TOP 1</span>
                    </div>
                    <div className="relative mt-2 mb-2">
                      <img
                        src={TOP_STREAMERS[0]?.avatar}
                        alt={TOP_STREAMERS[0]?.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-amber-400"
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-amber-400 text-slate-950">
                        <Crown className="w-3 h-3 fill-current" />
                      </div>
                    </div>
                    <h4 className="font-black text-xs text-white leading-tight">
                      {TOP_STREAMERS[0]?.name}
                    </h4>
                    <span className="text-[10px] text-amber-300 font-bold px-2 py-0.5 mt-1 rounded-full bg-amber-400/20 border border-amber-400/30">
                      {TOP_STREAMERS[0]?.badge}
                    </span>
                    <div className="mt-2 text-[11px] font-mono font-black text-emerald-400">
                      {TOP_STREAMERS[0]?.monthlyPrize}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTA */}
        <div className="p-4 border-t border-white/10 bg-neutral-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] text-white/60 text-center sm:text-left">
            Broadcast games live & earn points to join the top leaderboard!
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onLoginClick();
              }}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
            >
              <span>Sign In as Streamer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
