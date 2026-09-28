export type SupportedLocale =
  | "id-ID"
  | "en-US"
  | "en-GB"
  | "en-SG"
  | "ms-MY"
  | "ar-SA"
  | "ar-AE"
  | "ja-JP"
  | "zh-CN"
  | "ko-KR"
  | "de-DE"
  | "fr-FR"
  | "es-ES"
  | "it-IT"
  | "pt-BR"
  | "en-IN"
  | "hi-IN";

export interface LocaleConfig {
  locale: SupportedLocale;
  language: string;
  country: string;
  currency: string;
  direction: "ltr" | "rtl";
}

export const LOCALES: Record<SupportedLocale, LocaleConfig> = {
  "id-ID": { locale: "id-ID", language: "Bahasa Indonesia", country: "Indonesia", currency: "IDR", direction: "ltr" },
  "en-US": { locale: "en-US", language: "English", country: "United States", currency: "USD", direction: "ltr" },
  "en-GB": { locale: "en-GB", language: "English", country: "United Kingdom", currency: "GBP", direction: "ltr" },
  "en-SG": { locale: "en-SG", language: "English", country: "Singapore", currency: "SGD", direction: "ltr" },
  "ms-MY": { locale: "ms-MY", language: "Bahasa Melayu", country: "Malaysia", currency: "MYR", direction: "ltr" },
  "ar-SA": { locale: "ar-SA", language: "العربية", country: "Saudi Arabia", currency: "SAR", direction: "rtl" },
  "ar-AE": { locale: "ar-AE", language: "العربية", country: "United Arab Emirates", currency: "AED", direction: "rtl" },
  "ja-JP": { locale: "ja-JP", language: "日本語", country: "Japan", currency: "JPY", direction: "ltr" },
  "zh-CN": { locale: "zh-CN", language: "简体中文", country: "China", currency: "CNY", direction: "ltr" },
  "ko-KR": { locale: "ko-KR", language: "한국어", country: "South Korea", currency: "KRW", direction: "ltr" },
  "de-DE": { locale: "de-DE", language: "Deutsch", country: "Germany", currency: "EUR", direction: "ltr" },
  "fr-FR": { locale: "fr-FR", language: "Français", country: "France", currency: "EUR", direction: "ltr" },
  "es-ES": { locale: "es-ES", language: "Español", country: "Spain", currency: "EUR", direction: "ltr" },
  "it-IT": { locale: "it-IT", language: "Italiano", country: "Italy", currency: "EUR", direction: "ltr" },
  "pt-BR": { locale: "pt-BR", language: "Português", country: "Brazil", currency: "BRL", direction: "ltr" },
  "en-IN": { locale: "en-IN", language: "English", country: "India", currency: "INR", direction: "ltr" },
  "hi-IN": { locale: "hi-IN", language: "हिन्दी", country: "India", currency: "INR", direction: "ltr" },
};

const STORAGE_KEY = "sys_stream_locale";

export function getLocale(): SupportedLocale {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved && saved in LOCALES) {
    return saved as SupportedLocale;
  }

  const browserLocale = navigator.language as SupportedLocale;

  if (browserLocale in LOCALES) {
    return browserLocale;
  }

  const language = navigator.language.split("-")[0];

  const match = Object.keys(LOCALES).find(
    key => key.split("-")[0] === language
  );

  return (match as SupportedLocale) || "id-ID";
}

export function setLocale(locale: SupportedLocale): void {
  if (!(locale in LOCALES)) return;

  localStorage.setItem(STORAGE_KEY, locale);

  const config = LOCALES[locale];

  document.documentElement.lang = locale;
  document.documentElement.dir = config.direction;
}

export function getLocaleConfig(): LocaleConfig {
  return LOCALES[getLocale()];
}

export function formatNumber(
  value: number | string,
  options?: Intl.NumberFormatOptions
): string {
  const config = getLocaleConfig();

  return new Intl.NumberFormat(config.locale, options).format(
    Number(value) || 0
  );
}

export function formatCurrency(
  value: number | string,
  currency?: string
): string {
  const config = getLocaleConfig();

  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency: currency || config.currency,
    currencyDisplay: "symbol",
  }).format(Number(value) || 0);
}

export function formatDate(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const config = getLocaleConfig();

  return new Intl.DateTimeFormat(config.locale, options).format(
    new Date(value)
  );
}

export function getCurrency(): string {
  return getLocaleConfig().currency;
}

export function getDirection(): "ltr" | "rtl" {
  return getLocaleConfig().direction;
}

export function getLanguage(): string {
  return getLocaleConfig().language;
}

export function initializeLocale(): void { setLocale(getLocale()); }

