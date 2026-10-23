import { describe, expect, it } from 'vitest';

import { clampQuantity, isSoldOut, maxSelectableQuantity, resolveEdition } from './edition-rules';
import type { Edition } from './nft-detail';

const soldOut: Edition = { id: '1-1', kind: { type: 'limited', size: 1 }, priceEth: '3.50', remaining: 0, maxPerOrder: 1 };
const small: Edition = { id: '1-10', kind: { type: 'limited', size: 10 }, priceEth: '1.69', remaining: 3, maxPerOrder: 3 };
const base: Edition = { id: '1-50', kind: { type: 'limited', size: 50 }, priceEth: '1.19', remaining: 20, maxPerOrder: 5 };
const open: Edition = { id: 'open', kind: { type: 'open' }, priceEth: '0.25', remaining: 999, maxPerOrder: 10 };
const editions = [soldOut, small, base, open];

describe('resolveEdition', () => {
  it('sem parametro usa a edicao padrao', () => {
    expect(resolveEdition(editions, '1-50', undefined)).toEqual({ status: 'ok', edition: base });
  });

  it('parametro valido seleciona a edicao pedida', () => {
    expect(resolveEdition(editions, '1-50', '1-10')).toEqual({ status: 'ok', edition: small });
  });

  it('parametro desconhecido cai na padrao com status fallback', () => {
    expect(resolveEdition(editions, '1-50', 'nope')).toEqual({ status: 'fallback', edition: base });
  });

  it('parametro de edicao esgotada devolve status sold-out com essa edicao', () => {
    expect(resolveEdition(editions, '1-50', '1-1')).toEqual({ status: 'sold-out', edition: soldOut });
  });

  it('padrao esgotada sem parametro tambem e sold-out', () => {
    expect(resolveEdition(editions, '1-1', undefined)).toEqual({ status: 'sold-out', edition: soldOut });
  });
});

describe('isSoldOut', () => {
  it('e verdadeiro so quando remaining <= 0', () => {
    expect(isSoldOut(soldOut)).toBe(true);
    expect(isSoldOut(small)).toBe(false);
  });
});

describe('maxSelectableQuantity', () => {
  it.each([
    [small, 3],
    [base, 5],
    [open, 10],
    [soldOut, 0],
    [{ ...base, remaining: 2 }, 2],
  ])('edicao %# permite no maximo %i', (edition, max) => {
    expect(maxSelectableQuantity(edition)).toBe(max);
  });
});

describe('clampQuantity', () => {
  it.each([
    [0, 3, 1],
    [-4, 3, 1],
    [2, 3, 2],
    [9, 3, 3],
    [Number.NaN, 3, 1],
    [2.7, 5, 2],
  ])('clampQuantity(%f, max %i) = %i', (quantity, max, expected) => {
    expect(clampQuantity(quantity, max)).toBe(expected);
  });

  it('sem estoque (max 0) devolve 0', () => {
    expect(clampQuantity(1, 0)).toBe(0);
  });
});
