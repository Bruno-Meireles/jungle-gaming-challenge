import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it } from 'vitest';

import { cartKeys, type Cart } from '../../entities/cart';
import { nftKeys, type CatalogPage, type NftDetail } from '../../entities/nft';
import { orderKeys, type Order } from '../../entities/order';
import type { NftUpdatedEvent, OrderUpdatedEvent } from '../../shared/api/contracts/realtime';
import { applyRealtimeEvent, reconcileRealtimeQueries } from './query-sync';

const asData = <T>(value: unknown): T => value as T;

const nftEvent = (overrides: Partial<NftUpdatedEvent['data']> = {}): NftUpdatedEvent => ({
  eventId: 'evt-1',
  version: 2,
  occurredAt: '2026-10-23T10:00:00.000Z',
  type: 'nft.updated',
  resource: { type: 'nft', id: 'nft-a' },
  data: {
    priceEth: '1.25',
    editions: [{ id: 'ed-1', priceEth: '1.25', remaining: 3 }],
    ...overrides,
  },
});

const orderEvent = (over: Partial<OrderUpdatedEvent> = {}): OrderUpdatedEvent => ({
  eventId: 'evt-o1',
  version: 2,
  occurredAt: '2026-10-23T10:05:00.000Z',
  type: 'order.updated',
  resource: { type: 'order', id: 'order-1' },
  userId: 'user-1',
  data: { status: 'confirmed', transactionRef: '0xabc' },
  ...over,
});

const newClient = () => new QueryClient({ defaultOptions: { queries: { retry: false } } });

describe('applyRealtimeEvent: nft.updated', () => {
  it('atualiza o preco da NFT em listagens e destaques sem mexer nas demais', () => {
    const client = newClient();
    const listKey = nftKeys.list('viewer', {} as never);
    client.setQueryData(
      listKey,
      asData<CatalogPage>({
        items: [
          { id: 'nft-a', price: '1.00' },
          { id: 'nft-b', price: '2.00' },
        ],
      }),
    );
    client.setQueryData(nftKeys.highlights('viewer'), {
      hero: [{ id: 'nft-a', price: '1.00' }],
      featured: { id: 'nft-b', price: '2.00' },
    });

    applyRealtimeEvent(client, 'user-1', nftEvent());

    const page = client.getQueryData<CatalogPage>(listKey)!;
    expect(page.items.map((nft) => nft.price)).toEqual(['1.25', '2.00']);
    const highlights = client.getQueryData<{ hero: { price: string }[]; featured: { price: string } }>(
      nftKeys.highlights('viewer'),
    )!;
    expect(highlights.hero[0]?.price).toBe('1.25');
    expect(highlights.featured.price).toBe('2.00');
  });

  it('atualiza preco e estoque apenas das edicoes citadas no detalhe', () => {
    const client = newClient();
    client.setQueryData(
      nftKeys.detail('nft-a'),
      asData<NftDetail>({
        id: 'nft-a',
        editions: [
          { id: 'ed-1', priceEth: '1.00', remaining: 10 },
          { id: 'ed-2', priceEth: '5.00', remaining: 4 },
        ],
      }),
    );

    applyRealtimeEvent(client, 'user-1', nftEvent());

    const detail = client.getQueryData<NftDetail>(nftKeys.detail('nft-a'))!;
    expect(detail.editions).toEqual([
      { id: 'ed-1', priceEth: '1.25', remaining: 3 },
      { id: 'ed-2', priceEth: '5.00', remaining: 4 },
    ]);
  });

  it('reflete o novo preco no carrinho aberto e invalida a cotacao', () => {
    const client = newClient();
    client.setQueryData(
      cartKeys.current(),
      asData<Cart>({
        lines: [
          { lineId: 'l1', nftId: 'nft-a', edition: { id: 'ed-1' }, unitPrice: '1.00', quantity: 2 },
          { lineId: 'l2', nftId: 'nft-b', edition: { id: 'ed-1' }, unitPrice: '9.00', quantity: 1 },
          { lineId: 'l3', nftId: 'nft-a', edition: { id: 'ed-9' }, unitPrice: '7.00', quantity: 1 },
        ],
      }),
    );
    client.setQueryData(cartKeys.quote('ethereum' as never), { quoteHash: 'q1', lines: [] });

    applyRealtimeEvent(client, 'user-1', nftEvent());

    const cart = client.getQueryData<Cart>(cartKeys.current())!;
    expect(cart.lines.map((line) => line.unitPrice)).toEqual(['1.25', '9.00', '7.00']);
    expect(client.getQueryState(cartKeys.quote('ethereum' as never))?.isInvalidated).toBe(true);
  });
});

