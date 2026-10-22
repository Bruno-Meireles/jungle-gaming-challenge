import { z } from 'zod';

export const apiErrorBodySchema = z.object({
  code: z.enum(['validation_failed', 'service_unavailable', 'internal_error']),
  fieldErrors: z.record(z.string(), z.literal('invalid')).optional(),
});

export type ApiErrorBody = z.infer<typeof apiErrorBodySchema>;
