import React, { useState } from 'react';
import { useAppConfig } from '../context/AppConfigContext';
import { CountryCurrencyConfig } from '../types';
import { Search, Globe, Check, X, Languages, Coins } from 'lucide-react';

interface CountryLanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'id', name: 'Bahasa Indonesia', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Indonesia' },
  { code: 'en', name: 'English', nativeName: 'English (US / Global)', flag: '🇺🇸', region: 'United States & Global' },
  { code: 'ms', name: 'Bahasa Melayu', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Malaysia & Brunei' },
  { code: 'zh', name: 'Chinese Simplified', nativeName: '简体中文', flag: '🇨🇳', region: 'China / Singapore' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Japan' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'South Korea' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭', region: 'Thailand' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Vietnam' },
  { code: 'tl', name: 'Tagalog / Filipino', nativeName: 'Wikang Tagalog', flag: '🇵🇭', region: 'Philippines' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Spain & Latin America' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português (Brasil)', flag: '🇧🇷', region: 'Brazil & Portugal' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Russia & CIS' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Turkey' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'India' },
];

export const CountryLanguageSelectorModal: React.FC<CountryLanguageSelectorModalProps> = ({
  isOpen,
  onClose
}) => {
  const { country, setCountryCode, languageCode, setLanguageCode, allCountries, t } = useAppConfig();
  const [activeTab, setActiveTab] = useState<'language' | 'country'>('language');
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const currentLangCode = (languageCode || country.languageCode || 'en').toLowerCase().split('-')[0];

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.nativeName.toLowerCase().includes(search.toLowerCase()) ||
      l.region.toLowerCase().includes(search.toLowerCase()) ||
      l.code.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCountries = allCountries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      c.currencyCode.toLowerCase().includes(search.toLowerCase()) ||
      c.languageName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectLanguage = (langCode: string) => {
    // If there's a primary country matching this language, align country too
    const matchingCountry = allCountries.find((c) => c.languageCode === langCode);
    if (matchingCountry) {
      setCountryCode(matchingCountry.code);
    }
    // Set languageCode explicitly so it takes precedence
    setLanguageCode(langCode);
    onClose();
  };

  const handleSelectCountry = (code: string) => {
    setCountryCode(code);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#0e1422] border border-cyan-500/30 p-5 sm:p-6 shadow-2xl shadow-cyan-500/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shadow">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {activeTab === 'language' ? t('language_selector_title') : t('select_country')}
              </h3>
              <p className="text-xs text-white/60">
                {activeTab === 'language'
                  ? t('language_selector_desc')
                  : t('select_country_desc')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher: Language vs Country */}
        <div className="flex gap-2 my-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('language');
              setSearch('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'language'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Languages className="w-4 h-4" />
            <span>{t('select_lang_btn')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('country');
              setSearch('');
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'country'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/25'
                : 'bg-white/5 hover:bg-white/10 text-white/70'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>{t('currency_lang_label')}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-white/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'language'
                ? 'Cari bahasa (Indonesia, English, Melayu, 日本語, 简体中文, dll)...'
                : t('search_country_placeholder')
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-cyan-400 transition-all"
          />
        </div>

        {/* List Content */}
        <div className="overflow-y-auto pr-1 py-1 space-y-2 flex-1 custom-scrollbar">
          {activeTab === 'language' ? (
            /* Language List */
            <>
              {filteredLanguages.map((item) => {
                const isSelected = currentLangCode === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-400 shadow-md shadow-cyan-500/15'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">{item.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {item.nativeName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                            {item.code}
                          </span>
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {item.name} • {item.region}
                        </div>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-cyan-400 text-black flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}

              {filteredLanguages.length === 0 && (
                <div className="p-8 text-center text-xs text-white/40">
                  Tidak ada bahasa yang cocok dengan pencarian "{search}".
                </div>
              )}
            </>
          ) : (
            /* Countries Grid */
            <>
              {filteredCountries.map((item: CountryCurrencyConfig) => {
                const isSelected = country.code === item.code;
                return (
                  <button
                    key={item.code}
                    onClick={() => handleSelectCountry(item.code)}
                    className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 shadow-md shadow-amber-500/15'
                        : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-2xl shrink-0 select-none">{item.flag}</span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white truncate">
                            {item.name}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-white/10 text-[10px] font-mono font-bold text-amber-300">
                            {item.currencyCode} ({item.currencySymbol})
                          </span>
                        </div>
                        <div className="text-[11px] text-white/50 truncate">
                          {item.languageName} • {item.nameEn}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right font-mono text-[11px] text-amber-300 font-bold">
                        {item.currencySymbol}
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-black flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}

              {filteredCountries.length === 0 && (
                <div className="p-8 text-center text-xs text-white/40">
                  {t('no_country_matched')} "{search}".
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
          <span>
            {activeTab === 'language'
              ? `${SUPPORTED_LANGUAGES.length} Bahasa Tersedia`
              : `${allCountries.length} ${t('countries_available')}`}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer"
          >
            {t('done')}
          </button>
        </div>
      </div>
    </div>
  );
};
