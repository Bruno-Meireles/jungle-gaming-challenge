import { z } from 'zod';

export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,20}$/;
export const PASSWORD_MIN_LENGTH = 8;
export const SESSION_TOKEN_STORAGE_KEY = 'jg.session.token';

export const emailSchema = z.email();
export const usernameSchema = z.string().regex(USERNAME_PATTERN);
export const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH);

export const sessionUserSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  username: usernameSchema,
  email: emailSchema,
  avatarUrl: z.string().nullable(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const loginRequestSchema = z.object({ email: emailSchema, password: z.string().min(1) });
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  displayName: z.string().min(1).max(60),
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/** `expiresAt` em epoch ms. */
export const authResponseSchema = z.object({
  token: z.string().min(1),
  expiresAt: z.number().int().positive(),
  user: sessionUserSchema,
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const sessionResponseSchema = z.object({ user: sessionUserSchema.nullable() });
export type SessionResponse = z.infer<typeof sessionResponseSchema>;
