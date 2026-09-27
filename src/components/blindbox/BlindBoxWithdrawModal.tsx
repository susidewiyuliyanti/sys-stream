import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Wallet, ShieldCheck, ArrowDownToLine, CheckCircle, ShieldAlert, Coins } from 'lucide-react';
import { BlindBoxDeposit } from '../../types';

interface BlindBoxWithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  deposit: BlindBoxDeposit | null;
  onSuccess: (payout: number, newBalance: number) => void;
  jwtToken: string;
}

const CRYPTO_NETWORKS = [
  { id: 'USDT (TRC-20)', name: 'USDT (TRC-20)', sub: 'Tron Network - Transaksi Cepat & Biaya Rendah', tag: 'Direkomendasikan' },
  { id: 'USDT (BEP-20)', name: 'USDT (BEP-20)', sub: 'BNB Smart Chain (BSC)', tag: 'Populer' },
  { id: 'USDT (Polygon)', name: 'USDT (Polygon)', sub: 'Polygon PoS Network', tag: 'Hemat Gas' },
  { id: 'USDT (Arbitrum)', name: 'USDT (Arbitrum One)', sub: 'Arbitrum Layer 2', tag: 'Cepat' },
  { id: 'USDT (ERC-20)', name: 'USDT (ERC-20)', sub: 'Ethereum Mainnet', tag: 'Standard' },
  { id: 'BTC', name: 'Bitcoin (BTC)', sub: 'Bitcoin Native Network', tag: 'Crypto' },
  { id: 'ETH', name: 'Ethereum (ETH)', sub: 'Ethereum Mainnet', tag: 'Crypto' },
  { id: 'SOL', name: 'Solana (SOL)', sub: 'Solana High Speed Network', tag: 'Crypto' },
];

export const BlindBoxWithdrawModal: React.FC<BlindBoxWithdrawModalProps> = ({
  isOpen,
  onClose,
  deposit,
  onSuccess,
  jwtToken,
}) => {
  const [cryptoNetwork, setCryptoNetwork] = useState('USDT (TRC-20)');
  const [walletAddress, setWalletAddress] = useState('');
  const [walletMemo, setWalletMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !deposit) return null;

  const totalPayout = deposit.amount + deposit.totalClaimed;
  const usdtEstimate = (totalPayout / 16000).toFixed(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanAddress = walletAddress.trim();
    if (!cleanAddress) {
      setErrorMsg('Recipient crypto wallet address is required.');
      return;
    }

    if (cleanAddress.length < 15) {
      setErrorMsg('Crypto wallet address format appears too short. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          depositId: deposit.id,
          cryptoNetwork,
          walletAddress: cleanAddress,
          memo: walletMemo.trim() || 'Crypto Wallet',
          bankName: cryptoNetwork,
          accountNumber: cleanAddress,
          accountName: walletMemo.trim() || 'Crypto Wallet',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process crypto withdrawal.');
      }

      onSuccess(data.payout, data.newBalance);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Crypto withdrawal failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg rounded-3xl bg-neutral-900 border border-amber-500/40 p-6 sm:p-7 shadow-2xl text-white max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 mb-3 shadow-lg shadow-amber-500/20 text-slate-950">
              <Coins className="w-7 h-7" />
            </div>
            <div className="inline-block px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-[10px] font-black text-amber-300 uppercase tracking-widest mb-1.5">
              100% Crypto-Only Payout
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-amber-300">
              Withdraw Principal + Harvest Earnings (Crypto)
            </h3>
            <p className="text-xs text-white/60 mt-1 max-w-sm mx-auto">
              Deposit lock period is complete. All funds will be sent directly to your crypto wallet address.
            </p>
          </div>

          {/* Payout Breakdown Card */}
          <div className="p-4.5 rounded-2xl bg-black/60 border border-amber-500/30 mb-5 space-y-2.5">
            <div className="flex justify-between text-xs text-white/70">
              <span>Principal Deposit Lock:</span>
              <span className="font-mono text-white font-bold">
                Rp {deposit.amount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between text-xs text-white/70">
              <span>Total Blind Box Rewards:</span>
              <span className="font-mono text-emerald-400 font-bold">
                +Rp {deposit.totalClaimed.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-white/70 block">Total Payout:</span>
                <span className="text-[11px] text-amber-300/80 font-mono">
                  Estimate ≈ {usdtEstimate} USDT
                </span>
              </div>
              <span className="font-mono text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-amber-300 to-amber-500">
                Rp {totalPayout.toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">
                Select Network & Crypto Asset
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CRYPTO_NETWORKS.slice(0, 4).map((net) => (
                  <button
                    key={net.id}
                    type="button"
                    onClick={() => setCryptoNetwork(net.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                      cryptoNetwork === net.id
                        ? 'bg-amber-500/20 border-amber-400 text-white shadow-sm'
                        : 'bg-black/40 border-white/10 hover:border-white/20 text-white/70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{net.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-amber-300 font-semibold">
                        {net.tag}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/50 block mt-0.5">{net.sub}</span>
                  </button>
                ))}
              </div>

              {/* Option for other crypto */}
              <div className="mt-2">
                <select
                  value={cryptoNetwork}
                  onChange={(e) => setCryptoNetwork(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-xs text-white focus:outline-none"
                >
                  {CRYPTO_NETWORKS.map((n) => (
                    <option key={n.id} value={n.id} className="bg-neutral-900 text-white">
                      {n.name} - {n.sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5 flex items-center justify-between">
                <span>Recipient Crypto Wallet Address ({cryptoNetwork})</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Auto Network
                </span>
              </label>
              <div className="relative">
                <Wallet className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="text"
                  required
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  placeholder={`Enter your ${cryptoNetwork} wallet address`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-xs font-mono text-white placeholder:text-white/30 focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-white/50 mt-1">
                Ensure wallet address matches the selected network to prevent loss of funds.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">
                Memo / Tag / Wallet Label <span className="text-white/40 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={walletMemo}
                onChange={(e) => setWalletMemo(e.target.value)}
                placeholder="Example: Personal TrustWallet / Binance / Bybit"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/15 focus:border-amber-400 text-xs text-white placeholder:text-white/30 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              <span>
                {isLoading
                  ? 'Verifying Crypto Transaction...'
                  : `Withdraw Rp ${totalPayout.toLocaleString('id-ID')} (~${usdtEstimate} USDT)`}
              </span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
