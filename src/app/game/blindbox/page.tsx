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
  Clock,
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
    description: 'Tersedia untuk lock aktif minimal Rp 50.000. Reward harian diproses server dan masuk ke saldo tersedia.',
    badge: 'Daily Active Reward',
    accentColor: '#38bdf8',
    minLockedRequired: 50000,
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
    description: 'Tier lock lebih tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
    badge: 'Enhanced Lock Tier',
    accentColor: '#a855f7',
    minLockedRequired: 500000,
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
    description: 'Tier lock tinggi dengan koleksi langka. Reward finansial tetap ditentukan server.',
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
  } = useGame();

  const [selectedBox, setSelectedBox] = useState<BoxTier>(BOX_TIERS[0]);
  const [unboxingState, setUnboxingState] = useState<'IDLE' | 'SHAKING' | 'REVEALING' | 'REVEALED'>('IDLE');
  const [unboxedItem, setUnboxedItem] = useState<BlindboxItem | null>(null);
  const [wonUsdt, setWonUsdt] = useState<number>(0);

  // Staking lock modal/form
  const [lockIdrAmount, setLockIdrAmount] = useState<number>(50000);
  const [lockDuration, setLockDuration] = useState<30 | 60 | 90>(30);

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
  const isQualified = totalLocked >= 50000;

  const activeLocks = locks.filter((l) => l.status === 'locked');
  const primaryLock: LockRecord | undefined = activeLocks[0];

  const handleCreateStakingLock = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      createLock(lockIdrAmount, lockDuration);
    });
  };


  const startDailyUnboxing = () => {
    requireAuth(async () => {
      if (!isQualified) {
        showToast(
          'Staking Required',
          'Anda harus mengunci minimal Rp 50.000 untuk membuka Blind Box harian.',
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
          const rewardIdr = Number(result.reward ?? result.prizeAmount ?? 0);

          const baseItem = selectedBox.lootPool.find(item => item.id === result.item?.id) || selectedBox.lootPool[0];
          const uniqueItem: BlindboxItem = {
            ...baseItem,
            id: 'pull_' + result.claimId,
            name: result.item?.name || baseItem.name,
            rarity: result.item?.rarity || baseItem.rarity,
            usdtReward: 0,
            coinValue: 0,
          };

          setUnboxedItem(uniqueItem);
          setWonUsdt(rewardIdr);

          setTimeout(() => {
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
              details: `Daily Box: +Rp ${rewardIdr.toLocaleString('id-ID')} & ${uniqueItem.name}`,
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
              Reward harian masuk ke saldo
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Buka Blind Box harian berdasarkan saldo yang sedang dikunci. Klaim harian mengikuti aturan server dan reset WIB.
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
              <span>Lock minimal Rp 50.000 untuk membuka Blind Box</span>
            </div>
          )}
        </div>
      </div>

      {/* TIER MULTIPLIER RULES & DAILY QUOTA SCALING BREAKDOWN */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6 text-xs">
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Rp 50.000+ Lock</span>
            <span className="text-emerald-400 font-mono">1 Box / Hari</span>
          </div>
          <div className="text-[11px] text-slate-400">Minimum lock Rp 50.000. Maksimal 1 claim per hari.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Lock aktif</span>
            <span className="text-cyan-400 font-mono">1 Box / Hari</span>
          </div>
          <div className="text-[11px] text-slate-400">Aturan claim tetap 1 kali per hari.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Lock aktif</span>
            <span className="text-amber-400 font-mono">1 Box / Hari</span>
          </div>
          <div className="text-[11px] text-slate-400">Aturan claim tetap 1 kali per hari.</div>
        </div>

        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 font-bold">
            <span>Lock aktif</span>
            <span className="text-purple-400 font-mono">1 Box / Hari</span>
          </div>
          <div className="text-[11px] text-slate-400">Aturan claim tetap 1 kali per hari.</div>
        </div>
      </div>

      {/* STAKING FORM / ACTIVE STAKING CARD */}
      {!isQualified ? (
        <div className="bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold">
                <Lock className="w-3.5 h-3.5" />
                <span>LOCK SALDO DIBUTUHKAN</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Lock saldo untuk mendapatkan hak claim Blind Box harian
              </h2>
              <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                <p>
                  Durasi lock tersedia: <strong>30 hari</strong> · <strong>60 hari</strong> · <strong>90 hari</strong>.
                </p>
                <p className="text-slate-400 text-[11px]">
                  ⚠️ Lock hanya dapat diselesaikan setelah masa lock berakhir. Sistem tidak menyediakan early unlock melalui Blind Box.
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
                  Nominal Lock (IDR)
                </label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[50000, 500000, 1000000, 2500000].map((amt) => (
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
                      Rp {amt.toLocaleString('id-ID')}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  min="50000"
                  step="10000"
                  value={lockIdrAmount}
                  onChange={(e) => setLockIdrAmount(Math.max(50000, Number(e.target.value) || 50000))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white font-mono text-sm outline-none focus:border-amber-400"
                  placeholder="Nominal lock pilihan user"
                />
                <div className="text-[10px] text-slate-500 mt-1">Nominal lock ditentukan sendiri oleh user. Minimum Rp 50.000, kelipatan Rp 10.000.</div>
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Quota: <strong className="text-emerald-400">1 Box/Day</strong></span>
                  <span className="font-mono text-amber-400">Rp {lockIdrAmount.toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                  Durasi Lock
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
                      <div className="text-[9px] font-semibold opacity-85">Lock</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock Saldo Sekarang</span>
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
                    Total Locked: Rp ${totalLocked.toLocaleString('id-ID')} ({dailyQuota} Box/Hari)
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                    Lock Aktif
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Daily Claim: 
                  <strong className="text-amber-400">{primaryLock?.dailyClaims}x</strong>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 max-w-xs text-right">
              Claim dilakukan melalui tombol Blind Box di bawah. Lock akan selesai otomatis setelah masa durasi berakhir.
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
                      ? 'Lock minimal Rp 50.000 untuk mengaktifkan'
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
                  {unboxingState === 'SHAKING' ? 'Memproses Reward Blind Box...' : 'Opening Mystery Vault!'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Server sedang menentukan reward...</div>
              </div>
            </div>
          )}

          {unboxingState === 'REVEALED' && unboxedItem && (
            <div className="flex flex-col items-center text-center space-y-5 z-10 py-4 w-full max-w-md animate-in zoom-in-90 duration-300">
              <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Reward Blind Box Harian</span>
              </div>

              {/* USDT Cash Prize Callout Banner */}
              <div className="w-full p-4 bg-emerald-500/15 border-2 border-emerald-500/50 rounded-2xl text-center space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                  Reward dikreditkan ke saldo tersedia
                </div>
                <div className="text-3xl font-mono font-black text-emerald-400">
                  +Rp {wonUsdt.toLocaleString('id-ID')}
                </div>
                <div className="text-xs text-slate-400">
                  Reward diproses dalam saldo IDR
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
                        {isTierUnlocked ? 'Unlocked' : `Requires Rp ${box.minLockedRequired.toLocaleString('id-ID')}+ Lock`}
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

          {/* Aturan Lock */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Jadwal Durasi Lock</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">30 Days Term</span>
                <span className="font-mono text-emerald-400 font-bold">Reward harian sesuai pengaturan server</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">60 Days Term</span>
                <span className="font-mono text-cyan-400 font-bold">Reward harian sesuai pengaturan server</span>
              </div>
              <div className="flex justify-between items-center text-[11px] p-2 bg-slate-950 rounded-lg">
                <span className="text-slate-300 font-bold">90 Days Term</span>
                <span className="font-mono text-amber-400 font-bold">Reward harian sesuai pengaturan server</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
