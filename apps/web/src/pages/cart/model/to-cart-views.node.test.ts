import { describe, expect, it } from 'vitest';

import type { Cart, CartQuote } from '../../../entities/cart';
import { parseEth } from '../../../shared/lib/eth/eth';
import { toCartLineInput, toCartViews } from './to-cart-views';

const t = (key: string) => key;
const line = (overrides: Partial<Cart['lines'][number]> = {}): Cart['lines'][number] => ({
  lineId: 'l1',
  nftId: 'emerald-ape-042',
  title: 'Emerald Ape #042',
  image: { src: '/nfts/emerald-ape-042-480.webp', width: 480, height: 480 },
  tokenId: '42',
  edition: { id: 'e1', label: '1-50', supply: 50 },
  unitPrice: parseEth('1.19'),
  quantity: 2,
  maxQuantity: 5,
  ...overrides,
});
const cart = (lines = [line()]): Cart => ({ lines, couponCode: null, itemCount: 2, version: 1 });
const quote = (overrides: Partial<CartQuote> = {}): CartQuote => ({
  quoteHash: 'q1',
  cartVersion: 1,
  networkId: 'ethereum',
  lines: [{ lineId: 'l1', unitPrice: parseEth('1.19'), quantity: 2, lineTotal: parseEth('2.38'), notice: null }],
  subtotal: parseEth('2.38'),
  discount: parseEth('0'),
  networkFee: parseEth('0.01'),
  total: parseEth('2.39'),
  coupon: null,
  canCheckout: true,
  expiresAt: 0,
  ...overrides,
});
const views = (q: CartQuote | undefined, status: 'pending' | 'error' | 'ready' = 'ready') =>
  toCartViews({ cart: cart(), quote: q, quoteStatus: status, busy: false, locale: 'pt-BR', t });

describe('toCartLineInput: rotulo da edicao', () => {
  it('"1-50" vira numero 1 e tiragem 50', () => {
    expect(toCartLineInput(line()).edition).toEqual({ id: 'e1', number: 1, supply: 50 });
  });

  it('edicao aberta (supply nulo, rotulo "open") vira numero 0 e tiragem 0', () => {
    expect(toCartLineInput(line({ edition: { id: 'e2', label: 'open', supply: null } })).edition).toEqual({ id: 'e2', number: 0, supply: 0 });
  });
});

describe('toCartViews: motivo para desabilitar o checkout', () => {
  it('cotacao pendente ou com erro bloqueia com motivo proprio', () => {
    expect(views(undefined, 'pending').disabledReason).toBe('quote_pending');
    expect(views(undefined, 'error').disabledReason).toBe('quote_error');
  });

  it('cotacao pronta e liberada nao tem motivo', () => {
    expect(views(quote()).disabledReason).toBeNull();
  });

  it('cotacao que nao permite checkout bloqueia', () => {
    expect(views(quote({ canCheckout: false })).disabledReason).toBe('line_blocking');
  });

  it('uma linha esgotada na cotacao bloqueia mesmo com canCheckout', () => {
    const sold = quote({ lines: [{ lineId: 'l1', unitPrice: parseEth('1.19'), quantity: 2, lineTotal: parseEth('2.38'), notice: { kind: 'sold_out' } }] });
    expect(views(sold).disabledReason).toBe('line_blocking');
  });
});
