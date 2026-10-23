import { useQuery } from '@tanstack/react-query';

import { sessionQueryOptions } from './session-query';

/** GET /auth/session no mount; `data` e `Session` (anonymous | authenticated). */
export function useSession() {
  return useQuery(sessionQueryOptions());
}
