import React, { useState } from 'react';
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
  const [open, setOpen] = useState(false);
  const current = languages.find(item => item.code === language) || languages[0];
  return (
    <div className="relative z-[60] shrink-0">
      <button
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen(value => !value)}
        className="relative z-[61] inline-flex min-h-11 min-w-11 touch-manipulation items-center justify-center gap-1.5 rounded-xl border border-cyan-500/40 bg-slate-900 px-2.5 text-xs font-bold text-white shadow-sm active:bg-slate-800"
      >
        <Globe className="h-4 w-4 shrink-0 text-cyan-400" />
        <span className="max-w-[3.25rem] truncate">{current?.native || current?.code || 'EN'}</span>
      </button>
      {open && (
        <>
          <button type="button" aria-label={label} className="fixed inset-0 z-[58] cursor-default bg-transparent" onClick={() => setOpen(false)} />
          <div role="menu" aria-label={label} className="absolute right-0 top-full z-[62] mt-2 max-h-[65vh] w-48 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 p-1.5 shadow-2xl">
            {languages.map(item => (
              <button
                key={item.code}
                type="button"
                role="menuitemradio"
                aria-checked={item.code === language}
                onClick={() => { setLanguage(item.code as typeof language); setOpen(false); }}
                className={`flex min-h-11 w-full touch-manipulation items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${item.code === language ? 'bg-cyan-500/15 font-bold text-cyan-300' : 'text-slate-200 hover:bg-slate-800'}`}
              >
                <span>{item.native}</span>
                <span className="ml-3 text-[10px] uppercase text-slate-500">{item.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
