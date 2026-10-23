import { isApiError } from '../../api/api-error';

export type FormFailure =
  | { kind: 'validation'; fields: string[] }
  | { kind: 'conflict'; fields: string[] }
  | { kind: 'session_expired' }
  | { kind: 'network' }
  | { kind: 'unexpected' };

/** Traduz erro de transporte para falha de formulario; `ApiError` nao vaza para a UI. */
export function toFormFailure(error: unknown): FormFailure {
  if (!isApiError(error)) return { kind: 'unexpected' };
  switch (error.code) {
    case 'validation_failed':
      return { kind: 'validation', fields: Object.keys(error.fieldErrors ?? {}) };
    case 'account_conflict':
      return { kind: 'conflict', fields: [...(error.fields ?? [])] };
    case 'session_invalid':
      return { kind: 'session_expired' };
    case 'network_error':
      return { kind: 'network' };
    default:
      return { kind: 'unexpected' };
  }
}
