import { getRouteApi } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { CatalogResults } from '../../../widgets/catalog';
import { FeaturedNft } from '../../../widgets/featured-nft';
import { Hero } from '../../../widgets/hero';

const homeRoute = getRouteApi('/');
const CATALOG_ID = 'catalog';

export function HomePage() {
  const { t } = useTranslation('pageHome');
  useDocumentMeta({ title: t('title'), description: t('description') });
  const search = homeRoute.useSearch();
  return (
    <PageContainer className="pt-16 pb-24 tablet:pt-32 tablet:pb-32">
      <Hero exploreTargetId={CATALOG_ID} />
      <div className="mt-16 flex flex-col tablet:mt-48 desktop:mt-96 desktop:grid desktop:grid-cols-[310px_1fr] desktop:gap-48">
        <FeaturedNft />
        <div id={CATALOG_ID} tabIndex={-1} className="outline-none">
          <CatalogResults search={search} />
        </div>
      </div>
    </PageContainer>
  );
}
