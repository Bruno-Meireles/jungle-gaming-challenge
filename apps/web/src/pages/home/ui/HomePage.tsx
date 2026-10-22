import { useTranslation } from 'react-i18next';
import { useDocumentMeta } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { Catalog } from '../../../widgets/catalog';
import { FilterSheet, FilterSidebar } from '../../../widgets/filter-panel';
import { FeaturedNft } from '../../../widgets/featured-nft';
import { Hero } from '../../../widgets/hero';

const CATALOG_ID = 'catalog';

export function HomePage() {
  const { t } = useTranslation('pageHome');
  useDocumentMeta({ title: t('title'), description: t('description') });
  return (
    <PageContainer className="pt-16 pb-24 tablet:pt-32 tablet:pb-32">
      <FilterSheet className="mb-16 flex justify-end desktop:hidden" />
      <Hero exploreTargetId={CATALOG_ID} />
      <div className="mt-16 flex flex-col tablet:mt-48 desktop:mt-96 desktop:grid desktop:grid-cols-[310px_1fr] desktop:gap-48">
        <div className="flex flex-col gap-24">
          <FilterSidebar />
          <FeaturedNft />
        </div>
        <div id={CATALOG_ID} tabIndex={-1} className="outline-none">
          <Catalog />
        </div>
      </div>
    </PageContainer>
  );
}
