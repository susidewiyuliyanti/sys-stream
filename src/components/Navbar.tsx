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
      <div className="max-w-7xl mx-auto w-full min-w-0 px-2.5 sm:px-6 h-16 flex items-center justify-between gap-2">
        <button
          onClick={() => { sound.playClick(); navigate('/dashboard'); }}
          aria-label={t('Go to SYS STREAM home')}
          className="min-w-0 shrink transition-transform hover:scale-[1.02] cursor-pointer"
        >
          <SysLogo size="md" showText={true} className="max-w-full" />
        </button>
        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          {isLoggedIn && (
            <button
              onClick={() => { sound.playClick(); navigate('/profile'); }}
              aria-label={t('Profile')}
              title={t('Profile')}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-cyan-500/30 bg-slate-900/90 px-2 sm:px-3 py-2 text-xs font-bold text-cyan-300 hover:text-white hover:border-cyan-400 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">{t('Profile')}</span>
            </button>
          )}
          <MobileLanguagePicker language={language} setLanguage={setLanguage} languages={LANGUAGES} label={t('Language')} />
        </div>
      </div>
    </header>
  );
};


interface MobileLanguagePickerProps {
  language: string;
  setLanguage: (language: any) => void;
  languages: typeof LANGUAGES;
  label: string;
}

const MobileLanguagePicker: React.FC<MobileLanguagePickerProps> = ({ language, setLanguage, languages, label }) => {
  const current = languages.find(item => item.code === language) || languages[0];
  return (
    <label className="relative z-[70] inline-flex min-h-11 min-w-[3.25rem] shrink-0 touch-manipulation items-center justify-center gap-1.5 overflow-hidden rounded-xl border border-cyan-500/40 bg-slate-900 px-2.5 text-xs font-bold text-white shadow-sm">
      <Globe aria-hidden="true" className="pointer-events-none h-4 w-4 shrink-0 text-cyan-400" />
      <span aria-hidden="true" className="pointer-events-none max-w-[3.25rem] truncate">{current?.native || current?.code || 'EN'}</span>
      <select
        aria-label={label}
        title={label}
        value={language}
        onChange={(event) => setLanguage(event.target.value as typeof language)}
        className="absolute inset-0 z-[71] h-full w-full cursor-pointer appearance-none opacity-0"
        style={{ fontSize: '16px' }}
      >
        {languages.map(item => (
          <option key={item.code} value={item.code} style={{ backgroundColor: "#0f172a", color: "#ffffff" }}>{item.native}</option>
        ))}
      </select>
    </label>
  );
};
