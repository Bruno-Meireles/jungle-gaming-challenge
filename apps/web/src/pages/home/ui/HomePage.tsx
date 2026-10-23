import { useTranslation } from 'react-i18next';

import { useCatalogSearch } from '../../../entities/nft';
import { SearchField } from '../../../features/catalog-search';
import { useDocumentMeta } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { Catalog } from '../../../widgets/catalog';
import { FilterSheet, FilterSidebar } from '../../../widgets/filter-panel';
import { FeaturedNft } from '../../../widgets/featured-nft';
import { Hero } from '../../../widgets/hero';
import { Journal } from '../../../widgets/journal';
import { PromoBanners } from '../../../widgets/promo-banners';

const CATALOG_ID = 'catalog';

export function HomePage() {
  const { t } = useTranslation('pageHome');
  useDocumentMeta({ title: t('title'), description: t('description') });
  const { search, update } = useCatalogSearch();
  return (
    <PageContainer className="pt-16 pb-24 tablet:pt-32 tablet:pb-32">
      <div className="mb-16 flex items-center gap-8 desktop:hidden">
        <SearchField value={search.q} onSubmit={(q) => update({ q })} className="min-w-0 flex-1 tablet:hidden" />
        <FilterSheet className="ml-auto" />
      </div>
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
      <div className="mt-48 desktop:mt-96">
        <PromoBanners />
      </div>
      <div className="mt-48 desktop:mt-96">
        <Journal />
      </div>
    </PageContainer>
  );
}
