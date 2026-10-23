import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jg/design-system';
import { useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { withLangParam } from '../../../shared/lib/i18n/lang-param';
import { LOCALES, resolveLocale, type Locale } from '../../../shared/lib/i18n/resolve-locale';

function isLocale(value: string): value is Locale {
  return LOCALES.some((locale) => locale === value);
}

/** Troca o idioma (salva a preferencia, atualiza html lang) e grava `?lang=` na URL atual sem perder rota nem outros parametros. */
export function LanguageSwitch() {
  const { t, i18n } = useTranslation('language');
  const router = useRouter();
  const locale = resolveLocale({ saved: i18n.language, languages: [] });

  const change = (next: string) => {
    if (!isLocale(next)) return;
    void i18n.changeLanguage(next);
    const { pathname, search, hash } = window.location;
    router.history.replace(pathname + withLangParam(search, next) + hash);
  };

  return (
    <Select value={locale} onValueChange={change}>
      <SelectTrigger aria-label={t('label')} className="h-35 w-140">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((option) => (
          <SelectItem key={option} value={option} lang={option}>
            {t(`options.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
