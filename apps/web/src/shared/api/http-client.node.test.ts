import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { z } from 'zod';

import { ApiError, isApiError } from './api-error';
import { createHttpClient, getJson } from './http-client';

const BASE = 'http://localhost/api';
const schema = z.object({ items: z.array(z.string()) });

const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const client = createHttpClient({ baseURL: BASE });

async function failure(promise: Promise<unknown>): Promise<unknown> {
  try {
    await promise;
  } catch (e) {
    return e;
  }
  throw new Error('esperava rejeicao');
}

describe('getJson', () => {
  it('devolve o dado tipado quando a resposta 200 respeita o schema', async () => {
    server.use(http.get(`${BASE}/ok`, () => HttpResponse.json({ items: ['a', 'b'] })));
    await expect(getJson(client, { path: '/ok', schema })).resolves.toEqual({ items: ['a', 'b'] });
  });

  it('rejeita com invalid_response quando o 200 tem corpo fora do schema', async () => {
    server.use(http.get(`${BASE}/bad`, () => HttpResponse.json({ items: 42 })));
    const error = await failure(getJson(client, { path: '/bad', schema }));
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 200, code: 'invalid_response', transient: false });
  });

  it('normaliza 503 service_unavailable como transitorio', async () => {
    server.use(http.get(`${BASE}/e503`, () => HttpResponse.json({ code: 'service_unavailable' }, { status: 503 })));
    const error = await failure(getJson(client, { path: '/e503', schema }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, code: 'service_unavailable', transient: true });
  });

  it('normaliza 400 validation_failed com fieldErrors como nao transitorio', async () => {
    server.use(
      http.get(`${BASE}/e400`, () =>
        HttpResponse.json({ code: 'validation_failed', fieldErrors: { q: 'invalid' } }, { status: 400 }),
      ),
    );
    const error = await failure(getJson(client, { path: '/e400', schema }));
    expect(error).toMatchObject({
      status: 400,
      code: 'validation_failed',
      transient: false,
      fieldErrors: { q: 'invalid' },
    });
  });

  it('preserva session_invalid em 401 para a recuperacao da sessao', async () => {
    server.use(http.get(`${BASE}/auth/session`, () => HttpResponse.json({ code: 'session_invalid' }, { status: 401 })));
    const error = await failure(getJson(client, { path: '/auth/session', schema }));
    expect(error).toMatchObject({ status: 401, code: 'session_invalid', transient: false });
  });

  it('normaliza 500 internal_error como transitorio', async () => {
    server.use(http.get(`${BASE}/e500`, () => HttpResponse.json({ code: 'internal_error' }, { status: 500 })));
    const error = await failure(getJson(client, { path: '/e500', schema }));
    expect(error).toMatchObject({ status: 500, code: 'internal_error', transient: true });
  });

  it('trata corpo de erro ilegivel em 5xx como internal_error transitorio', async () => {
    server.use(http.get(`${BASE}/g502`, () => new HttpResponse('<html>bad gateway</html>', { status: 502 })));
    const error = await failure(getJson(client, { path: '/g502', schema }));
    expect(error).toMatchObject({ status: 502, code: 'internal_error', transient: true });
  });

  it('trata corpo de erro ilegivel em 4xx como validation_failed nao transitorio', async () => {
    server.use(http.get(`${BASE}/g404`, () => new HttpResponse('nope', { status: 404 })));
    const error = await failure(getJson(client, { path: '/g404', schema }));
    expect(error).toMatchObject({ status: 404, code: 'validation_failed', transient: false });
  });

  it('erro de rede sem resposta vira network_error transitorio com status null', async () => {
    server.use(http.get(`${BASE}/net`, () => HttpResponse.error()));
    const error = await failure(getJson(client, { path: '/net', schema }));
    expect(error).toMatchObject({ status: null, code: 'network_error', transient: true });
  });

  it('cancelamento durante a requisicao vira aborted nao transitorio', async () => {
    server.use(
      http.get(`${BASE}/slow`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return HttpResponse.json({ items: [] });
      }),
    );
    const controller = new AbortController();
    const pending = failure(getJson(client, { path: '/slow', schema, signal: controller.signal }));
    setTimeout(() => controller.abort(), 20);
    const error = await pending;
    expect(error).toMatchObject({ code: 'aborted', transient: false });
  });

  it('signal ja abortado antes de enviar rejeita com aborted sem chamar o servidor', async () => {
    const controller = new AbortController();
    controller.abort();
    const error = await failure(getJson(client, { path: '/never', schema, signal: controller.signal }));
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ code: 'aborted', transient: false });
  });

  it('serializa arrays de params como parametros repetidos sem colchetes, em ordem', async () => {
    let received: string[] = [];
    let raw = '';
    server.use(
      http.get(`${BASE}/list`, ({ request }) => {
        const url = new URL(request.url);
        received = url.searchParams.getAll('collections');
        raw = url.search;
        return HttpResponse.json({ items: [] });
      }),
    );
    await getJson(client, { path: '/list', schema, params: { collections: ['a', 'b', 'c'], q: 'x' } });
    expect(received).toEqual(['a', 'b', 'c']);
    expect(raw).not.toContain('%5B');
  });
});
