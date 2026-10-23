import { safeRedirect } from './safe-redirect';

export type PrivateAccess = { kind: 'allow' } | { kind: 'login'; redirect: string };

export function resolvePrivateAccess({ session, href }: { session: 'authenticated' | 'anonymous'; href: string }): PrivateAccess {
  if (session === 'authenticated') return { kind: 'allow' };
  return { kind: 'login', redirect: safeRedirect(href) };
}
