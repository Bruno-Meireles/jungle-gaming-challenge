import type { CatalogPageDto } from '../../../../shared/api/contracts/nfts';
import type { NftSummary } from './nft';

export type CatalogPage = {
  items: NftSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  facets: CatalogPageDto['facets'];
};
