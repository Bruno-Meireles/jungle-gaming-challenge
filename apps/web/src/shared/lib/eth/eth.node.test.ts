import { describe, expect, it } from 'vitest';

import { compareEth, isEthDecimal, parseEth, toWei } from './eth';

const VALID: [string, string][] = [
  ['0', '0'],
  ['1', '1'],
  ['1.19', '1.19'],
  ['12.30', '12.3'],
  ['0.000000000000000001', '0.000000000000000001'],
  ['1.1', '1.1'],
  ['1.10', '1.1'],
  ['1.000', '1'],
  ['007', '7'],
];

const INVALID = [
  '',
  '1e3',
  '-1',
  '+1',
  '.5',
  '1.',
  '1,5',
  '1.0000000000000000001',
  'abc',
  ' 1',
  '1 ',
  '0x1',
];

describe('isEthDecimal', () => {
  it.each(VALID)('aceita %s', (input) => {
    expect(isEthDecimal(input)).toBe(true);
  });

  it.each(INVALID)('rejeita %j', (input) => {
    expect(isEthDecimal(input)).toBe(false);
  });
});

describe('parseEth', () => {
  it.each(VALID)('devolve a forma canonica de %s', (input, canonical) => {
    expect(parseEth(input)).toBe(canonical);
  });

  it.each(INVALID)('lanca invalid_eth para %j', (input) => {
    expect(() => parseEth(input)).toThrow(new Error('invalid_eth'));
  });

  it.each(VALID)('e idempotente na ida e volta de %s', (input) => {
    expect(parseEth(parseEth(input))).toBe(parseEth(input));
  });
});

describe('toWei', () => {
  it('converte 1.19 para 18 casas inteiras', () => {
    expect(toWei(parseEth('1.19'))).toBe(1190000000000000000n);
  });

  it('converte o menor valor para 1 wei', () => {
    expect(toWei(parseEth('0.000000000000000001'))).toBe(1n);
  });
});

describe('compareEth', () => {
  it('trata 1.10 e 1.1 como iguais', () => {
    expect(compareEth(parseEth('1.10'), parseEth('1.1'))).toBe(0);
  });

  it('compara 0.1 maior que 0.09', () => {
    expect(compareEth(parseEth('0.1'), parseEth('0.09'))).toBe(1);
  });

  it('compara 1 wei menor que 2 wei', () => {
    expect(
      compareEth(parseEth('0.000000000000000001'), parseEth('0.000000000000000002')),
    ).toBe(-1);
  });
});
