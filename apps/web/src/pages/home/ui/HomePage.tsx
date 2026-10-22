import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../../shared/hooks';
import { CatalogResults } from '../../../widgets/catalog';

const homeRoute = getRouteApi('/');

export function HomePage() {
  const { t } = useTranslation('pageHome');
  useDocumentMeta({ title: t('title'), description: t('description') });
  const search = homeRoute.useSearch();
  return (
    <div className="mx-auto w-full max-w-[1200px] px-16 py-24 tablet:px-24 desktop:px-0">
      <CatalogResults search={search} />
    </div>
  );
}
