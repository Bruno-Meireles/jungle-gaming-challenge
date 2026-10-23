import { isApiError } from '../../../shared/api/api-error';

export type AuthFailure =
  | { kind: 'invalid_credentials' }
  | { kind: 'account_conflict'; fields: ('email' | 'username')[] }
  | { kind: 'validation'; fieldErrors: Record<string, 'invalid'> }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' };

/** Traduz erro de transporte para falha de dominio; `ApiError` nao vaza para a UI. */
export function toAuthFailure(error: unknown): AuthFailure {
  if (!isApiError(error)) return { kind: 'unexpected' };
  switch (error.code) {
    case 'invalid_credentials':
      return { kind: 'invalid_credentials' };
    case 'account_conflict':
      return { kind: 'account_conflict', fields: error.fields ?? [] };
    case 'validation_failed':
      return { kind: 'validation', fieldErrors: error.fieldErrors ?? {} };
    case 'network_error':
    case 'service_unavailable':
    case 'internal_error':
      return { kind: 'network', retryable: true };
    default:
      return { kind: 'unexpected' };
  }
}
