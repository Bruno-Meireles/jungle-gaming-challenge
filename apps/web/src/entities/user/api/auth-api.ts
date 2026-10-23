import {
  authResponseSchema,
  sessionResponseSchema,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
  type SessionResponse,
} from '../../../shared/api/contracts/auth';
import { getJson, httpClient, sendJson, type HttpClient } from '../../../shared/api/http-client';

export function login(body: LoginRequest, client: HttpClient = httpClient): Promise<AuthResponse> {
  return sendJson(client, { method: 'post', path: '/auth/login', body, schema: authResponseSchema });
}

export function register(body: RegisterRequest, client: HttpClient = httpClient): Promise<AuthResponse> {
  return sendJson(client, { method: 'post', path: '/auth/register', body, schema: authResponseSchema });
}

/** 200 `{user:null}` sem token; 401 `session_invalid` com token invalido ou expirado. */
export function fetchSession(signal?: AbortSignal, client: HttpClient = httpClient): Promise<SessionResponse> {
  return getJson(client, { path: '/auth/session', schema: sessionResponseSchema, signal });
}

export function logout(client: HttpClient = httpClient): Promise<undefined> {
  return sendJson(client, { method: 'post', path: '/auth/logout' });
}
