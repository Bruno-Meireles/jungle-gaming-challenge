export type ApiErrorCode =
  | 'validation_failed'
  | 'service_unavailable'
  | 'internal_error'
  | 'network_error'
  | 'invalid_response'
  | 'aborted';

export class ApiError extends Error {
  status: number | null;
  code: ApiErrorCode;
  transient: boolean;
  fieldErrors?: Record<string, 'invalid'>;

  constructor(init: {
    status: number | null;
    code: ApiErrorCode;
    transient: boolean;
    fieldErrors?: Record<string, 'invalid'>;
  }) {
    super(init.code);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.transient = init.transient;
    this.fieldErrors = init.fieldErrors;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
