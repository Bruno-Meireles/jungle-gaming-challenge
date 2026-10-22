import { httpClient, getJson } from '../../../shared/api/http-client';
import { catalogPageDtoSchema, type CatalogPageDto } from '../../../shared/api/contracts/nfts';
import type { CatalogPage } from '../model/domain/catalog-page';
import type { CatalogQuery } from '../model/domain/catalog-query';
import { toNftSummary } from './to-nft-summary';

export const CATALOG_PAGE_SIZE = 9;

function toCatalogPage(dto: CatalogPageDto): CatalogPage {
  return {
    items: dto.items.map(toNftSummary),
    page: dto.page,
    pageSize: dto.pageSize,
    totalItems: dto.totalItems,
    totalPages: dto.totalPages,
    facets: dto.facets,
  };
}

function toRequestParams(query: CatalogQuery): Record<string, unknown> {
  return {
    search: query.search,
    view: query.view,
    sort: query.sort,
    collections: [...query.collections].sort(),
    networks: [...query.networks].sort(),
    minPriceEth: query.minPriceEth,
    maxPriceEth: query.maxPriceEth,
    page: query.page,
    pageSize: CATALOG_PAGE_SIZE,
  };
}

export async function fetchCatalogPage(
  query: CatalogQuery,
  signal: AbortSignal,
): Promise<CatalogPage> {
  const dto = await getJson(httpClient, {
    path: '/nfts',
    schema: catalogPageDtoSchema,
    params: toRequestParams(query),
    signal,
  });
  return toCatalogPage(dto);
}
