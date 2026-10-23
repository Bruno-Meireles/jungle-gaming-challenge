import { HttpResponse, http } from 'msw';

import {
  addCartItemRequestSchema,
  applyCouponRequestSchema,
  updateCartItemRequestSchema,
} from '../../shared/api/contracts/commerce';
import { NETWORK_IDS, type NetworkId } from '../../shared/api/contracts/ids';
import {
  addItem,
  applyCoupon,
  getCart,
  quoteFor,
  removeCoupon,
  removeItem,
  toCartDto,
  updateItem,
  type CartMutation,
} from '../commerce/cart-store';
import { updateCommerce } from '../commerce/commerce-state';
import { emitCommerceChange } from '../commerce/events';
import { liveEdition, setEdition } from '../commerce/market';
import { activeScenario } from '../commerce/scenario';
import { commerceLatency, invalid, notFound, resolveOwner, unavailable } from './commerce-http';

function mutationResponse(result: CartMutation): Response {
  if (result.ok) return HttpResponse.json(toCartDto(result.cart));
  if (result.error === 'not_found') return notFound();
  return HttpResponse.json({ code: 'availability_conflict', available: result.available ?? 0 }, { status: 409 });
}

/** Cenarios de quote que mudam o mercado na 2a cotacao (preco muda / edicao esgota). */
function applyQuoteScenario(): void {
  const scenario = activeScenario();
  if (scenario !== 'cart-price-changed' && scenario !== 'quote-sold-out' && scenario !== 'cart-sold-out') return;
  const count = updateCommerce((s) => (s.counters.quotes = (s.counters.quotes ?? 0) + 1));
  if (count !== 2 && scenario !== 'cart-sold-out') return;
  const edition = liveEdition('emerald-ape-042', '1-50');
  if (!edition) return;
  if (scenario === 'cart-price-changed') setEdition('emerald-ape-042', '1-50', { priceEth: '1.29' });
  else setEdition('emerald-ape-042', '1-50', { remaining: 0 });
  emitCommerceChange({ type: 'nft', nftId: 'emerald-ape-042' });
}

function networkOf(url: string): NetworkId | null {
  const raw = new URL(url).searchParams.get('networkId') ?? 'ethereum';
  return NETWORK_IDS.find((n) => n === raw) ?? null;
}

export const cartHandlers = [
  http.get('*/api/cart', async ({ request }) => {
    await commerceLatency();
    if (activeScenario() === 'cart-error') return unavailable();
    return HttpResponse.json(toCartDto(getCart(resolveOwner(request))));
  }),

  http.post('*/api/cart/items', async ({ request }) => {
    await commerceLatency();
    if (activeScenario() === 'cart-availability-conflict') {
      return HttpResponse.json({ code: 'availability_conflict', available: 0 }, { status: 409 });
    }
    const body = addCartItemRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid();
    return mutationResponse(addItem(resolveOwner(request), body.data));
  }),

  http.patch('*/api/cart/items/:lineId', async ({ request, params }) => {
    await commerceLatency();
    if (activeScenario() === 'cart-mutation-error') return unavailable();
    const body = updateCartItemRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid();
    return mutationResponse(updateItem(resolveOwner(request), String(params.lineId), body.data.quantity));
  }),

  http.delete('*/api/cart/items/:lineId', async ({ request, params }) => {
    await commerceLatency();
    if (activeScenario() === 'cart-mutation-error') return unavailable();
    return mutationResponse(removeItem(resolveOwner(request), String(params.lineId)));
  }),

  http.put('*/api/cart/coupon', async ({ request }) => {
    await commerceLatency();
    const body = applyCouponRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid();
    const result = applyCoupon(resolveOwner(request), body.data.code);
    if (!result.ok) return HttpResponse.json({ code: result.error }, { status: 422 });
    return HttpResponse.json(toCartDto(result.cart));
  }),

  http.delete('*/api/cart/coupon', async ({ request }) => {
    await commerceLatency();
    return HttpResponse.json(toCartDto(removeCoupon(resolveOwner(request))));
  }),

  http.get('*/api/cart/quote', async ({ request }) => {
    await commerceLatency();
    if (activeScenario() === 'quote-error') return unavailable();
    const networkId = networkOf(request.url);
    if (!networkId) return invalid();
    applyQuoteScenario();
    return HttpResponse.json(quoteFor(resolveOwner(request), networkId));
  }),
];
