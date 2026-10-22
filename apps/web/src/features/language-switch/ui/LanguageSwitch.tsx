import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { LOCALES, resolveLocale } from '../../../shared/lib/i18n/resolve-locale';

export function LanguageSwitch() {
  const { t, i18n } = useTranslation('language');
  const locale = resolveLocale({ saved: i18n.language, languages: [] });
  return (
    <Select value={locale} onValueChange={(next) => void i18n.changeLanguage(next)}>
      <SelectTrigger aria-label={t('label')} className="h-35 w-140">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LOCALES.map((option) => (
          <SelectItem key={option} value={option}>
            {t(`options.${option}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
