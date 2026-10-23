import { describe, expect, it } from 'vitest';

import {
  changePasswordRequestSchema,
  profileSchema,
  saveWalletRequestSchema,
  updateProfileRequestSchema,
  walletsResponseSchema,
} from './account';

const ETH = '0x' + 'a'.repeat(40);

describe('contratos de conta', () => {
  it('perfil aceita avatar nulo ou string', () => {
    const p = { id: 'u1', displayName: 'Ana', username: 'ana', email: 'ana@example.test', avatarUrl: null };
    expect(profileSchema.safeParse(p).success).toBe(true);
    expect(updateProfileRequestSchema.safeParse({ ...p, avatarUrl: 'data:image/png;base64,AAA' }).success).toBe(true);
    expect(updateProfileRequestSchema.safeParse({ ...p, displayName: '' }).success).toBe(false);
  });

  it('troca de senha exige nova senha com 8+ e diferente da atual', () => {
    expect(changePasswordRequestSchema.safeParse({ currentPassword: 'old-pass-1', newPassword: 'new-pass-22' }).success).toBe(true);
    expect(changePasswordRequestSchema.safeParse({ currentPassword: 'same-pass-1', newPassword: 'same-pass-1' }).success).toBe(false);
    expect(changePasswordRequestSchema.safeParse({ currentPassword: 'old', newPassword: 'short' }).success).toBe(false);
  });

  it('carteira valida endereco conforme a rede', () => {
    expect(saveWalletRequestSchema.safeParse({ kind: 'primary', network: 'ethereum', address: ETH }).success).toBe(true);
    expect(saveWalletRequestSchema.safeParse({ kind: 'secondary', network: 'polygon', address: 'xyz' }).success).toBe(false);
    expect(
      saveWalletRequestSchema.safeParse({ kind: 'secondary', network: 'solana', address: '7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV' }).success,
    ).toBe(true);
    expect(saveWalletRequestSchema.safeParse({ kind: 'third', network: 'ethereum', address: ETH }).success).toBe(false);
  });

  it('lista de carteiras', () => {
    expect(walletsResponseSchema.parse({ wallets: [] })).toEqual({ wallets: [] });
  });
});
