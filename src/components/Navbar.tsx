import React from 'react';
import { sound } from '../lib/sound';
import { SysLogo } from './SysLogo';
import { Globe, User } from 'lucide-react';
import { LANGUAGES, useLanguage } from '../i18n';
import { useGame } from '../context/GameContext';

interface Props {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<Props> = ({ navigate }) => {
  const { language, setLanguage, t } = useLanguage();
  const { isLoggedIn } = useGame();
  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button
          onClick={() => { sound.playClick(); navigate('/dashboard'); }}
          aria-label={t('Go to SYS STREAM home')}
          className="text-left transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <SysLogo size="md" showText={true} />
        </button>
        <div className="flex items-center gap-2">
          {isLoggedIn && (
            <button
              onClick={() => { sound.playClick(); navigate('/profile'); }}
              aria-label={t('Profile')}
              title={t('Profile')}
              className="inline-flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-slate-900/90 px-3 py-2 text-xs font-bold text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Profile')}</span>
            </button>
          )}
          <label className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-xs text-slate-300" title={t('Language')}>
          <Globe className="w-4 h-4 text-cyan-400" />
          <select
            aria-label={t('Language')}
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="bg-transparent outline-none cursor-pointer text-xs"
          >
            {LANGUAGES.map(item => <option key={item.code} value={item.code} className="bg-slate-900">{item.native}</option>)}
          </select>
          </label>
        </div>
      </div>
    </header>
  );
};
