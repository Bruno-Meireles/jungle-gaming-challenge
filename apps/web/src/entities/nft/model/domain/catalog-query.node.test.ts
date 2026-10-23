import { describe, expect, it } from 'vitest';

import { effectiveSort, normalizeCatalogSearch, toApiParams, withFilterChange } from './catalog-query';

/*
 * Assinatura sob teste (puro, sem React/Axios/TanStack):
 *
 *   type CatalogSearch = {
 *     q?: string; tab?: ViewId; sort?: SortId;
 *     collections?: CollectionId[]; networks?: NetworkId[];
 *     min?: string; max?: string; page?: number;
 *   };
 *   normalizeCatalogSearch(raw: Readonly<Record<string, unknown>>): CatalogSearch
 *

 * withFilterChange(search: CatalogSearch, patch: Partial<CatalogSearch>): CatalogSearch
 *   aplica o patch (valor undefined remove a chave), zera page se o patch tocar q, tab, sort,
 *   collections, networks, min ou max, e devolve a forma canonica (defaults omitidos).
 * toApiParams(search: CatalogSearch): CatalogQuery  (mesma forma de mocks/catalog queryCatalog)
 *   CatalogQuery = { search?; view; sort; collections; networks; minPriceEth?; maxPriceEth?; page }
 *   com defaults preenchidos: view all, sort recent, page 1, arrays [].
 *
 * Saida canonica: default omitido (tab 'all', sort 'recent', page 1, arrays vazios),
 * chaves invalidas descartadas, nunca lanca.
 */

describe('normalizeCatalogSearch', () => {
  it('entrada vazia vira objeto vazio', () => {
    expect(normalizeCatalogSearch({})).toEqual({});
  });

  it('omite valores iguais ao default', () => {
    expect(
      normalizeCatalogSearch({
        tab: 'all',
        sort: 'recent',
        page: 1,
        collections: [],
        networks: [],
      }),
    ).toEqual({});
  });

  it('mantem valores validos fora do default', () => {
    expect(
      normalizeCatalogSearch({ tab: 'new', sort: 'price-desc', page: 3, min: '0.5', max: '2' }),
    ).toEqual({ tab: 'new', sort: 'price-desc', page: 3, min: '0.5', max: '2' });
  });

  it('q recebe trim; vazio ou so espacos vira ausente', () => {
    expect(normalizeCatalogSearch({ q: '  nomad  ' })).toEqual({ q: 'nomad' });
    expect(normalizeCatalogSearch({ q: '   ' })).toEqual({});
    expect(normalizeCatalogSearch({ q: '' })).toEqual({});
  });

  it('q aceita ate 100 caracteres e rejeita mais que isso', () => {
    const ok = 'a'.repeat(100);
    expect(normalizeCatalogSearch({ q: ok })).toEqual({ q: ok });
    expect(normalizeCatalogSearch({ q: 'a'.repeat(101) })).toEqual({});
  });

  it('tab e sort invalidos viram ausentes', () => {
    expect(normalizeCatalogSearch({ tab: 'foo', sort: 'cheapest' })).toEqual({});
    expect(normalizeCatalogSearch({ tab: 3, sort: null })).toEqual({});
  });

  it('collections e networks: sem duplicatas, ordenados e sem desconhecidos', () => {
    expect(
      normalizeCatalogSearch({
        collections: ['music', 'digital-art', 'music', 'nope'],
        networks: ['solana', 'ethereum', 'solana', 'bitcoin'],
      }),
    ).toEqual({ collections: ['digital-art', 'music'], networks: ['ethereum', 'solana'] });
  });

  it('collections so com desconhecidos vira ausente', () => {
    expect(normalizeCatalogSearch({ collections: ['nope'], networks: 'bitcoin' })).toEqual({});
  });

  it.each(['1e3', '-1', '.5', '1.', '1,5', '0.1234567890123456789', 'abc', '', 5])(
    'min e max invalidos (%j) sao descartados',
    (value) => {
      expect(normalizeCatalogSearch({ min: value, max: value })).toEqual({});
    },
  );

  it('compara min e max como bigint: 1.10 e 1.1 sao iguais e preservados', () => {
    expect(normalizeCatalogSearch({ min: '1.10', max: '1.1' })).toEqual({
      min: '1.10',
      max: '1.1',
    });
  });

  it('min > max descarta os dois', () => {
    expect(normalizeCatalogSearch({ min: '2', max: '1.99' })).toEqual({});
    expect(normalizeCatalogSearch({ min: '0.1', max: '0.09' })).toEqual({});
  });

  it('min invalido nao descarta um max valido', () => {
    expect(normalizeCatalogSearch({ min: 'abc', max: '3' })).toEqual({ max: '3' });
  });

  it.each([-1, 0, 2.5, 'abc', null, Number.NaN])('page invalida (%j) vira ausente', (page) => {
    expect(normalizeCatalogSearch({ page })).toEqual({});
  });

  it('descarta chaves desconhecidas', () => {
    expect(normalizeCatalogSearch({ foo: 'bar', q: 'x' })).toEqual({ q: 'x' });
  });
});