describe('applyRealtimeEvent: order.updated', () => {
  const seed = (client: QueryClient, order: Partial<Order>) =>
    client.setQueryData(orderKeys.detail('order-1'), asData<Order>({ id: 'order-1', ...order }));

  it('promove pendente -> confirmado com versao, data e referencia da transacao', () => {
    const client = newClient();
    seed(client, { status: 'pending', version: 1, transactionRef: null, updatedAt: 'antes' });

    applyRealtimeEvent(client, 'user-1', orderEvent());

    expect(client.getQueryData<Order>(orderKeys.detail('order-1'))).toMatchObject({
      status: 'confirmed',
      version: 2,
      updatedAt: '2026-10-23T10:05:00.000Z',
      transactionRef: '0xabc',
    });
  });

  it.each([
    ['duplicado (mesma versao)', 2],
    ['antigo (versao menor que a conhecida)', 3],
  ])('ignora evento %s', (_label, knownVersion) => {
    const client = newClient();
    seed(client, { status: 'pending', version: knownVersion, transactionRef: null });

    applyRealtimeEvent(client, 'user-1', orderEvent());

    expect(client.getQueryData<Order>(orderKeys.detail('order-1'))).toMatchObject({
      status: 'pending',
      version: knownVersion,
    });
  });

  it('nao regride pedido terminal, mesmo com versao maior', () => {
    const client = newClient();
    seed(client, { status: 'refused', version: 1, transactionRef: null });

    applyRealtimeEvent(
      client,
      'user-1',
      orderEvent({ version: 5, data: { status: 'confirmed', transactionRef: '0xabc' } }),
    );

    expect(client.getQueryData<Order>(orderKeys.detail('order-1'))?.status).toBe('refused');
  });

  it('ignora evento de outro usuario', () => {
    const client = newClient();
    seed(client, { status: 'pending', version: 1, transactionRef: null });

    applyRealtimeEvent(client, 'user-2', orderEvent());

    const state = client.getQueryState(orderKeys.detail('order-1'));
    expect(client.getQueryData<Order>(orderKeys.detail('order-1'))?.status).toBe('pending');
    expect(state?.isInvalidated).toBe(false);
  });

  it('nao cria pedido desconhecido no cache', () => {
    const client = newClient();

    applyRealtimeEvent(client, 'user-1', orderEvent());

    expect(client.getQueryData(orderKeys.detail('order-1'))).toBeUndefined();
  });
});

describe('reconcileRealtimeQueries', () => {
  it('invalida catalogo, carrinho e pedidos apos reconexao', () => {
    const client = newClient();
    client.setQueryData(nftKeys.detail('nft-a'), {});
    client.setQueryData(cartKeys.current(), {});
    client.setQueryData(orderKeys.detail('order-1'), {});
    client.setQueryData(['account', 'profile'], {});

    reconcileRealtimeQueries(client);

    expect(client.getQueryState(nftKeys.detail('nft-a'))?.isInvalidated).toBe(true);
    expect(client.getQueryState(cartKeys.current())?.isInvalidated).toBe(true);
    expect(client.getQueryState(orderKeys.detail('order-1'))?.isInvalidated).toBe(true);
    expect(client.getQueryState(['account', 'profile'])?.isInvalidated).toBe(false);
  });
});
