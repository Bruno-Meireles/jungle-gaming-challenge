import { QueryClient } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createHandlers } from '../../../mocks/handlers';
import { createHttpClient } from '../../../shared/api/http-client';
import { login } from '../api/auth-api';
import {
  loadProfile,
  loadWallets,
  submitPasswordChange,
  submitProfile,
  submitWallet,
} from './account-operations';
import { toAccountFailure } from './account-failure';
import { userKeys } from './user-keys';

const client = createHttpClient({ baseURL: 'http://localhost/api' });
const server = setupServer();
let store: Map<string, string>;

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(async () => {
  store = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  server.use(...createHandlers());
  const auth = await login({ email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' }, client);
  store.set('jg.session.token', auth.token);
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

async function failureOf(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('esperava rejeicao');
}

describe('operacoes de conta', () => {
  it('loadProfile devolve o perfil da sessao', async () => {
    await expect(loadProfile(client)).resolves.toMatchObject({ username: 'ana' });
  });

  it('submitProfile atualiza o cache do perfil e invalida a sessao', async () => {
    const qc = new QueryClient();
    qc.setQueryData(['session', 'current'], { status: 'authenticated' });
    const profile = await submitProfile(
      qc,
      { displayName: 'Ana M.', username: 'ana', email: 'ana@example.test', avatarUrl: null },
      client,
    );
    expect(profile.displayName).toBe('Ana M.');
    expect(qc.getQueryData(userKeys.profile())).toEqual(profile);
    expect(qc.getQueryState(['session', 'current'])?.isInvalidated).toBe(true);
  });

  it('submitProfile com username em conflito vira AccountFailure account_conflict', async () => {
    const failure = await failureOf(
      submitProfile(
        new QueryClient(),
        { displayName: 'Ana', username: 'bruno', email: 'ana@example.test', avatarUrl: null },
        client,
      ),
    );
    expect(failure).toEqual({ kind: 'account_conflict', fields: ['username'] });
  });

  it('submitPasswordChange com senha atual errada vira validation com fieldErrors', async () => {
    const failure = await failureOf(
      submitPasswordChange({ currentPassword: 'errada-123', newPassword: 'Nova-Senha-2026' }, client),
    );
    expect(failure).toEqual({ kind: 'validation', fieldErrors: { currentPassword: 'invalid' } });
    await expect(
      submitPasswordChange({ currentPassword: 'JungleDemo-Ana-2026!', newPassword: 'Nova-Senha-2026' }, client),
    ).resolves.toBeUndefined();
  });

  it('wallets: carrega, salva a secundaria e atualiza o cache', async () => {
    const qc = new QueryClient();
    const before = await loadWallets(client);
    expect(before.wallets).toHaveLength(1);
    qc.setQueryData(userKeys.wallets(), before);
    const wallet = await submitWallet(qc, { kind: 'secondary', network: 'solana', address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' }, client);
    expect(wallet.kind).toBe('secondary');
    expect(qc.getQueryData(userKeys.wallets())).toEqual({ wallets: [before.wallets[0], wallet] });
  });

  it('wallet com endereco invalido vira validation', async () => {
    const failure = await failureOf(
      submitWallet(new QueryClient(), { kind: 'primary', network: 'ethereum', address: 'xyz' }, client),
    );
    expect(failure).toEqual({ kind: 'validation', fieldErrors: { address: 'invalid' } });
  });

  it('sem sessao vira session_expired', async () => {
    store.delete('jg.session.token');
    expect(await failureOf(submitPasswordChange({ currentPassword: 'a', newPassword: 'bbbbbbbbb' }, client))).toEqual({
      kind: 'session_expired',
    });
  });
});

describe('toAccountFailure', () => {
  it('erro desconhecido e unexpected', () => {
    expect(toAccountFailure(new Error('x'))).toEqual({ kind: 'unexpected' });
  });
});
