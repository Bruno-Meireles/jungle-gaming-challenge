import { z } from 'zod';

import { emailSchema, passwordSchema, usernameSchema } from './auth';
import { NETWORK_IDS } from './ids';

export const profileSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  username: usernameSchema,
  email: emailSchema,
  avatarUrl: z.string().nullable(),
});
export type Profile = z.infer<typeof profileSchema>;

export const MAX_AVATAR_LENGTH = 300_000;

export const updateProfileRequestSchema = z.object({
  displayName: z.string().trim().min(1).max(60),
  username: usernameSchema,
  email: emailSchema,
  avatarUrl: z.string().max(MAX_AVATAR_LENGTH).nullable(),
});
export type UpdateProfileRequest = z.infer<typeof updateProfileRequestSchema>;

export const changePasswordRequestSchema = z
  .object({ currentPassword: z.string().min(1), newPassword: passwordSchema })
  .refine((v) => v.currentPassword !== v.newPassword, { path: ['newPassword'] });
export type ChangePasswordRequest = z.infer<typeof changePasswordRequestSchema>;

export const WALLET_KINDS = ['primary', 'secondary'] as const;
export const walletKindSchema = z.enum(WALLET_KINDS);
export type WalletKind = z.infer<typeof walletKindSchema>;

const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;
const SOLANA_ADDRESS = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidWalletAddress(network: (typeof NETWORK_IDS)[number], address: string): boolean {
  return (network === 'solana' ? SOLANA_ADDRESS : EVM_ADDRESS).test(address);
}

export const walletSchema = z.object({
  id: z.string().min(1),
  kind: walletKindSchema,
  network: z.enum(NETWORK_IDS),
  address: z.string().min(1),
});
export type Wallet = z.infer<typeof walletSchema>;

export const saveWalletRequestSchema = z
  .object({ kind: walletKindSchema, network: z.enum(NETWORK_IDS), address: z.string().trim() })
  .refine((v) => isValidWalletAddress(v.network, v.address), { path: ['address'] });
export type SaveWalletRequest = z.infer<typeof saveWalletRequestSchema>;

export const walletsResponseSchema = z.object({ wallets: z.array(walletSchema) });
export type WalletsResponse = z.infer<typeof walletsResponseSchema>;
