import React, { useState, useEffect, useMemo } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  Flame,
  Award,
  Users,
  TrendingUp,
  Gift,
  ArrowUpRight,
  Shield,
  Search,
  Filter,
  CheckCircle2,
  Tv,
  Coins,
  Clock,
  Calendar
} from 'lucide-react';
import { UserProfile, StreamingSessionLog } from '../types';
import { LEADERBOARD_PRIZES } from '../constants/referralTiers';
import { subscribeToAllUsers, subscribeToAllStreamingSessions } from '../services/firebase';
import { playClick } from '../services/sound';

interface LeaderboardPageProps {
  currentUser: UserProfile | null;
  onOpenReferralModal: () => void;
  onOpenPricingModal: () => void;
  onBackToGame?: () => void;
}

interface StreamerRankItem {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  badge: string;
  isOwner?: boolean;
  totalSessions: number;
  totalRounds: number;
  totalPrizeDistributed: number;
  referralCount: number;
  affiliateEarnings: number;
  rank?: number;
}

// Papan leaderboard default kosong, otomatis ter-update setiap minggu dengan data referral real
const BASELINE_STREAMERS: StreamerRankItem[] = [];

export const LeaderboardPage: React.FC<LeaderboardPageProps> = ({
  currentUser,
  onOpenReferralModal,
  onOpenPricingModal,
  onBackToGame
}) => {
  const [activeTab, setActiveTab] = useState<'streamers' | 'affiliates'>('affiliates');
  const [searchQuery, setSearchQuery] = useState('');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [sessionsList, setSessionsList] = useState<StreamingSessionLog[]>([]);
  const [weeklyCountdown, setWeeklyCountdown] = useState<string>('');

  // Weekly reset timer calculation (Every Sunday 23:59:59 WIB)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate next Sunday 23:59:59
      const dayOfWeek = now.getDay(); // 0 is Sunday
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      const nextSunday = new Date(now);
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(23, 59, 59, 999);

      const diff = nextSunday.getTime() - now.getTime();
      if (diff <= 0) {
        setWeeklyCountdown('Resetting Now');
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      setWeeklyCountdown(`${days}d ${hours}h ${minutes}m`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);

  // Listen to Firestore real data
  useEffect(() => {
    const unsubUsers = subscribeToAllUsers((users) => {
      setUsersList(users);
    });

    const unsubSessions = subscribeToAllStreamingSessions((sessions) => {
      setSessionsList(sessions);
    });

    return () => {
      unsubUsers();
      unsubSessions();
    };
  }, []);

  // Merge real firestore users & sessions with baseline list
  const combinedRankings = useMemo(() => {
    const map = new Map<string, StreamerRankItem>();

    // Add baseline
    BASELINE_STREAMERS.forEach((item) => {
      map.set(item.name.toLowerCase(), { ...item });
    });

    // Incorporate real users from Firestore
    usersList.forEach((user) => {
      const key = (user.displayName || user.email).toLowerCase();
      const existing = map.get(key) || {
        id: user.uid,
        name: user.displayName || user.email.split('@')[0],
        handle: user.streamerHandle ? `@${user.streamerHandle}` : `@${user.email.split('@')[0]}`,
        avatar: user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.displayName || user.email || user.uid)}`,
        badge: user.role === 'admin' ? 'Sultan VIP Host' : user.subscriptionPlan || 'Member Host',
        isOwner: user.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com',
        totalSessions: 0,
        totalRounds: 0,
        totalPrizeDistributed: 0,
        referralCount: user.referralCount || 0,
        affiliateEarnings: user.affiliateEarnings || 0
      };

      existing.referralCount = Math.max(existing.referralCount, user.referralCount || 0);
      existing.affiliateEarnings = Math.max(existing.affiliateEarnings, user.affiliateEarnings || 0);
      if (user.role === 'admin' || user.isLifetime) {
        existing.badge = user.email?.toLowerCase() === 'susidewiyuliyanti@gmail.com' ? 'Sultan Super Owner' : 'Sultan VIP Host';
      }

      map.set(key, existing);
    });

    // Incorporate real streaming sessions
    sessionsList.forEach((session) => {
      const user = usersList.find((u) => u.uid === session.userId);
      const nameKey = user ? (user.displayName || user.email).toLowerCase() : session.userEmail.toLowerCase();
      const item = map.get(nameKey);
      if (item) {
        item.totalSessions += 1;
        item.totalRounds += session.totalRounds || 1;
        item.totalPrizeDistributed += session.totalPrizeDistributed || 0;
      }
    });

    const list = Array.from(map.values());

    // Filter by search query
    const filtered = list.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.handle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort based on active tab
    if (activeTab === 'streamers') {
      filtered.sort((a, b) => {
        // Primary: totalPrizeDistributed, Secondary: totalSessions
        if (b.totalPrizeDistributed !== a.totalPrizeDistributed) {
          return b.totalPrizeDistributed - a.totalPrizeDistributed;
        }
        return b.totalSessions - a.totalSessions;
      });
    } else {
      // Affiliates tab: sorted by referralCount, then affiliateEarnings
      filtered.sort((a, b) => {
        if (b.referralCount !== a.referralCount) {
          return b.referralCount - a.referralCount;
        }
        return b.affiliateEarnings - a.affiliateEarnings;
      });
    }

    return filtered.map((item, index) => ({
      ...item,
      rank: index + 1
    }));
  }, [usersList, sessionsList, activeTab, searchQuery]);

  const topThree = combinedRankings.slice(0, 3);
  const others = combinedRankings.slice(3);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/50 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Official Live Streamer Leaderboard</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] text-emerald-400">Live Realtime</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
              Hall of Fame & Leaderboard
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-2xl">
              Rankings of the most active streamers and top referral hosts. Claim Top 3 positions to win high cash bonuses and permanent VIP Host status!
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => {
                playClick();
                onOpenReferralModal();
              }}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
            >
              <Gift className="w-4 h-4" />
              Rewards & Referral Program
            </button>

            {onBackToGame && (
              <button
                onClick={() => {
                  playClick();
                  onBackToGame();
                }}
                className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm border border-slate-700 transition-colors cursor-pointer"
              >
                Back to Game
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Program Hadiah Juara Bulanan Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {LEADERBOARD_PRIZES.map((prize) => (
          <div
            key={prize.rank}
            className={`relative p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border ${prize.border} shadow-xl flex items-center gap-4 overflow-hidden`}
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${prize.gradient} flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shrink-0`}
            >
              #{prize.rank}
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                {prize.title}
              </div>
              <div className="text-lg sm:text-xl font-black text-white">
                Rp {prize.cashPrize.toLocaleString('id-ID')}
              </div>
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                <Crown className="w-3.5 h-3.5" />
                {prize.badge}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Countdown & Reset Info Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5 text-xs text-amber-300">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold">Active Weekly Cycle:</span>
          <span className="text-slate-300">Automatically updated every week by top referrals</span>
        </div>
        {weeklyCountdown && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Weekly Reset: {weeklyCountdown}</span>
          </div>
        )}
      </div>

      {/* Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => {
              playClick();
              setActiveTab('affiliates');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'affiliates'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Weekly Top Referrals
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('streamers');
            }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === 'streamers'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md font-black'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-4 h-4" />
            Live Host Activity
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search host name or handle..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* 3D VISUAL PODIUM (TOP 3) */}
      {topThree.length >= 3 && (
        <div className="pt-8 pb-4">
          <div className="grid grid-cols-3 gap-2 sm:gap-6 items-end max-w-4xl mx-auto">
            {/* Rank 2 (Left) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-slate-300 p-1 bg-slate-800 overflow-hidden shadow-xl shadow-slate-300/10">
                  <img
                    src={topThree[1].avatar}
                    alt={topThree[1].name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-200 text-slate-950 px-2 py-0.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border border-slate-400">
                  <Medal className="w-3 h-3 text-slate-700" />
                  #2
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <h4 className="font-bold text-white text-xs sm:text-base truncate max-w-[120px] sm:max-w-[180px]">
                  {topThree[1].name}
                </h4>
                <div className="text-[10px] sm:text-xs text-slate-400">{topThree[1].handle}</div>
                <div className="text-[11px] font-black text-amber-400 mt-1">
                  {activeTab === 'streamers'
                    ? `Rp ${topThree[1].totalPrizeDistributed.toLocaleString('id-ID')}`
                    : `${topThree[1].referralCount} Hosts Invited`}
                </div>
              </div>

              <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-slate-800 to-slate-700 rounded-t-2xl border-t border-x border-slate-500/50 flex flex-col items-center justify-center p-2 text-center shadow-lg">
                <span className="text-xl sm:text-3xl font-black text-slate-200">2nd</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300">Silver Host</span>
                <span className="text-[9px] sm:text-[10px] text-amber-300 font-semibold mt-1">
                  Bonus $80
                </span>
              </div>
            </div>

            {/* Rank 1 (Center - Highest) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 animate-bounce">
                  <Crown className="w-7 h-7 sm:w-9 sm:h-9 filter drop-shadow-[0_0_8px_rgba(234,179,8,0.8)]" />
                </div>
                <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-full border-4 border-yellow-400 p-1 bg-amber-500/20 overflow-hidden shadow-2xl shadow-yellow-500/30">
                  <img
                    src={topThree[0].avatar}
                    alt={topThree[0].name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 px-3 py-0.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1 border border-yellow-300">
                  <Trophy className="w-3.5 h-3.5 text-slate-950" />
                  CHAMPION #1
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <h4 className="font-black text-white text-sm sm:text-lg truncate max-w-[140px] sm:max-w-[220px]">
                  {topThree[0].name}
                </h4>
                <div className="text-[11px] sm:text-xs text-amber-400 font-semibold">{topThree[0].handle}</div>
                <div className="text-xs sm:text-sm font-black text-emerald-400 mt-1">
                  {activeTab === 'streamers'
                    ? `Rp ${topThree[0].totalPrizeDistributed.toLocaleString('id-ID')} Prizes`
                    : `${topThree[0].referralCount} Hosts Invited`}
                </div>
              </div>

              <div className="w-full h-36 sm:h-48 bg-gradient-to-t from-amber-950/80 via-yellow-600/30 to-amber-500/20 rounded-t-2xl border-t-2 border-x border-yellow-400 flex flex-col items-center justify-center p-2 text-center shadow-2xl shadow-yellow-500/20">
                <span className="text-2xl sm:text-4xl font-black text-yellow-400">1st</span>
                <span className="text-xs sm:text-sm font-black text-white">SULTAN CHAMPION</span>
                <span className="text-[10px] sm:text-xs text-amber-300 font-bold mt-1">
                  Bonus $160 + Lifetime VIP
                </span>
              </div>
            </div>

            {/* Rank 3 (Right) */}
            <div className="flex flex-col items-center">
              <div className="relative mb-3">
                <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full border-4 border-amber-700 p-1 bg-slate-800 overflow-hidden shadow-xl shadow-amber-700/10">
                  <img
                    src={topThree[2].avatar}
                    alt={topThree[2].name}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-800 text-white px-2 py-0.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border border-amber-600">
                  <Medal className="w-3 h-3 text-amber-300" />
                  #3
                </div>
              </div>

              <div className="text-center mb-2 px-1">
                <h4 className="font-bold text-white text-xs sm:text-base truncate max-w-[120px] sm:max-w-[180px]">
                  {topThree[2].name}
                </h4>
                <div className="text-[10px] sm:text-xs text-slate-400">{topThree[2].handle}</div>
                <div className="text-[11px] font-black text-amber-400 mt-1">
                  {activeTab === 'streamers'
                    ? `Rp ${topThree[2].totalPrizeDistributed.toLocaleString('id-ID')}`
                    : `${topThree[2].referralCount} Hosts Invited`}
                </div>
              </div>

              <div className="w-full h-24 sm:h-32 bg-gradient-to-t from-slate-900 to-amber-950/40 rounded-t-2xl border-t border-x border-amber-700/50 flex flex-col items-center justify-center p-2 text-center shadow-lg">
                <span className="text-xl sm:text-3xl font-black text-amber-500">3rd</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-300">Bronze Host</span>
                <span className="text-[9px] sm:text-[10px] text-amber-400 font-semibold mt-1">
                  Bonus $40
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EMPTY STATE IF NO USERS YET */}
      {combinedRankings.length === 0 ? (
        <div className="py-16 px-6 text-center rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center space-y-4 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-lg sm:text-xl font-black text-white">
              Weekly Leaderboard is Empty
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Leaderboard updates in real-time and automatically resets every week. Share your referral code with fellow streamers to lead the ranks this week!
            </p>
          </div>
          <button
            onClick={() => {
              playClick();
              onOpenReferralModal();
            }}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span>Share My Referral Code</span>
          </button>
        </div>
      ) : (
        /* FULL LEADERBOARD TABLE */
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              Complete Streamer Rankings
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              Showing {combinedRankings.length} Active Streamers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4 w-16 text-center">Rank</th>
                  <th className="py-3 px-4">Streamer Host</th>
                  <th className="py-3 px-4">Status / Badge</th>
                  <th className="py-3 px-4 text-right">
                    {activeTab === 'streamers' ? 'Total Game Rounds' : 'Hosts Invited'}
                  </th>
                  <th className="py-3 px-4 text-right">
                    {activeTab === 'streamers' ? 'Total Viewer Prizes' : 'Total Commission Earned'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {combinedRankings.map((item) => {
                  const isCurrentUser = currentUser?.uid === item.id || (currentUser?.email && currentUser.email.toLowerCase() === item.name.toLowerCase());
                  return (
                    <tr
                      key={item.id}
                      className={`transition-colors hover:bg-slate-800/40 ${
                        isCurrentUser ? 'bg-amber-500/10 border-l-4 border-l-amber-400' : ''
                      }`}
                    >
                      {/* Rank Number */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-xl font-black text-xs ${
                            item.rank === 1
                              ? 'bg-yellow-400 text-slate-950 shadow-md shadow-yellow-500/20'
                              : item.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : item.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>

                      {/* Streamer Avatar & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="truncate max-w-[150px] sm:max-w-[220px]">
                            <div className="font-bold text-white flex items-center gap-1.5 truncate">
                              <span className="truncate">{item.name}</span>
                              {item.isOwner && (
                                <Crown className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                              )}
                              {isCurrentUser && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-500 text-slate-950">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">{item.handle}</div>
                          </div>
                        </div>
                      </td>

                      {/* Badge */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-amber-300 border border-slate-700">
                          <Award className="w-3 h-3 text-amber-400" />
                          {item.badge}
                        </span>
                      </td>

                      {/* Metric 1 */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {activeTab === 'streamers' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <Tv className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{item.totalRounds} Rounds</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1.5">
                            <Users className="w-3.5 h-3.5 text-cyan-400" />
                            <span>{item.referralCount} Streamers</span>
                          </div>
                        )}
                      </td>

                      {/* Metric 2 */}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {activeTab === 'streamers' ? (
                          <span className="text-emerald-400">
                            Rp {item.totalPrizeDistributed.toLocaleString('id-ID')}
                          </span>
                        ) : (
                          <span className="text-amber-400">
                            Rp {item.affiliateEarnings.toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer Info Box */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-amber-950/30 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">Want to Climb the Ranks Faster?</div>
            <p className="text-slate-400">
              Stream regularly each day and invite fellow hosts to earn leaderboard points and weekly cash bonuses.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            playClick();
            onOpenReferralModal();
          }}
          className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold transition-colors whitespace-nowrap self-start sm:self-auto cursor-pointer"
        >
          View My Referral Code
        </button>
      </div>
    </div>
  );
};
