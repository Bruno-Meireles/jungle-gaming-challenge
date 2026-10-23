import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { cartKeys } from '../../../entities/cart';
import { orderKeys } from '../../../entities/order';
import { authenticated, readToken, sessionKeys, writeToken } from '../../../entities/session';
import { registerPrivateTeardown } from '../../../shared/lib/private-state/teardown';
import { logout } from './logout';

let store: Map<string, string>;
beforeEach(() => {
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal('sessionStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  });
});
afterEach(() => vi.unstubAllGlobals());

function seed() {
  const queryClient = new QueryClient();
  writeToken('token-1');
  queryClient.setQueryData(sessionKeys.current(), authenticated({ id: 'u1', displayName: 'Ana', username: 'ana', email: 'ana@example.test', avatarUrl: null }));
  queryClient.setQueryData(cartKeys.current(), { lines: [] });
  queryClient.setQueryData(orderKeys.detail('o1'), { id: 'o1' });
  return queryClient;
}

describe('logout', () => {
  it('apaga token, cache privado, sessao e executa teardowns (subscriptions)', async () => {
    const queryClient = seed();
    const teardown = vi.fn();
    registerPrivateTeardown(teardown);
    await logout(queryClient, () => Promise.resolve());
    expect(readToken()).toBeNull();
    expect(queryClient.getQueryData(cartKeys.current())).toBeUndefined();
    expect(queryClient.getQueryData(orderKeys.detail('o1'))).toBeUndefined();
    expect(queryClient.getQueryData(sessionKeys.current())).toEqual({ status: 'anonymous' });
    expect(teardown).toHaveBeenCalledOnce();
  });

  it('sai localmente mesmo se o servidor falhar', async () => {
    const queryClient = seed();
    await logout(queryClient, () => Promise.reject(new Error('rede')));
    expect(readToken()).toBeNull();
    expect(queryClient.getQueryData(sessionKeys.current())).toEqual({ status: 'anonymous' });
  });
});
