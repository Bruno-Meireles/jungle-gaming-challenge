import {
  authResponseSchema,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from '../../../shared/api/contracts/auth';
import { httpClient, sendJson, type HttpClient } from '../../../shared/api/http-client';

export function login(body: LoginRequest, client: HttpClient = httpClient): Promise<AuthResponse> {
  return sendJson(client, { method: 'post', path: '/auth/login', body, schema: authResponseSchema });
}

export function register(body: RegisterRequest, client: HttpClient = httpClient): Promise<AuthResponse> {
  return sendJson(client, { method: 'post', path: '/auth/register', body, schema: authResponseSchema });
}

export function logout(client: HttpClient = httpClient): Promise<undefined> {
  return sendJson(client, { method: 'post', path: '/auth/logout' });
}
