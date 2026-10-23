import { QueryClient } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { favoritesKeys } from '../../entities/nft';
import { userKeys } from '../../entities/user';
import { clearPrivateData } from './private-session';

beforeEach(() => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    key: (i: number) => [...store.keys()][i] ?? null,
    get length() {
      return store.size;
    },
  };
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('sessionStorage', storage);
});
afterEach(() => vi.unstubAllGlobals());

describe('clearPrivateData', () => {
  it('remove raizes privadas (favoritos, usuario) e preserva as publicas', () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(favoritesKeys.list(), ['a']);
    queryClient.setQueryData(userKeys.wallets(), []);
    queryClient.setQueryData(['nft', 'catalog'], { items: [] });
    clearPrivateData(queryClient);
    expect(queryClient.getQueryData(favoritesKeys.list())).toBeUndefined();
    expect(queryClient.getQueryData(userKeys.wallets())).toBeUndefined();
    expect(queryClient.getQueryData(['nft', 'catalog'])).toEqual({ items: [] });
  });
});
