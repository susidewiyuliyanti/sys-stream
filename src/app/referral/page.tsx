import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../i18n';
import { sound } from '../../lib/sound';
import { Users, Copy, Check, Gift, ArrowRight, Share2, DollarSign, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReferralPage() {
  const { user, claimReferralRewards, showToast } = useGame();
  const { t } = useLanguage();
  const [copiedLink, setCopiedLink] = useState(false);
  const [pendingClaim, setPendingClaim] = useState({ coins: 0, diamonds: 0 });
  const [isClaimed, setIsClaimed] = useState(false);

  // Commission calculator state
  const [calcFriends, setCalcFriends] = useState(15);
  const [calcWagerPerFriend, setCalcWagerPerFriend] = useState(1000);

  const PRODUCTION_DOMAIN = 'https://sysstreamer.asia';
  const walletAddress = String(user.walletAddress || '').trim();
  const referralLink = walletAddress
    ? `${PRODUCTION_DOMAIN}/login?ref=${encodeURIComponent(walletAddress)}`
    : '';

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    sound.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
    showToast(t('Copied Link'), t('Referral link copied to clipboard!'), 'info');
  };

  const handleClaim = () => {
    if (pendingClaim.coins === 0 && pendingClaim.diamonds === 0) {
      showToast(t('No Pending Rewards'), t('All referral commissions have already been transferred.'), 'info');
      return;
    }

    claimReferralRewards();
    confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    setPendingClaim({ coins: 0, diamonds: 0 });
    setIsClaimed(true);
  };

  const estMonthlyEarnings = Math.floor(calcFriends * calcWagerPerFriend * 0.05);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-3">
          <Gift className="w-3.5 h-3.5" />
          <span>{t('Affiliate Partner Program')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          {t('Earn Passive Crypto & Gold Coins')}
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          {t('Invite fellow gamers to NEXUS...')}
        </p>
      </div>

      {/* Primary Referral Link Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
        <div className="grid md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <h2 className="text-lg font-bold text-white">{t('Your Personal Affiliate Link')}</h2>
            <p className="text-xs text-slate-400">
              {t('Anyone registering with your link receives...')} <strong className="text-amber-400">+500 Gold Coins</strong>
            </p>

            {/* Share Link Input */}
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 pl-3">
              <span className="text-xs font-mono text-slate-300 truncate flex-1 select-all">
                {referralLink || t('Wallet address belum tersedia. Hubungkan wallet terlebih dahulu.')}
              </span>
              <button
                onClick={copyLink}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? t('Copied!') : t('Copy Link')}</span>
              </button>
            </div>

            {/* Referral Code Quick Copy */}
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>{t('User ID / Wallet:')}</span>
              <span className="font-mono font-bold text-amber-400 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-md truncate max-w-full">
                {walletAddress || t('Wallet belum terhubung')}
              </span>
            </div>
          </div>

          {/* Pending Commission Balance & Claim Box */}
          <div className="md:col-span-5 bg-slate-950 border border-amber-500/30 rounded-2xl p-6 space-y-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t('Unclaimed Commission Balance')}
            </div>

            <div className="flex items-center justify-center gap-3">
              <div className="text-2xl font-mono font-black text-amber-400">
                🪙 {pendingClaim.coins.toLocaleString()}
              </div>
              <span className="text-slate-600">·</span>
              <div className="text-2xl font-mono font-black text-cyan-400">
                💎 {pendingClaim.diamonds}
              </div>
            </div>

            <button
              onClick={handleClaim}
              disabled={pendingClaim.coins === 0 && pendingClaim.diamonds === 0}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>{isClaimed ? t('All Claimed!') : t('Claim Commission to Wallet')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Tier Compensation Tree Breakdown */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold">
              {t('Tier 1 (Direct)')}
            </span>
            <span className="text-lg font-mono font-black text-white">5.0%</span>
          </div>
          <h3 className="text-sm font-bold text-white">{t('Direct Invitations')}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('Players who register directly via your personal link or referral code.')}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">{t('Active Referees:')}</span>
            <span className="font-mono text-white font-bold">{t('Data produksi')}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-bold">
              {t('Tier 2 (Sub-Affiliate)')}
            </span>
            <span className="text-lg font-mono font-black text-white">2.5%</span>
          </div>
          <h3 className="text-sm font-bold text-white">{t('Network Invites')}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('Players invited by your Tier 1 direct referees.')}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">{t('Active Referees:')}</span>
            <span className="font-mono text-white font-bold">{t('Data produksi')}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30 text-xs font-bold">
              {t('Tier 3 (Extended)')}
            </span>
            <span className="text-lg font-mono font-black text-white">1.0%</span>
          </div>
          <h3 className="text-sm font-bold text-white">{t('Deep Ecosystem')}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('Players invited down the tree by your Tier 2 network.')}
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between text-xs">
            <span className="text-slate-400">{t('Active Referees:')}</span>
            <span className="font-mono text-white font-bold">{t('Data produksi')}</span>
          </div>
        </div>
      </div>

      {/* Commission Estimator Calculator */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl mb-8">
        <h3 className="text-base font-bold text-white mb-1">{t('Affiliate Income Calculator')}</h3>
        <p className="text-xs text-slate-400 mb-6">
          {t('Slide to project your estimated monthly passive revenue...')}
        </p>

        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>{t('Active Friends Invited:')}</span>
                <span className="font-mono font-bold text-amber-400">{calcFriends} {t('Active Friends Invited:')}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={calcFriends}
                onChange={(e) => setCalcFriends(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1.5">
                <span>{t('Average Weekly Wager per Friend:')}</span>
                <span className="font-mono font-bold text-amber-400">{calcWagerPerFriend} {t('Gold Coins')}</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={calcWagerPerFriend}
                onChange={(e) => setCalcWagerPerFriend(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="text-xs text-slate-400 uppercase font-semibold">{t('Estimated Monthly Earnings')}</div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-amber-400 mt-2">
              +{estMonthlyEarnings.toLocaleString()} {t('Gold Coins')}
            </div>
            <div className="text-xs text-emerald-400 font-mono mt-1">
              ≈ ${(estMonthlyEarnings / 100).toFixed(2)} USD / month
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referral Activity Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="text-sm font-bold text-white">{t('Live Referral Feed')}</h3>
          <span className="text-xs text-slate-400">{t('Referral milik wallet ini')}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">{t('Referee Handle')}</th>
                <th className="py-3 px-4">{t('Date Joined')}</th>
                <th className="py-3 px-4">{t('Commission Tier')}</th>
                <th className="py-3 px-4">{t('Wager Volume')}</th>
                <th className="py-3 px-4 text-right">{t('Commission Earned')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr>
                <td colSpan={5} className="py-8 px-4 text-center text-slate-500">
                  {t('Belum ada data referral produksi untuk wallet ini.')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
