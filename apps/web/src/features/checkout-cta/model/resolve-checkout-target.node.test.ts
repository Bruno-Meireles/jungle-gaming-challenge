import { describe, expect, it } from 'vitest';

import { safeRedirect } from '../../../shared/lib/navigation/safe-redirect';
import { resolveCheckoutTarget } from './resolve-checkout-target';

describe('resolveCheckoutTarget', () => {
  it('autenticado vai direto para /checkout', () => {
    expect(resolveCheckoutTarget(true)).toEqual({ to: '/checkout' });
  });

  it('anonimo vai para /login com redirect=/checkout', () => {
    expect(resolveCheckoutTarget(false)).toEqual({ to: '/login', search: { redirect: '/checkout' } });
  });

  it('o redirect do anonimo sobrevive ao safeRedirect (destino interno valido)', () => {
    const redirect = resolveCheckoutTarget(false).search?.redirect;
    expect(safeRedirect(redirect, '/')).toBe('/checkout');
  });
});
