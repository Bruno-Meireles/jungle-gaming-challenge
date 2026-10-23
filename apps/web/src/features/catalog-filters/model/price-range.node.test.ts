import { describe, expect, it } from 'vitest';

import { boundsOf, formatSteps, selectionToSteps, stepsToSelection } from './price-range';

const RANGE = { minEth: '0.015', maxEth: '12.301' };

describe('price-range (passos de 0.01 ETH, sem float)', () => {
  it('arredonda a faixa da API para fora: piso do minimo e teto do maximo', () => {
    expect(boundsOf(RANGE)).toEqual({ lo: 1, hi: 1231 });
  });

  it('sem selecao usa os extremos; selecao fora da faixa e limitada', () => {
    const bounds = boundsOf(RANGE);
    expect(selectionToSteps(bounds, {})).toEqual([1, 1231]);
    expect(selectionToSteps(bounds, { min: '0.00', max: '99.00' })).toEqual([1, 1231]);
    expect(selectionToSteps(bounds, { min: '1.00', max: '2.50' })).toEqual([100, 250]);
  });

  it('extremos viram "sem filtro" e valores internos viram parametros decimais', () => {
    const bounds = boundsOf(RANGE);
    expect(stepsToSelection(bounds, [1, 1231])).toEqual({});
    expect(stepsToSelection(bounds, [100, 1231])).toEqual({ min: '1' });
    expect(stepsToSelection(bounds, [100, 250])).toEqual({ min: '1', max: '2.5' });
  });

  it('formata os passos com duas casas conforme o idioma', () => {
    expect(formatSteps(250, 'pt-BR')).toContain('2,50');
    expect(formatSteps(250, 'en')).toContain('2.50');
  });
});
