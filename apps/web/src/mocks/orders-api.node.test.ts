import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { login } from '../entities/user/api/auth-api';
import { createHttpClient } from '../shared/api/http-client';
import { createHandlers } from './handlers';
import { resetMockState } from './reset';

const server = setupServer();
const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };
const BRUNO = { email: 'bruno@example.test', password: 'JungleDemo-Bruno-2026!' };

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  const map = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
  });
  resetMockState();
  server.use(...createHandlers());
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

const base = 'http://localhost/api';
const authed = async (credentials: typeof ANA) => {
  const client = createHttpClient({ baseURL: base });
  const { token } = await login(credentials, client);
  return { Authorization: `Bearer ${token}` };
};

describe('GET /api/orders/:id', () => {
  it('sem token responde 401 session_invalid', async () => {
    const res = await fetch(`${base}/orders/ord-ana-0001`);
    expect(res.status).toBe(401);
    expect((await res.json()).code).toBe('session_invalid');
  });

  it('devolve o pedido semeado ao dono', async () => {
    const res = await fetch(`${base}/orders/ord-ana-0001`, { headers: await authed(ANA) });
    expect(res.status).toBe(200);
    expect((await res.json()).id).toBe('ord-ana-0001');
  });

  it('isolamento: outro usuario nao enxerga o pedido', async () => {
    const res = await fetch(`${base}/orders/ord-ana-0001`, { headers: await authed(BRUNO) });
    expect([403, 404]).toContain(res.status);
  });
});
