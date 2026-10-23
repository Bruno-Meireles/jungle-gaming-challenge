import {
  authResponseSchema,
  type AuthResponse,
  type LoginRequest,
  type RegisterRequest,
} from '../../../shared/api/contracts/auth';
import { GUEST_CART_HEADER } from '../../../shared/api/contracts/commerce';
import { httpClient, sendJson, type HttpClient } from '../../../shared/api/http-client';
import { getGuestId } from '../../../shared/lib/viewer/guest-id';

// O servidor une o carrinho do visitante ao do usuario no login/cadastro.
const guestHeaders = () => ({ [GUEST_CART_HEADER]: getGuestId() });

export function login(body: LoginRequest, client: HttpClient = httpClient): Promise<AuthResponse> {
  return sendJson(client, { method: 'post', path: '/auth/login', body, headers: guestHeaders(), schema: authResponseSchema });
}

export function register(body: RegisterRequest, client: HttpClient = httpClient): Promise<AuthResponse> {
  return sendJson(client, { method: 'post', path: '/auth/register', body, headers: guestHeaders(), schema: authResponseSchema });
}

export function logout(client: HttpClient = httpClient): Promise<undefined> {
  return sendJson(client, { method: 'post', path: '/auth/logout' });
}
