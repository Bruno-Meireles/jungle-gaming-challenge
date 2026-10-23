import { describe, expect, it } from 'vitest';

import { addEth, asEthAmount, mulEthInt, percentOfEth, subEth, sumEth } from './eth-math';

const eth = asEthAmount;

describe('eth-math', () => {
  it('soma sem perder precisao', () => {
    expect(addEth(eth('0.1'), eth('0.2'))).toBe('0.3');
    expect(sumEth([eth('1.19'), eth('1.39'), eth('3.58')])).toBe('6.16');
    expect(sumEth([])).toBe('0');
  });
  it('multiplica por inteiro', () => {
    expect(mulEthInt(eth('1.79'), 2)).toBe('3.58');
  });
  it('subtrai e nao permite negativo', () => {
    expect(subEth(eth('1'), eth('0.25'))).toBe('0.75');
    expect(() => subEth(eth('1'), eth('2'))).toThrow();
  });
  it('percentual arredonda para baixo em wei', () => {
    expect(percentOfEth(eth('6.16'), 10)).toBe('0.616');
    expect(percentOfEth(eth('0.000000000000000001'), 10)).toBe('0');
  });
});
