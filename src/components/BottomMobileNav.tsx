import React from 'react';
import { sound } from '../lib/sound';
import {
  Home,
  TrendingUp,
  Trophy,
  User,
  Radio,
  Box,
} from 'lucide-react';

interface BottomMobileNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({ currentPath, navigate }) => {
  const tabs = [
    { label: 'Home', path: '/room/main', icon: Home },
    { label: 'Earn', path: '/game/blindbox', icon: TrendingUp },
    { label: 'Board', path: '/leaderboard', icon: Trophy },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#060a14]/95 backdrop-blur-xl border-t border-cyan-500/20 px-3 py-2 flex items-center justify-around sm:hidden shadow-[0_-4px_25px_rgba(0,0,0,0.8)]">
      {tabs.map((tab) => {
        const isActive =
          currentPath === tab.path ||
          (tab.path === '/room/main' && currentPath.startsWith('/room')) ||
          (tab.path === '/leaderboard' && (currentPath.startsWith('/leaderboard') || currentPath.startsWith('/referral'))) ||
          (tab.path === '/game/blindbox' && (currentPath.startsWith('/game') || currentPath.startsWith('/vault')));

        const Icon = tab.icon;

        return (
          <button
            key={tab.path}
            onClick={() => {
              sound.playClick();
              navigate(tab.path);
            }}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative ${
              isActive
                ? 'text-cyan-400 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {isActive && (
              <span className="absolute -top-2 w-8 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            )}
            <div
              className={`p-1.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-cyan-500/15 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : ''
              }`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
export default BottomMobileNav;
