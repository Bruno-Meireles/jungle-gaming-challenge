import { useState } from 'react';

import { useCatalogSearch, type CatalogPage } from '../../../entities/nft';
import { CatalogFilters, type FilterValue, type PriceSelection } from '../../../features/catalog-filters';

// Montado com `key` da faixa na URL: o rascunho do slider reinicia quando a URL muda (voltar, limpar).
export function SidebarBody({ facets }: { facets: CatalogPage['facets'] | undefined }) {
  const { search, update } = useCatalogSearch();
  const [price, setPrice] = useState<PriceSelection>({ min: search.min, max: search.max });
  const value: FilterValue = {
    collections: search.collections ?? [],
    networks: search.networks ?? [],
    ...price,
  };
  return (
    <CatalogFilters
      facets={facets}
      value={value}
      onChange={(patch) => {
        if ('min' in patch || 'max' in patch) setPrice({ min: patch.min, max: patch.max });
        else update(patch);
      }}
      onApplyPrice={() => update({ min: price.min, max: price.max })}
    />
  );
}
