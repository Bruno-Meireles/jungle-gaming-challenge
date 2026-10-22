import { describe, expect, it } from 'vitest';

import type { CollectionId, NetworkId, SortId, ViewId } from '../../shared/api/contracts/ids';
import { COLLECTION_IDS, NETWORK_IDS } from '../../shared/api/contracts/ids';
import type { NftSummaryDto } from '../../shared/api/contracts/nfts';
import { compareEth, parseEth } from '../../shared/lib/eth/eth';
import { queryCatalog } from './query-catalog';

/*
 * Assinatura sob teste (funcao pura, sem relogio nem I/O):
 *
 *   queryCatalog(catalog: readonly NftSummaryDto[], query: CatalogQuery, now: string): CatalogPageDto
 *
 *   type CatalogQuery = {
 *     search?: string; view: ViewId; sort: SortId;
 *     collections: readonly CollectionId[]; networks: readonly NetworkId[];
 *     minPriceEth?: string; maxPriceEth?: string; page: number;
 *   };
 *
 * `now` e o MOCK_NOW em ISO. `pageSize` e fixo em 9 e vem no resultado.
 * `new` = listedAt nos 30 dias anteriores a `now`; `trending` = popularity >= 80.
 * Empates de ordenacao desempatam por `id` ascendente.
 * Facetas de colecao e rede listam todos os ids conhecidos (zero incluido).
 */

const NOW = '2026-06-30T12:00:00.000Z';

let seq = 0;
function nft(overrides: Partial<NftSummaryDto> = {}): NftSummaryDto {
  seq += 1;
  return {
    id: `item-${String(seq).padStart(3, '0')}`,
    title: 'Plain Title',
    collectionId: 'digital-art',
    networkId: 'ethereum',
    priceEth: '1',
    image: { src: '/images/x.webp', width: 640, height: 480 },
    rarity: 'common',
    listedAt: '2026-01-01T00:00:00.000Z',
    popularity: 10,
    version: 0,
    ...overrides,
  };
}

function query(
  overrides: Partial<{
    search: string;
    view: ViewId;
    sort: SortId;
    collections: CollectionId[];
    networks: NetworkId[];
    minPriceEth: string;
    maxPriceEth: string;
    page: number;
  }> = {},
) {
  return { view: 'all' as ViewId, sort: 'recent' as SortId, collections: [], networks: [], page: 1, ...overrides };
}

const ids = (items: readonly NftSummaryDto[]) => items.map((i) => i.id);

