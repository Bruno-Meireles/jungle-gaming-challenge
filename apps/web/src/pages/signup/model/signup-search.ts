import { safeRedirect } from '../../../shared/lib/navigation/safe-redirect';

export type SignupSearch = { redirect?: string };

export function signupSearchSchema(search: Record<string, unknown>): SignupSearch {
  const redirect = search.redirect;
  return typeof redirect === 'string' && redirect !== '' && safeRedirect(redirect, '') !== ''
    ? { redirect }
    : {};
}
