import { useCatalogSearch } from '../../../entities/nft';
import { CatalogSort } from '../../../features/catalog-sort';
import { CatalogViewTabs } from '../../../features/catalog-view-tabs';

/** Abas a esquerda e ordenacao a direita (so >= 1440; abaixo disso a ordenacao fica no Sheet de filtros). */
export function CatalogToolbar() {
  const { search, update } = useCatalogSearch();
  return (
    <div className="mb-24 flex items-start justify-between gap-16 tablet:mb-32">
      <CatalogViewTabs value={search.tab ?? 'all'} onChange={(tab) => update({ tab })} />
      <div className="hidden shrink-0 desktop:block">
        <CatalogSort value={search.sort ?? 'recent'} onChange={(sort) => update({ sort })} />
      </div>
    </div>
  );
}
