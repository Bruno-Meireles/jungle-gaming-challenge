import { z } from 'zod';

import { walletSchema } from '../../shared/api/contracts/account';
import { sessionUserSchema } from '../../shared/api/contracts/auth';

export const MOCK_STATE_KEY = 'jg:mocks:state';
export const MOCK_STATE_VERSION = 1;

export const userRecordSchema = sessionUserSchema.extend({
  salt: z.string(),
  passwordHash: z.string(),
});
export type UserRecord = z.infer<typeof userRecordSchema>;

export const sessionRecordSchema = z.object({
  token: z.string(),
  userId: z.string(),
  expiresAt: z.number(),
});
export type SessionRecord = z.infer<typeof sessionRecordSchema>;

export const walletRecordSchema = z.object({ userId: z.string(), wallet: walletSchema });
export type WalletRecord = z.infer<typeof walletRecordSchema>;

export const mockStateSchema = z.object({
  version: z.literal(MOCK_STATE_VERSION),
  users: z.array(userRecordSchema),
  sessions: z.array(sessionRecordSchema),
  wallets: z.array(walletRecordSchema),
});
export type MockState = z.infer<typeof mockStateSchema>;
