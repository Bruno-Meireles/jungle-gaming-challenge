import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../../shared/hooks';

export function NotFoundPage() {
  const { t } = useTranslation('pageNotFound');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return (
    <section>
      <h1>{t('heading')}</h1>
      <p>{t('body')}</p>
      <Link to="/">{t('back')}</Link>
    </section>
  );
}
