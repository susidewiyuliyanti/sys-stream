import React, { useState, useEffect } from 'react';
import {
  X,
  Copy,
  Check,
  Share2,
  Gift,
  Award,
  Wallet,
  ArrowUpRight,
  Users,
  ChevronRight,
  DollarSign,
  TrendingUp,
  Target,
  ShieldCheck,
  Clock,
  Send,
  AlertCircle,
  CheckCircle2,
  Calculator,
  FileText,
  Crown,
  Info,
  BadgeCheck,
  Coins,
  Flame,
  Star,
  Zap,
  HelpCircle
} from 'lucide-react';
import { UserProfile, ReferralRecord, AffiliateWithdrawal } from '../types';
import {
  REFERRAL_REWARD_TIERS,
  REFERRAL_BONUS_PER_MEMBER,
  NEW_MEMBER_WELCOME_BONUS,
  REFERRAL_TERMS_AND_CONDITIONS,
  calculateReferralBreakdown
} from '../constants/referralTiers';
import {
  applyReferralCode,
  subscribeToUserReferrals,
  requestAffiliateWithdrawal,
  subscribeToUserWithdrawals
} from '../services/firebase';
import { playClick, playWinnerFanfare, playTick } from '../services/sound';
import { ReferralCalculationTab } from './ReferralCalculationTab';
import { ReferralTermsTab } from './ReferralTermsTab';

interface ReferralAffiliateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  onOpenPricing?: () => void;
}

