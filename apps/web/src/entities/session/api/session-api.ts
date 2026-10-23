import { sessionResponseSchema, type SessionResponse } from '../../../shared/api/contracts/auth';
import { getJson, httpClient, type HttpClient } from '../../../shared/api/http-client';

/** 200 `{user:null}` sem token; 401 `session_invalid` com token invalido ou expirado. */
export function fetchSession(signal?: AbortSignal, client: HttpClient = httpClient): Promise<SessionResponse> {
  return getJson(client, { path: '/auth/session', schema: sessionResponseSchema, signal });
}
