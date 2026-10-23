export type ApiErrorCode =
  | 'validation_failed'
  | 'service_unavailable'
  | 'internal_error'
  | 'session_invalid'
  | 'invalid_credentials'
  | 'account_conflict'
  | 'coupon_invalid'
  | 'coupon_expired'
  | 'quote_changed'
  | 'idempotency_conflict'
  | 'availability_conflict'
  | 'forbidden'
  | 'not_found'
  | 'network_error'
  | 'invalid_response'
  | 'aborted';

export class ApiError extends Error {
  status: number | null;
  code: ApiErrorCode;
  transient: boolean;
  fieldErrors?: Record<string, 'invalid'>;
  fields?: ('email' | 'username')[];

  constructor(init: {
    status: number | null;
    code: ApiErrorCode;
    transient: boolean;
    fieldErrors?: Record<string, 'invalid'>;
    fields?: ('email' | 'username')[];
  }) {
    super(init.code);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.transient = init.transient;
    this.fieldErrors = init.fieldErrors;
    this.fields = init.fields;
  }
}

export function isApiError(e: unknown): e is ApiError {
  return e instanceof ApiError;
}
