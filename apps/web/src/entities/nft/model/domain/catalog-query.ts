import type { CollectionId, NetworkId, SortId, ViewId } from '../../../../shared/api/contracts/ids';
import {
  COLLECTION_IDS,
  NETWORK_IDS,
  SORT_IDS,
  VIEW_IDS,
} from '../../../../shared/api/contracts/ids';
import { compareEth, isEthDecimal, parseEth } from '../../../../shared/lib/eth/eth';

export type CatalogSearch = {
  q?: string;
  tab?: ViewId;
  sort?: SortId;
  collections?: readonly CollectionId[];
  networks?: readonly NetworkId[];
  min?: string;
  max?: string;
  page?: number;
};

const MAX_QUERY_LENGTH = 100;
const DEFAULT_VIEW: ViewId = 'all';
const DEFAULT_SORT: SortId = 'recent';

function pickEnum<T extends string>(allowed: readonly T[], value: unknown): T | undefined {
  return allowed.find((candidate) => candidate === value);
}

function pickEnumList<T extends string>(allowed: readonly T[], value: unknown): T[] {
  if (!Array.isArray(value)) return [];
  return allowed.filter((candidate) => value.includes(candidate));
}

function pickQuery(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' || trimmed.length > MAX_QUERY_LENGTH ? undefined : trimmed;
}

function pickPrice(value: unknown): string | undefined {
  return typeof value === 'string' && isEthDecimal(value) ? value : undefined;
}

function pickPage(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 1 ? value : undefined;
}

function pickPriceRange(minRaw: unknown, maxRaw: unknown): Pick<CatalogSearch, 'min' | 'max'> {
  const min = pickPrice(minRaw);
  const max = pickPrice(maxRaw);
  if (min !== undefined && max !== undefined && compareEth(parseEth(min), parseEth(max)) > 0)
    return {};
  return { ...(min === undefined ? {} : { min }), ...(max === undefined ? {} : { max }) };
}

export function normalizeCatalogSearch(raw: Readonly<Record<string, unknown>>): CatalogSearch {
  const q = pickQuery(raw.q);
  const tab = pickEnum(VIEW_IDS, raw.tab);
  const sort = pickEnum(SORT_IDS, raw.sort);
  const collections = pickEnumList(COLLECTION_IDS, raw.collections);
  const networks = pickEnumList(NETWORK_IDS, raw.networks);
  const page = pickPage(raw.page);
  return {
    ...(q === undefined ? {} : { q }),
    ...(tab === undefined || tab === DEFAULT_VIEW ? {} : { tab }),
    ...(sort === undefined || sort === DEFAULT_SORT ? {} : { sort }),
    ...(collections.length === 0 ? {} : { collections }),
    ...(networks.length === 0 ? {} : { networks }),
    ...pickPriceRange(raw.min, raw.max),
    ...(page === undefined ? {} : { page }),
  };
}

const FILTER_KEYS = ['q', 'tab', 'sort', 'collections', 'networks', 'min', 'max'] as const;

export function withFilterChange(
  search: CatalogSearch,
  patch: Partial<CatalogSearch>,
): CatalogSearch {
  const touchesFilter = FILTER_KEYS.some((key) => key in patch);
  const { page, ...rest } = { ...search, ...patch };
  return normalizeCatalogSearch(touchesFilter ? rest : { ...rest, page });
}

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

export function toApiParams(search: CatalogSearch): CatalogQuery {
  return {
    ...(search.q === undefined ? {} : { search: search.q }),
    view: search.tab ?? DEFAULT_VIEW,
    sort: search.sort ?? DEFAULT_SORT,
    collections: search.collections ?? [],
    networks: search.networks ?? [],
    ...(search.min === undefined ? {} : { minPriceEth: search.min }),
    ...(search.max === undefined ? {} : { maxPriceEth: search.max }),
    page: search.page ?? 1,
  };
}
