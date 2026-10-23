import { describe, expect, it } from 'vitest';

import { toFailureState } from './profile-failure';

describe('toFailureState', () => {
  it('sessao expirada nao mostra erro de campo', () => {
    expect(toFailureState({ kind: 'session_expired' })).toEqual({ errors: {}, failure: null, sessionExpired: true });
  });

  it('conflito marca e-mail e usuario como ja usados', () => {
    expect(toFailureState({ kind: 'conflict', fields: ['email', 'username'] }).errors).toEqual({
      email: 'email_taken',
      username: 'username_taken',
    });
  });

  it('validacao do servidor aponta senha atual errada e campos invalidos', () => {
    expect(toFailureState({ kind: 'validation', fields: ['currentPassword', 'displayName'] }).errors).toEqual({
      currentPassword: 'wrong_current',
      displayName: 'invalid',
    });
  });

  it('validacao sem campo conhecido vira falha inesperada', () => {
    expect(toFailureState({ kind: 'validation', fields: ['outro'] })).toEqual({ errors: {}, failure: 'unexpected', sessionExpired: false });
  });

  it.each([
    ['network', 'network'],
    ['unexpected', 'unexpected'],
  ] as const)('%s vira falha geral %s', (kind, failure) => {
    expect(toFailureState({ kind })).toEqual({ errors: {}, failure, sessionExpired: false });
  });
});
