import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  changePassword,
  fetchProfile,
  fetchWallets,
  saveWallet,
  updateProfile,
} from '../entities/user/api/account-api';
import { fetchSession, login, logout, register } from '../entities/user/api/auth-api';
import { createHttpClient } from '../shared/api/http-client';
import { createHandlers } from './handlers';
import { resetMockState } from './reset';
import { SCENARIO_STORAGE_KEY } from './scenario';

const client = createHttpClient({ baseURL: 'http://localhost/api' });
const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };
const BRUNO = { email: 'bruno@example.test', password: 'JungleDemo-Bruno-2026!' };

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    clear: () => map.clear(),
    dump: () => JSON.stringify([...map.entries()]),
  };
}

let storage = memoryStorage();
const server = setupServer();
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
beforeEach(() => {
  storage = memoryStorage();
  vi.stubGlobal('localStorage', storage);
  server.use(...createHandlers());
});
afterEach(() => {
  server.resetHandlers();
  vi.unstubAllGlobals();
});
afterAll(() => server.close());

async function rejection(p: Promise<unknown>): Promise<unknown> {
  try {
    await p;
  } catch (e) {
    return e;
  }
  throw new Error('esperava rejeicao');
}

async function loginAs(creds: { email: string; password: string }) {
  const auth = await login(creds, client);
  storage.setItem('jg.session.token', auth.token);
  return auth;
}

describe('auth (MSW)', () => {
  it('login com credencial ficticia devolve token, expiresAt futuro e usuario', async () => {
    const auth = await login(ANA, client);
    expect(auth.user).toMatchObject({ email: 'ana@example.test', username: 'ana' });
    expect(auth.expiresAt).toBeGreaterThan(Date.now());
    expect(auth.token.length).toBeGreaterThan(10);
  });

  it('senha errada e e-mail desconhecido dao o mesmo invalid_credentials', async () => {
    const wrong = await rejection(login({ ...ANA, password: 'errada-123' }, client));
    const unknown = await rejection(login({ email: 'ninguem@example.test', password: 'x12345678' }, client));
    expect(wrong).toMatchObject({ status: 401, code: 'invalid_credentials' });
    expect(unknown).toMatchObject({ status: 401, code: 'invalid_credentials' });
  });

  it('registro cria conta, nao guarda a senha em claro e permite login', async () => {
    const body = { displayName: 'carla', username: 'carla', email: 'carla@example.test', password: 'Segredo-Unico-77' };
    const auth = await register(body, client);
    expect(auth.user.username).toBe('carla');
    expect(storage.dump()).not.toContain('Segredo-Unico-77');
    await expect(login({ email: body.email, password: body.password }, client)).resolves.toMatchObject({
      user: { email: body.email },
    });
  });

  it('registro duplicado devolve 409 com os campos em conflito', async () => {
    const email = await rejection(
      register({ displayName: 'x', username: 'novo_user', email: 'ANA@example.test', password: 'abcdefgh1' }, client),
    );
    expect(email).toMatchObject({ status: 409, code: 'account_conflict', fields: ['email'] });
    const both = await rejection(
      register({ displayName: 'x', username: 'Bruno', email: 'bruno@example.test', password: 'abcdefgh1' }, client),
    );
    expect(both).toMatchObject({ code: 'account_conflict', fields: ['email', 'username'] });
  });

  it('registro invalido devolve 400 validation_failed', async () => {
    const error = await rejection(register({ displayName: 'x', username: 'a b', email: 'x', password: '1' }, client));
    expect(error).toMatchObject({ status: 400, code: 'validation_failed' });
  });

  it('sessao: sem token e anonima, token invalido e session_invalid, token valido devolve o usuario', async () => {
    await expect(fetchSession(undefined, client)).resolves.toEqual({ user: null });
    storage.setItem('jg.session.token', 'lixo');
    expect(await rejection(fetchSession(undefined, client))).toMatchObject({ status: 401, code: 'session_invalid' });
    await loginAs(BRUNO);
    await expect(fetchSession(undefined, client)).resolves.toMatchObject({ user: { username: 'bruno' } });
  });

  it('logout invalida o token no estado persistido', async () => {
    const { token } = await loginAs(ANA);
    await logout(client);
    storage.setItem('jg.session.token', token);
    expect(await rejection(fetchSession(undefined, client))).toMatchObject({ code: 'session_invalid' });
  });

  it('cenario auth_network_error derruba o login na rede', async () => {
    storage.setItem(SCENARIO_STORAGE_KEY, 'auth_network_error');
    expect(await rejection(login(ANA, client))).toMatchObject({ code: 'network_error', transient: true });
  });

  it('cenario auth_server_error responde 503 transitorio', async () => {
    storage.setItem(SCENARIO_STORAGE_KEY, 'auth_server_error');
    expect(await rejection(login(ANA, client))).toMatchObject({
      status: 503,
      code: 'service_unavailable',
      transient: true,
    });
  });
});

