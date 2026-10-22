import { describe, expect, it } from 'vitest';

import { normalizeCatalogSearch } from './catalog-query';

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
 * Saida canonica: default omitido (tab 'all', sort 'recent', page 1, arrays vazios),
 * chaves invalidas descartadas, nunca lanca.
 */

describe('normalizeCatalogSearch', () => {
  it('entrada vazia vira objeto vazio', () => {
    expect(normalizeCatalogSearch({})).toEqual({});
  });

  it('omite valores iguais ao default', () => {
    expect(
      normalizeCatalogSearch({ tab: 'all', sort: 'recent', page: 1, collections: [], networks: [] }),
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
    expect(normalizeCatalogSearch({ min: '1.10', max: '1.1' })).toEqual({ min: '1.10', max: '1.1' });
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
