import { safeRedirect } from '../../../shared/lib/navigation/safe-redirect';

export type LoginSearch = { redirect?: string };

export function loginSearchSchema(search: Record<string, unknown>): LoginSearch {
  const redirect = search.redirect;
  return typeof redirect === 'string' && redirect !== '' && safeRedirect(redirect, '') !== ''
    ? { redirect }
    : {};
}
