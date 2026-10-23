import { createOrder, toPlaceOrderFailure } from '../api/checkout-api';
import type { PlaceOrderFailure, PlaceOrderInput, PlaceOrderResult } from './domain/order';
import { fingerprintOf } from './domain/order-status';

const KEY_PREFIX = 'jg.idempotency.';
const MAX_RETRIES = 2;

const inFlight = new Map<string, Promise<PlaceOrderResult>>();

/** Chave de idempotencia por conteudo do pedido, persistida em sessionStorage (sobrevive a refresh). */
export function idempotencyKeyFor(input: PlaceOrderInput): string {
  const storageKey = KEY_PREFIX + fingerprintOf(input);
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) return stored;
    const created = crypto.randomUUID();
    sessionStorage.setItem(storageKey, created);
    return created;
  } catch {
    return crypto.randomUUID();
  }
}

export function clearIdempotencyKeys(): void {
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith(KEY_PREFIX)) sessionStorage.removeItem(key);
    }
  } catch {
    // sem storage: nada a limpar
  }
}

async function attempt(input: PlaceOrderInput, onRecovering?: () => void): Promise<PlaceOrderResult> {
  const key = idempotencyKeyFor(input);
  let failure: PlaceOrderFailure = { kind: 'unexpected' };
  for (let tries = 0; tries <= MAX_RETRIES; tries += 1) {
    if (tries > 0) onRecovering?.();
    try {
      const order = await createOrder(input, key);
      return { ok: true, value: { orderId: order.id, status: order.status } };
    } catch (error) {
      failure = toPlaceOrderFailure(error);
      if (failure.kind !== 'network') break;
    }
  }
  return { ok: false, failure };
}

/** Cliques repetidos com o mesmo conteudo reutilizam a mesma chamada (e a mesma chave). */
export function placeOrder(input: PlaceOrderInput, onRecovering?: () => void): Promise<PlaceOrderResult> {
  const id = fingerprintOf(input);
  const running = inFlight.get(id);
  if (running) return running;
  const promise = attempt(input, onRecovering).finally(() => inFlight.delete(id));
  inFlight.set(id, promise);
  return promise;
}
