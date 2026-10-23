import { describe, expect, it } from 'vitest';

import { readLangParam, withLangParam } from './lang-param';

describe('readLangParam', () => {
  it.each([
    ['?lang=en', 'en'],
    ['?lang=pt-BR', 'pt-BR'],
    ['?q=ape&lang=en&page=2', 'en'],
  ])('le %s', (search, expected) => {
    expect(readLangParam(search)).toBe(expected);
  });

  it.each([[''], ['?lang=fr'], ['?lang='], ['?lang=EN'], ['?q=en']])('ignora %j', (search) => {
    expect(readLangParam(search)).toBeNull();
  });
});

describe('withLangParam', () => {
  it('adiciona lang sem perder os outros parametros', () => {
    expect(withLangParam('?q=ape&page=2', 'en')).toBe('?q=ape&page=2&lang=en');
  });

  it('substitui lang existente e preserva chaves repetidas', () => {
    expect(withLangParam('?lang=pt-BR&networks=ethereum&networks=polygon', 'en')).toBe('?lang=en&networks=ethereum&networks=polygon');
  });

  it('funciona sem query', () => {
    expect(withLangParam('', 'pt-BR')).toBe('?lang=pt-BR');
  });
});
