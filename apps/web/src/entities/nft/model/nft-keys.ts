import type { CatalogSearch } from './domain/catalog-query';
import { normalizeCatalogSearch } from './domain/catalog-query';

export const nftKeys = {
  list: (viewer: string, query: CatalogSearch) =>
    ['nfts', 'list', { viewer }, normalizeCatalogSearch(query)] as const,
  detail: (nftId: string) => ['nfts', 'detail', { nftId }] as const,
  highlights: (viewer: string) => ['nfts', 'highlights', { viewer }] as const,
};
