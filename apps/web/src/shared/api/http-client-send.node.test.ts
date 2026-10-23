import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { createHttpClient, sendJson } from './http-client';

const BASE = 'http://localhost/api';
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

const client = createHttpClient({ baseURL: BASE });
const schema = z.object({ ok: z.boolean() });

async function failure(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('esperava rejeicao');
}

describe('sendJson', () => {
  it('envia o corpo JSON e valida a resposta', async () => {
    let received: unknown;
    server.use(
      http.post(`${BASE}/x`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ ok: true });
      }),
    );
    await expect(sendJson(client, { method: 'post', path: '/x', body: { a: 1 }, schema })).resolves.toEqual({ ok: true });
    expect(received).toEqual({ a: 1 });
  });

  it('aceita resposta sem corpo (204) quando nao ha schema', async () => {
    server.use(http.put(`${BASE}/y`, () => new HttpResponse(null, { status: 204 })));
    await expect(sendJson(client, { method: 'put', path: '/y', body: {} })).resolves.toBeUndefined();
  });

  it('preserva account_conflict com fields', async () => {
    server.use(
      http.post(`${BASE}/z`, () => HttpResponse.json({ code: 'account_conflict', fields: ['email'] }, { status: 409 })),
    );
    const error = await failure(sendJson(client, { method: 'post', path: '/z', body: {}, schema }));
    expect(error).toMatchObject({ status: 409, code: 'account_conflict', transient: false, fields: ['email'] });
  });

  it('preserva invalid_credentials em 401', async () => {
    server.use(http.post(`${BASE}/z`, () => HttpResponse.json({ code: 'invalid_credentials' }, { status: 401 })));
    const error = await failure(sendJson(client, { method: 'post', path: '/z', body: {}, schema }));
    expect(error).toMatchObject({ status: 401, code: 'invalid_credentials', transient: false });
  });

  it('anexa Authorization Bearer quando ha token salvo', async () => {
    vi.stubGlobal('localStorage', { getItem: (k: string) => (k === 'jg.session.token' ? 'tok-1' : null) });
    let auth: string | null = null;
    server.use(
      http.post(`${BASE}/x`, ({ request }) => {
        auth = request.headers.get('authorization');
        return HttpResponse.json({ ok: true });
      }),
    );
    await sendJson(client, { method: 'post', path: '/x', body: {}, schema });
    expect(auth).toBe('Bearer tok-1');
  });

  it('nao envia Authorization sem token', async () => {
    let auth: string | null = 'x';
    server.use(
      http.post(`${BASE}/x`, ({ request }) => {
        auth = request.headers.get('authorization');
        return HttpResponse.json({ ok: true });
      }),
    );
    await sendJson(client, { method: 'post', path: '/x', body: {}, schema });
    expect(auth).toBeNull();
  });

  it('envia headers extras (Idempotency-Key)', async () => {
    let key: string | null = null;
    server.use(
      http.post(`${BASE}/x`, ({ request }) => {
        key = request.headers.get('idempotency-key');
        return HttpResponse.json({ ok: true });
      }),
    );
    await sendJson(client, { method: 'post', path: '/x', body: {}, schema, headers: { 'Idempotency-Key': 'k1' } });
    expect(key).toBe('k1');
  });
});
