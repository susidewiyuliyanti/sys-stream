import { CountryCurrencyConfig } from '../types';

export const DEFAULT_COUNTRY_CODE = 'US';

export const COUNTRIES_CONFIG: CountryCurrencyConfig[] = [
  {
    code: 'US',
    name: 'United States',
    nameEn: 'United States',
    flag: '🇺🇸',
    languageCode: 'en',
    languageName: 'English (US)',
    currencyCode: 'USD',
    currencySymbol: '$',
    rateFromIdr: 1 / 16000,
    decimals: 2,
    banknotePrefix: 'USD '
  },
  {
    code: 'ID',
    name: 'Indonesia',
    nameEn: 'Indonesia',
    flag: '🇮🇩',
    languageCode: 'id',
    languageName: 'Bahasa Indonesia',
    currencyCode: 'IDR',
    currencySymbol: 'Rp',
    rateFromIdr: 1,
    decimals: 0,
    banknotePrefix: 'IDR '
  },
  {
    code: 'MY',
    name: 'Malaysia',
    nameEn: 'Malaysia',
    flag: '🇲🇾',
    languageCode: 'ms',
    languageName: 'Bahasa Melayu',
    currencyCode: 'MYR',
    currencySymbol: 'RM',
    rateFromIdr: 1 / 3600,
    decimals: 2,
    banknotePrefix: 'MYR '
  },
  {
    code: 'SG',
    name: 'Singapore',
    nameEn: 'Singapore',
    flag: '🇸🇬',
    languageCode: 'en',
    languageName: 'English (SG)',
    currencyCode: 'SGD',
    currencySymbol: 'S$',
    rateFromIdr: 1 / 12300,
    decimals: 2,
    banknotePrefix: 'SGD '
  },
  {
    code: 'JP',
    name: '日本 (Japan)',
    nameEn: 'Japan',
    flag: '🇯🇵',
    languageCode: 'ja',
    languageName: '日本語',
    currencyCode: 'JPY',
    currencySymbol: '¥',
    rateFromIdr: 1 / 105,
    decimals: 0,
    banknotePrefix: 'JPY '
  },
  {
    code: 'KR',
    name: '대한민국 (South Korea)',
    nameEn: 'South Korea',
    flag: '🇰🇷',
    languageCode: 'ko',
    languageName: '한국어',
    currencyCode: 'KRW',
    currencySymbol: '₩',
    rateFromIdr: 1 / 12,
    decimals: 0,
    banknotePrefix: 'KRW '
  },
  {
    code: 'CN',
    name: '中国 (China)',
    nameEn: 'China',
    flag: '🇨🇳',
    languageCode: 'zh',
    languageName: '简体中文',
    currencyCode: 'CNY',
    currencySymbol: '¥',
    rateFromIdr: 1 / 2250,
    decimals: 2,
    banknotePrefix: 'CNY '
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    nameEn: 'United Kingdom',
    flag: '🇬🇧',
    languageCode: 'en',
    languageName: 'English (UK)',
    currencyCode: 'GBP',
    currencySymbol: '£',
    rateFromIdr: 1 / 21000,
    decimals: 2,
    banknotePrefix: 'GBP '
  },
  {
    code: 'EU',
    name: 'European Union (Euro)',
    nameEn: 'European Union',
    flag: '🇪🇺',
    languageCode: 'en',
    languageName: 'European (EUR)',
    currencyCode: 'EUR',
    currencySymbol: '€',
    rateFromIdr: 1 / 17500,
    decimals: 2,
    banknotePrefix: 'EUR '
  },
  {
    code: 'SA',
    name: 'المملكة العربية السعودية (Saudi Arabia)',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    languageCode: 'ar',
    languageName: 'العربية',
    currencyCode: 'SAR',
    currencySymbol: 'ر.س',
    rateFromIdr: 1 / 4300,
    decimals: 2,
    banknotePrefix: 'SAR '
  },
  {
    code: 'AE',
    name: 'الإمارات (United Arab Emirates)',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    languageCode: 'ar',
    languageName: 'العربية (الإمارات)',
    currencyCode: 'AED',
    currencySymbol: 'د.إ',
    rateFromIdr: 1 / 4350,
    decimals: 2,
    banknotePrefix: 'AED '
  },
  {
    code: 'PH',
    name: 'Pilipinas (Philippines)',
    nameEn: 'Philippines',
    flag: '🇵🇭',
    languageCode: 'tl',
    languageName: 'Tagalog / Filipino',
    currencyCode: 'PHP',
    currencySymbol: '₱',
    rateFromIdr: 1 / 285,
    decimals: 2,
    banknotePrefix: 'PHP '
  },
  {
    code: 'TH',
    name: 'ประเทศไทย (Thailand)',
    nameEn: 'Thailand',
    flag: '🇹🇭',
    languageCode: 'th',
    languageName: 'ภาษาไทย',
    currencyCode: 'THB',
    currencySymbol: '฿',
    rateFromIdr: 1 / 480,
    decimals: 2,
    banknotePrefix: 'THB '
  },
  {
    code: 'VN',
    name: 'Việt Nam (Vietnam)',
    nameEn: 'Vietnam',
    flag: '🇻🇳',
    languageCode: 'vi',
    languageName: 'Tiếng Việt',
    currencyCode: 'VND',
    currencySymbol: '₫',
    rateFromIdr: 1 / 0.65,
    decimals: 0,
    banknotePrefix: 'VND '
  },
  {
    code: 'IN',
    name: 'भारत (India)',
    nameEn: 'India',
    flag: '🇮🇳',
    languageCode: 'hi',
    languageName: 'हिन्दी / English',
    currencyCode: 'INR',
    currencySymbol: '₹',
    rateFromIdr: 1 / 190,
    decimals: 2,
    banknotePrefix: 'INR '
  },
  {
    code: 'AU',
    name: 'Australia',
    nameEn: 'Australia',
    flag: '🇦🇺',
    languageCode: 'en',
    languageName: 'English (AU)',
    currencyCode: 'AUD',
    currencySymbol: 'A$',
    rateFromIdr: 1 / 10600,
    decimals: 2,
    banknotePrefix: 'AUD '
  },
  {
    code: 'BR',
    name: 'Brasil (Brazil)',
    nameEn: 'Brazil',
    flag: '🇧🇷',
    languageCode: 'pt',
    languageName: 'Português (Brasil)',
    currencyCode: 'BRL',
    currencySymbol: 'R$',
    rateFromIdr: 1 / 3200,
    decimals: 2,
    banknotePrefix: 'BRL '
  },
  {
    code: 'RU',
    name: 'Россия (Russia)',
    nameEn: 'Russia',
    flag: '🇷🇺',
    languageCode: 'ru',
    languageName: 'Русский',
    currencyCode: 'RUB',
    currencySymbol: '₽',
    rateFromIdr: 1 / 175,
    decimals: 0,
    banknotePrefix: 'RUB '
  },
  {
    code: 'TR',
    name: 'Türkiye (Turkey)',
    nameEn: 'Turkey',
    flag: '🇹🇷',
    languageCode: 'tr',
    languageName: 'Türkçe',
    currencyCode: 'TRY',
    currencySymbol: '₺',
    rateFromIdr: 1 / 460,
    decimals: 2,
    banknotePrefix: 'TRY '
  },
  {
    code: 'CA',
    name: 'Canada',
    nameEn: 'Canada',
    flag: '🇨🇦',
    languageCode: 'en',
    languageName: 'English (CA)',
    currencyCode: 'CAD',
    currencySymbol: 'C$',
    rateFromIdr: 1 / 11800,
    decimals: 2,
    banknotePrefix: 'CAD '
  },
  {
    code: 'MX',
    name: 'México (Mexico)',
    nameEn: 'Mexico',
    flag: '🇲🇽',
    languageCode: 'es',
    languageName: 'Español (México)',
    currencyCode: 'MXN',
    currencySymbol: 'Mex$',
    rateFromIdr: 1 / 950,
    decimals: 2,
    banknotePrefix: 'MXN '
  }
];

