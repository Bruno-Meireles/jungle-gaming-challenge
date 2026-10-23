import { describe, expect, it } from 'vitest';

import { findParityIssues } from '../../shared/lib/i18n/locale-parity';
import { cartCouponLocales } from '../../features/cart-coupon';
import { cartLineControlsLocales } from '../../features/cart-line-controls';
import { checkoutCtaLocales } from '../../features/checkout-cta';
import { pageCartLocales } from '../../pages/cart';
import { cartLinesLocales } from '../../widgets/cart-lines';
import { cartSummaryLocales } from '../../widgets/cart-summary';
import { relatedNftsLocales } from '../../widgets/related-nfts';
import { resources } from './resources';

const namespaces = {
  pageCart: pageCartLocales,
  cartLines: cartLinesLocales,
  cartSummary: cartSummaryLocales,
  cartLineControls: cartLineControlsLocales,
  cartCoupon: cartCouponLocales,
  checkoutCta: checkoutCtaLocales,
  relatedNfts: relatedNftsLocales,
};

describe.each(Object.entries(namespaces))('namespace %s do carrinho', (name, locales) => {
  it('tem mensagens em pt-BR (nao vazio)', () => {
    expect(Object.keys(locales['pt-BR']).length).toBeGreaterThan(0);
  });

  it('tem as mesmas chaves e placeholders em pt-BR e en', () => {
    expect(findParityIssues(locales['pt-BR'], locales.en)).toEqual([]);
  });

  it('esta registrado nos recursos do app nos dois idiomas', () => {
    expect(resources['pt-BR'][name]).toBe(locales['pt-BR']);
    expect(resources.en[name]).toBe(locales.en);
  });
});
