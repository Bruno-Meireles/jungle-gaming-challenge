import { describe, expect, it } from 'vitest';

import { readLangParam } from './lang-param';

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
