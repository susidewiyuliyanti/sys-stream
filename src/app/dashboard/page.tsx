import React from 'react';
import { LockKeyhole, Wallet, Gamepad2, User, ArrowRight, RefreshCw } from 'lucide-react';
import { useGame } from '../../context/GameContext';

interface Props {
  navigate?: (path: string) => void;
}

export default function DashboardPage({ navigate }: Props) {
  const { user, locks, isLoggedIn, refreshFinancialState } = useGame();

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

        <div className="grid sm:grid-cols-3 gap-3">
          <button onClick={() => navigate?.('/game/blindbox')} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-cyan-500/50 transition-colors">
            <Gamepad2 className="w-5 h-5 text-cyan-400 mb-3" />
            <div className="font-bold">Blind Box</div>
            <div className="text-xs text-slate-500 mt-1">Open the game using your real account balance.</div>
            <ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
          </button>

          <button onClick={() => navigate?.('/profile')} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-cyan-500/50 transition-colors">
            <User className="w-5 h-5 text-purple-400 mb-3" />
            <div className="font-bold">Profile</div>
            <div className="text-xs text-slate-500 mt-1">Manage your account profile.</div>
            <ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
          </button>

          <button onClick={() => navigate?.('/game/blindbox')} className="rounded-2xl border border-slate-800 bg-slate-900 p-4 text-left hover:border-emerald-500/50 transition-colors">
            <Gamepad2 className="w-5 h-5 text-emerald-400 mb-3" />
            <div className="font-bold">Blind Box</div>
            <div className="text-xs text-slate-500 mt-1">Open the server-backed Blind Box game.</div>
            <ArrowRight className="w-4 h-4 mt-3 text-slate-500" />
          </button>
        </div>
      </div>
    </section>
  );
}
