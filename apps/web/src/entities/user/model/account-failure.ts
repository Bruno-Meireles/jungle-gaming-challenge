import { isApiError } from '../../../shared/api/api-error';

export type AccountFailure =
  | { kind: 'validation'; fieldErrors: Record<string, 'invalid'> }
  | { kind: 'account_conflict'; fields: ('email' | 'username')[] }
  | { kind: 'session_expired' }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' };

/** Traduz erro de transporte para falha de dominio; `ApiError` nao vaza para a UI. */
export function toAccountFailure(error: unknown): AccountFailure {
  if (!isApiError(error)) return { kind: 'unexpected' };
  switch (error.code) {
    case 'validation_failed':
      return { kind: 'validation', fieldErrors: error.fieldErrors ?? {} };
    case 'account_conflict':
      return { kind: 'account_conflict', fields: error.fields ?? [] };
    case 'session_invalid':
      return { kind: 'session_expired' };
    case 'network_error':
    case 'service_unavailable':
    case 'internal_error':
      return { kind: 'network', retryable: true };
    default:
      return { kind: 'unexpected' };
  }
}