import { TRANSLATIONS } from '../locales';

export { TRANSLATIONS };

/**
 * Format IDR base amount to target country's currency accurately
 */
export function formatCurrencyAmount(
  amountInIdr: number,
  country: CountryCurrencyConfig
): string {
  const safeAmount = typeof amountInIdr === 'number' && !isNaN(amountInIdr) ? amountInIdr : 0;
  if (!country || country.code === 'ID') {
    return `Rp ${Math.round(safeAmount).toLocaleString('id-ID')}`;
  }

  const converted = safeAmount * (country.rateFromIdr || 1);

  if (country.decimals === 0) {
    const rounded = Math.round(converted);
    if (country.code === 'JP') return `¥${rounded.toLocaleString('ja-JP')}`;
    if (country.code === 'KR') return `₩${rounded.toLocaleString('ko-KR')}`;
    if (country.code === 'VN') return `${rounded.toLocaleString('vi-VN')} ₫`;
    if (country.code === 'RU') return `${rounded.toLocaleString('ru-RU')} ₽`;
    return `${country.currencySymbol}${rounded.toLocaleString()}`;
  }

  const formatted = converted.toLocaleString(undefined, {
    minimumFractionDigits: country.decimals,
    maximumFractionDigits: country.decimals
  });

  if (country.code === 'SA') return `${formatted} ر.س`;
  if (country.code === 'AE') return `${formatted} د.إ`;
  if (country.code === 'MY') return `RM ${formatted}`;
  if (country.code === 'SG') return `S$ ${formatted}`;
  if (country.code === 'AU') return `A$ ${formatted}`;
  if (country.code === 'CA') return `C$ ${formatted}`;
  if (country.code === 'MX') return `Mex$ ${formatted}`;
  if (country.code === 'BR') return `R$ ${formatted}`;
  if (country.code === 'TR') return `₺${formatted}`;
  if (country.code === 'IN') return `₹${formatted}`;
  if (country.code === 'TH') return `฿${formatted}`;
  if (country.code === 'PH') return `₱${formatted}`;
  if (country.code === 'US') return `$${formatted}`;
  if (country.code === 'GB') return `£${formatted}`;
  if (country.code === 'EU') return `€${formatted}`;
  if (country.code === 'CN') return `¥${formatted}`;

  return `${country.currencySymbol}${formatted}`;
}

