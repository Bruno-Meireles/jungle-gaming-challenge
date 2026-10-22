import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation('footer');
  return <footer aria-label={t('label')} className="p-4" />;
}
