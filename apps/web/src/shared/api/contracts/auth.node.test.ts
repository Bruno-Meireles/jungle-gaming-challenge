import { describe, expect, it } from 'vitest';

import {
  authResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  sessionResponseSchema,
  sessionUserSchema,
} from './auth';
import { apiErrorBodySchema } from './error';

const user = { id: 'u1', displayName: 'Ana', username: 'ana', email: 'ana@example.test', avatarUrl: null };

describe('contratos de auth', () => {
  it('authResponse exige token, expiresAt numerico e user', () => {
    expect(authResponseSchema.safeParse({ token: 't', expiresAt: 1_800_000_000_000, user }).success).toBe(true);
    expect(authResponseSchema.safeParse({ token: 't', user }).success).toBe(false);
    expect(authResponseSchema.safeParse({ token: 't', expiresAt: '1', user }).success).toBe(false);
  });

  it('sessionResponse aceita user nulo (anonimo)', () => {
    expect(sessionResponseSchema.parse({ user: null })).toEqual({ user: null });
    expect(sessionResponseSchema.parse({ user })).toEqual({ user });
  });

  it('sessionUser rejeita e-mail invalido e campos extras sao descartados', () => {
    expect(sessionUserSchema.safeParse({ ...user, email: 'x' }).success).toBe(false);
    expect(sessionUserSchema.parse({ ...user, passwordHash: 'x' })).toEqual(user);
  });

  it('request de registro exige displayName, username valido e senha com 8+', () => {
    const ok = { displayName: 'ana', username: 'ana_01', email: 'a@b.co', password: '12345678' };
    expect(registerRequestSchema.safeParse(ok).success).toBe(true);
    expect(registerRequestSchema.safeParse({ ...ok, username: 'a b' }).success).toBe(false);
    expect(registerRequestSchema.safeParse({ ...ok, password: '123' }).success).toBe(false);
    expect(loginRequestSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });

  it('erro 409 carrega fields e 401 invalid_credentials e codigo valido', () => {
    expect(apiErrorBodySchema.parse({ code: 'account_conflict', fields: ['email'] })).toEqual({
      code: 'account_conflict',
      fields: ['email'],
    });
    expect(apiErrorBodySchema.safeParse({ code: 'invalid_credentials' }).success).toBe(true);
    expect(apiErrorBodySchema.safeParse({ code: 'account_conflict', fields: ['x'] }).success).toBe(false);
  });
});
