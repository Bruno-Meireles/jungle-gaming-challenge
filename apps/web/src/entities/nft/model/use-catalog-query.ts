import { keepPreviousData, useQuery } from '@tanstack/react-query';

import { fetchCatalogPage } from '../api/fetch-catalog-page';
import { toApiParams, type CatalogSearch } from './domain/catalog-query';
import { nftKeys } from './nft-keys';

const ANONYMOUS_VIEWER = 'anonymous';

// staleTime e retry (so transitorio, 1x, 300 ms) vem da politica do QueryClient (ADR-20).
export function useCatalogQuery(search: CatalogSearch) {
  return useQuery({
    queryKey: nftKeys.list(ANONYMOUS_VIEWER, search),
    queryFn: ({ signal }) => fetchCatalogPage(toApiParams(search), signal),
    placeholderData: keepPreviousData,
  });
}
