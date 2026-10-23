import { QueryClient } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createHandlers } from '../../../mocks/handlers';
import { createHttpClient } from '../../../shared/api/http-client';
import { sessionKeys } from './session-keys';
import { sessionQueryOptions } from './session-query';
import { clearToken, readToken, writeToken } from './session-store';

const client = createHttpClient({ baseURL: 'http://localhost/api' });
const server = setupServer();
let store: Map<string, string>;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  server.use(...createHandlers());
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

async function tokenFor(email: string, password: string): Promise<string> {
  const res = await client.post<{ token: string }>('/auth/login', { email, password });
  return res.data.token;
}

describe('session-store', () => {
  it('persiste o token em localStorage jg.session.token e limpa', () => {
    expect(readToken()).toBeNull();
    writeToken('abc');
    expect(store.get('jg.session.token')).toBe('abc');
    expect(readToken()).toBe('abc');
    clearToken();
    expect(readToken()).toBeNull();
  });

  it('nao quebra quando o storage lanca', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('bloqueado');
      },
      setItem: () => {
        throw new Error('bloqueado');
      },
      removeItem: () => {
        throw new Error('bloqueado');
      },
    });
    expect(readToken()).toBeNull();
    expect(() => writeToken('x')).not.toThrow();
    expect(() => clearToken()).not.toThrow();
  });
});

describe('sessionKeys', () => {
  it('current e estavel', () => {
    expect(sessionKeys.current()).toEqual(sessionKeys.current());
    expect(sessionKeys.current()[0]).toBe('session');
  });
});

describe('sessionQueryOptions', () => {
  const run = () => new QueryClient().fetchQuery({ ...sessionQueryOptions(client), staleTime: 0 });

  it('sem token e anonima', async () => {
    await expect(run()).resolves.toEqual({ status: 'anonymous' });
  });

  it('token valido e autenticada com o usuario', async () => {
    writeToken(await tokenFor('ana@example.test', 'JungleDemo-Ana-2026!'));
    await expect(run()).resolves.toMatchObject({ status: 'authenticated', user: { username: 'ana' } });
  });

  it('401 session_invalid vira anonima e apaga o token', async () => {
    writeToken('token-expirado');
    await expect(run()).resolves.toEqual({ status: 'anonymous' });
    expect(readToken()).toBeNull();
  });

  it('200 {user:null} vira anonima e apaga o token', async () => {
    const { http, HttpResponse } = await import('msw');
    server.use(http.get('*/api/auth/session', () => HttpResponse.json({ user: null })));
    writeToken('qualquer');
    await expect(run()).resolves.toEqual({ status: 'anonymous' });
    expect(readToken()).toBeNull();
  });

  it('falha de rede NAO desloga: propaga o erro e mantem o token', async () => {
    const { http, HttpResponse } = await import('msw');
    server.use(http.get('*/api/auth/session', () => HttpResponse.error()));
    writeToken('mantido');
    await expect(run()).rejects.toMatchObject({ code: 'network_error' });
    expect(readToken()).toBe('mantido');
  });
});