describe('queryCatalog', () => {
  it('busca sem diferenciar maiusculas em titulo e em colecao', () => {
    const byTitle = nft({ id: 'a', title: 'Emerald Ape #042' });
    const byCollection = nft({ id: 'b', title: 'Outro', collectionId: 'photography' });
    const none = nft({ id: 'c', title: 'Outro' });
    const catalog = [byTitle, byCollection, none];

    expect(ids(queryCatalog(catalog, query({ search: 'eMeRaLd' }), NOW).items)).toEqual(['a']);
    expect(ids(queryCatalog(catalog, query({ search: 'PHOTO' }), NOW).items)).toEqual(['b']);
  });

  it('combina com OR dentro da dimensao e AND entre dimensoes', () => {
    const a = nft({ id: 'a', collectionId: 'music', networkId: 'ethereum' });
    const b = nft({ id: 'b', collectionId: 'gaming', networkId: 'polygon' });
    const c = nft({ id: 'c', collectionId: 'music', networkId: 'solana' });
    const d = nft({ id: 'd', collectionId: 'utility', networkId: 'ethereum' });
    const catalog = [a, b, c, d];

    const or = queryCatalog(catalog, query({ collections: ['music', 'gaming'], sort: 'popular' }), NOW);
    expect(ids(or.items).sort()).toEqual(['a', 'b', 'c']);

    const and = queryCatalog(catalog, query({ collections: ['music', 'gaming'], networks: ['ethereum', 'polygon'] }), NOW);
    expect(ids(and.items).sort()).toEqual(['a', 'b']);
    expect(and.totalItems).toBe(2);
  });

  it('filtra preco de forma inclusiva por bigint, nao por texto', () => {
    const low = nft({ id: 'low', priceEth: '0.02' });
    const nine = nft({ id: 'nine', priceEth: '9.5' });
    const twelve = nft({ id: 'twelve', priceEth: '12.30' });
    const catalog = [low, nine, twelve];

    const range = queryCatalog(catalog, query({ minPriceEth: '9.5', maxPriceEth: '12.30' }), NOW);
    expect(ids(range.items).sort()).toEqual(['nine', 'twelve']);

    const onlyMin = queryCatalog(catalog, query({ minPriceEth: '10' }), NOW);
    expect(ids(onlyMin.items)).toEqual(['twelve']);

    const onlyMax = queryCatalog(catalog, query({ maxPriceEth: '0.020' }), NOW);
    expect(ids(onlyMax.items)).toEqual(['low']);
  });

  it('view new mantem so os listados nos 30 dias antes de now e trending so popularity >= 80', () => {
    const recent = nft({ id: 'recent', listedAt: '2026-06-10T00:00:00.000Z', popularity: 5 });
    const old = nft({ id: 'old', listedAt: '2026-05-01T00:00:00.000Z', popularity: 79 });
    const hot = nft({ id: 'hot', listedAt: '2026-05-01T00:00:00.000Z', popularity: 80 });
    const catalog = [recent, old, hot];

    expect(ids(queryCatalog(catalog, query({ view: 'all' }), NOW).items).sort()).toEqual(['hot', 'old', 'recent']);
    expect(ids(queryCatalog(catalog, query({ view: 'new' }), NOW).items)).toEqual(['recent']);
    expect(ids(queryCatalog(catalog, query({ view: 'trending' }), NOW).items)).toEqual(['hot']);
  });

  it('ordena por recent, price-asc, price-desc e popular com desempate por id', () => {
    const a = nft({ id: 'a', listedAt: '2026-01-02T00:00:00.000Z', priceEth: '12.30', popularity: 5 });
    const b = nft({ id: 'b', listedAt: '2026-03-01T00:00:00.000Z', priceEth: '9.5', popularity: 50 });
    const c = nft({ id: 'c', listedAt: '2026-02-01T00:00:00.000Z', priceEth: '0.02', popularity: 50 });
    const catalog = [a, b, c];

    expect(ids(queryCatalog(catalog, query({ sort: 'recent' }), NOW).items)).toEqual(['b', 'c', 'a']);
    expect(ids(queryCatalog(catalog, query({ sort: 'price-asc' }), NOW).items)).toEqual(['c', 'b', 'a']);
    expect(ids(queryCatalog(catalog, query({ sort: 'price-desc' }), NOW).items)).toEqual(['a', 'b', 'c']);
    expect(ids(queryCatalog(catalog, query({ sort: 'popular' }), NOW).items)).toEqual(['b', 'c', 'a']);

    const prices = queryCatalog(catalog, query({ sort: 'price-asc' }), NOW).items.map((i) => parseEth(i.priceEth));
    for (let i = 1; i < prices.length; i += 1) {
      expect(compareEth(prices[i - 1]!, prices[i]!)).toBe(-1);
    }
  });

  it('pagina em 9 itens e limita page acima do total a ultima pagina', () => {
    const catalog = Array.from({ length: 11 }, (_, i) =>
      nft({ id: `n-${String(i).padStart(2, '0')}`, listedAt: `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z` }),
    );

    const first = queryCatalog(catalog, query({ page: 1 }), NOW);
    expect(first).toMatchObject({ page: 1, pageSize: 9, totalItems: 11, totalPages: 2 });
    expect(first.items).toHaveLength(9);

    const beyond = queryCatalog(catalog, query({ page: 99 }), NOW);
    expect(beyond.page).toBe(2);
    expect(beyond.items).toHaveLength(2);
    expect(ids(beyond.items)).toEqual(['n-01', 'n-00']);
  });

  it('resultado vazio tem totalPages 0 e itens vazios', () => {
    const result = queryCatalog([nft()], query({ search: 'inexistente' }), NOW);
    expect(result).toMatchObject({ items: [], totalItems: 0, totalPages: 0, pageSize: 9 });
  });

  it('facetas sao disjuntivas: colecoes ignoram o filtro collections e redes ignoram networks', () => {
    const catalog = [
      nft({ id: 'a', collectionId: 'music', networkId: 'ethereum' }),
      nft({ id: 'b', collectionId: 'music', networkId: 'polygon' }),
      nft({ id: 'c', collectionId: 'gaming', networkId: 'ethereum' }),
      nft({ id: 'd', collectionId: 'gaming', networkId: 'solana' }),
    ];

    const result = queryCatalog(catalog, query({ collections: ['music'], networks: ['ethereum'] }), NOW);
    expect(ids(result.items)).toEqual(['a']);

    const collectionCount = (id: CollectionId) => result.facets.collections.find((f) => f.id === id)?.count;
    const networkCount = (id: NetworkId) => result.facets.networks.find((f) => f.id === id)?.count;

    // colecoes: aplica networks=ethereum, ignora collections
    expect(collectionCount('music')).toBe(1);
    expect(collectionCount('gaming')).toBe(1);
    expect(collectionCount('utility')).toBe(0);
    // redes: aplica collections=music, ignora networks
    expect(networkCount('ethereum')).toBe(1);
    expect(networkCount('polygon')).toBe(1);
    expect(networkCount('solana')).toBe(0);

    expect(result.facets.collections.map((f) => f.id)).toEqual([...COLLECTION_IDS]);
    expect(result.facets.networks.map((f) => f.id)).toEqual([...NETWORK_IDS]);
  });

  it('facetas respeitam busca, view e preco', () => {
    const catalog = [
      nft({ id: 'a', title: 'Alpha', collectionId: 'music', priceEth: '1' }),
      nft({ id: 'b', title: 'Alpha', collectionId: 'gaming', priceEth: '50' }),
      nft({ id: 'c', title: 'Beta', collectionId: 'gaming', priceEth: '1' }),
    ];
    const result = queryCatalog(catalog, query({ search: 'alpha', maxPriceEth: '2' }), NOW);
    expect(result.facets.collections.find((f) => f.id === 'music')?.count).toBe(1);
    expect(result.facets.collections.find((f) => f.id === 'gaming')?.count).toBe(0);
  });

  it('priceRange vem do catalogo inteiro, independente dos filtros', () => {
    const catalog = [
      nft({ id: 'a', priceEth: '0.000000000000000001', collectionId: 'music' }),
      nft({ id: 'b', priceEth: '12.30', collectionId: 'gaming' }),
      nft({ id: 'c', priceEth: '9.5', collectionId: 'gaming' }),
    ];
    const result = queryCatalog(catalog, query({ collections: ['gaming'], minPriceEth: '9' }), NOW);
    expect(result.facets.priceRange).toEqual({ minEth: '0.000000000000000001', maxEth: '12.30' });
  });
});
