import { LOCALES, type Locale } from './resolve-locale';

export const LANG_PARAM = 'lang';

/** Idioma valido do parametro `?lang=` (qualquer outro valor e ignorado). */
export function readLangParam(search: string): Locale | null {
  const value = new URLSearchParams(search).get(LANG_PARAM);
  return LOCALES.find((locale) => locale === value) ?? null;
}
