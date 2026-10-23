import { describe, expect, it } from 'vitest';

import { ApiError, type ApiErrorCode } from '../../../shared/api/api-error';
import { toOrderFailure, toPlaceOrderFailure } from './checkout-api';

const error = (code: ApiErrorCode, transient = false) => new ApiError({ status: null, code, transient });

describe('toPlaceOrderFailure', () => {
  it.each(['quote_changed', 'availability_conflict', 'idempotency_conflict'] as const)(
    'mapeia %s para a falha de mesmo nome',
    (code) => {
      expect(toPlaceOrderFailure(error(code))).toEqual({ kind: code });
    },
  );

  it('mapeia sessao invalida e validacao', () => {
    expect(toPlaceOrderFailure(error('session_invalid'))).toEqual({ kind: 'session_expired' });
    expect(toPlaceOrderFailure(error('validation_failed'))).toEqual({ kind: 'validation' });
  });

  it('trata timeout/rede e 5xx transitorio como falha de rede recuperavel', () => {
    expect(toPlaceOrderFailure(error('network_error'))).toEqual({ kind: 'network', retryable: true });
    expect(toPlaceOrderFailure(error('service_unavailable', true))).toEqual({ kind: 'network', retryable: true });
  });

  it('trata erro nao transitorio ou desconhecido como inesperado', () => {
    expect(toPlaceOrderFailure(error('internal_error'))).toEqual({ kind: 'unexpected' });
    expect(toPlaceOrderFailure(new Error('x'))).toEqual({ kind: 'unexpected' });
  });
});

describe('toOrderFailure', () => {
  it('esconde pedido de outro usuario: forbidden e not_found viram not_found', () => {
    expect(toOrderFailure(error('forbidden'))).toEqual({ kind: 'not_found' });
    expect(toOrderFailure(error('not_found'))).toEqual({ kind: 'not_found' });
  });

  it('mapeia sessao, rede e inesperado', () => {
    expect(toOrderFailure(error('session_invalid'))).toEqual({ kind: 'session_expired' });
    expect(toOrderFailure(error('network_error'))).toEqual({ kind: 'network', retryable: true });
    expect(toOrderFailure(error('internal_error'))).toEqual({ kind: 'unexpected' });
    expect(toOrderFailure('x')).toEqual({ kind: 'unexpected' });
  });
});
