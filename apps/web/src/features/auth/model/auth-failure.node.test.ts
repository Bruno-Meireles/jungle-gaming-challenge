import { describe, expect, it } from 'vitest';

import { ApiError } from '../../../shared/api/api-error';
import { toAuthFailure } from './auth-failure';

const api = (init: ConstructorParameters<typeof ApiError>[0]) => new ApiError(init);

describe('toAuthFailure', () => {
  it('invalid_credentials', () => {
    expect(toAuthFailure(api({ status: 401, code: 'invalid_credentials', transient: false }))).toEqual({
      kind: 'invalid_credentials',
    });
  });

  it('account_conflict preserva os campos', () => {
    expect(
      toAuthFailure(api({ status: 409, code: 'account_conflict', transient: false, fields: ['email', 'username'] })),
    ).toEqual({ kind: 'account_conflict', fields: ['email', 'username'] });
  });

  it('account_conflict sem fields vira lista vazia', () => {
    expect(toAuthFailure(api({ status: 409, code: 'account_conflict', transient: false }))).toEqual({
      kind: 'account_conflict',
      fields: [],
    });
  });

  it('validation_failed preserva fieldErrors', () => {
    expect(
      toAuthFailure(api({ status: 400, code: 'validation_failed', transient: false, fieldErrors: { email: 'invalid' } })),
    ).toEqual({ kind: 'validation', fieldErrors: { email: 'invalid' } });
  });

  it('rede e erros transitorios de servidor viram network retryable', () => {
    expect(toAuthFailure(api({ status: null, code: 'network_error', transient: true }))).toEqual({
      kind: 'network',
      retryable: true,
    });
    expect(toAuthFailure(api({ status: 503, code: 'service_unavailable', transient: true }))).toEqual({
      kind: 'network',
      retryable: true,
    });
  });

  it('qualquer outra coisa e unexpected e nao vaza ApiError', () => {
    expect(toAuthFailure(new Error('boom'))).toEqual({ kind: 'unexpected' });
    expect(toAuthFailure(api({ status: 200, code: 'invalid_response', transient: false }))).toEqual({
      kind: 'unexpected',
    });
    expect(toAuthFailure('x')).toEqual({ kind: 'unexpected' });
  });
});
