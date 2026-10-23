import { describe, expect, it } from 'vitest';

import { buildQuote, checkCoupon, type QuoteInputLine } from './quote-engine';

const line = (over: Partial<QuoteInputLine> = {}): QuoteInputLine => ({
  lineId: 'a~1-50',
  nftId: 'a',
  title: 'A',
  quantity: 2,
  unitPriceEth: '1.79',
  maxQuantity: 5,
  ...over,
});
const base = { couponCode: null, networkId: 'ethereum' as const, cartVersion: 1, now: 0 };

describe('quote-engine', () => {
  it('calcula subtotal, taxa e total por BigInt', () => {
    const second = line({ lineId: 'b', nftId: 'b', unitPriceEth: '1.19', quantity: 1 });
    const q = buildQuote({ ...base, lines: [line(), second] });
    expect(q).toMatchObject({
      subtotalEth: '4.77',
      discountEth: '0',
      networkFeeEth: '0.016',
      totalEth: '4.786',
      canCheckout: true,
    });
  });
  it('aplica LAUNCH10; EXPIRED2025 expira; outros invalidos', () => {
    const q = buildQuote({ ...base, couponCode: 'LAUNCH10', lines: [line()] });
    expect(q.discountEth).toBe('0.358');
    expect(q.coupon).toEqual({ code: 'LAUNCH10', status: 'applied', percent: 10 });
    expect(checkCoupon('EXPIRED2025').kind).toBe('expired');
    expect(checkCoupon('xx').kind).toBe('invalid');
  });
  it('esgotado ou acima do disponivel bloqueia o checkout', () => {
    expect(buildQuote({ ...base, lines: [line({ maxQuantity: 0 })] }).canCheckout).toBe(false);
    expect(buildQuote({ ...base, lines: [line({ maxQuantity: 1 })] }).lines[0]?.status).toBe('insufficient');
  });
  it('hash muda com o preco, e estavel sem mudanca; carrinho vazio sem taxa', () => {
    const a = buildQuote({ ...base, lines: [line()] });
    expect(buildQuote({ ...base, now: 99, cartVersion: 7, lines: [line()] }).quoteHash).toBe(a.quoteHash);
    expect(buildQuote({ ...base, lines: [line({ unitPriceEth: '1.80' })] }).quoteHash).not.toBe(a.quoteHash);
    expect(buildQuote({ ...base, lines: [] }).networkFeeEth).toBe('0');
  });
});
