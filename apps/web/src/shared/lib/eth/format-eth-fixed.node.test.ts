import { describe, expect, it } from 'vitest';

import { parseEth } from './eth';
import { formatEthFixed } from './format-eth';

describe('formatEthFixed', () => {
  it.each([
    ['12.3', 'pt-BR', '12,30'],
    ['12.3', 'en', '12.30'],
    ['0', 'pt-BR', '0,00'],
    ['1.5', 'en', '1.50'],
    ['1234.05', 'pt-BR', '1.234,05'],
  ] as const)('%s em %s vira %s', (value, locale, expected) => {
    expect(formatEthFixed(parseEth(value), locale, 2)).toBe(expected);
  });
});
