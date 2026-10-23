import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { authResponseSchema } from '../shared/api/contracts/auth';
import {
  cartDtoSchema,
  IDEMPOTENCY_KEY_HEADER,
  orderDtoSchema,
  quoteDtoSchema,
} from '../shared/api/contracts/commerce';
import { catalogPageDtoSchema, nftDetailDtoSchema } from '../shared/api/contracts/nfts';
import { createHandlers } from './handlers';
import { resetMockState } from './reset';
import { SCENARIO_STORAGE_KEY } from './scenario';

const base = 'http://localhost/api';
const BRUNO = { email: 'bruno@example.test', password: 'JungleDemo-Bruno-2026!' };
const server = setupServer();
let storage = new Map<string, string>();

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  storage = new Map();
  vi.stubGlobal('location', { href: 'http://localhost/', origin: 'http://localhost' });
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  });
  resetMockState();
  server.use(...createHandlers());
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

const useScenario = (id: string) => storage.set(SCENARIO_STORAGE_KEY, id);
const json = (body: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

async function catalog(query = '') {
  const response = await fetch(`${base}/nfts${query}`);
  expect(response.status).toBe(200);
  return catalogPageDtoSchema.parse(await response.json());
}

describe('GET /api/nfts (catalogo)', () => {
  it('pagina de 9 em 9 sem repetir itens entre paginas e com contagens coerentes', async () => {
    const first = await catalog();
    expect(first.pageSize).toBe(9);
    expect(first.page).toBe(1);
    expect(first.totalPages).toBe(Math.ceil(first.totalItems / 9));
    expect(first.totalPages).toBeGreaterThan(1);

    const ids = new Set(first.items.map((nft) => nft.id));
    for (let page = 2; page <= first.totalPages; page += 1) {
      const next = await catalog(`?page=${page}`);
      expect(next.items.length).toBeLessThanOrEqual(9);
      for (const nft of next.items) {
        expect(ids.has(nft.id)).toBe(false);
        ids.add(nft.id);
      }
    }
    expect(ids.size).toBe(first.totalItems);
  });

  it('ordena por preco crescente e decrescente', async () => {
    const asc = (await catalog('?sort=price-asc')).items.map((nft) => Number(nft.priceEth));
    const desc = (await catalog('?sort=price-desc')).items.map((nft) => Number(nft.priceEth));

    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it('combina colecao, faixa de preco e busca como interseccao', async () => {
    const all = await catalog();
    const collection = all.facets.collections.find((facet) => facet.count > 0)!.id;
    const inCollection = await catalog(`?collections=${collection}`);
    expect(inCollection.totalItems).toBeGreaterThan(0);
    expect(inCollection.items.every((nft) => nft.collectionId === collection)).toBe(true);

    const cheapest = Math.min(...inCollection.items.map((nft) => Number(nft.priceEth)));
    const combined = await catalog(`?collections=${collection}&maxPriceEth=${cheapest}&sort=price-asc`);
    expect(combined.items.length).toBeGreaterThan(0);
    expect(combined.items.every((nft) => nft.collectionId === collection && Number(nft.priceEth) <= cheapest)).toBe(true);

    const term = inCollection.items[0]!.title.split(' ')[0]!.toLowerCase();
    const searched = await catalog(`?collections=${collection}&search=${term}`);
    expect(searched.items.length).toBeGreaterThan(0);
    expect(searched.items.every((nft) => nft.title.toLowerCase().includes(term) || nft.collectionId.includes(term))).toBe(true);
  });

  it('ignora parametros invalidos em vez de falhar', async () => {
    const page = await catalog('?sort=nope&view=nope&page=-4&minPriceEth=abc&collections=nope');

    expect(page.page).toBe(1);
    expect(page.totalItems).toBeGreaterThan(0);
  });

  it('cenario catalog-empty devolve lista vazia e catalog-error devolve 503', async () => {
    useScenario('catalog-empty');
    expect((await catalog()).totalItems).toBe(0);

    useScenario('catalog-error');
    expect((await fetch(`${base}/nfts`)).status).toBe(503);
  });

  it('cenario catalog-flaky falha as 2 primeiras requisicoes e depois responde', async () => {
    useScenario('catalog-flaky');

    expect((await fetch(`${base}/nfts`)).status).toBe(503);
    expect((await fetch(`${base}/nfts`)).status).toBe(503);
    expect((await fetch(`${base}/nfts`)).status).toBe(200);
  });
});

describe('POST /api/__mock/nft (controle do mercado)', () => {
  it('altera preco e estoque, refletindo no catalogo e no detalhe, e devolve a versao', async () => {
    const response = await fetch(
      `${base}/__mock/nft`,
      json({ nftId: 'emerald-ape-042', editionId: '1-50', priceEth: '3.5', remaining: 7 }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ version: 1 });

    const listed = (await catalog()).items.find((nft) => nft.id === 'emerald-ape-042');
    expect(listed?.priceEth).toBe('3.5');
    const detail = nftDetailDtoSchema.parse(await (await fetch(`${base}/nfts/emerald-ape-042`)).json());
    expect(detail.editions.find((edition) => edition.id === '1-50')).toMatchObject({ priceEth: '3.5', remaining: 7 });
  });

  it('a versao cresce a cada alteracao', async () => {
    const patch = (priceEth: string) =>
      fetch(`${base}/__mock/nft`, json({ nftId: 'emerald-ape-042', editionId: '1-50', priceEth })).then((r) => r.json());

    expect(await patch('2.0')).toEqual({ version: 1 });
    expect(await patch('2.1')).toEqual({ version: 2 });
  });

  it('rejeita corpo invalido (400) e edicao inexistente (404)', async () => {
    expect((await fetch(`${base}/__mock/nft`, json({ nftId: 1 }))).status).toBe(400);
    expect((await fetch(`${base}/__mock/nft`, json({ nftId: 'emerald-ape-042', editionId: 'x', priceEth: '1' }))).status).toBe(404);
  });
});

async function bruno() {
  const login = await fetch(`${base}/auth/login`, json(BRUNO));
  const auth = authResponseSchema.parse(await login.json());
  return { Authorization: ['Bearer', auth.token].join(' ') };
}

async function prepareOrder() {
  const headers = await bruno();
  const added = await fetch(`${base}/cart/items`, {
    ...json({ nftId: 'emerald-ape-042', editionId: '1-50', quantity: 1 }),
    headers: { ...headers, 'Content-Type': 'application/json' },
  });
  const cart = cartDtoSchema.parse(await added.json());
  const quote = quoteDtoSchema.parse(await (await fetch(`${base}/cart/quote?networkId=ethereum`, { headers })).json());
  const body = {
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
  };
  const place = (key = 'key-1') =>
    fetch(`${base}/orders`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json', [IDEMPOTENCY_KEY_HEADER]: key },
      body: JSON.stringify(body),
    });
  const read = async (id: string) => orderDtoSchema.parse(await (await fetch(`${base}/orders/${id}`, { headers })).json());
  return { headers, place, read };
}

describe('POST /api/orders e controles de pedido', () => {
  it('cria pedido pendente (201) e o liquida como confirmado nas leituras seguintes', async () => {
    const { place, read } = await prepareOrder();

    const created = await place();
    expect(created.status).toBe(201);
    const order = orderDtoSchema.parse(await created.json());
    expect(order.status).toBe('pending');

    const seen = [(await read(order.id)).status, (await read(order.id)).status, (await read(order.id)).status];
    expect(seen).toContain('confirmed');
    expect(seen[seen.length - 1]).toBe('confirmed');
  });

  it('exige Idempotency-Key e corpo valido (400)', async () => {
    const headers = await bruno();

    const noKey = await fetch(`${base}/orders`, { ...json({}), headers: { ...headers, 'Content-Type': 'application/json' } });
    const noBody = await fetch(`${base}/orders`, {
      method: 'POST',
      headers: { ...headers, [IDEMPOTENCY_KEY_HEADER]: 'k' },
      body: 'nao-json',
    });

    expect(noKey.status).toBe(400);
    expect(noBody.status).toBe(400);
  });

  it('sem sessao responde 401 em criar e listar', async () => {
    expect((await fetch(`${base}/orders`, json({}))).status).toBe(401);
    expect((await fetch(`${base}/orders`)).status).toBe(401);
  });

  it('lista somente os pedidos do usuario autenticado', async () => {
    const { headers, place } = await prepareOrder();
    const created = orderDtoSchema.parse(await (await place()).json());

    const listed = (await (await fetch(`${base}/orders`, { headers })).json()) as { orders: { id: string }[] };

    expect(listed.orders.map((order) => order.id)).toContain(created.id);
    expect(listed.orders.every((order) => order.id.startsWith('ord-bruno') || order.id === created.id)).toBe(true);
  });

  it('cenario order-pending nunca liquida sozinho; o controle liquida como confirmado', async () => {
    useScenario('order-pending');
    const { place, read } = await prepareOrder();
    const order = orderDtoSchema.parse(await (await place()).json());

    for (let i = 0; i < 4; i += 1) expect((await read(order.id)).status).toBe('pending');

    const settled = orderDtoSchema.parse(
      await (await fetch(`${base}/__mock/order`, json({ orderId: order.id, status: 'confirmed' }))).json(),
    );
    expect(settled).toMatchObject({ status: 'confirmed', version: 2 });
    expect(settled.transactionRef).toMatch(/^0x/);
    expect(settled.explorerUrl).not.toBeNull();
  });

  it('cenario order-refused liquida como recusado sem referencia de transacao', async () => {
    useScenario('order-refused');
    const { place, read } = await prepareOrder();
    const order = orderDtoSchema.parse(await (await place()).json());

    await read(order.id);
    const final = await read(order.id);

    expect(final).toMatchObject({ status: 'refused', refusalReason: 'payment_declined', transactionRef: null });
  });

  it('pedido liquidado e terminal: nova liquidacao nao o altera', async () => {
    useScenario('order-pending');
    const { place } = await prepareOrder();
    const order = orderDtoSchema.parse(await (await place()).json());
    const settle = (status: string) =>
      fetch(`${base}/__mock/order`, json({ orderId: order.id, status })).then((r) => r.json());

    const first = orderDtoSchema.parse(await settle('confirmed'));
    const second = orderDtoSchema.parse(await settle('refused'));

    expect(second).toEqual(first);
  });

  it('cenario checkout-session-expired responde 401 session_invalid so na primeira tentativa', async () => {
    useScenario('checkout-session-expired');
    const { place } = await prepareOrder();

    const first = await place();
    expect(first.status).toBe(401);
    expect(await first.json()).toEqual({ code: 'session_invalid' });
    expect((await place()).status).toBe(201);
  });

  it('cenario order-timeout derruba a resposta mas o pedido existe e a mesma chave o reproduz', async () => {
    useScenario('order-timeout');
    const { place } = await prepareOrder();

    await expect(place()).rejects.toThrow();
    const replay = await place();

    expect(replay.status).toBe(200);
    expect(orderDtoSchema.parse(await replay.json()).status).toBe('pending');
  });

  it('confirmacao baixa o estoque e esvazia as linhas compradas do carrinho', async () => {
    useScenario('order-pending');
    const { headers, place } = await prepareOrder();
    const before = nftDetailDtoSchema.parse(await (await fetch(`${base}/nfts/emerald-ape-042`)).json());
    const order = orderDtoSchema.parse(await (await place()).json());

    await fetch(`${base}/__mock/order`, json({ orderId: order.id, status: 'confirmed' }));

    const after = nftDetailDtoSchema.parse(await (await fetch(`${base}/nfts/emerald-ape-042`)).json());
    const remaining = (detail: typeof before) => detail.editions.find((e) => e.id === '1-50')!.remaining;
    expect(remaining(after)).toBe(remaining(before) - 1);
    const cart = cartDtoSchema.parse(await (await fetch(`${base}/cart`, { headers })).json());
    expect(cart.lines).toHaveLength(0);
  });

  it('controle de pedido rejeita corpo invalido (400) e pedido desconhecido (404)', async () => {
    expect((await fetch(`${base}/__mock/order`, json({ orderId: 'x', status: 'pending' }))).status).toBe(400);
    expect((await fetch(`${base}/__mock/order`, json({ orderId: 'nao-existe', status: 'confirmed' }))).status).toBe(404);
  });
});
