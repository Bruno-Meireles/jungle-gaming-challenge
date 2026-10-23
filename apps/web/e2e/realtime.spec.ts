import { expect, test, type Page, type Request } from '@playwright/test';

const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };
const NFT_ID = 'emerald-ape-042';
const EDITION_ID = '1-50';
type TrackedSocket = { url: string; closed: boolean; messages: string[]; close: () => void };
type TrackedRealtimeWindow = Window & { __trackedRealtimeSockets?: TrackedSocket[] };

async function startScenario(page: Page, scenario = 'default') {
  await page.goto(`/login?mockReset=1&mockScenario=${scenario}`, { waitUntil: 'domcontentloaded' });
  await expect
    .poll(() => page.evaluate(() => location.search))
    .toBe('');
}

async function login(page: Page) {
  await page.getByLabel('E-mail', { exact: true }).fill(ANA.email);
  await page.getByLabel('Senha', { exact: true }).fill(ANA.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page).toHaveURL(/\/$/);
}

async function trackRealtimeSocketLifecycle(page: Page) {
  await page.addInitScript(() => {
    const trackedSockets: TrackedSocket[] = [];
    Object.defineProperty(window, '__trackedRealtimeSockets', { value: trackedSockets });
    const trackedBySocket = new WeakMap<EventTarget, TrackedSocket>();
    const dispatchEvent = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function (this: EventTarget, event: Event) {
      const socket = this as WebSocket;
      let tracked = trackedBySocket.get(this);
      if (
        !tracked &&
        (event.type === 'open' || event.type === 'message') &&
        socket.url?.includes('realtime.jungle.test')
      ) {
        tracked = { url: socket.url, closed: false, messages: [], close: () => socket.close() };
        trackedBySocket.set(this, tracked);
        trackedSockets.push(tracked);
      }
      if (tracked && event.type === 'message') {
        tracked.messages.push(String((event as MessageEvent).data));
      }
      if (tracked && event.type === 'close') {
        tracked.closed = true;
      }
      return dispatchEvent.call(this, event);
    };
  });
}

async function interruptRealtimeSocket(page: Page) {
  const interrupted = await page.evaluate(() => {
    const sockets = (window as TrackedRealtimeWindow).__trackedRealtimeSockets;
    const socket = sockets?.find((candidate) => !candidate.closed);
    if (!socket) return false;
    socket.close();
    return true;
  });
  expect(interrupted).toBe(true);
  await expect
    .poll(() =>
      page.evaluate(() => {
        const sockets = (window as TrackedRealtimeWindow).__trackedRealtimeSockets;
        return Boolean(sockets?.some((socket) => socket.closed));
      }),
    )
    .toBe(true);
}

async function waitForRealtimeSocket(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => {
          const sockets = (window as TrackedRealtimeWindow).__trackedRealtimeSockets;
          return Boolean(sockets?.some((socket) => socket.messages.some((message) => message.startsWith('40'))));
        },
      ),
    )
    .toBe(true);
}

async function expectRealtimeEventFrames(page: Page, eventId: string, count: number) {
  await expect
    .poll(() =>
      page.evaluate(
        ({ eventId }) => {
          const sockets = (window as TrackedRealtimeWindow).__trackedRealtimeSockets;
          return (
            sockets?.flatMap((socket) => socket.messages).filter((message) => message.includes(eventId))
              .length ?? 0
          );
        },
        { eventId },
      ),
    )
    .toBe(count);
}

async function mockNftPrice(page: Page, priceEth: string) {
  const status = await page.evaluate(
    async ({ nftId, editionId, priceEth }) =>
      (
        await fetch('/api/__mock/nft', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ nftId, editionId, priceEth }),
        })
      ).status,
    { nftId: NFT_ID, editionId: EDITION_ID, priceEth },
  );
  expect(status).toBe(200);
}

async function broadcastOrderEvent(
  page: Page,
  event: {
    eventId: string;
    version: number;
    orderId: string;
    userId: string;
    status: 'confirmed' | 'refused';
    transactionRef: string | null;
  },
) {
  const status = await page.evaluate(
    async ({ eventId, version, orderId, userId, status, transactionRef, nftId, editionId }) => {
      const response = await fetch('/api/__mock/nft', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          nftId,
          editionId,
          replayEvent: {
            eventId,
            version,
            occurredAt: new Date().toISOString(),
            type: 'order.updated',
            resource: { type: 'order', id: orderId },
            userId,
            data: { status, transactionRef },
          },
        }),
      });
      return { status: response.status, body: await response.text() };
    },
    { ...event, nftId: NFT_ID, editionId: EDITION_ID },
  );
  expect(status).toEqual({ status: 200, body: '{"accepted":true}' });
}

