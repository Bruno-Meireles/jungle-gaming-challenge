import { describe, expect, it } from 'vitest';

import { validateCollector } from './collector-schema';

const valid = {
  displayName: 'Ana Souza',
  email: 'ana@example.com',
  username: 'ana_souza',
  profileName: 'Ana Collector',
  referralCode: 'JUNGLE10',
  ensName: 'ana-souza',
  secondaryWalletOrEns: '',
  note: '',
};

describe('validateCollector', () => {
  it('aceita dados validos e normaliza opcionais vazios para null', () => {
    expect(validateCollector(valid)).toEqual({
      ok: true,
      value: { ...valid, secondaryWalletOrEns: null, note: null },
    });
  });

  it('aparda espacos e mantem opcionais preenchidos', () => {
    const result = validateCollector({ ...valid, displayName: '  Ana  ', note: ' oi ', secondaryWalletOrEns: ' reserva.eth ' });
    expect(result).toMatchObject({ ok: true, value: { displayName: 'Ana', note: 'oi', secondaryWalletOrEns: 'reserva.eth' } });
  });

  it.each(['displayName', 'email', 'username', 'profileName', 'referralCode', 'ensName'] as const)('%s vazio e required', (field) => {
    const result = validateCollector({ ...valid, [field]: '   ' });
    expect(result).toEqual({ ok: false, errors: { [field]: 'required' } });
  });

  it('e-mail malformado e invalid_email', () => {
    expect(validateCollector({ ...valid, email: 'ana@' })).toEqual({ ok: false, errors: { email: 'invalid_email' } });
  });

  it('usuario com espaco ou simbolo e invalid_username', () => {
    expect(validateCollector({ ...valid, username: 'ana souza!' })).toEqual({ ok: false, errors: { username: 'invalid_username' } });
  });

  it.each(['ab', 'Ana', 'ana.eth', 'a'.repeat(64)])('ENS %s e invalid_ens', (ensName) => {
    expect(validateCollector({ ...valid, ensName })).toEqual({ ok: false, errors: { ensName: 'invalid_ens' } });
  });

  it('ENS nos limites 3 e 63 e valido', () => {
    expect(validateCollector({ ...valid, ensName: 'abc' }).ok).toBe(true);
    expect(validateCollector({ ...valid, ensName: 'a'.repeat(63) }).ok).toBe(true);
  });

  it('observacao tem maximo de 280 e codigo de indicacao de 32', () => {
    expect(validateCollector({ ...valid, note: 'x'.repeat(280) }).ok).toBe(true);
    expect(validateCollector({ ...valid, note: 'x'.repeat(281) })).toEqual({ ok: false, errors: { note: 'too_long' } });
    expect(validateCollector({ ...valid, referralCode: 'x'.repeat(32) }).ok).toBe(true);
    expect(validateCollector({ ...valid, referralCode: 'x'.repeat(33) })).toEqual({ ok: false, errors: { referralCode: 'too_long' } });
  });

  it('reporta todos os campos invalidos de uma vez', () => {
    const result = validateCollector({ ...valid, email: '', ensName: 'X' });
    expect(result).toEqual({ ok: false, errors: { email: 'required', ensName: 'invalid_ens' } });
  });
});
