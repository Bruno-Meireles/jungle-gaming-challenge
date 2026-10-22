import { useTranslation } from 'react-i18next';

export function Header() {
  const { t } = useTranslation(['header', 'shared']);
  return (
    <header aria-label={t('header:label')} className="p-4">
      <span>{t('shared:brand')}</span>
    </header>
  );
}