describe('withFilterChange', () => {
  it.each([
    ['q', { q: 'ape' }],
    ['tab', { tab: 'trending' }],
    ['sort', { sort: 'popular' }],
    ['collections', { collections: ['music'] }],
    ['networks', { networks: ['polygon'] }],
    ['min', { min: '0.5' }],
    ['max', { max: '9' }],
  ] as const)('mudar %s zera page', (_name, patch) => {
    const result = withFilterChange({ page: 3 }, patch);
    expect(result.page).toBeUndefined();
    expect(result).toMatchObject(patch);
  });

  it('mudar so page preserva page e os filtros', () => {
    expect(withFilterChange({ q: 'ape', page: 2 }, { page: 4 })).toEqual({ q: 'ape', page: 4 });
  });

  it('preserva os demais filtros ao mudar um', () => {
    expect(withFilterChange({ q: 'ape', tab: 'new', page: 2 }, { sort: 'price-asc' })).toEqual({
      q: 'ape',
      tab: 'new',
      sort: 'price-asc',
    });
  });

  it('valor undefined no patch remove a chave', () => {
    expect(withFilterChange({ q: 'ape', page: 2 }, { q: undefined })).toEqual({});
  });

  it('valor igual ao default no patch fica omitido', () => {
    expect(withFilterChange({ sort: 'price-asc' }, { sort: 'recent' })).toEqual({});
  });

  it('nao muta a entrada', () => {
    const input = { q: 'ape', page: 2 };
    withFilterChange(input, { q: 'x' });
    expect(input).toEqual({ q: 'ape', page: 2 });
  });
});

describe('toApiParams', () => {
  it('preenche os defaults quando a busca esta vazia', () => {
    expect(toApiParams({})).toEqual({
      view: 'all',
      sort: 'recent',
      collections: [],
      networks: [],
      page: 1,
    });
  });

  it('mapeia q para search, tab para view, min/max para minPriceEth/maxPriceEth', () => {
    expect(
      toApiParams({
        q: 'nomad',
        tab: 'trending',
        sort: 'price-desc',
        collections: ['music'],
        networks: ['polygon', 'solana'],
        min: '0.02',
        max: '12.30',
        page: 2,
      }),
    ).toEqual({
      search: 'nomad',
      view: 'trending',
      sort: 'price-desc',
      collections: ['music'],
      networks: ['polygon', 'solana'],
      minPriceEth: '0.02',
      maxPriceEth: '12.30',
      page: 2,
    });
  });

  it('nao emite chaves de busca nem de preco quando ausentes', () => {
    const params = toApiParams({ tab: 'new' });
    expect(Object.keys(params).sort()).toEqual(['collections', 'networks', 'page', 'sort', 'view']);
  });

  it('a ordenacao padrao depende da aba: new recent, trending popular, all recent', () => {
    expect(toApiParams({ tab: 'new' }).sort).toBe('recent');
    expect(toApiParams({ tab: 'trending' }).sort).toBe('popular');
    expect(toApiParams({}).sort).toBe('recent');
  });

  it('ordenacao explicita vence o padrao da aba', () => {
    expect(toApiParams({ tab: 'trending', sort: 'recent' }).sort).toBe('recent');
    expect(toApiParams({ tab: 'trending', sort: 'price-asc' }).sort).toBe('price-asc');
  });
});

describe('ordenacao efetiva por aba', () => {
  it('effectiveSort devolve o padrao da aba quando nao ha sort', () => {
    expect(effectiveSort({})).toBe('recent');
    expect(effectiveSort({ tab: 'trending' })).toBe('popular');
    expect(effectiveSort({ tab: 'trending', sort: 'price-desc' })).toBe('price-desc');
  });

  it('na aba trending, recent e explicito e fica na URL; popular e o padrao e fica omitido', () => {
    expect(normalizeCatalogSearch({ tab: 'trending', sort: 'recent' })).toEqual({ tab: 'trending', sort: 'recent' });
    expect(normalizeCatalogSearch({ tab: 'trending', sort: 'popular' })).toEqual({ tab: 'trending' });
    expect(normalizeCatalogSearch({ tab: 'new', sort: 'popular' })).toEqual({ tab: 'new', sort: 'popular' });
  });

  it('trocar de aba preserva o sort explicito', () => {
    expect(withFilterChange({ sort: 'price-asc' }, { tab: 'trending' })).toEqual({ tab: 'trending', sort: 'price-asc' });
  });
});
