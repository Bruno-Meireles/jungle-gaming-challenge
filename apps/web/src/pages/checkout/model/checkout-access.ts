import { resolvePrivateAccess } from '../../../shared/lib/navigation/private-access';

export type CheckoutAccess = { kind: 'allow' } | { kind: 'login'; redirect: string } | { kind: 'cart' };

export function resolveCheckoutAccess(input: {
  session: 'authenticated' | 'anonymous';
  cartLineCount: number;
  href: string;
}): CheckoutAccess {
  const access = resolvePrivateAccess({ session: input.session, href: input.href });
  if (access.kind !== 'allow') return access;
  return input.cartLineCount > 0 ? access : { kind: 'cart' };
}
