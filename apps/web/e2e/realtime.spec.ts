import { expect, test, type Page } from '@playwright/test';

const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };
const NFT_ID = 'emerald-ape-042';
const EDITION_ID = '1-50';

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
    type TrackedSocket = { url: string; closed: boolean; messages: string[] };
    const trackedSockets: TrackedSocket[] = [];
    Object.defineProperty(window, '__trackedRealtimeSockets', { value: trackedSockets });
    const trackedBySocket = new WeakMap<EventTarget, TrackedSocket>();
    const dispatchEvent = EventTarget.prototype.dispatchEvent;
    EventTarget.prototype.dispatchEvent = function (this: EventTarget, event: Event) {
      const socket = this as EventTarget & { url?: string };
      let tracked = trackedBySocket.get(this);
      if (
        !tracked &&
        (event.type === 'open' || event.type === 'message') &&
        socket.url?.includes('realtime.jungle.test')
      ) {
        tracked = { url: socket.url, closed: false, messages: [] };
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

async function waitForRealtimeSocket(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => {
          const sockets = (
            window as Window & {
              __trackedRealtimeSockets?: {
                url: string;
                closed: boolean;
                messages: string[];
              }[];
            }
          ).__trackedRealtimeSockets;
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
          const sockets = (
            window as Window & {
              __trackedRealtimeSockets?: {
                url: string;
                closed: boolean;
                messages: string[];
              }[];
            }
          ).__trackedRealtimeSockets;
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

async function completeCheckout(page: Page) {
  await page.getByLabel('Nome do perfil').fill('Ana Collector');
  await page.getByLabel('Código de indicação').fill('JUNGLE2026');
  await page.getByLabel('Nome ENS').fill('ana-collector');
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByText('Carteira conectada').first()).toBeVisible();
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
    await expect(emeraldLine).toContainText('O preço mudou');
    await expect(emeraldLine).toContainText('2,50 ETH');

    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    const summary = page.getByRole('region', { name: 'Resumo do pedido' });
    await expect(summary).toContainText('5 ETH');

    await mockNftPrice(page, '2.75');
    await expect(summary).toContainText('5,5 ETH');
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
          const sockets = (
            window as Window & {
              __trackedRealtimeSockets?: {
                url: string;
                closed: boolean;
                messages: string[];
              }[];
            }
          ).__trackedRealtimeSockets;
          return Boolean(sockets?.length && sockets.every((socket) => socket.closed));
        }),
      )
      .toBe(true);
  });
});
