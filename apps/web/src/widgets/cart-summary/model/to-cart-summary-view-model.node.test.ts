import { describe, expect, it } from 'vitest';

import { cartQuote, fakeT } from '../../../../tests/cart/fixtures';
import { toCartSummaryViewModel } from './to-cart-summary-view-model';

const ctx = (locale: 'pt-BR' | 'en') => ({ locale, t: fakeT });

describe('toCartSummaryViewModel', () => {
  it('cotacao pendente vira loading e falha vira error', () => {
    expect(toCartSummaryViewModel({ state: { status: 'loading' }, ...ctx('en') })).toEqual({ status: 'loading' });
    expect(toCartSummaryViewModel({ state: { status: 'error' }, ...ctx('en') })).toEqual({ status: 'error' });
  });

  it('pronto: formata subtotal, taxa e total da cotacao por idioma, sem recalcular', () => {
    const quote = cartQuote({ subtotal: '26.83', networkFee: '0.016', total: '26.846' });
    const pt = toCartSummaryViewModel({ state: { status: 'ready', quote, busy: false }, ...ctx('pt-BR') });
    const en = toCartSummaryViewModel({ state: { status: 'ready', quote, busy: false }, ...ctx('en') });
    expect(pt).toMatchObject({
      status: 'ready',
      subtotal: 'shared:eth.amount(amount=26,83)',
      networkFee: 'shared:eth.amount(amount=0,016)',
      total: 'shared:eth.amount(amount=26,846)',
    });
    expect(en).toMatchObject({ subtotal: 'shared:eth.amount(amount=26.83)', total: 'shared:eth.amount(amount=26.846)' });
  });

  it('o total vem da cotacao mesmo que nao some subtotal + taxa (cliente nao calcula)', () => {
    const quote = cartQuote({ subtotal: '1', discount: '0', networkFee: '1', total: '999' });
    const vm = toCartSummaryViewModel({ state: { status: 'ready', quote, busy: false }, ...ctx('en') });
    expect(vm).toMatchObject({ total: 'shared:eth.amount(amount=999.00)' });
  });

  it('desconto e sempre visivel, inclusive zerado', () => {
    const zero = toCartSummaryViewModel({ state: { status: 'ready', quote: cartQuote({ discount: '0' }), busy: false }, ...ctx('pt-BR') });
    const some = toCartSummaryViewModel({ state: { status: 'ready', quote: cartQuote({ discount: '2.683' }), busy: false }, ...ctx('en') });
    expect(zero).toMatchObject({ discount: 'cartSummary:discountValue(amount=0,00)' });
    expect(some).toMatchObject({ discount: 'cartSummary:discountValue(amount=2.683)' });
  });

  it('couponCode so aparece com cupom aplicado; busy repassa o recalculo em andamento', () => {
    const applied = cartQuote({ coupon: { code: 'LAUNCH10', status: 'applied' } });
    const invalid = cartQuote({ coupon: { code: 'NOPE', status: 'invalid' } });
    expect(toCartSummaryViewModel({ state: { status: 'ready', quote: applied, busy: true }, ...ctx('en') })).toMatchObject({
      couponCode: 'LAUNCH10',
      busy: true,
    });
    expect(toCartSummaryViewModel({ state: { status: 'ready', quote: invalid, busy: false }, ...ctx('en') })).toMatchObject({
      couponCode: null,
      busy: false,
    });
    expect(toCartSummaryViewModel({ state: { status: 'ready', quote: cartQuote(), busy: false }, ...ctx('en') })).toMatchObject({
      couponCode: null,
    });
  });
});