async function broadcastNftEvent(
  page: Page,
  event: { eventId: string; version: number; priceEth: string },
) {
  const status = await page.evaluate(
    async ({ eventId, version, priceEth, nftId, editionId }) =>
      {
        const response = await fetch('/api/__mock/nft', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            nftId,
            editionId,
            replayEvent: {
              eventId,
              version,
              occurredAt: new Date().toISOString(),
              type: 'nft.updated',
              resource: { type: 'nft', id: nftId },
              data: {
                priceEth,
                editions: [{ id: editionId, priceEth, remaining: 20 }],
              },
            },
          }),
        });
        return { status: response.status, body: await response.text() };
      },
    { ...event, nftId: NFT_ID, editionId: EDITION_ID },
  );
  expect(status).toEqual({ status: 200, body: '{"accepted":true}' });
}

function trackOrderPosts(page: Page): Request[] {
  const posts: Request[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && /\/api\/orders$/.test(request.url())) posts.push(request);
  });
  return posts;
}

async function prepareCheckout(page: Page) {
  await page.getByLabel('Nome do perfil').fill('Ana Collector');
  await page.getByLabel('Código de indicação').fill('JUNGLE2026');
  await page.getByLabel('Nome ENS').fill('ana-collector');
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByText('Carteira conectada').first()).toBeVisible();
}

async function completeCheckout(page: Page) {
  await prepareCheckout(page);
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page).toHaveURL(/\/orders\/[\w-]+$/);
}

