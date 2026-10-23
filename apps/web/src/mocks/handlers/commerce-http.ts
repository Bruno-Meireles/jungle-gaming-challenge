import { HttpResponse, delay } from 'msw';

import { GUEST_CART_HEADER } from '../../shared/api/contracts/commerce';
import { authenticate, sessionInvalid } from '../auth/guard';
import type { Owner } from '../commerce/cart-store';
import { activeScenario } from '../commerce/scenario';

export const COMMERCE_LATENCY_MS = 80;
const SLOW_MS = 1500;

export const unavailable = () => HttpResponse.json({ code: 'service_unavailable' }, { status: 503 });
export const notFound = () => HttpResponse.json({ code: 'not_found' }, { status: 404 });
export const invalid = () => HttpResponse.json({ code: 'validation_failed' }, { status: 400 });

/** Usuario autenticado, ou visitante pelo cabecalho X-Guest-Cart-Id (carrinho nao exige login). */
export function resolveOwner(request: Request): Owner {
  const auth = authenticate(request);
  if (auth) return { kind: 'user', id: auth.user.id };
  return { kind: 'guest', id: request.headers.get(GUEST_CART_HEADER) ?? 'anonymous' };
}

export function requireUser(request: Request): { id: string; username: string } | Response {
  const auth = authenticate(request);
  return auth ? { id: auth.user.id, username: auth.user.username } : sessionInvalid();
}

export async function commerceLatency(): Promise<void> {
  await delay(activeScenario() === 'cart-slow' ? SLOW_MS : COMMERCE_LATENCY_MS);
}
