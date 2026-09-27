import { en, type UIKey } from './en';

export const languages = { en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

const dictionaries: Record<Lang, Partial<Record<UIKey, string>>> = { en };

export function getLangFromUrl(url: URL): Lang {
  const [, first] = url.pathname.split('/');
  return first && first in languages ? (first as Lang) : defaultLang;
}

export function useTranslations(lang: Lang = defaultLang) {
  return (key: UIKey): string => dictionaries[lang][key] ?? en[key];
}

/** Prefix a path with the language segment (no prefix for the default language). */
export function localizePath(path: string, lang: Lang = defaultLang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return lang === defaultLang ? clean : `/${lang}${clean}`;
}

export function formatDate(date: Date, lang: Lang = defaultLang): string {
  return date.toLocaleDateString(lang === 'en' ? 'en-GB' : lang, {
    year: 'numeric',
    month: 'short',
  });
}
