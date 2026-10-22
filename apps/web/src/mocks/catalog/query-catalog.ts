import type { CollectionId, NetworkId, SortId, ViewId } from '../../shared/api/contracts/ids';
import { COLLECTION_IDS, NETWORK_IDS } from '../../shared/api/contracts/ids';
import type { CatalogPageDto, NftSummaryDto } from '../../shared/api/contracts/nfts';
import { parseEth, toWei } from '../../shared/lib/eth/eth';

export type CatalogQuery = {
  search?: string;
  view: ViewId;
  sort: SortId;
  collections: readonly CollectionId[];
  networks: readonly NetworkId[];
  minPriceEth?: string;
  maxPriceEth?: string;
  page: number;
};

const PAGE_SIZE = 9;
const NEW_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;
const TRENDING_MIN_POPULARITY = 80;

type Predicate = (item: NftSummaryDto) => boolean;

const wei = (value: string): bigint => toWei(parseEth(value));

function matchesSearch(search: string | undefined): Predicate {
  const term = search?.trim().toLowerCase() ?? '';
  if (term === '') return () => true;
  return (item) => item.title.toLowerCase().includes(term) || item.collectionId.toLowerCase().includes(term);
}

function matchesView(view: ViewId, now: string): Predicate {
  const nowMs = Date.parse(now);
  if (view === 'new') {
    return (item) => {
      const listed = Date.parse(item.listedAt);
      return listed <= nowMs && listed >= nowMs - NEW_WINDOW_MS;
    };
  }
  if (view === 'trending') return (item) => item.popularity >= TRENDING_MIN_POPULARITY;
  return () => true;
}

function matchesPrice(min: string | undefined, max: string | undefined): Predicate {
  const minWei = min === undefined ? undefined : wei(min);
  const maxWei = max === undefined ? undefined : wei(max);
  return (item) => {
    const price = wei(item.priceEth);
    return (minWei === undefined || price >= minWei) && (maxWei === undefined || price <= maxWei);
  };
}

function matchesAny<T>(selected: readonly T[], pick: (item: NftSummaryDto) => T): Predicate {
  if (selected.length === 0) return () => true;
  return (item) => selected.includes(pick(item));
}

function compareBy(sort: SortId): (a: NftSummaryDto, b: NftSummaryDto) => number {
  const byId = (a: NftSummaryDto, b: NftSummaryDto) => a.id.localeCompare(b.id);
  const primary = (a: NftSummaryDto, b: NftSummaryDto): number => {
    const priceDiff = wei(a.priceEth) - wei(b.priceEth);
    const sign = priceDiff === 0n ? 0 : priceDiff < 0n ? -1 : 1;
    if (sort === 'price-asc') return sign;
    if (sort === 'price-desc') return -sign;
    if (sort === 'popular') return b.popularity - a.popularity;
    return Date.parse(b.listedAt) - Date.parse(a.listedAt);
  };
  return (a, b) => primary(a, b) || byId(a, b);
}

function priceRange(catalog: readonly NftSummaryDto[]): { minEth: string; maxEth: string } {
  const first = catalog[0];
  if (first === undefined) return { minEth: '0', maxEth: '0' };
  let min = first;
  let max = first;
  for (const item of catalog) {
    if (wei(item.priceEth) < wei(min.priceEth)) min = item;
    if (wei(item.priceEth) > wei(max.priceEth)) max = item;
  }
  return { minEth: min.priceEth, maxEth: max.priceEth };
}

function countBy<T extends string>(ids: readonly T[], items: readonly NftSummaryDto[], pick: (i: NftSummaryDto) => T) {
  return ids.map((id) => ({ id, count: items.filter((item) => pick(item) === id).length }));
}

export function queryCatalog(catalog: readonly NftSummaryDto[], query: CatalogQuery, now: string): CatalogPageDto {
  const base = [matchesSearch(query.search), matchesView(query.view, now), matchesPrice(query.minPriceEth, query.maxPriceEth)];
  const byCollection = matchesAny(query.collections, (item) => item.collectionId);
  const byNetwork = matchesAny(query.networks, (item) => item.networkId);
  const apply = (predicates: readonly Predicate[]) => catalog.filter((item) => predicates.every((p) => p(item)));

  const matched = apply([...base, byCollection, byNetwork]).sort(compareBy(query.sort));
  const totalPages = Math.ceil(matched.length / PAGE_SIZE);
  const page = Math.min(Math.max(query.page, 1), Math.max(totalPages, 1));
  const start = (page - 1) * PAGE_SIZE;

  return {
    items: matched.slice(start, start + PAGE_SIZE),
    page,
    pageSize: PAGE_SIZE,
    totalItems: matched.length,
    totalPages,
    facets: {
      collections: countBy(COLLECTION_IDS, apply([...base, byNetwork]), (item) => item.collectionId),
      networks: countBy(NETWORK_IDS, apply([...base, byCollection]), (item) => item.networkId),
      priceRange: priceRange(catalog),
    },
  };
}
