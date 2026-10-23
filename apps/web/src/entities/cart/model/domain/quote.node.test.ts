import { describe, expect, it } from 'vitest';

import { asEthAmount } from '../../../../shared/lib/eth/eth';
import type { CartQuote, LineNotice } from './cart';
import { clampQuantity, diffQuotes, withNotices } from './quote';

const eth = asEthAmount;
const quote = (quoteHash: string, lines: [string, string][]): CartQuote =>
  ({
    quoteHash,
    lines: lines.map(([lineId, price]) => ({
      lineId,
      unitPrice: eth(price),
      quantity: 1,
      lineTotal: eth(price),
      notice: null,
    })),
  }) as unknown as CartQuote;

describe('clampQuantity', () => {
  it.each([
    [0, 5, 1],
    [-3, 5, 1],
    [2.9, 5, 2],
    [9, 5, 5],
    [3, 0, 1],
  ])('clampQuantity(%s, max %s) = %s', (requested, max, expected) => {
    expect(clampQuantity(requested, max)).toBe(expected);
  });
});

describe('diffQuotes', () => {
  it('lista linhas com preco alterado e sinaliza mudanca por hash', () => {
    const seen = quote('h1', [['a', '1.00'], ['b', '2.00']]);
    const current = quote('h2', [['a', '1.50'], ['b', '2.00']]);

    expect(diffQuotes(seen, current)).toEqual({ priceChanged: ['a'], changed: true });
  });

  it('ignora linhas novas e nao sinaliza mudanca com hash igual', () => {
    const seen = quote('h1', [['a', '1.00']]);
    const current = quote('h1', [['a', '1.00'], ['c', '9.00']]);

    expect(diffQuotes(seen, current)).toEqual({ priceChanged: [], changed: false });
  });
});

describe('withNotices', () => {
  const current = quote('h2', [['a', '1.50'], ['b', '2.00'], ['c', '3.00']]);

  it('gera price_changed pelo preco visto e prioriza o aviso de disponibilidade da API', () => {
    const seen = new Map([['a', '1.00'], ['b', '2.00'], ['c', '3.00']]);
    const api = new Map<string, LineNotice>([['c', { kind: 'sold_out' }]]);

    const notices = withNotices(current, seen, api).lines.map((l) => l.notice);

    expect(notices).toEqual([
      { kind: 'price_changed', previousUnitPrice: '1.00', unitPrice: '1.50' },
      null,
      { kind: 'sold_out' },
    ]);
  });

  it('sem preco visto nem aviso da API nao ha notice', () => {
    expect(withNotices(current, new Map(), new Map()).lines.every((l) => l.notice === null)).toBe(true);
  });
});