/**
 * Translate helper
 */
export function translate(key: string, languageCode: string, fallback?: string): string {
  const lang = (languageCode || 'en').toLowerCase().split('-')[0];
  const langDict = TRANSLATIONS[lang] || TRANSLATIONS['en'] || TRANSLATIONS['id'];
  if (langDict && langDict[key]) {
    return langDict[key];
  }
  if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
    return TRANSLATIONS['en'][key];
  }
  if (TRANSLATIONS['id'] && TRANSLATIONS['id'][key]) {
    return TRANSLATIONS['id'][key];
  }
  return fallback || key;
}

/**
 * Helper to get country by code
 */
export function getCountryByCode(code: string): CountryCurrencyConfig {
  const found = COUNTRIES_CONFIG.find(
    (c) => c.code.toUpperCase() === (code || '').toUpperCase()
  );
  return found || COUNTRIES_CONFIG[0];
}


/**
 * Global UI translation safety net.
 * Existing components should still prefer t(), but this catches exact
 * catalog strings rendered directly by legacy components.
 */
const globalTextSources = new WeakMap<Text, string>();
const globalAttributeSources = new WeakMap<Element, Record<string, string>>();

const GLOBAL_TRANSLATABLE_ATTRIBUTES = [
  'placeholder',
  'title',
  'aria-label',
  'aria-placeholder'
] as const;

