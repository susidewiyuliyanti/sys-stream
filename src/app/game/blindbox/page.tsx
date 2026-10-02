import React, { useState, useEffect } from 'react';
import { useGame } from '../../../context/GameContext';
import { BlindboxItem, RarityTier, LockRecord } from '../../../types';
import { sound } from '../../../lib/sound';
import {
  Box,
  Sparkles,
  Shield,
  Coins,
  Package,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle,
  Gem,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BoxTier {
  id: string;
  name: string;
  description: string;
  badge: string;
  accentColor: string;
  minLockedRequired: number;
  lootPool: BlindboxItem[];
}

const BOX_TIERS: BoxTier[] = [
  {
    id: 'cyber_daily',
    name: 'Cyber Daily Mystery Box',
    description: 'Unlocked for all active stakers ($4+ USDT). Contains daily cash drops in USDT & cyber gear.',
    badge: 'Daily Active Reward',
    accentColor: '#38bdf8',
    minLockedRequired: 4,
    lootPool: [
      { id: 'bb_1', name: 'Tactical Neon Visor', category: 'Skin', rarity: 'common', powerStat: 24, coinValue: 100, usdtReward: 0.5, iconName: 'Eye' },
      { id: 'bb_2', name: 'Nano-Blade Dagger', category: 'Weapon', rarity: 'common', powerStat: 30, coinValue: 120, usdtReward: 0.8, iconName: 'Scissors' },
      { id: 'bb_3', name: 'EMP Grenade Launcher', category: 'Weapon', rarity: 'rare', powerStat: 55, coinValue: 280, usdtReward: 1.5, iconName: 'Zap' },
      { id: 'bb_4', name: 'Holo-Decoy Drone', category: 'Companion', rarity: 'rare', powerStat: 62, coinValue: 350, usdtReward: 2.5, iconName: 'Bot' },
    ],
  },
  {
    id: 'apex_lockbox',
    name: 'Apex High-Roller Crate',
    description: 'Higher drop rate of pure USDT rewards and rare collectibles for $50+ stakers.',
    badge: '$50+ Staker Enhanced',
    accentColor: '#a855f7',
    minLockedRequired: 50,
    lootPool: [
      { id: 'bb_5', name: 'Vortex Hoverbike', category: 'Vehicle', rarity: 'rare', powerStat: 65, coinValue: 400, usdtReward: 3.5, iconName: 'Car' },
      { id: 'bb_6', name: 'Plasma Katana Mk.IV', category: 'Weapon', rarity: 'epic', powerStat: 82, coinValue: 900, usdtReward: 7.5, iconName: 'Sword' },
      { id: 'bb_7', name: 'Quantum Core Reactor', category: 'Relic', rarity: 'epic', powerStat: 88, coinValue: 1150, usdtReward: 12.0, iconName: 'Cpu' },
      { id: 'bb_8', name: 'Solaris Battle Automaton', category: 'Companion', rarity: 'legendary', powerStat: 95, coinValue: 2400, usdtReward: 25.0, iconName: 'Shield' },
    ],
  },
  {
    id: 'dragon_vault',
    name: 'Celestial Dragon Vault',
    description: 'Supreme vault containing legendary artifacts and maximum USDT rewards for high stakers.',
    badge: 'Supreme Tier ($100+)',
    accentColor: '#f59e0b',
    minLockedRequired: 100,
    lootPool: [
      { id: 'bb_9', name: 'Obsidian Dreadnought', category: 'Vehicle', rarity: 'epic', powerStat: 85, coinValue: 1200, usdtReward: 15.0, iconName: 'Rocket' },
      { id: 'bb_10', name: 'Aegis of the Sun God', category: 'Relic', rarity: 'legendary', powerStat: 96, coinValue: 3200, usdtReward: 35.0, iconName: 'ShieldAlert' },
      { id: 'bb_11', name: 'Chronos Time Fragment', category: 'Relic', rarity: 'legendary', powerStat: 98, coinValue: 4500, usdtReward: 50.0, iconName: 'Hourglass' },
      { id: 'bb_12', name: 'Cyber Dragon Sovereign', category: 'Companion', rarity: 'mythic', powerStat: 100, coinValue: 10000, usdtReward: 100.0, iconName: 'Crown' },
    ],
  },
];

export default function BlindboxGamePage() {
  const {
    user,
    updateCoins,
    addToInventory,
    addGameHistory,
    locks,
    createLock,
    claimDailyLockYield,
    unlockEarly,
    hasActiveLock,
    getTotalLockedUsdt,
    getDailyBoxQuota,
    getRemainingDailyBoxes,
    claimBlindBox,
    showToast,
    requireAuth,
  } = useGame();

  const [selectedBox, setSelectedBox] = useState<BoxTier>(BOX_TIERS[0]);
  const [unboxingState, setUnboxingState] = useState<'IDLE' | 'SHAKING' | 'REVEALING' | 'REVEALED'>('IDLE');
  const [unboxedItem, setUnboxedItem] = useState<BlindboxItem | null>(null);
  const [wonUsdt, setWonUsdt] = useState<number>(0);

  // Staking lock modal/form
  const [lockUsdAmount, setLockUsdAmount] = useState<number>(4);
  const [lockDuration, setLockDuration] = useState<30 | 60 | 90>(30);
  const [isEarlyUnlockModalOpen, setIsEarlyUnlockModalOpen] = useState(false);
  const [targetUnlockLockId, setTargetUnlockLockId] = useState<string | null>(null);

  // Time until midnight reset
  const [timeToReset, setTimeToReset] = useState<string>('');

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
  const isQualified = totalLocked >= 4;

  const activeLocks = locks.filter((l) => l.status === 'locked');
  const primaryLock: LockRecord | undefined = activeLocks[0];

  const handleCreateStakingLock = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      createLock(lockUsdAmount, lockDuration);
    });
  };

  const handleConfirmEarlyUnlock = () => {
    if (!targetUnlockLockId) return;
    unlockEarly(targetUnlockLockId);
    setIsEarlyUnlockModalOpen(false);
    setTargetUnlockLockId(null);
  };

  const startDailyUnboxing = () => {
    requireAuth(async () => {
      if (!isQualified) {
        showToast(
          'Staking Required',
          'You must lock a minimum of 4.00 USDT to open daily Blind Boxes.',
          'error'
        );
        return;
      }

      if (remainingBoxes <= 0) {
        showToast(
          'Daily Limit Reached',
          `You have opened all ${dailyQuota} box(es) for today. Quota resets in ${timeToReset}!`,
          'info'
        );
        return;
      }

      if (unboxingState !== 'IDLE') return;

      try {
        setUnboxingState('SHAKING');
        sound.playUnboxShake();

        setTimeout(() => {
          sound.playUnboxShake();
        }, 450);

        setTimeout(async () => {
          setUnboxingState('REVEALING');

          const result = await claimBlindBox(selectedBox.id);
          const finalUsdtReward = Number(result.rewardUsdt || 0);
          const coinsEquiv = Math.floor(finalUsdtReward * 100);

          const baseItem = selectedBox.lootPool.find(item => item.id === result.item?.id) || selectedBox.lootPool[0];
          const uniqueItem: BlindboxItem = {
            ...baseItem,
            id: 'pull_' + result.claimId,
            name: result.item?.name || baseItem.name,
            rarity: result.item?.rarity || baseItem.rarity,
            usdtReward: finalUsdtReward,
            coinValue: coinsEquiv,
          };

          setUnboxedItem(uniqueItem);
          setWonUsdt(finalUsdtReward);

          setTimeout(() => {
            setUnboxingState('REVEALED');
            sound.playUnboxReveal(uniqueItem.rarity);

            if (uniqueItem.rarity === 'mythic' || uniqueItem.rarity === 'legendary' || finalUsdtReward >= 10) {
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
              payoutAmount: coinsEquiv,
              multiplier: 1.0,
              isWin: true,
              details: `Daily Box: +$${finalUsdtReward.toFixed(2)} USDT & ${uniqueItem.name}`,
            });
          }, 700);
        }, 1200);
      } catch (error) {
        setUnboxingState('IDLE');
        showToast(
          'Blind Box Failed',
          error instanceof Error ? error.message : 'Server gagal memproses Blind Box.',
          'error'
        );
      }
    });
  };

  const handleKeepItem = () => {
    if (!unboxedItem) return;
    sound.playClick();
    addToInventory(unboxedItem);
    showToast('Vault Updated', `Added ${unboxedItem.name} to your Inventory!`, 'success');
    resetBox();
  };

  const resetBox = () => {
    setUnboxingState('IDLE');
    setUnboxedItem(null);
    setWonUsdt(0);
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
            <span>Daily Mystery Blind Box</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              All Rewards in USDT
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Open your daily mystery box based on your locked USDT balance. Quota resets daily at 00:00 UTC.
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
                <div className="text-[10px] text-slate-400">Resets in: {timeToReset}</div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-400 flex items-center gap-1.5 font-semibold">
              <Lock className="w-4 h-4" />
              <span>Lock $4+ USDT to Unlock Daily Boxes</span>
            </div>
          )}
        </div>
      </div>

      {/* TIER MULTIPLIER RULES & DAILY QUOTA SCALING BREAKDOWN */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>$4 - $49 USDT</span>
            <span className="text-emerald-400 font-mono">1 Box / Day</span>
          </div>
          <div className="text-[11px] text-slate-400">Minimum qualifying lock. 1 box reset daily.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>$50 - $99 USDT</span>
            <span className="text-cyan-400 font-mono">2 Boxes / Day</span>
          </div>
          <div className="text-[11px] text-slate-400">2x daily opening quota. Resets every day.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>$100 - $249 USDT</span>
            <span className="text-amber-400 font-mono">3 Boxes / Day</span>
          </div>
          <div className="text-[11px] text-slate-400">3x daily openings + enhanced USDT rewards.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>$500+ USDT</span>
            <span className="text-purple-400 font-mono">10 Boxes / Day</span>
          </div>
          <div className="text-[11px] text-slate-400">VIP Whale status. Maximum daily USDT yields.</div>
        </div>
      </div>

      {/* STAKING FORM / ACTIVE STAKING CARD */}
      {!isQualified ? (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>USDT STAKING LOCK REQUIRED</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Lock USDT to Claim Daily Boxes & Earn Passive USDT Yields
              </h2>
              <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                <p>
                  Estimated returns based on commitment: <strong>10% (30 Days)</strong> ·{' '}
                  <strong>15% (60 Days)</strong> · <strong>20% (90 Days)</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  ⚠️ Early unlock is available anytime; however, if unlocked before completing the committed duration,
                  all daily rewards are forfeited (reward harian hangus), and only your initial locked principal is refunded.
                </p>
              </div>
            </div>

            {/* Quick Lock Creator Form */}
            <form
              onSubmit={handleCreateStakingLock}
              className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 w-full lg:w-80 shrink-0"
            >
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Lock Amount (USDT)
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[4, 50, 100, 250].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => { sound.playClick(); setLockUsdAmount(amt); }}
                      className={`py-1 text-xs font-bold rounded-lg border transition-all ${
                        lockUsdAmount === amt
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="4"
                  step="0.01"
                  value={lockUsdAmount}
                  onChange={(e) => setLockUsdAmount(Math.max(4, Number(e.target.value) || 4))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-sm outline-none focus:border-amber-400"
                  placeholder="Nominal lock pilihan user"
                />
                <div className="text-[10px] text-slate-500 mt-1">Nominal lock ditentukan sendiri oleh user. Minimum 4 USDT.</div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Quota: <strong className="text-emerald-400">{lockUsdAmount >= 250 ? '5 Boxes/Day' : lockUsdAmount >= 100 ? '3 Boxes/Day' : lockUsdAmount >= 50 ? '2 Boxes/Day' : '1 Box/Day'}</strong></span>
                  <span className="font-mono text-amber-400">{lockUsdAmount * 100} Coins</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Commitment & Return
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { days: 30, yield: '10%' },
                    { days: 60, yield: '15%' },
                    { days: 90, yield: '20%' },
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
                      <div className="text-[9px] font-semibold opacity-85">{tier.yield} Est.</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Now</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ACTIVE STAKING DETAILS & EARLY UNLOCK CARD */
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white">
                    Total Locked: ${totalLocked.toFixed(2)} USDT ({dailyQuota} Boxes/Day Quota)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Active Commitment
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Est. Staking Yield: 10% (30d) · 15% (60d) · 20% (90d) | Daily Claims:{' '}
                  <strong className="text-amber-400">{primaryLock?.dailyClaims}x</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => primaryLock && claimDailyLockYield(primaryLock.id)}
                className="px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Claim Daily Yield
              </button>

              <button
                onClick={() => {
                  if (primaryLock) {
                    setTargetUnlockLockId(primaryLock.id);
                    setIsEarlyUnlockModalOpen(true);
                  }
                }}
                className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Early Unlock</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EARLY UNLOCK FORFEIT WARNING MODAL */}
      {isEarlyUnlockModalOpen && primaryLock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Confirm Early Unlock</h3>
            </div>

            <div className="p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-xs text-rose-200 space-y-1.5">
              <div className="font-bold">⚠️ Staking Policy Rule:</div>
              <p>
                You committed to <strong>{primaryLock.durationDays} Days</strong>. If you unlock early before the term
                completes:
              </p>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-300 font-semibold">
                <li>All daily yield rewards (+{primaryLock.accumulatedYieldCoins} Coins) are forfeited.</li>
                <li>Only your initial principal of ${primaryLock.amount.toFixed(2)} USDT ({Math.floor(primaryLock.amount * 100)} Coins) will be refunded.</li>
                <li>Daily blind box unboxing privileges will be suspended until a new lock is active.</li>
              </ul>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsEarlyUnlockModalOpen(false)}
                className="flex-1 py-2 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Cancel & Keep Staking
              </button>
              <button
                type="button"
                onClick={handleConfirmEarlyUnlock}
                className="flex-1 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors"
              >
                Forfeit Rewards & Unlock
              </button>
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
                <p className="text-xs text-slate-400 max-w-sm mt-1">{selectedBox.description}</p>
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
                      ? 'Lock $4+ USDT to Enable'
                      : remainingBoxes > 0
                      ? `Open Daily Box (${remainingBoxes} Available Today)`
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
                  alt="Unboxing"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-emerald-400 animate-pulse">
                  {unboxingState === 'SHAKING' ? 'Decrypting Daily USDT Drop...' : 'Opening Mystery Vault!'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Calibrating USDT Reward Distribution</div>
              </div>
            </div>
          )}

          {unboxingState === 'REVEALED' && unboxedItem && (
            <div className="flex flex-col items-center text-center space-y-5 z-10 py-4 w-full max-w-md animate-in zoom-in-90 duration-300">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Daily USDT Reward Unlocked!</span>
              </div>

              {/* USDT Cash Prize Callout Banner */}
              <div className="w-full p-4 bg-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl text-center space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Instant USDT Prize Credited to Wallet
                </div>
                <div className="text-3xl font-mono font-black text-emerald-400">
                  +${wonUsdt.toFixed(2)} USDT
                </div>
                <div className="text-xs text-slate-400">
                  (Equivalent to +{unboxedItem.coinValue} Gold Coins)
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
                  <span>Keep in Vault</span>
                </button>
                <button
                  onClick={resetBox}
                  className="py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Done</span>
                </button>
              </div>

              {remainingBoxes > 0 && (
                <button
                  onClick={() => { resetBox(); startDailyUnboxing(); }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Open Next Daily Box ({remainingBoxes} Left)</span>
                </button>
              )}
            </div>
          )}
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
                        {isTierUnlocked ? 'Unlocked' : `Requires $${box.minLockedRequired}+ Lock`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{box.description}</p>
                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{box.badge}</span>
                      {isSelected && <span className="text-emerald-400 font-semibold">Active Selection</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Staking Return Estimates */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>USDT Staking Return Schedule</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">30 Days Term</span>
                <span className="font-mono text-emerald-400 font-bold">10% Total Yield</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">60 Days Term</span>
                <span className="font-mono text-cyan-400 font-bold">15% Total Yield</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">90 Days Term</span>
                <span className="font-mono text-amber-400 font-bold">20% Total Yield</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
