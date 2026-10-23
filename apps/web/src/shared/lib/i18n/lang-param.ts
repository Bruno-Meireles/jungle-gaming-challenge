import { LOCALES, type Locale } from './resolve-locale';

export const LANG_PARAM = 'lang';

/** Idioma valido do parametro `?lang=` (qualquer outro valor e ignorado). */
export function readLangParam(search: string): Locale | null {
  const value = new URLSearchParams(search).get(LANG_PARAM);
  return LOCALES.find((locale) => locale === value) ?? null;
}

/** Devolve `search` com `lang` definido, preservando os demais parametros (inclusive chaves repetidas). */
export function withLangParam(search: string, locale: Locale): string {
  const params = new URLSearchParams(search);
  params.set(LANG_PARAM, locale);
  return '?' + params.toString();
}
