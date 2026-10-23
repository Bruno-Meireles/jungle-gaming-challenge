export type CheckoutTarget = { to: '/checkout'; search?: undefined } | { to: '/login'; search: { redirect: string } };

export function resolveCheckoutTarget(isAuthenticated: boolean): CheckoutTarget {
  return isAuthenticated ? { to: '/checkout' } : { to: '/login', search: { redirect: '/checkout' } };
}
