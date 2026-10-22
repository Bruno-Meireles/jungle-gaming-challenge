import { useTranslation } from 'react-i18next';

import { resolveLocale, type Locale } from '../lib/i18n/resolve-locale';

export function useLocale(): Locale {
  const { i18n } = useTranslation();
  return resolveLocale({ saved: i18n.language, languages: [] });
}
