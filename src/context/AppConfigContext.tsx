import React, { createContext, useContext, useState, useEffect } from 'react';
import { CountryCurrencyConfig, SoundTheme, SoundThemeInfo } from '../types';
import {
  COUNTRIES_CONFIG,
  getCountryByCode,
  formatCurrencyAmount,
  translate,
  installGlobalTranslationObserver
} from '../services/i18n';
import { sound, SOUND_THEMES } from '../services/sound';

interface AppConfigContextType {
  country: CountryCurrencyConfig;
  setCountryCode: (code: string) => void;
  languageCode: string;
  setLanguageCode: (lang: string) => void;
  formatCurrency: (amountInIdr: number) => string;
  t: (key: string, fallback?: string) => string;
  allCountries: CountryCurrencyConfig[];
  soundTheme: SoundTheme;
  setSoundTheme: (theme: SoundTheme) => void;
  toggleSoundTheme: () => SoundTheme;
  availableSoundThemes: SoundThemeInfo[];
}

const AppConfigContext = createContext<AppConfigContextType | null>(null);

export const AppConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Country & Currency State (Default to Indonesia IDR for host, or saved country)
  const [country, setCountry] = useState<CountryCurrencyConfig>(() => {
    try {
      const savedCode = localStorage.getItem('ls_country_code');
      if (savedCode) {
        return getCountryByCode(savedCode);
      }
      const savedLang = localStorage.getItem('ls_language_code');
      if (savedLang) {
        const found = COUNTRIES_CONFIG.find(c => c.languageCode === savedLang.toLowerCase().split('-')[0]);
        if (found) return found;
      }
    } catch {}
    // Default to Indonesia (IDR Rp)
    return COUNTRIES_CONFIG.find(c => c.code === 'ID') || COUNTRIES_CONFIG[0];
  });

  // Explicit Language override (defaults to country.languageCode)
  const [languageCode, setLanguageCodeState] = useState<string>(() => {
    try {
      const savedLang = localStorage.getItem('ls_language_code');
      if (savedLang) return savedLang;
      const savedCountry = localStorage.getItem('ls_country_code');
      if (savedCountry) {
        return getCountryByCode(savedCountry).languageCode;
      }
    } catch {}
    return 'id'; // Default Bahasa Indonesia
  });

  // Global i18n safety net: translate legacy/hard-coded UI text as soon as the selected language changes.
  useEffect(() => {
    const cleanLanguage = (languageCode || country.languageCode || 'id').toLowerCase().split('-')[0];

    document.documentElement.lang = cleanLanguage;
    document.documentElement.dir = cleanLanguage === 'ar' ? 'rtl' : 'ltr';

    return installGlobalTranslationObserver(cleanLanguage);
  }, [languageCode, country.languageCode]);

  // Sound Theme State
  const [soundTheme, setSoundThemeState] = useState<SoundTheme>(() => sound.getTheme());

  const setCountryCode = (code: string) => {
    const nextCountry = getCountryByCode(code);
    setCountry(nextCountry);
    setLanguageCodeState(nextCountry.languageCode);

    try {
      localStorage.setItem('ls_country_code', nextCountry.code);
      localStorage.setItem('ls_language_code', nextCountry.languageCode);
    } catch {}
  };

  const setLanguageCode = (lang: string) => {
    setLanguageCodeState(lang);
    const clean = (lang || 'id').toLowerCase().split('-')[0];
    
    // Explicit 1-to-1 language-to-national currency mapping
    const langToCountryMap: Record<string, string> = {
      id: 'ID',
      en: 'US',
      ms: 'MY',
      zh: 'CN',
      ja: 'JP',
      ko: 'KR',
      th: 'TH',
      vi: 'VN',
      tl: 'PH',
      ar: 'SA',
      es: 'MX',
      pt: 'BR',
      ru: 'RU',
      tr: 'TR',
      hi: 'IN'
    };

    const targetCountryCode = langToCountryMap[clean] || COUNTRIES_CONFIG.find((c) => c.languageCode === clean)?.code;
    if (targetCountryCode) {
      const matchingCountry = getCountryByCode(targetCountryCode);
      setCountry(matchingCountry);
      try {
        localStorage.setItem('ls_country_code', matchingCountry.code);
      } catch {}
    }
    try {
      localStorage.setItem('ls_language_code', lang);
    } catch {}
  };

  const setSoundTheme = (theme: SoundTheme) => {
    sound.setTheme(theme);
    setSoundThemeState(theme);
  };

  const toggleSoundTheme = () => {
    const nextTheme = sound.toggleNextTheme();
    setSoundThemeState(nextTheme);
    return nextTheme;
  };

  const formatCurrency = (amountInIdr: number) => {
    return formatCurrencyAmount(amountInIdr, country);
  };

  const t = (key: string, fallback?: string) => {
    return translate(key, languageCode || country.languageCode, fallback);
  };

  return (
    <AppConfigContext.Provider
      value={{
        country,
        setCountryCode,
        languageCode,
        setLanguageCode,
        formatCurrency,
        t,
        allCountries: COUNTRIES_CONFIG,
        soundTheme,
        setSoundTheme,
        toggleSoundTheme,
        availableSoundThemes: SOUND_THEMES
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
};

export const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within an AppConfigProvider');
  }
  return context;
};