describe('conta (MSW)', () => {
  it('rotas privadas sem token respondem 401 session_invalid', async () => {
    expect(await rejection(fetchProfile(client))).toMatchObject({ status: 401, code: 'session_invalid' });
    expect(await rejection(fetchWallets(client))).toMatchObject({ status: 401, code: 'session_invalid' });
  });

  it('atualiza perfil e avatar e persiste', async () => {
    await loginAs(ANA);
    const updated = await updateProfile(
      { displayName: 'Ana Maria', username: 'ana', email: 'ana@example.test', avatarUrl: 'data:image/png;base64,AAAA' },
      client,
    );
    expect(updated.avatarUrl).toBe('data:image/png;base64,AAAA');
    await expect(fetchProfile(client)).resolves.toMatchObject({ displayName: 'Ana Maria' });
    await expect(fetchSession(undefined, client)).resolves.toMatchObject({ user: { displayName: 'Ana Maria' } });
  });

  it('atualizar perfil para username de outra conta da 409 com fields', async () => {
    await loginAs(ANA);
    const error = await rejection(
      updateProfile({ displayName: 'Ana', username: 'bruno', email: 'ana@example.test', avatarUrl: null }, client),
    );
    expect(error).toMatchObject({ status: 409, code: 'account_conflict', fields: ['username'] });
  });

  it('troca de senha: atual errada da fieldErrors; sucesso troca a credencial', async () => {
    await loginAs(ANA);
    const bad = await rejection(
      changePassword({ currentPassword: 'errada-123', newPassword: 'Nova-Senha-2026' }, client),
    );
    expect(bad).toMatchObject({ status: 400, code: 'validation_failed', fieldErrors: { currentPassword: 'invalid' } });
    await changePassword({ currentPassword: ANA.password, newPassword: 'Nova-Senha-2026' }, client);
    expect(await rejection(login(ANA, client))).toMatchObject({ code: 'invalid_credentials' });
    await expect(login({ email: ANA.email, password: 'Nova-Senha-2026' }, client)).resolves.toBeDefined();
    expect(storage.dump()).not.toContain('Nova-Senha-2026');
  });

  it('carteiras: Ana tem a principal; salva secundaria; endereco invalido da 400', async () => {
    await loginAs(ANA);
    const before = await fetchWallets(client);
    expect(before.wallets.map((w) => w.kind)).toEqual(['primary']);
    const saved = await saveWallet({ kind: 'secondary', network: 'polygon', address: '0x' + 'b'.repeat(40) }, client);
    expect(saved).toMatchObject({ kind: 'secondary', network: 'polygon' });
    expect((await fetchWallets(client)).wallets.map((w) => w.kind)).toEqual(['primary', 'secondary']);
    const edited = await saveWallet({ kind: 'secondary', network: 'ethereum', address: '0x' + 'c'.repeat(40) }, client);
    expect(edited.id).toBe(saved.id);
    expect((await fetchWallets(client)).wallets).toHaveLength(2);
    const bad = await rejection(saveWallet({ kind: 'primary', network: 'ethereum', address: 'xyz' }, client));
    expect(bad).toMatchObject({ status: 400, code: 'validation_failed', fieldErrors: { address: 'invalid' } });
  });

  it('carteiras sao isoladas por usuario (Bruno nao tem nenhuma)', async () => {
    await loginAs(BRUNO);
    expect((await fetchWallets(client)).wallets).toEqual([]);
  });

  it('reset restaura o estado conhecido', async () => {
    await register({ displayName: 'd', username: 'dora', email: 'dora@example.test', password: 'abcdefgh1' }, client);
    resetMockState();
    expect(await rejection(login({ email: 'dora@example.test', password: 'abcdefgh1' }, client))).toMatchObject({
      code: 'invalid_credentials',
    });
    await expect(login(ANA, client)).resolves.toBeDefined();
  });
});
