import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { authResponseSchema } from '../shared/api/contracts/auth';
import {
  cartDtoSchema,
  favoritesDtoSchema,
  GUEST_CART_HEADER,
  IDEMPOTENCY_KEY_HEADER,
  orderDtoSchema,
  quoteDtoSchema,
} from '../shared/api/contracts/commerce';
import { nftDetailDtoSchema } from '../shared/api/contracts/nfts';
import { createHandlers } from './handlers';
import { resetMockState } from './reset';
import { SCENARIO_STORAGE_KEY } from './scenario';

const base = 'http://localhost/api';
const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };
const BRUNO = { email: 'bruno@example.test', password: 'JungleDemo-Bruno-2026!' };
const server = setupServer();

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => void values.set(key, value),
    removeItem: (key: string) => void values.delete(key),
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  vi.stubGlobal('localStorage', memoryStorage());
  resetMockState();
  server.use(...createHandlers());
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

async function loginAs(
  credentials: typeof ANA | typeof BRUNO,
  guestId?: string,
): Promise<{ Authorization: string }> {
  const response = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(guestId ? { [GUEST_CART_HEADER]: guestId } : {}),
    },
    body: JSON.stringify(credentials),
  });
  expect(response.status).toBe(200);
  const auth = authResponseSchema.parse(await response.json());
  return { Authorization: `Bearer ${auth.token}` };
}

