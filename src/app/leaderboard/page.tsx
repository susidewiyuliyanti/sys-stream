import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { sound } from '../../lib/sound';
import { ArrowLeft, Bell, Trophy, Rocket, Copy, Check, Users } from 'lucide-react';
import { useLanguage } from '../../i18n';

interface LeaderboardProps { navigate?: (path: string) => void; }

export default function LeaderboardPage({ navigate }: LeaderboardProps) {
  const { user, showToast } = useGame();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'referral'>('leaderboard');
  const [copied, setCopied] = useState(false);

  const wallet = String(user.walletAddress || '').trim();
  const referralCode = wallet || String(user.referralCode || '').trim();

  const copyReferral = async () => {
    if (!referralCode) return;
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      showToast(t('Code Copied!'), t('Referral code copied to clipboard.'), 'success');
      setTimeout(() => setCopied(false), 1800);
    } catch {
      showToast(t('Referral'), referralCode, 'info');
    }
  };

  return (
    <div className="min-h-screen bg-[#060a14] text-white font-sans pb-24">
      <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-5">
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => { sound.playClick(); navigate?.('/room/main'); }} className="p-2 text-slate-400 rounded-xl bg-slate-900/60 border border-slate-800">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg sm:text-xl font-black text-center">{t('Leaderboard & Referral')}</h1>
          <button onClick={() => showToast(t('Notifications'), t('No new notifications.'), 'info')} className="p-2 text-slate-400 rounded-xl bg-slate-900/60 border border-slate-800">
            <Bell className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl border border-cyan-500/20 text-xs font-black uppercase">
          <button onClick={() => setActiveTab('leaderboard')} className={`py-2.5 rounded-xl ${activeTab === 'leaderboard' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400'}`}>{t('Leaderboard')}</button>
          <button onClick={() => setActiveTab('referral')} className={`py-2.5 rounded-xl ${activeTab === 'referral' ? 'bg-purple-600/30 text-purple-300' : 'text-slate-400'}`}>{t('Referral Event')}</button>
        </div>

        {activeTab === 'leaderboard' ? (
          <section className="rounded-3xl border border-cyan-500/20 bg-slate-950/80 p-6 text-center">
            <Trophy className="w-10 h-10 mx-auto text-cyan-400" />
            <h2 className="text-lg font-black mt-3">{t('Production Leaderboard')}</h2>
            <p className="text-xs text-slate-500 mt-2 leading-5">{t('No production ranking data is available yet. Dummy ranking data is intentionally disabled.')}</p>
          </section>
        ) : (
          <section className="rounded-3xl border border-purple-500/30 bg-slate-950/80 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Rocket className="w-5 h-5 text-purple-400" />
              <h2 className="text-sm font-black">{t('Referral Event')}</h2>
            </div>
            <p className="text-xs text-slate-400">{t('Referral participation is optional. Use your wallet identity as your referral identifier.')}</p>
            <div className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-4">
              <div className="text-[10px] text-slate-500 uppercase font-bold">{t('Your Wallet / Referral ID')}</div>
              <div className="mt-2 break-all font-mono text-sm font-black text-cyan-300">{referralCode || t('Wallet not connected')}</div>
              <button disabled={!referralCode} onClick={() => void copyReferral()} className="mt-3 w-full rounded-xl bg-purple-600 py-2.5 text-xs font-black disabled:opacity-40">
                {copied ? <Check className="w-4 h-4 mx-auto" /> : <><Copy className="w-4 h-4 inline mr-2" />{t('Copy Referral ID')}</>}
              </button>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex items-center gap-3">
              <Users className="w-5 h-5 text-cyan-400" />
              <div><div className="text-xs font-bold">{t('Live Referral Data')}</div><div className="text-[10px] text-slate-500 mt-1">{t('Only verified production activity will be shown here.')}</div></div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
