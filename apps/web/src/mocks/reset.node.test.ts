import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { readState, updateState } from './state';
import { resetMockState } from './reset';

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
});
afterEach(() => vi.unstubAllGlobals());

describe('resetMockState', () => {
  it('descarta alteracoes e restaura o seed (usuarios fictícios)', () => {
    updateState((s) => void (s.sessions = [{ token: 't', userId: 'x', expiresAt: Date.now() + 1000 }]));
    expect(readState().sessions.length).toBe(1);
    resetMockState();
    expect(readState().sessions).toEqual([]);
    expect(readState().users.length).toBeGreaterThan(0);
  });
});
