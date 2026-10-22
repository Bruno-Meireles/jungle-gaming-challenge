import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../../shared/hooks';

export function HomePage() {
  const { t } = useTranslation('pageHome');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return null;
}
