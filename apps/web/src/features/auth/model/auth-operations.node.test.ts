import { QueryClient } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { cartKeys } from '../../../entities/cart';
import { readToken, sessionKeys } from '../../../entities/session';
import { createHandlers } from '../../../mocks/handlers';
import { SCENARIO_STORAGE_KEY } from '../../../mocks/scenario';
import { createHttpClient } from '../../../shared/api/http-client';
import { signIn, signUp } from './auth-operations';

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

const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };

async function failureOf(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('esperava rejeicao');
}

describe('signIn', () => {
  it('grava token, popula a sessao no cache e invalida o carrinho; devolve o usuario', async () => {
    const qc = new QueryClient();
    qc.setQueryData(cartKeys.current(), { stale: true });
    const user = await signIn(qc, ANA, client);
    expect(user).toMatchObject({ username: 'ana' });
    expect(readToken()).not.toBeNull();
    expect(qc.getQueryData(sessionKeys.current())).toEqual({ status: 'authenticated', user });
    expect(qc.getQueryState(cartKeys.current())?.isInvalidated).toBe(true);
  });

  it('credencial invalida vira AuthFailure e nao grava token', async () => {
    const qc = new QueryClient();
    const failure = await failureOf(signIn(qc, { ...ANA, password: 'errada-12345' }, client));
    expect(failure).toEqual({ kind: 'invalid_credentials' });
    expect(readToken()).toBeNull();
    expect(qc.getQueryData(sessionKeys.current())).toBeUndefined();
  });

  it('rede vira network retryable', async () => {
    store.set(SCENARIO_STORAGE_KEY, 'auth_network_error');
    expect(await failureOf(signIn(new QueryClient(), ANA, client))).toEqual({ kind: 'network', retryable: true });
  });

  it('503 vira network retryable', async () => {
    store.set(SCENARIO_STORAGE_KEY, 'auth_server_error');
    expect(await failureOf(signIn(new QueryClient(), ANA, client))).toEqual({ kind: 'network', retryable: true });
  });
});

describe('signUp', () => {
  const values = { username: 'carla_9', email: 'carla@example.test', password: 'Segredo-Unico-77', confirmPassword: 'Segredo-Unico-77' };

  it('envia displayName = username, grava token e sessao', async () => {
    const qc = new QueryClient();
    const user = await signUp(qc, values, client);
    expect(user).toMatchObject({ username: 'carla_9', displayName: 'carla_9', email: 'carla@example.test' });
    expect(readToken()).not.toBeNull();
    expect(qc.getQueryData(sessionKeys.current())).toEqual({ status: 'authenticated', user });
  });

  it('conflito de e-mail devolve account_conflict com fields', async () => {
    const failure = await failureOf(signUp(new QueryClient(), { ...values, email: 'ana@example.test' }, client));
    expect(failure).toEqual({ kind: 'account_conflict', fields: ['email'] });
    expect(readToken()).toBeNull();
  });
});