test.describe('sincronização realtime (mocks MSW)', () => {
  test('reflete mudanças de preço com carrinho e checkout abertos', async ({ page }) => {
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page);
    await login(page);
    await waitForRealtimeSocket(page);
    await page.goto('/cart');

    const emeraldLine = page.getByRole('listitem').filter({ hasText: 'Emerald Ape #042' });
    await expect(emeraldLine).toContainText('1,19 ETH');
    await mockNftPrice(page, '2.50');
    await expect(emeraldLine).toContainText('2,50 ETH');

    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    const summary = page.getByRole('region', { name: 'Resumo do pedido' });
    await expect(summary).toContainText('5 ETH');

    await mockNftPrice(page, '2.75');
    await expect(summary).toContainText('5,5 ETH');
  });

  test('preco atualizado no checkout impede confirmacao com a cotacao antiga', async ({ page }) => {
    const posts = trackOrderPosts(page);
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page);
    await login(page);
    await waitForRealtimeSocket(page);
    await page.goto('/cart');
    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await prepareCheckout(page);

    await mockNftPrice(page, '2.50');
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page.getByText('A cotação mudou. Revise os valores e confirme novamente.')).toBeVisible();
    expect(posts).toHaveLength(0);

    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page).toHaveURL(/\/orders\/[\w-]+$/);
    expect(posts).toHaveLength(1);
  });

  test('atualiza o recibo pendente com order.updated sem esperar o polling', async ({ page }) => {
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page, 'order-pending');
    await login(page);
    await waitForRealtimeSocket(page);
    await page.goto('/cart');
    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await completeCheckout(page);
    await expect(page.getByText('Aguardando a confirmação do pagamento')).toBeVisible();

    const orderId = new URL(page.url()).pathname.split('/').at(-1);
    expect(orderId).toBeTruthy();
    const status = await page.evaluate(async (id) => {
      const response = await fetch('/api/__mock/order', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderId: id, status: 'confirmed' }),
      });
      return response.status;
    }, orderId);
    expect(status).toBe(200);
    await expect(page.getByText('Pagamento aprovado')).toBeVisible();
    await expect(page.getByText('ID da transação')).toBeVisible();
  });

  test('recupera o pedido pendente por REST apos interrupcao do socket e reload', async ({ page }) => {
    const posts = trackOrderPosts(page);
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page, 'order-pending');
    await login(page);
    await waitForRealtimeSocket(page);
    await page.goto('/cart');
    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await completeCheckout(page);
    await expect(page.getByText('Aguardando a confirmação do pagamento')).toBeVisible();

    const orderId = new URL(page.url()).pathname.split('/').at(-1);
    if (!orderId) throw new Error('Expected the checkout to create an order');
    await interruptRealtimeSocket(page);
    const countBeforeReload = await page.evaluate(async (id) => {
      const token = localStorage.getItem('jg.session.token');
      const response = await fetch('/api/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Orders request failed with ${response.status}`);
      const body = await response.json();
      return body.orders.filter((order: { id: string }) => order.id === id).length;
    }, orderId);
    expect(countBeforeReload).toBe(1);

    await page.reload();
    await expect(page).toHaveURL(new RegExp(`/orders/${orderId}$`));
    await expect(page.getByText('Aguardando a confirmação do pagamento')).toBeVisible();
    const countAfterReload = await page.evaluate(async (id) => {
      const token = localStorage.getItem('jg.session.token');
      const response = await fetch('/api/orders', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Orders request failed with ${response.status}`);
      const body = await response.json();
      return body.orders.filter((order: { id: string }) => order.id === id).length;
    }, orderId);

    expect(countAfterReload).toBe(1);
    expect(posts).toHaveLength(1);
  });

  test('ignora eventos duplicados e versões antigas do mesmo NFT', async ({ page }) => {
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page);
    await login(page);
    await waitForRealtimeSocket(page);
    await page.goto(`/nfts/${NFT_ID}`);

    await expect(page.getByText('1,19 ETH', { exact: true }).first()).toBeVisible();
    const currentPrice = page.getByText('1,60 ETH', { exact: true }).first();
    await broadcastNftEvent(page, {
      eventId: 'e2e-nft-v5',
      version: 5,
      priceEth: '1.60',
    });
    await expectRealtimeEventFrames(page, 'e2e-nft-v5', 1);
    await expect(currentPrice).toBeVisible();

    await broadcastNftEvent(page, {
      eventId: 'e2e-nft-v5',
      version: 6,
      priceEth: '2.10',
    });
    await expectRealtimeEventFrames(page, 'e2e-nft-v5', 2);
    await expect(currentPrice).toBeVisible();

    await broadcastNftEvent(page, {
      eventId: 'e2e-nft-v4',
      version: 4,
      priceEth: '1.30',
    });
    await expectRealtimeEventFrames(page, 'e2e-nft-v4', 1);
    await expect(currentPrice).toBeVisible();
  });

  test('nao aplica evento de pedido de outro usuario ao pedido atual', async ({ page }) => {
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page, 'order-pending');
    await login(page);
    await waitForRealtimeSocket(page);
    await page.goto('/cart');
    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await completeCheckout(page);
    await expect(page.getByText('Aguardando a confirmação do pagamento')).toBeVisible();

    const orderId = new URL(page.url()).pathname.split('/').at(-1);
    if (!orderId) throw new Error('Expected the checkout to create an order');
    await broadcastOrderEvent(page, {
      eventId: 'e2e-foreign-order-v2',
      version: 2,
      orderId,
      userId: 'user-bruno',
      status: 'confirmed',
      transactionRef: '0xforeign',
    });
    await expect(page.getByText('Aguardando a confirmação do pagamento')).toBeVisible();

    await broadcastOrderEvent(page, {
      eventId: 'e2e-owner-order-v2',
      version: 2,
      orderId,
      userId: 'user-ana',
      status: 'refused',
      transactionRef: null,
    });
    await expectRealtimeEventFrames(page, 'e2e-owner-order-v2', 1);
    await expectRealtimeEventFrames(page, 'e2e-foreign-order-v2', 0);
    await expect(page.getByText('Pagamento recusado')).toBeVisible();
  });

  test('logout fecha a conexão Socket.IO', async ({ page }) => {
    await trackRealtimeSocketLifecycle(page);
    await startScenario(page);
    await login(page);
    await waitForRealtimeSocket(page);
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => {
          const sockets = (window as TrackedRealtimeWindow).__trackedRealtimeSockets;
          return Boolean(sockets?.length && sockets.every((socket) => socket.closed));
        }),
      )
      .toBe(true);
  });
});
