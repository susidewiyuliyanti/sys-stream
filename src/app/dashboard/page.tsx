import React from 'react';
import { LockKeyhole, Wallet, Gamepad2, User, ArrowRight, RefreshCw, Target, CircleDot, Gift } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../i18n';

interface Props {
  navigate?: (path: string) => void;
}

export default function DashboardPage({ navigate }: Props) {
  const { user, locks, isLoggedIn, refreshFinancialState, claimRegistrationBonus } = useGame();
  const { language } = useLanguage();

  const available = Number(user.coins || 0) / 100;
  const locked = locks
    .filter(lock => lock.status === 'locked')
    .reduce((sum, lock) => sum + Number(lock.amount || 0), 0);

  if (!isLoggedIn) return null;

  return (
    <section className="min-h-screen bg-[#050814] text-white px-4 py-6 sm:py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">SYS STREAM</p>
            <h1 className="text-2xl sm:text-3xl font-black mt-1">
              Welcome, {user.username || 'User'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">Your account dashboard</p>
          </div>
          <button
            onClick={() => void refreshFinancialState()}
            className="p-2.5 rounded-xl border border-slate-800 bg-slate-900 hover:border-cyan-500/50 transition-colors"
            aria-label="Refresh balance"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {user.registrationBonusGranted && (
            <div className="sm:col-span-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Registration Bonus</div>
                <div className="text-xl font-black mt-2 text-emerald-300">Rp15.000</div>
                <p className="text-xs text-slate-400 mt-1">Bonus pendaftaran • 1 akun hanya dapat claim 1 kali</p>
              </div>
              <button onClick={() => void claimRegistrationBonus()} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-400 text-slate-950 font-black hover:bg-emerald-300">
                <Gift className="w-4 h-4" /> Claim Bonus Registrasi
              </button>
            </div>
          )}

          <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
              <Wallet className="w-4 h-4 text-cyan-400" /> Available Balance
            </div>
            <div className="text-3xl font-black mt-3">{available.toFixed(2)} USDT</div>
            <p className="text-xs text-slate-500 mt-1">Server balance</p>
          </div>

          <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
              <LockKeyhole className="w-4 h-4 text-amber-400" /> Locked Balance
            </div>
            <div className="text-3xl font-black mt-3">{locked.toFixed(2)} USDT</div>
            <p className="text-xs text-slate-500 mt-1">{locks.filter(lock => lock.status === 'locked').length} active lock(s)</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={() => navigate?.('/game/tebak')} className="rounded-2xl border border-cyan-500/30 bg-slate-900 p-5 text-left hover:border-cyan-400/70 transition-colors">
            <Target className="w-6 h-6 text-cyan-400 mb-3" />
            <div className="font-bold text-lg">Tebak Nomor</div>
            <div className="text-xs text-slate-500 mt-1">Pilih angka dan ikuti permainan Tebak Nomor menggunakan saldo akun.</div>
            <ArrowRight className="w-4 h-4 mt-4 text-slate-500" />
          </button>
          <button onClick={() => navigate?.('/game/spinner')} className="rounded-2xl border border-purple-500/30 bg-slate-900 p-5 text-left hover:border-purple-400/70 transition-colors">
            <CircleDot className="w-6 h-6 text-purple-400 mb-3" />
            <div className="font-bold text-lg">Spinner</div>
            <div className="text-xs text-slate-500 mt-1">Masuk ke game Spinner dan lihat peserta yang sedang bermain.</div>
            <ArrowRight className="w-4 h-4 mt-4 text-slate-500" />
          </button>
          <button onClick={() => navigate?.('/game/blindbox')} className="rounded-2xl border border-emerald-500/30 bg-slate-900 p-5 text-left hover:border-emerald-400/70 transition-colors">
            <Gift className="w-6 h-6 text-emerald-400 mb-3" />
            <div className="font-bold text-lg">Blind Box</div>
            <div className="text-xs text-slate-500 mt-1">Buka Blind Box dan gunakan saldo game yang sama dengan saldo akun.</div>
            <ArrowRight className="w-4 h-4 mt-4 text-slate-500" />
          </button>
        </div>
      </div>
    </section>
  );
}