function buildGlobalTranslationMap(languageCode: string): Map<string, string> {
  const targetLanguage = (languageCode || 'en').toLowerCase().split('-')[0];
  const target = TRANSLATIONS[targetLanguage] || TRANSLATIONS.en || TRANSLATIONS.id;
  const map = new Map<string, string>();

  Object.keys(TRANSLATIONS).forEach((sourceLanguage) => {
    const source = TRANSLATIONS[sourceLanguage];
    Object.keys(source).forEach((key) => {
      const sourceText = source[key];
      const targetText = target?.[key];
      if (!sourceText || !targetText || sourceText === targetText) return;
      if (!map.has(sourceText)) map.set(sourceText, targetText);
    });
  });

  return map;
}

function translateTextNode(node: Text, translations: Map<string, string>): void {
  const parent = node.parentElement;
  if (!parent) return;

  const tag = parent.tagName;
  if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT' || tag === 'TEXTAREA' || tag === 'INPUT') {
    return;
  }

  const original = globalTextSources.get(node) ?? node.nodeValue ?? '';
  if (!original.trim()) return;
  if (!globalTextSources.has(node)) globalTextSources.set(node, original);

  const translated = translations.get(original.trim());
  if (!translated) return;

  const leading = original.match(/^\\s*/)?.[0] || '';
  const trailing = original.match(/\\s*$/)?.[0] || '';
  const nextValue = leading + translated + trailing;
  if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
}

function translateElementAttributes(element: Element, translations: Map<string, string>): void {
  if (element.tagName === 'SCRIPT' || element.tagName === 'STYLE' || element.tagName === 'NOSCRIPT') return;

  let originals = globalAttributeSources.get(element);
  if (!originals) {
    originals = {};
    globalAttributeSources.set(element, originals);
  }

  GLOBAL_TRANSLATABLE_ATTRIBUTES.forEach((attribute) => {
    if (!element.hasAttribute(attribute)) return;
    const current = element.getAttribute(attribute) || '';
    const original = originals[attribute] ?? current;
    if (originals[attribute] === undefined) originals[attribute] = original;

    const translated = translations.get(original);
    if (translated && current !== translated) element.setAttribute(attribute, translated);
  });
}

export function installGlobalTranslationObserver(languageCode: string): () => void {
  if (typeof document === 'undefined' || typeof MutationObserver === 'undefined') {
    return () => undefined;
  }

  const translations = buildGlobalTranslationMap(languageCode);
  let stopped = false;

  const apply = (root: Node) => {
    if (stopped) return;

    if (root.nodeType === Node.TEXT_NODE) {
      translateTextNode(root as Text, translations);
      return;
    }

    const element = root as Element;
    if (element.nodeType === Node.ELEMENT_NODE) {
      translateElementAttributes(element, translations);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null = walker.nextNode();
    while (node) {
      translateTextNode(node as Text, translations);
      node = walker.nextNode();
    }

    if (element.querySelectorAll) {
      element.querySelectorAll('*').forEach((child) => {
        translateElementAttributes(child, translations);
      });
    }
  };

  if (document.body) apply(document.body);

  const observer = new MutationObserver((mutations) => {
    if (stopped) return;

    mutations.forEach((mutation) => {
      if (mutation.type === 'characterData') {
        translateTextNode(mutation.target as Text, translations);
      }

      mutation.addedNodes.forEach((node) => apply(node));

      if (mutation.type === 'attributes' && mutation.target.nodeType === Node.ELEMENT_NODE) {
        translateElementAttributes(mutation.target as Element, translations);
      }
    });
  });

  if (document.body) {
    observer.observe(document.body, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...GLOBAL_TRANSLATABLE_ATTRIBUTES]
    });
  }

  return () => {
    stopped = true;
    observer.disconnect();
  };
}
