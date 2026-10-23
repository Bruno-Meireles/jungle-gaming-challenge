import { describe, expect, it } from 'vitest';

import { resolveCheckoutAccess } from './checkout-access';

describe('resolveCheckoutAccess', () => {
  it('anonimo vai para login com redirect /checkout', () => {
    expect(resolveCheckoutAccess({ session: 'anonymous', cartLineCount: 3, href: '/checkout' })).toEqual({
      kind: 'login',
      redirect: '/checkout',
    });
  });

  it('anonimo com carrinho vazio ainda vai para login (sessao antes do carrinho)', () => {
    expect(resolveCheckoutAccess({ session: 'anonymous', cartLineCount: 0, href: '/checkout' })).toEqual({
      kind: 'login',
      redirect: '/checkout',
    });
  });

  it('autenticado sem linhas volta ao carrinho', () => {
    expect(resolveCheckoutAccess({ session: 'authenticated', cartLineCount: 0, href: '/checkout' })).toEqual({ kind: 'cart' });
  });

  it('autenticado com linhas entra', () => {
    expect(resolveCheckoutAccess({ session: 'authenticated', cartLineCount: 1, href: '/checkout' })).toEqual({ kind: 'allow' });
  });
});
