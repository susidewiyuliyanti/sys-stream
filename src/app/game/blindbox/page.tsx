import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { BlindboxItem, RarityTier, LockRecord } from '../../../types';
import { sound } from '../../../lib/sound';
import { formatIdrAsSelectedCurrency, formatMinimumBlindBoxLock, getMinimumBlindBoxLockIdr, getLocaleConfig, IDR_PER_CURRENCY_UNIT, useLanguage } from '../../../i18n';
import {
  Box,
  Sparkles,
  Shield,
  Coins,
  Package,
  RefreshCw,
  Lock,
  Clock,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClaimHistoryItem {
  id: number;
  depositId: number;
  claimDate: string;
  amount: number;
  isJackpot: boolean;
  claimedAt: string;
}

interface BoxTier {
  id: string;
  name: string;
  description?: string;
  descriptionKey?: string;
  badge: string;
  accentColor: string;
  minLockedRequired: number;
  lootPool: BlindboxItem[];
}

const BOX_TIERS: BoxTier[] = [
  {
    id: 'cyber_daily',
    name: 'Cyber Daily Mystery Box',
    descriptionKey: 'Available with the minimum active lock. Daily claims are credited to Available Balance when claimed and remain yours if the lock is opened early.',
    badge: 'Daily Active Reward',
    accentColor: '#38bdf8',
    minLockedRequired: getMinimumBlindBoxLockIdr('id'),
    lootPool: [
      { id: 'bb_1', name: 'Tactical Neon Visor', category: 'Skin', rarity: 'common', powerStat: 24, coinValue: 100, usdtReward: 0, iconName: 'Eye' },
      { id: 'bb_2', name: 'Nano-Blade Dagger', category: 'Weapon', rarity: 'common', powerStat: 30, coinValue: 120, usdtReward: 0, iconName: 'Scissors' },
      { id: 'bb_3', name: 'EMP Grenade Launcher', category: 'Weapon', rarity: 'rare', powerStat: 55, coinValue: 280, usdtReward: 0, iconName: 'Zap' },
      { id: 'bb_4', name: 'Holo-Decoy Drone', category: 'Companion', rarity: 'rare', powerStat: 62, coinValue: 350, usdtReward: 0, iconName: 'Bot' },
    ],
  },
  {
    id: 'apex_lockbox',
    name: 'Apex High-Roller Crate',
    descriptionKey: 'Higher lock tier with rare collectibles. Financial rewards are determined by the server.',
    badge: 'Enhanced Lock Tier',
    accentColor: '#a855f7',
    minLockedRequired: 720000,
    lootPool: [
      { id: 'bb_5', name: 'Vortex Hoverbike', category: 'Vehicle', rarity: 'rare', powerStat: 65, coinValue: 400, usdtReward: 0, iconName: 'Car' },
      { id: 'bb_6', name: 'Plasma Katana Mk.IV', category: 'Weapon', rarity: 'epic', powerStat: 82, coinValue: 900, usdtReward: 0, iconName: 'Sword' },
      { id: 'bb_7', name: 'Quantum Core Reactor', category: 'Relic', rarity: 'epic', powerStat: 88, coinValue: 1150, usdtReward: 0, iconName: 'Cpu' },
      { id: 'bb_8', name: 'Solaris Battle Automaton', category: 'Companion', rarity: 'legendary', powerStat: 95, coinValue: 2400, usdtReward: 0, iconName: 'Shield' },
    ],
  },
  {
    id: 'dragon_vault',
    name: 'Celestial Dragon Vault',
    descriptionKey: 'High lock tier with rare collectibles. Financial rewards are determined by the server.',
    badge: 'Premium Lock Tier',
    accentColor: '#f59e0b',
    minLockedRequired: 1000000,
    lootPool: [
      { id: 'bb_9', name: 'Obsidian Dreadnought', category: 'Vehicle', rarity: 'epic', powerStat: 85, coinValue: 1200, usdtReward: 0, iconName: 'Rocket' },
      { id: 'bb_10', name: 'Aegis of the Sun God', category: 'Relic', rarity: 'legendary', powerStat: 96, coinValue: 3200, usdtReward: 0, iconName: 'ShieldAlert' },
      { id: 'bb_11', name: 'Chronos Time Fragment', category: 'Relic', rarity: 'legendary', powerStat: 98, coinValue: 4500, usdtReward: 0, iconName: 'Hourglass' },
      { id: 'bb_12', name: 'Cyber Dragon Sovereign', category: 'Companion', rarity: 'mythic', powerStat: 100, coinValue: 10000, usdtReward: 0, iconName: 'Crown' },
    ],
  },
];

export default function BlindboxGamePage() {
  const {
    user,
    addToInventory,
    addGameHistory,
    locks,
    createLock,
    getTotalLockedUsdt,
    getDailyBoxQuota,
    getRemainingDailyBoxes,
    claimBlindBox,
    showToast,
    requireAuth,
    refreshFinancialState,
  } = useGame();

  const [selectedBox, setSelectedBox] = useState<BoxTier>(BOX_TIERS[0]);
  const [unboxingState, setUnboxingState] = useState<'IDLE' | 'SHAKING' | 'REVEALING' | 'REVEALED'>('IDLE');
  const [unboxedItem, setUnboxedItem] = useState<BlindboxItem | null>(null);
  const [wonIdr, setWonIdr] = useState<number>(0);
  const [openingLock, setOpeningLock] = useState(false);
  const [claimHistory, setClaimHistory] = useState<ClaimHistoryItem[]>([]);
  const [claimHistoryLoading, setClaimHistoryLoading] = useState(false);

  const { language, t } = useLanguage();

  // Staking lock modal/form
  const minimumLockIdr = getMinimumBlindBoxLockIdr(language);
  const minimumLockDisplay = formatMinimumBlindBoxLock(language);
  const [lockDuration, setLockDuration] = useState<30 | 60 | 90>(30);
  const availableBalance = Number(user.availableBalance ?? 0);
  const [lockIdrAmount, setLockIdrAmount] = useState<number>(minimumLockIdr);

  // Time until midnight reset
  const [timeToReset, setTimeToReset] = useState<string>('');
  const currencyConfig = getLocaleConfig(language);
  const formatMoney = (idr: number) => formatIdrAsSelectedCurrency(idr, language);
  const toIdr = (displayAmount: number) => Math.round(displayAmount * (IDR_PER_CURRENCY_UNIT[language] ?? 1));

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setHours(24, 0, 0, 0);
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeToReset(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalLocked = getTotalLockedUsdt();
  const dailyQuota = getDailyBoxQuota();
  const remainingBoxes = getRemainingDailyBoxes();
  const isQualified = totalLocked >= minimumLockIdr;

  const activeLocks = locks.filter((l) => l.status === 'locked');
  const primaryLock: LockRecord | undefined = activeLocks[0];

  const handleOpenLock = async () => {
    requireAuth(async () => {
      if (openingLock) return;

      const confirmed = window.confirm(
        t('Open this lock before the agreed end date? The locked principal will be returned. Any Blind Box rewards already claimed remain yours and are not reversed. SYS Mining earned up to this moment will remain yours. Mining will stop immediately.')
      );
      if (!confirmed) return;

      try {
        setOpeningLock(true);
        const token = localStorage.getItem('sys_stream_auth_token');
        if (!token) throw new Error(t('Silakan login terlebih dahulu.'));

        // Always read the authenticated deposit list before unlocking.
        // This prevents a stale/empty React locks state from making the button silently do nothing.
        const depositsResponse = await fetch('/api/deposits', {
          credentials: 'include',
          cache: 'no-store',
          headers: { Authorization: `Bearer ${token}` },
        });
        const depositsData = await depositsResponse.json().catch(() => ({}));
        if (!depositsResponse.ok || !depositsData?.success) {
          throw new Error(depositsData?.error || depositsData?.message || t('Gagal memeriksa lock.'));
        }

        const activeDeposit =
          depositsData?.activeDeposit ||
          (Array.isArray(depositsData?.deposits)
            ? depositsData.deposits.find((deposit: any) => String(deposit.status).toUpperCase() === 'ACTIVE')
            : null);

        if (!activeDeposit?.id) {
          await refreshFinancialState();
          throw new Error(t('Tidak ada lock Blind Box yang aktif.'));
        }

        const response = await fetch(`/api/deposits/${encodeURIComponent(String(activeDeposit.id))}/unlock`, {
          method: 'POST',
          credentials: 'include',
          cache: 'no-store',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data?.success) {
          throw new Error(data?.error || data?.message || t('Gagal membuka lock.'));
        }

        await refreshFinancialState();
        await refreshClaimHistory();
        showToast(
          t('Lock Opened'),
          data.early
            ? t('Principal dikembalikan. Reward Blind Box yang sudah di-claim tetap menjadi hak Anda dan SYS Mining berhenti.')
            : t('Lock selesai dan principal dikembalikan.'),
          'success'
        );
      } catch (error) {
        showToast(
          t('Open Lock Failed'),
          error instanceof Error ? error.message : t('Gagal membuka lock.'),
          'error'
        );
      } finally {
        setOpeningLock(false);
      }
    });
  };
  const handleCreateStakingLock = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      if (lockIdrAmount > availableBalance) {
        showToast(t('Insufficient Balance'), t('Lock amount cannot exceed your Available Balance.'), 'error');
        return;
      }
      void createLock(lockIdrAmount, lockDuration);
    });
  };

  const refreshClaimHistory = async () => {
    const token = localStorage.getItem('sys_stream_auth_token');
    if (!token) {
      setClaimHistory([]);
      return;
    }
    try {
      setClaimHistoryLoading(true);
      const response = await fetch('/api/deposits', {
        credentials: 'include',
        cache: 'no-store',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) throw new Error('Claim history unavailable');
      setClaimHistory(Array.isArray(data.recentClaims) ? data.recentClaims : []);
    } catch {
      setClaimHistory([]);
    } finally {
      setClaimHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (user.id) {
      void refreshFinancialState();
      void refreshClaimHistory();
    } else {
      setClaimHistory([]);
    }
  }, [user.id]);


  const startDailyUnboxing = () => {
    requireAuth(async () => {
      if (!isQualified) {
        showToast(
          t('Staking Required'),
          t('You must lock at least $4 equivalent to open the daily Blind Box.'),
          'error'
        );
        return;
      }

      if (remainingBoxes <= 0) {
        showToast(
          t('Daily Limit Reached'),
          `${t('You have opened all')} ${dailyQuota} ${t('box(es) for today. Quota resets in')} ${timeToReset}!`,
          'info'
        );
        return;
      }

      if (unboxingState !== 'IDLE') return;

      try {
        setUnboxingState('SHAKING');
        sound.playUnboxShake();

        await new Promise<void>(resolve => {
          window.setTimeout(() => {
            sound.playUnboxShake();
            resolve();
          }, 450);
        });

        await new Promise<void>(resolve => {
          window.setTimeout(resolve, 750);
        });

        setUnboxingState('REVEALING');

        // The claim request is awaited inside this try/catch. The previous
        // setTimeout(async () => ...) allowed claim failures to escape the
        // component error handler and could leave the UI stuck on REVEALING.
        const result = await claimBlindBox(selectedBox.id);
        const rewardIdr = Number(result.reward ?? result.prizeAmount ?? 0);
        const claimId = String(result.claimId ?? result.id ?? Date.now());

        const baseItem = selectedBox.lootPool.find(item => item.id === result.item?.id) || selectedBox.lootPool[0];
        const uniqueItem: BlindboxItem = {
          ...baseItem,
          id: 'pull_' + claimId,
          name: result.item?.name || baseItem.name,
          rarity: result.item?.rarity || baseItem.rarity,
          usdtReward: 0,
          coinValue: 0,
        };

        setUnboxedItem(uniqueItem);
        setWonIdr(rewardIdr);

        await new Promise<void>(resolve => {
          window.setTimeout(resolve, 700);
        });

        setUnboxingState('REVEALED');
        sound.playUnboxReveal(uniqueItem.rarity);

        if (uniqueItem.rarity === 'mythic' || uniqueItem.rarity === 'legendary' || rewardIdr >= 100000) {
          sound.playJackpot();
          confetti({
            particleCount: 130,
            spread: 90,
            origin: { y: 0.5 },
          });
        }

        addGameHistory({
          gameType: 'blindbox',
          gameName: selectedBox.name,
          betAmount: 0,
          payoutAmount: rewardIdr,
          multiplier: 1.0,
          isWin: true,
          details: `Daily Box: +${formatMoney(rewardIdr)} & ${uniqueItem.name}`,
        });
      } catch (error) {
        setUnboxingState('IDLE');
        showToast(
          t('Blind Box Failed'),
          error instanceof Error ? error.message : t('Server gagal memproses Blind Box.'),
          'error'
        );
      }
    });
  };

  const handleKeepItem = () => {
    if (!unboxedItem) return;
    sound.playClick();
    addToInventory(unboxedItem);
    showToast(t('Vault Updated'), t('Added to your Inventory!'), 'success');
    resetBox();
  };

  const resetBox = () => {
    setUnboxingState('IDLE');
    setUnboxedItem(null);
    setWonIdr(0);
  };

  const getRarityBadge = (rarity: RarityTier) => {
    switch (rarity) {
      case 'mythic':
        return 'bg-gradient-to-r from-rose-500 to-amber-500 text-white font-extrabold';
      case 'legendary':
        return 'bg-amber-500 text-slate-950 font-bold';
      case 'epic':
        return 'bg-purple-600 text-white font-semibold';
      case 'rare':
        return 'bg-blue-600 text-white font-semibold';
      default:
        return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <span>{t('Daily Mystery Blind Box')}</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              {t('Daily claim credited to balance')}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {t('Open the daily Blind Box based on your currently locked balance. Each successful daily claim is credited to Available Balance immediately.')}
          </p>
        </div>

        {/* Daily Quota Indicator Badge */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isQualified ? (
            <div className="px-3.5 py-2 bg-slate-900 border border-emerald-500/40 rounded-xl text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-white font-bold">
                  Daily Boxes: <span className="text-emerald-400 font-mono">{remainingBoxes} / {dailyQuota} Available</span>
                </div>
                <div className="text-[10px] text-slate-400">{t('Quota resets in')} {timeToReset}</div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-1.5 font-semibold">
              <Lock className="w-4 h-4" />
              <span>{t('Lock at least $4 equivalent to open the Blind Box')}</span>
            </div>
          )}
        </div>
      </div>

      {/* TIER MULTIPLIER RULES & DAILY QUOTA SCALING BREAKDOWN */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>{t('$4 equivalent+ Lock')}</span>
            <span className="text-emerald-400 font-mono">1 {t('Daily Boxes')}</span>
          </div>
          <div className="text-[11px] text-slate-400">{t('Lock Amount (IDR)')}: {formatMoney(minimumLockIdr)} ({minimumLockDisplay} equivalent). {t('Claim Daily Blind Box')}: 1/day.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>{t('Active Lock')}</span>
            <span className="text-cyan-400 font-mono">1 {t('Daily Boxes')}</span>
          </div>
          <div className="text-[11px] text-slate-400">{t('Daily claim limit remains 1 box per day.')}</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>{t('Active Lock')}</span>
            <span className="text-amber-400 font-mono">1 {t('Daily Boxes')}</span>
          </div>
          <div className="text-[11px] text-slate-400">{t('Daily claim limit remains 1 box per day.')}</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>{t('Active Lock')}</span>
            <span className="text-purple-400 font-mono">1 {t('Daily Boxes')}</span>
          </div>
          <div className="text-[11px] text-slate-400">{t('Daily claim limit remains 1 box per day.')}</div>
        </div>
      </div>

      {/* STAKING FORM / ACTIVE STAKING CARD */}
      {!isQualified ? (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>{t('LOCK BALANCE REQUIRED')}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                {t('Lock your balance to unlock the daily Blind Box claim')}
              </h2>
              <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                <p>
                  {t('Available lock durations:')} <strong>{t('30 days')}</strong> · <strong>{t('60 days')}</strong> · <strong>{t('90 days')}</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  {t('The lock can only be completed once the lock period has ended. Early unlocking is not available through Blind Box.')}
                </p>
              </div>
            </div>

            {/* Quick Lock Creator Form */}
            <form
              onSubmit={handleCreateStakingLock}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 w-full lg:w-80 shrink-0"
            >
              <div className="rounded-xl border border-cyan-500/25 bg-cyan-500/5 px-3 py-2.5">
                <div className="text-[10px] uppercase tracking-wider text-slate-500">{t('Available Balance')}</div>
                <div className="text-xl font-black text-cyan-300 mt-1">{formatMoney(availableBalance)}</div>
                <div className="text-[10px] text-slate-500 mt-1">{t('Available to lock from this account')}</div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Lock Amount
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[minimumLockIdr, 720000, 1000000, 2720000]
                  .filter((amt, index, arr) => arr.indexOf(amt) === index)
                  .filter((amt) => amt <= availableBalance || amt === minimumLockIdr)
                  .map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { sound.playClick(); setLockIdrAmount(amt); }}
                      className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                        lockIdrAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {formatMoney(amt)}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min={minimumLockIdr / (IDR_PER_CURRENCY_UNIT[language] ?? 1)}
                  max={Math.max(minimumLockIdr / (IDR_PER_CURRENCY_UNIT[language] ?? 1), availableBalance / (IDR_PER_CURRENCY_UNIT[language] ?? 1))}
                  step="0.01"
                  value={Math.round(lockIdrAmount / (IDR_PER_CURRENCY_UNIT[language] ?? 1) * 100) / 100}
                  onChange={(e) => {
                    const displayAmount = Number(e.target.value);
                    if (!Number.isFinite(displayAmount)) return;
                    setLockIdrAmount(Math.max(minimumLockIdr, toIdr(displayAmount)));
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-sm outline-none focus:border-amber-400"
                  placeholder={`${t('Lock amount')} (${currencyConfig.currency})`}
                />
                <div className="text-[10px] text-slate-500 mt-1">{t('Minimum lock')}: {minimumLockDisplay} ({t('selected currency')}). {t('You can enter any amount above the minimum, up to your Available Balance.')}</div>
                <div className="text-[10px] mt-1 font-semibold text-slate-400">
                  {lockIdrAmount > availableBalance ? t('Lock amount exceeds Available Balance.') : `${t('Remaining after lock')}: ${formatMoney(Math.max(0, availableBalance - lockIdrAmount))}`}
                </div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>{t('Quota:')} <strong className="text-emerald-400">{t('1 Box/Day')}</strong></span>
                  <span className="font-mono text-amber-400">{formatMoney(lockIdrAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  {t('Lock Duration')}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { days: 30 },
                    { days: 60 },
                    { days: 90 },
                  ].map((tier) => (
                    <button
                      key={tier.days}
                      type="button"
                      onClick={() => { sound.playClick(); setLockDuration(tier.days as 30 | 60 | 90); }}
                      className={`py-1.5 text-center rounded-lg border transition-all ${
                        lockDuration === tier.days
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{tier.days}d</div>
                      <div className="text-[9px] font-semibold opacity-85">{t('Lock')}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{t('Lock Balance Now')}</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ACTIVE LOCK DETAILS */
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {t('Total Locked')}: {formatMoney(totalLocked)} ({dailyQuota} {t('Boxes/Day')})
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    {t('Active Lock')}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t('Daily Claim')}:
                  <strong className="text-amber-400">{primaryLock?.dailyClaims}x</strong>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2">
              <div className="text-xs text-slate-400 max-w-xs text-right">
                {t('Daily claims are credited to Available Balance immediately and remain yours if the lock is opened early.')}
              </div>
              <button
                type="button"
                onClick={handleOpenLock}
                disabled={openingLock}
                className="px-4 py-2.5 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {openingLock ? t('Opening Lock...') : t('Open Lock Early')}
              </button>
              <div className="text-[10px] text-rose-300/80 max-w-xs text-right">
                {t('Early open')}: {t('only the locked principal is returned')}. {t('Already claimed Blind Box rewards remain yours and are not reversed')}. {t('SYS mined until this moment remains yours')}.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* UNBOXING ARENA */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left: Box Stage & Unboxing Visuals */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center justify-center min-h-[480px] relative overflow-hidden">
          <div
            className="absolute w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
            style={{ backgroundColor: selectedBox.accentColor }}
          />

          {unboxingState === 'IDLE' && (
            <div className="flex flex-col items-center text-center space-y-6 z-10 py-6">
              <div className="relative group cursor-pointer" onClick={startDailyUnboxing}>
                <div className="w-56 h-56 rounded-2xl bg-slate-950/80 border border-slate-700/80 p-2 shadow-2xl transition-transform duration-300 group-hover:scale-105 overflow-hidden flex items-center justify-center">
                  <img
                    src="/src/assets/images/blindbox_mystery_chest_1790831279493.jpg"
                    alt={selectedBox.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded-full shadow-lg whitespace-nowrap">
                  {selectedBox.badge}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white">{selectedBox.name}</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1">{selectedBox.descriptionKey ? t(selectedBox.descriptionKey) : selectedBox.description}</p>
              </div>

              {/* Action Button */}
              <div className="w-full max-w-xs space-y-2">
                <button
                  onClick={startDailyUnboxing}
                  disabled={!isQualified || remainingBoxes <= 0}
                  className={`w-full py-3.5 font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    !isQualified
                      ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                      : remainingBoxes > 0
                      ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed'
                  }`}
                >
                  <Box className="w-4 h-4 fill-current" />
                  <span>
                    {!isQualified
                      ? `${t('Lock minimum')} ${formatMoney(71748)} ${t('to activate')}`
                      : remainingBoxes > 0
                      ? `${t('Open Daily Box')} (${remainingBoxes} ${t('Available Today')})`
                      : `Daily Limit Reached (Resets in ${timeToReset})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {(unboxingState === 'SHAKING' || unboxingState === 'REVEALING') && (
            <div className="flex flex-col items-center justify-center space-y-6 z-10 py-12">
              <div
                className={`w-52 h-52 rounded-2xl bg-slate-950 border-2 border-emerald-500/60 p-2 shadow-2xl flex items-center justify-center ${
                  unboxingState === 'SHAKING' ? 'animate-bounce' : 'scale-110 animate-pulse'
                }`}
              >
                <img
                  src="/src/assets/images/blindbox_mystery_chest_1790831279493.jpg"
                  alt={t('Unboxing')}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-emerald-400 animate-pulse">
                  {unboxingState === 'SHAKING' ? t('Processing Blind Box Reward...') : t('Opening Mystery Vault!')}
                </div>
                <div className="text-xs text-slate-400 mt-1">{t('Server is determining your reward...')}</div>
              </div>
            </div>
          )}

          {unboxingState === 'REVEALED' && unboxedItem && (
            <div className="flex flex-col items-center text-center space-y-5 z-10 py-4 w-full max-w-md animate-in zoom-in-90 duration-300">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>{t('Daily Blind Box Claim')}</span>
              </div>

              {/* USDT Cash Prize Callout Banner */}
              <div className="w-full p-4 bg-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl text-center space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  {t('Reward credited to Available Balance')}
                </div>
                <div className="text-3xl font-mono font-black text-emerald-400">
                  +{formatMoney(wonIdr)}
                </div>
                <div className="text-xs text-slate-400">
                  {t('This claimed reward has been credited to Available Balance and remains yours if the lock is opened early.')}
                </div>
              </div>

              {/* Loot Card */}
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[11px] uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getRarityBadge(
                      unboxedItem.rarity
                    )}`}
                  >
                    {unboxedItem.rarity}
                  </span>
                  <span className="text-xs text-slate-400">{unboxedItem.category}</span>
                </div>

                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center my-2 shadow-inner">
                  <Box className="w-8 h-8 text-amber-400" />
                </div>

                <h3 className="text-base font-bold text-white mt-1">{unboxedItem.name}</h3>
                <div className="text-xs text-slate-400 mt-1">
                  Power Stat: <strong className="text-white">{unboxedItem.powerStat}/100</strong>
                </div>
              </div>

              {/* Action Buttons: Keep or Continue */}
              <div className="grid grid-cols-2 gap-3 w-full">
                <button
                  onClick={handleKeepItem}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>{t('Keep in Vault')}</span>
                </button>
                <button
                  onClick={resetBox}
                  className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t('Done')}</span>
                </button>
              </div>

              {remainingBoxes > 0 && (
                <button
                  onClick={() => { resetBox(); startDailyUnboxing(); }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t('Claim Daily Blind Box')} ({remainingBoxes} {t('Left')})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Claim History */}
        <div className="lg:col-span-12 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-bold text-white">{t('Blind Box Claim History')}</h2>
              <p className="text-[10px] text-slate-500 mt-1">{t('History of daily claims. Claimed rewards are already included in Available Balance.')}</p>
            </div>
            <button
              type="button"
              onClick={() => { void refreshClaimHistory(); }}
              className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors"
              aria-label={t('Refresh claim history')}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${claimHistoryLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {claimHistory.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-500">
                {claimHistoryLoading ? t('Loading claim history...') : t('No Blind Box claims yet.')}
              </div>
            ) : claimHistory.map((claim) => (
              <div key={claim.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white">{t('Daily Blind Box Claim')}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{claim.claimDate} · {new Date(claim.claimedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-mono font-bold text-emerald-400">+{formatMoney(Number(claim.amount || 0))}</div>
                  <div className="text-[9px] text-amber-400">{t('Credited')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Box Selection & Drop Rates */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Mystery Crate Tier
            </h2>

            <div className="space-y-3">
              {BOX_TIERS.map((box) => {
                const isSelected = selectedBox.id === box.id;
                const isTierUnlocked = totalLocked >= box.minLockedRequired;

                return (
                  <button
                    key={box.id}
                    onClick={() => { sound.playClick(); setSelectedBox(box); resetBox(); }}
                    className={`w-full p-4 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-slate-950 border-emerald-500 shadow-lg shadow-emerald-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-white">{box.name}</span>
                      <span className={`text-xs font-mono font-bold ${isTierUnlocked ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {isTierUnlocked ? 'Unlocked' : `Requires ${formatMoney(box.minLockedRequired)}+ Lock`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{box.descriptionKey ? t(box.descriptionKey) : box.description}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{box.badge}</span>
                      {isSelected && <span className="text-emerald-400 font-semibold">{t('Active Selection')}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Aturan Lock */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>{t('Lock Duration Schedule')}</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">{t('30 Days Term')}</span>
                <span className="font-mono text-emerald-400 font-bold">{t('Daily reward follows server settings')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">{t('60 Days Term')}</span>
                <span className="font-mono text-cyan-400 font-bold">{t('Daily reward follows server settings')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">{t('90 Days Term')}</span>
                <span className="font-mono text-amber-400 font-bold">{t('Daily reward follows server settings')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
