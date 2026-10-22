import { describe, expect, it } from 'vitest';

import { nftKeys } from './nft-keys';

/*
 * Assinatura sob teste:
 *   nftKeys.list(viewer: string, query: CatalogSearch): readonly ['nfts', 'list', { viewer: string }, CatalogSearch]
 * O 4o elemento e a busca em forma canonica (normalizeCatalogSearch): arrays ordenados
 * e sem duplicatas, defaults omitidos. Idioma fora da chave.
 */

describe('nftKeys.list', () => {
  it('tem a forma [nfts, list, { viewer }, query canonica]', () => {
    expect(nftKeys.list('anonymous', { q: 'ape' })).toEqual(['nfts', 'list', { viewer: 'anonymous' }, { q: 'ape' }]);
  });

  it('arrays em ordem diferente geram a mesma chave', () => {
    const a = nftKeys.list('anonymous', { collections: ['music', 'digital-art'], networks: ['solana', 'ethereum'] });
    const b = nftKeys.list('anonymous', { collections: ['digital-art', 'music'], networks: ['ethereum', 'solana'] });
    expect(a).toEqual(b);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('default explicito e omitido geram a mesma chave', () => {
    const explicit = nftKeys.list('anonymous', { tab: 'all', sort: 'recent', page: 1, collections: [] });
    expect(explicit).toEqual(nftKeys.list('anonymous', {}));
    expect(JSON.stringify(explicit)).toBe(JSON.stringify(nftKeys.list('anonymous', {})));
  });

  it.each([
    ['q', { q: 'ape' }],
    ['tab', { tab: 'new' }],
    ['sort', { sort: 'popular' }],
    ['collections', { collections: ['music'] }],
    ['networks', { networks: ['polygon'] }],
    ['min', { min: '0.5' }],
    ['max', { max: '2' }],
    ['page', { page: 2 }],
  ] as const)('o parametro %s muda a chave', (_name, patch) => {
    expect(nftKeys.list('anonymous', patch)).not.toEqual(nftKeys.list('anonymous', {}));
  });

  it('viewer diferente muda a chave', () => {
    expect(nftKeys.list('user-1', {})).not.toEqual(nftKeys.list('anonymous', {}));
  });
});
