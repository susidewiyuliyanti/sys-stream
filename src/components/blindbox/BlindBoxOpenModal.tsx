import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Crown, CheckCircle2, Award, Gift } from 'lucide-react';
import { BlindBox3DScene } from './BlindBox3DScene';
import { gameAudio } from '../../utils/gameAudio';
import { OpenedBoxItem, BoxTierType } from '../../types';

interface BlindBoxOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizeAmount: number;
  isJackpot: boolean;
  totalClaimed: number;
  tier?: BoxTierType;
  tierName?: string;
  boxType?: string;
  boxCount?: number;
  boxes?: OpenedBoxItem[];
}

export const BlindBoxOpenModal: React.FC<BlindBoxOpenModalProps> = ({
  isOpen,
  onClose,
  prizeAmount,
  isJackpot,
  totalClaimed,
  tier = 'BRONZE',
  tierName = 'Bronze',
  boxType = 'Box Regular',
  boxCount = 1,
  boxes = [],
}) => {
  const [phase, setPhase] = useState<'opening' | 'revealed'>('opening');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setPhase('opening');
      setCountdown(3);
      return;
    }

    // Start 3-second sequence
    gameAudio.playVibrate();

    const timer1 = setTimeout(() => {
      setCountdown(2);
      gameAudio.playVibrate();
    }, 1000);

    const timer2 = setTimeout(() => {
      setCountdown(1);
      gameAudio.playOpenPop();
    }, 2000);

    const timer3 = setTimeout(() => {
      setPhase('revealed');
      if (isJackpot) {
        gameAudio.playJackpotFanfare();
        // Grand Confetti Blast
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#fef08a', '#ef4444', '#10b981'],
        });
      } else {
        gameAudio.playPrizeChime();
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#06b6d4', '#cbd5e1'],
        });
      }
    }, 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [isOpen, isJackpot]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-xl rounded-3xl bg-neutral-950 border border-amber-500/50 p-6 sm:p-8 text-white text-center shadow-[0_0_80px_rgba(245,158,11,0.25)] overflow-hidden my-6"
        >
          {/* Cyber Neon Background Glow */}
          <div
            className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl pointer-events-none ${
              isJackpot
                ? 'bg-amber-500/40'
                : tier === 'PLATINUM'
                ? 'bg-cyan-500/30'
                : tier === 'SILVER'
                ? 'bg-slate-400/20'
                : 'bg-yellow-500/20'
            }`}
          />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl bg-yellow-500/20 pointer-events-none" />

          {/* Phase 1: Opening Animation (3 Detik) */}
          {phase === 'opening' ? (
            <div className="py-4">
              <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black uppercase tracking-widest mb-3 animate-pulse">
                Membuka {boxCount} {boxType}... ({countdown}s)
              </span>

              <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-400 to-yellow-500 mb-6">
                Menghitung Keberuntungan {boxCount} Box Anda!
              </h3>

              <div className="my-6">
                <BlindBox3DScene
                  isOpening={true}
                  canClick={false}
                  tier={tier}
                  boxCount={boxCount}
                />
              </div>

              <div className="w-48 h-2 bg-white/10 rounded-full mx-auto overflow-hidden">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'linear' }}
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                />
              </div>
            </div>
          ) : (
            /* Phase 2: Result Revealed */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="py-2"
            >
              {isJackpot ? (
                <div className="mb-3">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-red-600 border border-yellow-300 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-amber-500/40 animate-bounce">
                    <Crown className="w-5 h-5 text-yellow-200" />
                    <span>🔥 JACKPOT SULTAN! 🔥</span>
                    <Crown className="w-5 h-5 text-yellow-200" />
                  </div>
                </div>
              ) : (
                <div className="mb-2">
                  <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-black ${
                    tier === 'GOLD'
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : tier === 'PLATINUM'
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                      : tier === 'SILVER'
                      ? 'bg-slate-400/20 border-slate-300 text-slate-200'
                      : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  }`}>
                    <Award className="w-4 h-4" />
                    <span>
                      {tier === 'GOLD'
                        ? '👑 10 Box Emas Berhasil Dibuka!'
                        : tier === 'PLATINUM'
                        ? '💎 5 Box Platinum Berhasil Dibuka!'
                        : tier === 'SILVER'
                        ? '🥈 3 Box Silver Berhasil Dibuka!'
                        : '🎁 Klaim Harian Berhasil!'}
                    </span>
                  </div>
                </div>
              )}

              <h2 className="text-lg sm:text-xl font-black text-white mb-1">
                Total Hadiah dari {boxCount} {boxType}:
              </h2>

              {/* Prize Grand Total Card */}
              <div
                className={`py-5 px-4 rounded-2xl border-2 my-4 ${
                  isJackpot
                    ? 'bg-gradient-to-br from-amber-500/30 via-yellow-600/20 to-neutral-900 border-yellow-300/80 shadow-2xl shadow-yellow-500/30'
                    : tier === 'PLATINUM'
                    ? 'bg-neutral-900/90 border-cyan-400/60 shadow-xl shadow-cyan-500/10'
                    : tier === 'SILVER'
                    ? 'bg-neutral-900/90 border-slate-400/60 shadow-xl shadow-slate-500/10'
                    : 'bg-neutral-900/90 border-amber-400/50 shadow-xl'
                }`}
              >
                <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-yellow-500 drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]">
                  Rp {prizeAmount.toLocaleString('id-ID')}
                </div>
                <p className="text-xs text-white/70 mt-1.5">
                  Prize balance has been automatically added to your total deposit balance.
                </p>
              </div>

              {/* Multi-box Breakdown Grid (if more than 1 box) */}
              {boxes && boxes.length > 1 && (
                <div className="mb-4 text-left">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-amber-400" />
                      <span>Prize Breakdown Per Box ({boxes.length} Boxes):</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-300 font-bold">
                      {tierName}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 max-h-48 overflow-y-auto p-1">
                    {boxes.map((b) => (
                      <div
                        key={b.boxNumber}
                        className={`p-2 rounded-xl border text-center relative overflow-hidden ${
                          b.isJackpot
                            ? 'bg-gradient-to-b from-red-600/40 to-amber-600/30 border-yellow-300 text-white shadow'
                            : tier === 'PLATINUM'
                            ? 'bg-cyan-950/40 border-cyan-500/30 text-cyan-200'
                            : tier === 'SILVER'
                            ? 'bg-slate-800/40 border-slate-400/30 text-slate-200'
                            : 'bg-white/5 border-white/10 text-white/90'
                        }`}
                      >
                        {b.isJackpot && (
                          <div className="absolute top-0.5 right-0.5">
                            <Crown className="w-3 h-3 text-yellow-300" />
                          </div>
                        )}
                        <div className="text-[9px] uppercase font-bold text-white/50 tracking-wider">
                          Box #{b.boxNumber}
                        </div>
                        <div className="text-xs font-black font-mono text-amber-300 mt-0.5">
                          Rp {b.prize.toLocaleString('id-ID')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Claimed Summary */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white/80 mb-5 flex items-center justify-between">
                <span>Total Hadiah Terkumpul Saat Ini:</span>
                <span className="font-mono font-black text-amber-300 text-sm">
                  Rp {totalClaimed.toLocaleString('id-ID')}
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-950 font-black text-base shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Simpan Hadiah & Kembali ke Dashboard</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
