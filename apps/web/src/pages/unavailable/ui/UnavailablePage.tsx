import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../../shared/hooks';
import { isFeature } from '../model/features';

export function UnavailablePage({ feature }: { feature?: string | undefined }) {
  const { t } = useTranslation('pageUnavailable');
  useDocumentMeta({ title: t('title'), description: t('description') });
  const body = isFeature(feature)
    ? t('bodyFeature', { name: t(`features.${feature}`) })
    : t('bodyGeneric');
  return (
    <section>
      <h1>{t('heading')}</h1>
      <p>{body}</p>
      <Link to="/">{t('back')}</Link>
    </section>
  );
}
