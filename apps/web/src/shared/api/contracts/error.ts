import { z } from 'zod';

// Esqueleto RED: permissivo de proposito, o GREEN o restringe.
export const apiErrorBodySchema = z.unknown();

export type ApiErrorBody = {
  code: 'validation_failed' | 'service_unavailable' | 'internal_error';
  fieldErrors?: Record<string, 'invalid'>;
};
