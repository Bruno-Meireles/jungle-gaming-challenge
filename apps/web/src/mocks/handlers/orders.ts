import { HttpResponse, http } from 'msw';

import { IDEMPOTENCY_KEY_HEADER, createOrderRequestSchema } from '../../shared/api/contracts/commerce';
import { sessionInvalid } from '../auth/guard';
import { readCommerce, updateCommerce } from '../commerce/commerce-state';
import { createOrder, listOrders, readOrder } from '../commerce/order-store';
import { activeScenario } from '../commerce/scenario';
import { commerceLatency, invalid, notFound, requireUser, unavailable } from './commerce-http';

/** Cenario que consome uma falha uma unica vez (contador persistido, reiniciado pelo reset). */
function firstTime(flag: string): boolean {
  if ((readCommerce().counters[flag] ?? 0) > 0) return false;
  updateCommerce((s) => void (s.counters[flag] = 1));
  return true;
}

export const orderHandlers = [
  http.post('*/api/orders', async ({ request }) => {
    await commerceLatency();
    const user = requireUser(request);
    if (user instanceof Response) return user;
    if (activeScenario() === 'checkout-session-expired' && firstTime('session-expired')) return sessionInvalid();
    const key = request.headers.get(IDEMPOTENCY_KEY_HEADER);
    const body = createOrderRequestSchema.safeParse(await request.json().catch(() => null));
    if (!key || !body.success) return invalid();
    const outcome = createOrder(user, key, body.data);
    if (outcome.kind === 'error') return HttpResponse.json({ code: outcome.code }, { status: 409 });
    if (outcome.kind === 'created' && activeScenario() === 'order-timeout') {
      return HttpResponse.error();
    }
    return HttpResponse.json(outcome.order, { status: outcome.kind === 'created' ? 201 : 200 });
  }),

  http.get('*/api/orders', async ({ request }) => {
    await commerceLatency();
    const user = requireUser(request);
    if (user instanceof Response) return user;
    return HttpResponse.json({ orders: listOrders(user.id) });
  }),

  http.get('*/api/orders/:orderId', async ({ request, params }) => {
    await commerceLatency();
    const user = requireUser(request);
    if (user instanceof Response) return user;
    if (activeScenario() === 'orders-error') return unavailable();
    const order = readOrder(user.id, String(params.orderId));
    return order ? HttpResponse.json(order) : notFound();
  }),
];
