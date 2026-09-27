import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Unlock, AlertTriangle, ArrowRight, ShieldAlert, Loader2, Coins } from 'lucide-react';
import { BlindBoxDeposit } from '../../types';

interface BlindBoxUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: BlindBoxDeposit | null;
  jwtToken: string;
  onSuccess: (refundedAmount: number, forfeitedReward: number, newBalance: number) => void;
}

export const BlindBoxUnlockModal: React.FC<BlindBoxUnlockModalProps> = ({
  isOpen,
  onClose,
  deposit,
  jwtToken,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !deposit) return null;

  const handleUnlock = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/deposit/unlock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({ depositId: deposit.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to unlock deposit.');
      }

      onSuccess(data.refundedAmount, data.forfeitedReward, data.newBalance);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while unlocking.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-md my-auto rounded-3xl bg-neutral-950 border border-red-500/40 p-5 sm:p-6 shadow-2xl shadow-red-500/20 text-white font-['Poppins']"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header icon & title */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 shrink-0">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">
                Unlock Deposit Balance
              </h3>
              <p className="text-xs text-red-300/80 font-medium">
                Withdraw principal before lock duration ends
              </p>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="space-y-3 mb-4">
            {/* Modal to be refunded */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Coins className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[11px] text-emerald-300/80 font-bold uppercase tracking-wider">
                    Refunded Principal:
                  </div>
                  <div className="text-base font-black font-mono text-emerald-300">
                    Rp {deposit.amount.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/30">
                100% RETURNED
              </span>
            </div>

            {/* Reward to be forfeited */}
            <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <div>
                  <div className="text-[11px] text-red-300/80 font-bold uppercase tracking-wider">
                    Forfeited Blind Box Rewards:
                  </div>
                  <div className="text-base font-black font-mono text-rose-300 line-through">
                    Rp {deposit.totalClaimed.toLocaleString('id-ID')}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-red-500/20 text-rose-300 text-[10px] font-black border border-red-500/40 animate-pulse">
                FORFEITED / LOST
              </span>
            </div>
          </div>

          {/* CRITICAL NOTE */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/60 to-rose-950/40 border-2 border-red-500/50 mb-5 space-y-1.5">
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>IMPORTANT NOTICE:</span>
            </div>
            <p className="text-xs text-white/90 leading-relaxed">
              By unlocking early now, all accumulated Blind Box rewards totaling{' '}
              <strong className="text-rose-300 font-black">
                Rp {deposit.totalClaimed.toLocaleString('id-ID')}
              </strong>{' '}
              will be{' '}
              <span className="text-rose-400 font-black underline">PERMANENTLY FORFEITED</span>{' '}
              and cannot be reclaimed.
            </p>
            <p className="text-[11px] text-white/70">
              Only the initial principal of{' '}
              <strong className="text-emerald-300">
                Rp {deposit.amount.toLocaleString('id-ID')}
              </strong>{' '}
              will be returned to your wallet balance.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-900/50 border border-red-500/50 text-xs text-red-200">
              {errorMsg}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white font-bold text-xs transition-all cursor-pointer text-center disabled:opacity-50"
            >
              Cancel (Keep Rewards)
            </button>
            <button
              type="button"
              onClick={handleUnlock}
              disabled={isLoading}
              className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Unlocking...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Yes, Unlock (Forfeit Rewards)</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
