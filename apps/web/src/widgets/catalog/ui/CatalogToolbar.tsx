import { useCatalogSearch } from '../../../entities/nft';
import { CatalogSort } from '../../../features/catalog-sort';
import { CatalogViewTabsList } from '../../../features/catalog-view-tabs';

/**
 * Abas a esquerda e ordenacao a direita (so >= 1440; abaixo disso a ordenacao fica no Sheet de filtros).
 * Deve estar dentro de `CatalogViewTabs`. Em telas estreitas a lista de abas rola na horizontal dentro da toolbar.
 */
export function CatalogToolbar() {
  const { search, update } = useCatalogSearch();
  return (
    <div className="mb-16 flex items-start justify-between gap-16 tablet:mb-32">
      <div className="-m-4 min-w-0 overflow-x-auto p-4">
        <CatalogViewTabsList />
      </div>
      <div className="hidden shrink-0 desktop:block">
        <CatalogSort value={search.sort ?? 'recent'} onChange={(sort) => update({ sort })} />
      </div>
    </div>
  );
}
