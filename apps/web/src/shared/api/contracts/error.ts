import { z } from 'zod';

export const apiErrorBodySchema = z.object({
  code: z.enum([
    'validation_failed',
    'service_unavailable',
    'internal_error',
    'session_invalid',
    'invalid_credentials',
    'account_conflict',
    'coupon_invalid',
    'coupon_expired',
    'quote_changed',
    'idempotency_conflict',
    'availability_conflict',
    'forbidden',
    'not_found',
  ]),
  fieldErrors: z.record(z.string(), z.literal('invalid')).optional(),
  fields: z.array(z.enum(['email', 'username'])).optional(),
  /** Quantidade disponivel em conflitos de disponibilidade (availability_conflict). */
  available: z.number().int().min(0).optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
