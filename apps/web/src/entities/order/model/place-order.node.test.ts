import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../../shared/api/api-error';
import type { Order, PlaceOrderInput } from './domain/order';

const createOrder = vi.hoisted(() => vi.fn());
vi.mock('../api/checkout-api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../api/checkout-api')>()),
  createOrder,
}));

import { clearIdempotencyKeys, idempotencyKeyFor, placeOrder } from './place-order';

const input = (quoteHash: string): PlaceOrderInput =>
  ({
    quoteHash,
    networkId: 'ethereum',
    walletId: 'w1',
    collector: {},
    lines: [{ lineId: 'l1', quantity: 1 }],
  }) as unknown as PlaceOrderInput;

const created = { id: 'order-1', status: 'pending' } as Order;
const networkError = () => new ApiError({ status: null, code: 'network_error', transient: true });

let uuid = 0;
beforeEach(() => {
  const store: Record<string, string> = {};
  vi.stubGlobal(
    'sessionStorage',
    Object.defineProperties(store, {
      getItem: { value: (k: string) => store[k] ?? null },
      setItem: { value: (k: string, v: string) => void (store[k] = v) },
      removeItem: { value: (k: string) => void delete store[k] },
    }),
  );
  vi.spyOn(crypto, 'randomUUID').mockImplementation(() => `key-${(uuid += 1)}` as `${string}-${string}-${string}-${string}-${string}`);
  createOrder.mockReset();
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('idempotencyKeyFor', () => {
  it('reusa a mesma chave para o mesmo conteudo e gera outra para conteudo diferente', () => {
    const first = idempotencyKeyFor(input('q1'));

    expect(idempotencyKeyFor(input('q1'))).toBe(first);
    expect(idempotencyKeyFor(input('q2'))).not.toBe(first);
  });

  it('gera nova chave depois de clearIdempotencyKeys (logout)', () => {
    const first = idempotencyKeyFor(input('q1'));

    clearIdempotencyKeys();

    expect(idempotencyKeyFor(input('q1'))).not.toBe(first);
  });
});

describe('placeOrder', () => {
  it('retorna o id e o status do pedido criado', async () => {
    createOrder.mockResolvedValue(created);

    await expect(placeOrder(input('q1'))).resolves.toEqual({
      ok: true,
      value: { orderId: 'order-1', status: 'pending' },
    });
  });

  it('repete com a MESMA Idempotency-Key apos falha de rede e avisa a recuperacao', async () => {
    createOrder.mockRejectedValueOnce(networkError()).mockResolvedValueOnce(created);
    const onRecovering = vi.fn();

    const result = await placeOrder(input('q1'), onRecovering);

    expect(result.ok).toBe(true);
    expect(createOrder).toHaveBeenCalledTimes(2);
    expect(createOrder.mock.calls[1]?.[1]).toBe(createOrder.mock.calls[0]?.[1]);
    expect(onRecovering).toHaveBeenCalledTimes(1);
  });

  it('desiste da rede depois de 3 tentativas (1 + 2 retries)', async () => {
    createOrder.mockRejectedValue(networkError());

    const result = await placeOrder(input('q1'));

    expect(result).toEqual({ ok: false, failure: { kind: 'network', retryable: true } });
    expect(createOrder).toHaveBeenCalledTimes(3);
  });

  it('nao repete erros de negocio (quote_changed)', async () => {
    createOrder.mockRejectedValue(new ApiError({ status: 409, code: 'quote_changed', transient: false }));

    const result = await placeOrder(input('q1'));

    expect(result).toEqual({ ok: false, failure: { kind: 'quote_changed' } });
    expect(createOrder).toHaveBeenCalledTimes(1);
  });

  it('cliques simultaneos com o mesmo conteudo compartilham uma unica chamada', async () => {
    let resolve!: (order: Order) => void;
    createOrder.mockReturnValue(new Promise<Order>((r) => (resolve = r)));

    const a = placeOrder(input('q1'));
    const b = placeOrder(input('q1'));
    resolve(created);

    expect(await a).toEqual(await b);
    expect(createOrder).toHaveBeenCalledTimes(1);
  });
});
