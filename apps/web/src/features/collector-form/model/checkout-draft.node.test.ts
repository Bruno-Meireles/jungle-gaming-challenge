import { describe, expect, it } from 'vitest';

import { createDraftStore } from './checkout-draft';

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
}

const draft = {
  values: { displayName: 'Ana', email: 'ana@example.com', username: 'ana', profileName: 'Ana C', referralCode: 'J10', ensName: 'ana', secondaryWalletOrEns: '', note: '' },
  walletId: 'w-1',
  networkId: 'ethereum',
};

describe('createDraftStore', () => {
  it('salva e carrega o rascunho do usuario', () => {
    const store = createDraftStore(memoryStorage());
    store.save('u1', draft);
    expect(store.load('u1')).toEqual(draft);
  });

  it('isola usuarios', () => {
    const store = createDraftStore(memoryStorage());
    store.save('u1', draft);
    expect(store.load('u2')).toBeNull();
  });

  it('usa chaves jg.checkout.* (limpas no logout)', () => {
    const storage = memoryStorage();
    createDraftStore(storage).save('u1', draft);
    expect([...storage.data.keys()].every((k) => k.startsWith('jg.checkout.'))).toBe(true);
    expect(storage.data.size).toBe(1);
  });

  it('ignora JSON invalido', () => {
    const storage = memoryStorage();
    const store = createDraftStore(storage);
    store.save('u1', draft);
    const [key] = [...storage.data.keys()];
    storage.data.set(key as string, '{nao-e-json');
    expect(store.load('u1')).toBeNull();
  });

  it('clear remove so o rascunho do usuario', () => {
    const store = createDraftStore(memoryStorage());
    store.save('u1', draft);
    store.save('u2', draft);
    store.clear('u1');
    expect(store.load('u1')).toBeNull();
    expect(store.load('u2')).toEqual(draft);
  });
});
