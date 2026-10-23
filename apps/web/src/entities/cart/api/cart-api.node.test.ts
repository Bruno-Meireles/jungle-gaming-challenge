import { describe, expect, it } from 'vitest';

import { ApiError, type ApiErrorCode } from '../../../shared/api/api-error';
import { toCartFailure, toCouponFailure } from './cart-api';

const error = (code: ApiErrorCode, extra: { transient?: boolean; available?: number } = {}) =>
  new ApiError({ status: null, code, transient: extra.transient ?? false, available: extra.available });

describe('toCartFailure', () => {
  it('preserva o estoque disponivel no conflito de disponibilidade', () => {
    expect(toCartFailure(error('availability_conflict', { available: 2 }))).toEqual({
      kind: 'availability_conflict',
      available: 2,
    });
    expect(toCartFailure(error('availability_conflict'))).toEqual({ kind: 'availability_conflict', available: 0 });
  });

  it('mapeia not_found, rede/transitorio e inesperado', () => {
    expect(toCartFailure(error('not_found'))).toEqual({ kind: 'not_found' });
    expect(toCartFailure(error('network_error'))).toEqual({ kind: 'network', retryable: true });
    expect(toCartFailure(error('service_unavailable', { transient: true }))).toEqual({
      kind: 'network',
      retryable: true,
    });
    expect(toCartFailure(error('internal_error'))).toEqual({ kind: 'unexpected' });
    expect(toCartFailure(new Error('x'))).toEqual({ kind: 'unexpected' });
  });
});

describe('toCouponFailure', () => {
  it('distingue cupom invalido de expirado', () => {
    expect(toCouponFailure(error('coupon_invalid'))).toEqual({ kind: 'coupon_invalid' });
    expect(toCouponFailure(error('coupon_expired'))).toEqual({ kind: 'coupon_expired' });
  });

  it('mantem falha de rede e reduz o resto a inesperado', () => {
    expect(toCouponFailure(error('network_error'))).toEqual({ kind: 'network', retryable: true });
    expect(toCouponFailure(error('availability_conflict'))).toEqual({ kind: 'unexpected' });
    expect(toCouponFailure(new Error('x'))).toEqual({ kind: 'unexpected' });
  });
});
