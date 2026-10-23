import { describe, expect, it } from 'vitest';

import { ApiError } from '../../api/api-error';
import { toFormFailure } from './to-form-failure';

const api = (init: ConstructorParameters<typeof ApiError>[0]) => new ApiError(init);

describe('toFormFailure', () => {
  it('400 validation_failed vira validation com os campos', () => {
    const e = api({ status: 400, code: 'validation_failed', transient: false, fieldErrors: { currentPassword: 'invalid' } });
    expect(toFormFailure(e)).toEqual({ kind: 'validation', fields: ['currentPassword'] });
  });
  it('409 account_conflict vira conflict com os campos', () => {
    const e = api({ status: 409, code: 'account_conflict', transient: false, fields: ['email', 'username'] });
    expect(toFormFailure(e)).toEqual({ kind: 'conflict', fields: ['email', 'username'] });
  });
  it('401 session_invalid vira session_expired', () => {
    expect(toFormFailure(api({ status: 401, code: 'session_invalid', transient: false }))).toEqual({ kind: 'session_expired' });
  });
  it('network_error vira network', () => {
    expect(toFormFailure(api({ status: null, code: 'network_error', transient: true }))).toEqual({ kind: 'network' });
  });
  it('5xx e erros desconhecidos viram unexpected', () => {
    expect(toFormFailure(api({ status: 500, code: 'internal_error', transient: true }))).toEqual({ kind: 'unexpected' });
    expect(toFormFailure(new Error('x'))).toEqual({ kind: 'unexpected' });
  });
});
