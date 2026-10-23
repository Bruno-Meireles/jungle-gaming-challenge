import { describe, expect, it } from 'vitest';

import { hasPasswordChange, toRequests, validateProfileForm, type ProfileFormValues } from './profile-form';

const base: ProfileFormValues = {
  displayName: 'Ana Souza',
  username: 'ana',
  email: 'ana@example.test',
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};
const withPw = { ...base, currentPassword: 'JungleDemo-Ana-2026!', newPassword: 'NovaSenha-2026', confirmPassword: 'NovaSenha-2026' };

describe('validateProfileForm', () => {
  it('valido sem senha devolve objeto vazio', () => {
    expect(validateProfileForm(base)).toEqual({});
  });
  it('obrigatorios, e-mail, usuario e tamanho', () => {
    expect(validateProfileForm({ ...base, displayName: '  ', email: '' })).toEqual({ displayName: 'required', email: 'required' });
    expect(validateProfileForm({ ...base, email: 'x' })).toEqual({ email: 'invalid_email' });
    expect(validateProfileForm({ ...base, username: 'a b' })).toEqual({ username: 'invalid_username' });
    expect(validateProfileForm({ ...base, displayName: 'x'.repeat(61) })).toEqual({ displayName: 'too_long' });
  });
  it('senha parcial exige os tres campos', () => {
    expect(validateProfileForm({ ...base, newPassword: 'NovaSenha-2026' })).toEqual({
      currentPassword: 'required',
      confirmPassword: 'required',
    });
  });
  it('senha curta, divergente e igual a atual', () => {
    expect(validateProfileForm({ ...withPw, newPassword: 'abc', confirmPassword: 'abc' })).toEqual({ newPassword: 'too_short' });
    expect(validateProfileForm({ ...withPw, confirmPassword: 'outra-senha-1' })).toEqual({ confirmPassword: 'password_mismatch' });
    expect(
      validateProfileForm({ ...withPw, newPassword: withPw.currentPassword, confirmPassword: withPw.currentPassword }),
    ).toEqual({ newPassword: 'same_password' });
  });
  it('senha completa e valida', () => {
    expect(validateProfileForm(withPw)).toEqual({});
  });
});

describe('hasPasswordChange', () => {
  it('false com os tres vazios, true se qualquer um preenchido', () => {
    expect(hasPasswordChange(base)).toBe(false);
    expect(hasPasswordChange({ ...base, confirmPassword: 'x' })).toBe(true);
  });
});

describe('toRequests', () => {
  it('sem senha: apenas profile (trim) com avatar', () => {
    expect(toRequests({ ...base, displayName: ' Ana ' }, 'data:image/png;base64,AA')).toEqual({
      profile: { displayName: 'Ana', username: 'ana', email: 'ana@example.test', avatarUrl: 'data:image/png;base64,AA' },
      password: null,
    });
  });
  it('com senha: inclui changePassword', () => {
    expect(toRequests(withPw, null).password).toEqual({ currentPassword: 'JungleDemo-Ana-2026!', newPassword: 'NovaSenha-2026' });
  });
});
