import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { isApiError } from '../../../shared/api/api-error';
import type { CatalogPageDto } from '../../../shared/api/contracts/nfts';
import { httpClient } from '../../../shared/api/http-client';
import type { NftSummary } from '../model/domain/nft';
import type { CatalogQuery } from '../model/domain/catalog-query';
import { fetchCatalogPage } from './fetch-catalog-page';

type CatalogPage = {
  items: NftSummary[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  facets: CatalogPageDto['facets'];
};

const BASE = 'http://localhost/api';
httpClient.defaults.baseURL = BASE;

const dto: CatalogPageDto = {
  items: [
    {
      id: 'emerald-ape-042',
      title: 'Emerald Ape #042',
      collectionId: 'digital-art',
      networkId: 'ethereum',
      priceEth: '1.19',
      image: { src: '/images/emerald-ape-042.webp', width: 640, height: 480 },
      rarity: 'rare',
      listedAt: '2026-01-15T10:30:00.000Z',
      popularity: 42,
      version: 3,
    },
  ],
  page: 2,
  pageSize: 9,
  totalItems: 10,
  totalPages: 2,
  facets: {
    collections: [{ id: 'digital-art', count: 4 }],
    networks: [{ id: 'ethereum', count: 7 }],
    priceRange: { minEth: '0.02', maxEth: '12.3' },
  },
};

const query: CatalogQuery = {
  search: 'ape',
  view: 'trending',
  sort: 'price-asc',
  collections: ['photography', 'digital-art'],
  networks: [],
  minPriceEth: '0.5',
  page: 2,
};

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function captureUrl(body: unknown = dto): { urls: URL[] } {
  const urls: URL[] = [];
  server.use(
    http.get(`${BASE}/nfts`, ({ request }) => {
      urls.push(new URL(request.url));
      return HttpResponse.json(body as Record<string, unknown>);
    }),
  );
  return { urls };
}

describe('fetchCatalogPage', () => {
  it('envia search, view, sort, collections repetido e ordenado, minPriceEth, page e pageSize=9', async () => {
    const { urls } = captureUrl();
    await fetchCatalogPage(query, new AbortController().signal);
    expect(urls).toHaveLength(1);
    const pairs = [...(urls[0]?.searchParams.entries() ?? [])].sort(([a, x], [b, y]) =>
      `${a}=${x}`.localeCompare(`${b}=${y}`),
    );
    expect(pairs).toEqual([
      ['collections', 'digital-art'],
      ['collections', 'photography'],
      ['minPriceEth', '0.5'],
      ['page', '2'],
      ['pageSize', '9'],
      ['search', 'ape'],
      ['sort', 'price-asc'],
      ['view', 'trending'],
    ]);
  });

  it('converte o DTO em dominio mantendo o preco como string', async () => {
    captureUrl();
    const page: CatalogPage = await fetchCatalogPage(query, new AbortController().signal);
    expect(page).toEqual({
      items: [
        {
          id: 'emerald-ape-042',
          title: 'Emerald Ape #042',
          collectionId: 'digital-art',
          networkId: 'ethereum',
          price: '1.19',
          image: { src: '/images/emerald-ape-042.webp', width: 640, height: 480 },
          rarity: 'rare',
          listedAt: '2026-01-15T10:30:00.000Z',
        },
      ],
      page: 2,
      pageSize: 9,
      totalItems: 10,
      totalPages: 2,
      facets: dto.facets,
    });
    expect(typeof page.items[0]?.price).toBe('string');
  });

  it('rejeita com ApiError invalid_response quando o DTO foge do schema', async () => {
    captureUrl({ ...dto, items: [{ ...dto.items[0], priceEth: 1.19 }] });
    const error: unknown = await fetchCatalogPage(query, new AbortController().signal).then(
      () => undefined,
      (e: unknown) => e,
    );
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'invalid_response', transient: false });
  });

  it('rejeita quando o signal ja esta abortado', async () => {
    captureUrl();
    const controller = new AbortController();
    controller.abort();
    await expect(fetchCatalogPage(query, controller.signal)).rejects.toMatchObject({
      code: 'aborted',
    });
  });
});