export const ReferralAffiliateModal: React.FC<ReferralAffiliateModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  onOpenPricing
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'calculation' | 'terms' | 'tiers' | 'withdraw' | 'history'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Interactive Simulator state
  const [simulatedCount, setSimulatedCount] = useState<number>(50);

  // Referral sponsor input
  const [sponsorCode, setSponsorCode] = useState('');
  const [claimingSponsor, setClaimingSponsor] = useState(false);
  const [sponsorMessage, setSponsorMessage] = useState<{ text: string; isError: boolean } | null>(null);

  // User data
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [withdrawals, setWithdrawals] = useState<AffiliateWithdrawal[]>([]);

  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100000);
  const [bankMethod, setBankMethod] = useState<string>('BCA');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [accountName, setAccountName] = useState<string>('');
  const [withdrawing, setWithdrawing] = useState<boolean>(false);
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ text: string; isError: boolean } | null>(null);

  const referralCode = userProfile?.referralCode || 'SYS-HOSTVIP';
  const referralCount = userProfile?.referralCount || referrals.length || 0;
  const affiliateEarnings = userProfile?.affiliateEarnings || 0;
  const affiliateWithdrawn = userProfile?.affiliateWithdrawn || 0;
  const availableBalance = Math.max(0, affiliateEarnings - affiliateWithdrawn);

  // Construct referral link
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://streamer-vip.app';
  const shareLink = `${origin}?ref=${encodeURIComponent(referralCode)}`;

  // Determine current tier
  const currentTier = [...REFERRAL_REWARD_TIERS].reverse().find(t => referralCount >= t.minReferrals) || null;
  const nextTier = REFERRAL_REWARD_TIERS.find(t => referralCount < t.minReferrals) || null;

  // Progress to next tier
  const progressPercent = nextTier
    ? Math.min(100, Math.round((referralCount / nextTier.minReferrals) * 100))
    : 100;

  useEffect(() => {
    if (!isOpen || !userProfile?.uid) return;

    const unsubReferrals = subscribeToUserReferrals(userProfile.uid, (list) => {
      setReferrals(list);
    });

    const unsubWithdrawals = subscribeToUserWithdrawals(userProfile.uid, (list) => {
      setWithdrawals(list);
    });

    return () => {
      unsubReferrals();
      unsubWithdrawals();
    };
  }, [isOpen, userProfile?.uid]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    playTick();
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    playTick();
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWA = () => {
    playClick();
    const text = `🎁 Join me on Live Streamer Sultan Studio! Get a FREE 15,000 IDR WELCOME BALANCE immediately upon registering with referral code: *${referralCode}*!\n\nEvery referral gives 5,000 IDR and cash bonuses up to 8,500,000 IDR + Free Lifetime Sultan VIP.\n\nRegister now: ${shareLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleClaimSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;
    if (!sponsorCode.trim()) {
      setSponsorMessage({ text: 'Please enter a sponsor referral code.', isError: true });
      return;
    }

    setClaimingSponsor(true);
    setSponsorMessage(null);

    try {
      const res = await applyReferralCode(userProfile.uid, sponsorCode);
      if (res.success) {
        playWinnerFanfare();
        setSponsorMessage({ text: res.message, isError: false });
        setSponsorCode('');
      } else {
        setSponsorMessage({ text: res.message, isError: true });
      }
    } catch (err: any) {
      setSponsorMessage({ text: err.message || 'Failed to apply referral code.', isError: true });
    } finally {
      setClaimingSponsor(false);
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile?.uid) return;

    if (withdrawAmount < 100000) {
      setWithdrawFeedback({ text: 'Minimum withdrawal amount is 100,000 IDR.', isError: true });
      return;
    }
    if (withdrawAmount > availableBalance) {
      setWithdrawFeedback({ text: 'Amount exceeds your available commission balance.', isError: true });
      return;
    }
    if (!accountNumber.trim() || !accountName.trim()) {
      setWithdrawFeedback({ text: 'Please provide both account number and account holder name.', isError: true });
      return;
    }

    setWithdrawing(true);
    setWithdrawFeedback(null);

    try {
      await requestAffiliateWithdrawal({
        withdrawalId: '',
        userId: userProfile.uid,
        userEmail: userProfile.email,
        userName: userProfile.displayName || 'Host Streamer',
        amount: withdrawAmount,
        bankName: bankMethod,
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        status: 'completed',
        createdAt: new Date().toISOString()
      });

      playWinnerFanfare();
      setWithdrawFeedback({
        text: `Withdrawal of ${withdrawAmount.toLocaleString('id-ID')} IDR to ${bankMethod} (${accountNumber}) successfully processed!`,
        isError: false
      });
      setAccountNumber('');
      setAccountName('');
    } catch (err: any) {
      setWithdrawFeedback({ text: err.message || 'Failed to process commission withdrawal.', isError: true });
    } finally {
      setWithdrawing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] my-auto">
        {/* Modal Header */}
        <div className="relative px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-slate-950">
              <Gift className="w-5 h-5 font-bold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                  Referral & Affiliate Rewards Program
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Commission up to 35%
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Invite fellow host streamers and earn passive commissions plus cash bonuses up to millions of IDR
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-5 sm:px-6 pt-3 border-b border-slate-800 bg-slate-950/60 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              playClick();
              setActiveTab('overview');
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Share2 className="w-4 h-4" />
            Overview & Links
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('calculation');
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'calculation'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            Reward Calculation
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('terms');
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            Terms & Conditions
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('tiers');
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'tiers'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            Reward Milestones
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('withdraw');
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'withdraw'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wallet className="w-4 h-4 text-purple-400" />
            Withdraw Commission
            {availableBalance > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            )}
          </button>

          <button
            onClick={() => {
              playClick();
              setActiveTab('history');
            }}
            className={`px-3.5 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            Referred Friends ({referrals.length})
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & SHARING */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Available Balance</span>
                    <Wallet className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-emerald-400">
                    Rp {availableBalance.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Ready for withdrawal
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Total Earnings</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-amber-300">
                    Rp {affiliateEarnings.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Commissions & bonuses
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Invited Hosts</span>
                    <Users className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-base sm:text-lg font-black text-cyan-300">
                    {referralCount} Hosts
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Active referrals
                  </div>
                </div>

                <div className="p-3.5 bg-slate-800/80 border border-slate-700/60 rounded-xl">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                    <span>Tier Level</span>
                    <Award className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-xs sm:text-sm font-black text-purple-300 truncate">
                    {currentTier ? currentTier.title : 'Standard Member'}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    Commission {currentTier ? `${currentTier.rewardCommissionPct}%` : '20%'}
                  </div>
                </div>
              </div>

              {/* Progress to Next Tier */}
              {nextTier && (
                <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700 rounded-xl">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-amber-400" />
                      Target Next Level: <strong className="text-amber-300">{nextTier.title}</strong>
                    </span>
                    <span className="text-slate-400">
                      {referralCount} / {nextTier.minReferrals} Hosts ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/70 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Invite {nextTier.minReferrals - referralCount} more hosts to level up</span>
                    <span className="text-emerald-400 font-bold">
                      Reward: Rp {nextTier.bonusCash.toLocaleString('id-ID')} + {nextTier.rewardCommissionPct}% Commission
                    </span>
                  </div>
                </div>
              )}

              {/* Referral Code & Share Link Box */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-950/20 via-slate-900 to-slate-900 border border-amber-500/40 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      Your Referral Code & Invitation Link
                    </h3>
                    <p className="text-xs text-slate-400">
                      Share with streamer friends on TikTok, YouTube, or your live streaming community
                    </p>
                  </div>
                  <button
                    onClick={handleShareWA}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors self-start sm:self-auto shadow-md"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Share to WhatsApp
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Copy Code */}
                  <div className="p-3 bg-slate-950/80 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Unique Referral Code
                      </div>
                      <div className="text-base font-black text-amber-400 font-mono tracking-wider">
                        {referralCode}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyCode}
                      className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-500/30 transition-all"
                    >
                      {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedCode ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>

                  {/* Copy Link */}
                  <div className="p-3 bg-slate-950/80 border border-slate-700 rounded-xl flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Direct Invitation Link
                      </div>
                      <div className="text-xs text-slate-300 truncate font-mono">
                        {shareLink}
                      </div>
                    </div>
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-600 transition-all whitespace-nowrap"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedLink ? 'Copied' : 'Copy Link'}
                    </button>
                  </div>
                </div>

                {/* Program Summary Quick Card */}
                <div className="p-4 bg-gradient-to-r from-amber-500/15 via-slate-900 to-emerald-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-black text-white uppercase tracking-wider">
                        Official Rewards & Referral Program
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          playClick();
                          setActiveTab('calculation');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 transition-colors flex items-center gap-1"
                      >
                        <Calculator className="w-3 h-3" />
                        Reward Calculation
                      </button>
                      <button
                        onClick={() => {
                          playClick();
                          setActiveTab('terms');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 text-[11px] font-bold border border-indigo-500/40 transition-colors flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Terms & Conditions
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] text-slate-400">New Member</div>
                      <div className="text-xs sm:text-sm font-black text-indigo-400">Free 15,000 IDR</div>
                      <div className="text-[10px] text-slate-500">Welcome balance</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Per Member Invited</div>
                      <div className="text-xs sm:text-sm font-black text-emerald-400">5,000 IDR / Reff</div>
                      <div className="text-[10px] text-slate-500">Instant credit</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] text-slate-400">Milestone Bonus</div>
                      <div className="text-xs sm:text-sm font-black text-amber-300">Up to 1,000,000 IDR</div>
                      <div className="text-[10px] text-slate-500">50, 100, 500, 1,000</div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-amber-500/30 bg-amber-500/10">
                      <div className="text-[10px] text-amber-300 font-bold">1,000 Reff Peak</div>
                      <div className="text-xs sm:text-sm font-black text-yellow-300">8,500,000 IDR</div>
                      <div className="text-[10px] text-amber-200 font-semibold">+ Free Lifetime VIP</div>
                    </div>
                  </div>
                </div>

                {/* Quick 3-Step Guide */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="font-bold text-amber-400 mb-1">1. Share Your Link</div>
                    <p className="text-slate-400 text-[11px]">
                      Invite fellow host streamers to register using your unique link or referral code.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="font-bold text-amber-400 mb-1">2. Member Activates</div>
                    <p className="text-slate-400 text-[11px]">
                      Your friend receives a free 15,000 IDR welcome bonus, and you earn an instant 5,000 IDR.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-800/80">
                    <div className="font-bold text-amber-400 mb-1">3. Withdraw Cash Rewards</div>
                    <p className="text-slate-400 text-[11px]">
                      Claim milestone bonuses up to 8,500,000 IDR + Lifetime Grand Master VIP access.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sponsor Referral Input (If user hasn't claimed yet) */}
              {!userProfile?.referredBy ? (
                <div className="p-4 bg-slate-800/60 border border-slate-700 rounded-xl">
                  <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Have a Friend's Referral Code?
                  </h4>
                  <p className="text-xs text-slate-400 mb-3">
                    Enter the referral code of the person who invited you to link accounts and claim your welcome bonus.
                  </p>
                  <form onSubmit={handleClaimSponsor} className="flex gap-2">
                    <input
                      type="text"
                      value={sponsorCode}
                      onChange={(e) => setSponsorCode(e.target.value.toUpperCase())}
                      placeholder="e.g. SYS-HOST77"
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white uppercase font-mono tracking-wider focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={claimingSponsor}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {claimingSponsor ? 'Processing...' : 'Claim Bonus'}
                    </button>
                  </form>

                  {sponsorMessage && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                        sponsorMessage.isError
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {sponsorMessage.isError ? (
                        <AlertCircle className="w-4 h-4 shrink-0" />
                      ) : (
                        <Check className="w-4 h-4 shrink-0" />
                      )}
                      <span>{sponsorMessage.text}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl flex items-center gap-2 text-xs text-emerald-300">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Your account is connected to an official affiliate sponsor.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB: DETAIL PERHITUNGAN NOMINAL HADIAH */}
          {activeTab === 'calculation' && (
            <ReferralCalculationTab
              currentReferralCount={referralCount}
              onSelectMilestone={() => {}}
            />
          )}

          {/* TAB: SYARAT & KETENTUAN */}
          {activeTab === 'terms' && (
            <ReferralTermsTab
              onGoToCalculation={() => {
                playClick();
                setActiveTab('calculation');
              }}
            />
          )}

          {/* TAB 2: REWARD TIERS */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-400" />
                    Tiered Reward & Bonus Scheme
                  </h3>
                  <p className="text-xs text-slate-400">
                    The more streamers you invite, the higher your commission percentage and cash milestone rewards!
                  </p>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold self-start sm:self-auto">
                  Your Referrals: {referralCount} Hosts
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REFERRAL_REWARD_TIERS.map((tier) => {
                  const isAchieved = referralCount >= tier.minReferrals;
                  return (
                    <div
                      key={tier.level}
                      className={`relative p-5 rounded-2xl border transition-all ${
                        isAchieved
                          ? 'bg-slate-900/90 border-amber-500/60 shadow-lg shadow-amber-500/10'
                          : 'bg-slate-950/60 border-slate-800 opacity-80'
                      }`}
                    >
                      {isAchieved && (
                        <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          UNLOCKED
                        </div>
                      )}

                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tier.badgeColor} flex items-center justify-center text-white font-black text-sm shadow-md border`}
                        >
                          T{tier.level}
                        </div>
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                            Level {tier.level} ({tier.minReferrals}+ Referrals)
                          </div>
                          <h4 className="text-base font-black text-white flex items-center gap-1.5">
                            {tier.title}
                            {tier.isSultanVip && <Crown className="w-4 h-4 text-amber-400" />}
                          </h4>
                        </div>
                      </div>

                      {/* Main Bonus Highlights */}
                      <div className="grid grid-cols-2 gap-2 my-3 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                        <div>
                          <div className="text-[10px] text-slate-400">Commission Share</div>
                          <div className="text-sm font-black text-amber-300">
                            {tier.rewardCommissionPct}% Per Order
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-400">Cash Milestone Bonus</div>
                          <div className="text-sm font-black text-emerald-400 font-mono">
                            Rp {tier.bonusCash.toLocaleString('id-ID')}
                          </div>
                        </div>
                      </div>

                      {/* Event prize & VIP Badge if applicable */}
                      {tier.eventPrize && (
                        <div className="mb-3 p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center justify-between text-xs">
                          <span className="text-slate-300 font-medium">Special Event Grand Prize:</span>
                          <span className="font-black font-mono text-cyan-300">
                            + Rp {tier.eventPrize.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}

                      {tier.isSultanVip && (
                        <div className="mb-3 p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center gap-2 text-[11px] text-amber-300 font-bold">
                          <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>FREE LIFETIME GRAND MASTER VIP</span>
                        </div>
                      )}

                      {/* Perks list */}
                      <div className="space-y-1.5 pt-1">
                        {tier.perks.map((perk, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: WITHDRAWAL / PAYOUT */}
          {activeTab === 'withdraw' && (
            <div className="space-y-6">
              {/* Saldo summary */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-950/30 via-slate-900 to-slate-900 border border-emerald-500/40 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Commission Balance Ready to Withdraw</div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                    Rp {availableBalance.toLocaleString('id-ID')}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>Total Withdrawn: Rp {affiliateWithdrawn.toLocaleString('id-ID')}</span>
                    <span>•</span>
                    <span>Minimum Withdrawal: Rp 50,000</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Fast payout within 1-24 hours directly to your bank account or e-wallet.</span>
                </div>
              </div>

              {/* Form Penarikan */}
              <form onSubmit={handleWithdrawSubmit} className="space-y-4 p-5 bg-slate-950/60 border border-slate-800 rounded-2xl">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  Commission Withdrawal Request Form
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Metode Bank / E-Wallet */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Bank / Digital Wallet
                    </label>
                    <select
                      value={bankMethod}
                      onChange={(e) => setBankMethod(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="BCA">Bank BCA</option>
                      <option value="Mandiri">Bank Mandiri</option>
                      <option value="BRI">Bank BRI</option>
                      <option value="BNI">Bank BNI</option>
                      <option value="DANA">DANA</option>
                      <option value="GoPay">GoPay</option>
                      <option value="OVO">OVO</option>
                      <option value="ShopeePay">ShopeePay</option>
                      <option value="USDT (TRC20)">USDT (TRC20)</option>
                    </select>
                  </div>

                  {/* Nominal Penarikan */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Withdrawal Amount (IDR)
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(Math.max(0, parseInt(e.target.value) || 0))}
                      min={100000}
                      step={10000}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                    <div className="flex gap-2 mt-2">
                      {[100000, 250000, 500000].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setWithdrawAmount(amt)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-colors"
                        >
                          Rp {amt.toLocaleString('id-ID')}
                        </button>
                      ))}
                      {availableBalance > 0 && (
                        <button
                          type="button"
                          onClick={() => setWithdrawAmount(availableBalance)}
                          className="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold rounded-lg border border-amber-500/30 transition-colors"
                        >
                          Withdraw All
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Nomor Rekening */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Account / E-Wallet Number
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="e.g. 1234567890 / 08123456789"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {/* Nama Pemilik Rekening */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="e.g. SUSI DEWI YULIYANTI"
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white uppercase focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {withdrawFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                      withdrawFeedback.isError
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {withdrawFeedback.isError ? (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    ) : (
                      <Check className="w-4 h-4 shrink-0" />
                    )}
                    <span>{withdrawFeedback.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={withdrawing || availableBalance < 100000}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  {withdrawing ? 'Processing...' : `Submit Withdrawal Rp ${withdrawAmount.toLocaleString('id-ID')}`}
                </button>
              </form>

              {/* Riwayat Penarikan */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Withdrawal History ({withdrawals.length})
                </h4>

                {withdrawals.length === 0 ? (
                  <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-500">
                    No withdrawal history yet. Earn commissions by inviting streamer friends!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {withdrawals.map((wd) => (
                      <div
                        key={wd.id || wd.withdrawalId}
                        className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{wd.bankName} - {wd.accountNumber}</span>
                            <span className="text-[10px] text-slate-400 font-normal">({wd.accountName})</span>
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(wd.createdAt).toLocaleString('en-US')}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-black text-emerald-400">
                            Rp {wd.amount.toLocaleString('id-ID')}
                          </div>
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {wd.status === 'completed' ? 'Completed' : wd.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REFERRED FRIENDS LIST */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">List of Invited Host Streamers</h3>
                  <p className="text-xs text-slate-400">
                    Each package purchase from hosts below awards 20% - 35% commission to your account
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  Total: {referrals.length} Hosts
                </span>
              </div>

              {referrals.length === 0 ? (
                <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 space-y-3">
                  <Users className="w-8 h-8 text-slate-600 mx-auto" />
                  <div className="text-sm font-bold text-slate-300">No streamers have joined yet</div>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Copy your referral link in the "Overview" tab and share it on social media to start generating passive commissions.
                  </p>
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors"
                  >
                    Copy Referral Code Now
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {referrals.map((ref, idx) => (
                    <div
                      key={ref.id || idx}
                      className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-amber-400">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-white">{ref.referredName || 'Host Streamer'}</div>
                          <div className="text-[10px] text-slate-400">{ref.referredEmail}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-bold text-emerald-400">
                          + Rp {ref.rewardAmount.toLocaleString('id-ID')}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(ref.createdAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Affiliate commissions are calculated automatically in real time in Firestore.</span>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