async function addEmeraldToCart(headers: Record<string, string> = {}) {
  const response = await fetch(`${base}/cart/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify({ nftId: 'emerald-ape-042', editionId: '1-50', quantity: 1 }),
  });
  expect(response.status).toBe(200);
  return cartDtoSchema.parse(await response.json());
}

async function prepareBrunoOrder() {
  const headers = await loginAs(BRUNO);
  const cart = await addEmeraldToCart(headers);
  const quoteResponse = await fetch(`${base}/cart/quote?networkId=ethereum`, { headers });
  expect(quoteResponse.status).toBe(200);
  const quote = quoteDtoSchema.parse(await quoteResponse.json());
  return {
    headers,
    body: {
      quoteHash: quote.quoteHash,
      networkId: 'ethereum',
      walletId: 'wallet-bruno-primary',
      collector: {
        displayName: 'Bruno Meireles',
        email: BRUNO.email,
        username: 'bruno',
        profileName: 'Bruno',
        referralCode: 'JUNGLE',
        ensName: 'bruno.eth',
      },
      lines: cart.lines.map(({ lineId, quantity }) => ({ lineId, quantity })),
    },
  };
}

function postOrder(headers: Record<string, string>, key: string, body: object) {
  return fetch(`${base}/orders`, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      [IDEMPOTENCY_KEY_HEADER]: key,
    },
    body: JSON.stringify(body),
  });
}

describe('commerce API (MSW)', () => {
  it('rejeita a mesma chave de idempotencia com conteudo diferente', async () => {
    const { headers, body } = await prepareBrunoOrder();
    const first = await postOrder(headers, 'order-key-conflict', body);
    expect(first.status).toBe(201);

    const changedBody = {
      ...body,
      collector: { ...body.collector, note: 'Conteudo diferente' },
    };
    const conflict = await postOrder(headers, 'order-key-conflict', changedBody);

    expect(conflict.status).toBe(409);
    expect(await conflict.json()).toEqual({ code: 'idempotency_conflict' });
  });

  it('reproduz o mesmo pedido para a mesma chave e o mesmo conteudo', async () => {
    const { headers, body } = await prepareBrunoOrder();
    const first = await postOrder(headers, 'order-key-replay', body);
    const original = orderDtoSchema.parse(await first.json());
    const replay = await postOrder(headers, 'order-key-replay', body);
    const repeated = orderDtoSchema.parse(await replay.json());

    expect(first.status).toBe(201);
    expect(replay.status).toBe(200);
    expect(repeated).toEqual(original);
  });

  it('responde quote_changed quando o mercado muda durante a confirmacao', async () => {
    const { headers, body } = await prepareBrunoOrder();
    localStorage.setItem(SCENARIO_STORAGE_KEY, 'quote-changed-on-confirm');

    const response = await postOrder(headers, 'order-key-quote-change', body);

    expect(response.status).toBe(409);
    expect(await response.json()).toEqual({ code: 'quote_changed' });
  });

  it('devolve 422 para cupom invalido e expirado', async () => {
    const invalid = await fetch(`${base}/cart/coupon`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'NOT-A-COUPON' }),
    });
    const expired = await fetch(`${base}/cart/coupon`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'EXPIRED2025' }),
    });

    expect(invalid.status).toBe(422);
    expect(await invalid.json()).toEqual({ code: 'coupon_invalid' });
    expect(expired.status).toBe(422);
    expect(await expired.json()).toEqual({ code: 'coupon_expired' });
  });

  it('mescla o carrinho de visitante no login sem manter o carrinho visitante', async () => {
    const guestId = 'guest-cart-merge-test';
    const guestHeaders = { [GUEST_CART_HEADER]: guestId };
    localStorage.setItem(SCENARIO_STORAGE_KEY, 'cart-seeded');
    const guestBeforeResponse = await fetch(`${base}/cart`, { headers: guestHeaders });
    const guestBefore = cartDtoSchema.parse(await guestBeforeResponse.json());

    const userHeaders = await loginAs(ANA, guestId);
    localStorage.removeItem(SCENARIO_STORAGE_KEY);
    const mergedResponse = await fetch(`${base}/cart`, { headers: userHeaders });
    const merged = cartDtoSchema.parse(await mergedResponse.json());
    const guestAfterResponse = await fetch(`${base}/cart`, { headers: guestHeaders });
    const guestAfter = cartDtoSchema.parse(await guestAfterResponse.json());

    expect(guestBefore.itemCount).toBeGreaterThan(0);
    expect(merged.lines.find((line) => line.nftId === 'emerald-ape-042')?.quantity).toBe(3);
    expect(merged.lines.find((line) => line.nftId === 'violet-nomad-314')?.quantity).toBe(7);
    expect(guestAfter.lines).toEqual([]);
  });

  it('isola favoritos entre usuarios', async () => {
    const anaHeaders = await loginAs(ANA);
    const brunoHeaders = await loginAs(BRUNO);
    const added = await fetch(`${base}/favorites/emerald-ape-042`, {
      method: 'PUT',
      headers: anaHeaders,
    });
    const anaResponse = await fetch(`${base}/favorites`, { headers: anaHeaders });
    const brunoResponse = await fetch(`${base}/favorites`, { headers: brunoHeaders });

    expect(added.status).toBe(204);
    expect(favoritesDtoSchema.parse(await anaResponse.json()).nftIds).toContain('emerald-ape-042');
    expect(favoritesDtoSchema.parse(await brunoResponse.json()).nftIds).toEqual([]);
  });

  it('devolve 404 para NFT ausente e expoe uma edicao esgotada', async () => {
    const missing = await fetch(`${base}/nfts/nft-that-does-not-exist`);
    expect(missing.status).toBe(404);
    expect(await missing.json()).toEqual({ code: 'not_found' });

    localStorage.setItem(SCENARIO_STORAGE_KEY, 'cart-sold-out');
    const quote = await fetch(`${base}/cart/quote?networkId=ethereum`);
    expect(quote.status).toBe(200);
    const detailResponse = await fetch(`${base}/nfts/emerald-ape-042`);
    const detail = nftDetailDtoSchema.parse(await detailResponse.json());

    expect(detail.editions.find((edition) => edition.id === '1-50')?.remaining).toBe(0);
  });

  it('rejeita quantidade acima do maximo da edicao com availability_conflict', async () => {
    const cart = await addEmeraldToCart();
    const line = cart.lines[0];
    if (!line) throw new Error('Expected the cart to contain the added NFT');
    const response = await fetch(`${base}/cart/items/${encodeURIComponent(line.lineId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: line.maxQuantity + 1 }),
    });

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({ code: 'availability_conflict' });
  });

  it('persiste a quantidade alterada por PATCH', async () => {
    const cart = await addEmeraldToCart();
    const line = cart.lines[0];
    if (!line) throw new Error('Expected the cart to contain the added NFT');
    const response = await fetch(`${base}/cart/items/${encodeURIComponent(line.lineId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity: 3 }),
    });
    expect(response.status).toBe(200);
    expect(cartDtoSchema.parse(await response.json()).lines[0]?.quantity).toBe(3);

    const persistedResponse = await fetch(`${base}/cart`);
    const persisted = cartDtoSchema.parse(await persistedResponse.json());

    expect(persisted.lines[0]?.quantity).toBe(3);
  });
});
