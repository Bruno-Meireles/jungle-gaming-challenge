import { queryOptions } from '@tanstack/react-query';

import { isApiError } from '../../../shared/api/api-error';
import { httpClient, type HttpClient } from '../../../shared/api/http-client';
import { fetchSession } from '../api/session-api';
import { ANONYMOUS, authenticated, type Session } from './session';
import { sessionKeys } from './session-keys';
import { clearToken, readToken } from './session-store';

async function resolveSession(client: HttpClient, signal?: AbortSignal): Promise<Session> {
  if (readToken() === null) return ANONYMOUS;
  try {
    const { user } = await fetchSession(signal, client);
    if (user) return authenticated(user);
  } catch (error) {
    // Somente 401 session_invalid desloga; falha de rede/5xx propaga e preserva o token.
    if (!(isApiError(error) && error.code === 'session_invalid')) throw error;
  }
  clearToken();
  return ANONYMOUS;
}

export function sessionQueryOptions(client: HttpClient = httpClient) {
  return queryOptions({
    queryKey: sessionKeys.current(),
    queryFn: ({ signal }) => resolveSession(client, signal),
  });
}
