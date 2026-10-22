export type Locale = 'pt-BR' | 'en';

export const LOCALES: readonly Locale[] = ['pt-BR', 'en'];

export const DEFAULT_LOCALE: Locale = 'pt-BR';

// Esqueleto da fase RED: o parametro so e usado na fase GREEN.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function resolveLocale(_input: { saved: string | null; languages: readonly string[] }): Locale {
  return DEFAULT_LOCALE;
}
