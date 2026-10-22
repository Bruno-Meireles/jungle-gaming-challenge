import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { parseEth } from './eth';
import { formatEthAmount } from './format-eth';

const CASES: [string, 'pt-BR' | 'en', string][] = [
  ['1.19', 'pt-BR', '1,19'],
  ['1.19', 'en', '1.19'],
  ['1234.5', 'pt-BR', '1.234,5'],
  ['1234.5', 'en', '1,234.5'],
  ['1234567', 'pt-BR', '1.234.567'],
  ['1234567', 'en', '1,234,567'],
  ['999', 'pt-BR', '999'],
  ['1000', 'en', '1,000'],
  ['0.000000000000000001', 'pt-BR', '0,000000000000000001'],
  ['0.000000000000000001', 'en', '0.000000000000000001'],
  ['12', 'pt-BR', '12'],
  ['12', 'en', '12'],
  ['0', 'pt-BR', '0'],
];

describe('formatEthAmount', () => {
  it.each(CASES)('formata %s em %s como %s', (value, locale, expected) => {
    expect(formatEthAmount(parseEth(value), locale)).toBe(expected);
  });

  it('nao usa Number, parseFloat, toFixed, toLocaleString nem Intl no fonte', () => {
    const source = readFileSync(
      fileURLToPath(new URL('./format-eth.ts', import.meta.url)),
      'utf8',
    );
    for (const forbidden of ['Number(', 'parseFloat', 'toFixed', 'toLocaleString', 'Intl.']) {
      expect(source).not.toContain(forbidden);
    }
  });
});
