/** Codigos de erro de campo vindos da validacao (sem texto: a traducao e da UI). */
export type FieldErrorCode = 'required' | 'invalid_email' | 'password_mismatch';

export type FormFailure =
  | { kind: 'invalid_credentials' }
  | { kind: 'account_conflict'; fields: ('email' | 'username')[] }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' }
  | null;
