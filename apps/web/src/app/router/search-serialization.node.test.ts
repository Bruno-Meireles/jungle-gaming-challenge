import { describe, expect, it } from 'vitest';
import { normalizeCatalogSearch } from '../../entities/nft';
import { parseSearch, stringifySearch } from './search-serialization';

/*
 * Contrato (assinaturas de `createRouter({ parseSearch, stringifySearch })` do TanStack Router):
 * - parseSearch(searchStr) -> objeto; mantem strings como strings (o parser padrao converte "123" e "1.5" em number,
 *   o que perde precisao em ETH com 18 casas); `page` vira number quando e inteiro canonico; `collections` e
 *   `networks` viram sempre array (chave repetida na URL).
 * - stringifySearch(obj) -> "?a=1&a=2" ou "" ; sem aspas JSON; arrays viram chave repetida; undefined e omitido.
 */
describe('parseSearch', () => {
  it('mantem strings decimais como string (min=1.5, q=123)', () => {
    const parsed = parseSearch('?q=123&min=1.5&max=12.30');

    expect(parsed).toMatchObject({ q: '123', min: '1.5', max: '12.30' });
  });

  it('preserva 18 casas decimais sem perda de precisao', () => {
    expect(parseSearch('?min=0.000000000000000001')).toMatchObject({ min: '0.000000000000000001' });
  });

  it('nao interpreta valores com cara de JSON ou literal', () => {
    expect(parseSearch('?q=true')).toMatchObject({ q: 'true' });
    expect(parseSearch('?q=null')).toMatchObject({ q: 'null' });
    expect(parseSearch('?q=%5B1%5D')).toMatchObject({ q: '[1]' });
    expect(parseSearch('?q=1e3')).toMatchObject({ q: '1e3' });
  });

  it('chave repetida vira array e chave unica de collections/networks tambem', () => {
    expect(parseSearch('?collections=digital-art&collections=music&networks=polygon')).toMatchObject({
      collections: ['digital-art', 'music'],
      networks: ['polygon'],
    });
  });

  it('page inteiro canonico vira number; invalido nao vira inteiro valido', () => {
    expect(parseSearch('?page=2')).toMatchObject({ page: 2 });
    for (const raw of ['-3', '2.5', 'abc']) {
      const { page } = parseSearch(`?page=${raw}`);
      expect(typeof page === 'number' && Number.isInteger(page) && page >= 1).toBe(false);
    }
  });

  it('aceita string sem "?" inicial e vazia', () => {
    expect(parseSearch('q=nomad')).toMatchObject({ q: 'nomad' });
    expect(parseSearch('')).toEqual({});
  });

  it('decodifica percent-encoding e "+" de espaco', () => {
    expect(parseSearch('?q=sage%20nomad')).toMatchObject({ q: 'sage nomad' });
    expect(parseSearch('?q=sage+nomad')).toMatchObject({ q: 'sage nomad' });
  });

  it('alimenta o normalizeCatalogSearch sem descartar q numerico nem min decimal', () => {
    const search = normalizeCatalogSearch(parseSearch('?q=123&min=1.5&collections=music&page=3'));

    expect(search).toEqual({ q: '123', min: '1.5', collections: ['music'], page: 3 });
  });
});

describe('stringifySearch', () => {
  it('serializa strings sem aspas JSON e preserva decimais', () => {
    const str = stringifySearch({ q: '123', min: '1.5', max: '12.30' });
    const params = new URLSearchParams(str);

    expect(str.startsWith('?')).toBe(true);
    expect(str).not.toContain('%22');
    expect(params.get('q')).toBe('123');
    expect(params.get('min')).toBe('1.5');
    expect(params.get('max')).toBe('12.30');
  });

  it('serializa arrays como chave repetida', () => {
    const params = new URLSearchParams(stringifySearch({ collections: ['digital-art', 'music'], networks: ['polygon'] }));

    expect(params.getAll('collections')).toEqual(['digital-art', 'music']);
    expect(params.getAll('networks')).toEqual(['polygon']);
  });

  it('serializa page numerico e omite undefined e arrays vazios', () => {
    const params = new URLSearchParams(stringifySearch({ page: 2, q: undefined, tab: undefined, collections: [] }));

    expect([...params.keys()]).toEqual(['page']);
    expect(params.get('page')).toBe('2');
  });

  it('objeto vazio vira string vazia (URL sem "?")', () => {
    expect(stringifySearch({})).toBe('');
  });

  it('codifica caracteres especiais e a ida e volta devolve o mesmo valor', () => {
    const original = { q: 'a&b=c d', min: '0.000000000000000001', collections: ['music'], page: 4 };

    expect(parseSearch(stringifySearch(original))).toEqual(original);
  });
});
