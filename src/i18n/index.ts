import { getLocales } from 'expo-localization';
import { useSyncExternalStore } from 'react';
import { I18nManager } from 'react-native';
import { readPref, writePref } from './prefs';
import en, { type Strings } from './locales/en';

export type Lang =
  | 'en' | 'fr' | 'de' | 'it' | 'es' | 'pt' | 'nl' | 'da' | 'sv' | 'nb' | 'fi' | 'pl' | 'cs' | 'sk' | 'hu'
  | 'ro' | 'hr' | 'el' | 'ru' | 'uk' | 'ca' | 'ko' | 'id' | 'ms' | 'vi' | 'hi' | 'ja' | 'zh-Hant' | 'ar';

/* eslint-disable @typescript-eslint/no-require-imports */
const LOADERS: Record<Lang, () => Strings> = {
  en: () => en,
  fr: () => require('./locales/fr').default,
  de: () => require('./locales/de').default,
  it: () => require('./locales/it').default,
  es: () => require('./locales/es').default,
  pt: () => require('./locales/pt').default,
  nl: () => require('./locales/nl').default,
  da: () => require('./locales/da').default,
  sv: () => require('./locales/sv').default,
  nb: () => require('./locales/nb').default,
  fi: () => require('./locales/fi').default,
  pl: () => require('./locales/pl').default,
  cs: () => require('./locales/cs').default,
  sk: () => require('./locales/sk').default,
  hu: () => require('./locales/hu').default,
  ro: () => require('./locales/ro').default,
  hr: () => require('./locales/hr').default,
  el: () => require('./locales/el').default,
  ru: () => require('./locales/ru').default,
  uk: () => require('./locales/uk').default,
  ca: () => require('./locales/ca').default,
  ko: () => require('./locales/ko').default,
  id: () => require('./locales/id').default,
  ms: () => require('./locales/ms').default,
  vi: () => require('./locales/vi').default,
  hi: () => require('./locales/hi').default,
  ja: () => require('./locales/ja').default,
  'zh-Hant': () => require('./locales/zh-Hant').default,
  ar: () => require('./locales/ar').default,
};
/* eslint-enable @typescript-eslint/no-require-imports */

export const LANGS = Object.keys(LOADERS) as Lang[];

/** Picks the first of the user's preferred iPhone languages that we support. */
export function detectLang(): Lang {
  for (const l of getLocales()) {
    const code = (l.languageCode ?? '').toLowerCase();
    if (code === 'zh') {
      const traditional = l.languageScriptCode === 'Hant' || ['TW', 'HK', 'MO'].includes(l.regionCode ?? '');
      if (traditional) return 'zh-Hant';
      continue;
    }
    if (code === 'no' || code === 'nn' || code === 'nb') return 'nb';
    if ((LANGS as string[]).includes(code)) return code as Lang;
  }
  return 'en';
}

/** Native names for the in-app language picker. */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English', fr: 'Français', de: 'Deutsch', it: 'Italiano', es: 'Español', pt: 'Português', nl: 'Nederlands',
  da: 'Dansk', sv: 'Svenska', nb: 'Norsk', fi: 'Suomi', pl: 'Polski', cs: 'Čeština', sk: 'Slovenčina', hu: 'Magyar',
  ro: 'Română', hr: 'Hrvatski', el: 'Ελληνικά', ru: 'Русский', uk: 'Українська', ca: 'Català', ko: '한국어',
  id: 'Bahasa Indonesia', ms: 'Bahasa Melayu', vi: 'Tiếng Việt', hi: 'हिन्दी', ja: '日本語', 'zh-Hant': '繁體中文', ar: 'العربية',
};

const LANG_KEY = 'app.lang';
const CURRENCY_KEY = 'app.currency';

function savedLang(): Lang | null {
  const v = readPref(LANG_KEY);
  return v && (LANGS as string[]).includes(v) ? (v as Lang) : null;
}

/** null = follow the iPhone language. */
export let langOverride: Lang | null = savedLang();
export let lang: Lang = langOverride ?? detectLang();
export let strings: Strings = LOADERS[lang]();

/** Locale tag for Intl formatting. */
const regionCode = getLocales()[0]?.regionCode;
// Dates and currency names follow the app language; the region keeps local conventions (e.g. de-AT).
const localeFor = (l: Lang) => (l === 'zh-Hant' ? 'zh-Hant' : regionCode ? `${l}-${regionCode}` : l);
export let intlLocale = localeFor(lang);

/** null = currency of the iPhone region. */
export let currencyOverride: string | null = readPref(CURRENCY_KEY);
export const regionCurrency = getLocales()[0]?.currencyCode ?? 'USD';

// Screens re-render through useI18nVersion() when language or currency changes.
type Listener = () => void;
const listeners = new Set<Listener>();
let version = 0;
export const subscribeI18n = (fn: Listener) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const getI18nVersion = () => version;
const emit = () => {
  version++;
  listeners.forEach((fn) => fn());
};

/** Switch the app language (null = automatic). Returns true when the text direction changed (needs a restart). */
export function setAppLang(next: Lang | null): boolean {
  writePref(LANG_KEY, next);
  langOverride = next;
  lang = next ?? detectLang();
  strings = LOADERS[lang]();
  intlLocale = localeFor(lang);
  const rtl = lang === 'ar';
  const directionChanged = rtl !== I18nManager.isRTL;
  if (directionChanged) {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  }
  emit();
  return directionChanged;
}

/** Switch the currency used in the gift list (null = automatic). */
export function setAppCurrency(code: string | null) {
  writePref(CURRENCY_KEY, code);
  currencyOverride = code;
  emit();
}

/** "Door {n}" + { n: 3 } → "Door 3" */
export function fmt(template: string, params: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(params[k] ?? `{${k}}`));
}


/** Countries where Christmas is usually celebrated on January 7. */
export const defaultOrthodox = lang === 'ru';

export function formatDayMonth(date: Date): string {
  try {
    return new Intl.DateTimeFormat(intlLocale, { day: 'numeric', month: 'long' }).format(date);
  } catch {
    return date.toDateString();
  }
}

export function formatNumber(n: number): string {
  try {
    return new Intl.NumberFormat(intlLocale).format(n);
  } catch {
    return String(n);
  }
}

/** `compact` shortens long amounts ("3,8 Tr ₫", "Rp 830 rb") for tight stat tiles in high-denomination currencies. */
export function formatMoney(n: number, compact = false): string {
  const currency = currencyOverride ?? regionCurrency;
  try {
    const full = new Intl.NumberFormat(intlLocale, { style: 'currency', currency, maximumFractionDigits: n % 1 === 0 ? 0 : 2 }).format(n);
    if (!compact || full.length <= 9) return full;
    return new Intl.NumberFormat(intlLocale, { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(n);
  } catch {
    return `${n}`;
  }
}

export type { Strings };

/** Re-render when the app language or currency changes. */
export function useI18nVersion(): number {
  return useSyncExternalStore(subscribeI18n, getI18nVersion, getI18nVersion);
}

/** The current language, as a value React can subscribe to. */
export function useLang(): Lang {
  return useSyncExternalStore(subscribeI18n, () => lang, () => lang);
}
