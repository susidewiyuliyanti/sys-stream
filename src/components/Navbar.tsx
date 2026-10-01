import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { CryptoDepositModal } from './CryptoDepositModal';
import { Volume2, VolumeX, Plus, Sparkles } from 'lucide-react';
import { sound } from '../lib/sound';
import { SysLogo } from './SysLogo';

interface Props {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<Props> = ({ currentPath, navigate }) => {
  const { user, soundEnabled, toggleSound, claimDailyBonus, isLoggedIn } = useGame();
  const [depositOpen, setDepositOpen] = useState(false);

  const navLinks = [
    { label: 'Live Stream Room', path: '/room/main' },
    { label: 'Crypto Card', path: '/game/tebak' },
    { label: 'Viewer Raffle', path: '/game/spinner' },
    { label: 'Blind Box', path: '/game/blindbox' },
    { label: 'Leaderboard', path: '/leaderboard' },
    { label: 'Referrals', path: '/referral' },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => { sound.playClick(); navigate('/room/main'); }}
            className="text-left transition-transform hover:scale-[1.02] cursor-pointer"
          >
            <SysLogo size="md" showText={true} />
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            {navLinks.map((item) => {
              const isActive = currentPath.startsWith(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => { sound.playClick(); navigate(item.path); }}
                  className={`relative py-1 transition-colors hover:text-white cursor-pointer ${isActive ? 'text-amber-400 font-semibold' : 'text-slate-400'}`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              title={soundEnabled ? 'Mute Audio' : 'Enable Audio'}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {isLoggedIn && (
              <>
                <button
                  onClick={() => claimDailyBonus()}
                  title="Claim Daily Free Reward"
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Daily Bonus</span>
                </button>

                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
                  <div className="px-2.5 py-1 flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <span className="text-amber-300">🪙</span>
                    <span className="tabular-nums">{user.coins.toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => { sound.playClick(); setDepositOpen(true); }}
                    title="Deposit Crypto via NOWPayments"
                    className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span className="hidden sm:inline">Deposit</span>
                  </button>
                </div>
              </>
            )}

            <button
              onClick={() => { sound.playClick(); navigate(isLoggedIn ? '/profile' : '/login'); }}
              className={`flex items-center gap-2 p-1.5 rounded-lg transition-colors cursor-pointer ${currentPath === '/profile' ? 'bg-slate-800 border border-amber-500/50' : 'hover:bg-slate-800'}`}
            >
              {isLoggedIn ? (
                <>
                  <img
                    src={user.avatar}
                    alt={user.username}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-md bg-slate-800 border border-slate-700"
                  />
                  <span className="hidden sm:inline text-xs font-semibold text-slate-200 truncate max-w-[90px]">
                    {user.username}
                  </span>
                </>
              ) : (
                <span className="text-xs font-semibold text-slate-200 px-2">Login</span>
              )}
            </button>
          </div>
        </div>

        <div className="md:hidden flex items-center justify-around border-t border-slate-800/80 px-2 py-2 overflow-x-auto text-xs font-medium text-slate-400">
          {navLinks.map((item) => (
            <button
              key={item.path}
              onClick={() => { sound.playClick(); navigate(item.path); }}
              className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${currentPath.startsWith(item.path) ? 'text-amber-400 font-semibold bg-slate-900' : 'hover:text-white'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      {isLoggedIn && (
        <CryptoDepositModal isOpen={depositOpen} onClose={() => setDepositOpen(false)} />
      )}
    </>
  );
};
