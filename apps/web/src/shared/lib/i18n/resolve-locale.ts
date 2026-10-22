export type Locale = 'pt-BR' | 'en';

export const LOCALES: readonly Locale[] = ['pt-BR', 'en'];

export const DEFAULT_LOCALE: Locale = 'pt-BR';

function isLocale(value: string | null): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

function matchLanguage(language: string): Locale | null {
  const prefix = language.toLowerCase().split('-')[0];
  if (prefix === 'en') return 'en';
  if (prefix === 'pt') return 'pt-BR';
  return null;
}

export function resolveLocale({ saved, languages }: { saved: string | null; languages: readonly string[] }): Locale {
  if (isLocale(saved)) return saved;
  for (const language of languages) {
    const match = matchLanguage(language);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}
