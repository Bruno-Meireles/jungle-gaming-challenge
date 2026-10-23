import { describe, expect, it } from 'vitest';

import { checkoutReducer, initialCheckoutState } from './checkout-machine';

const confirm = (displayedHash = 'h1', canConfirm = true) => ({ type: 'CONFIRM', displayedHash, canConfirm }) as const;
const revalidating = checkoutReducer(initialCheckoutState, confirm());
const submitting = checkoutReducer(revalidating, { type: 'REVALIDATED', hash: 'h1', canCheckout: true });

describe('checkoutReducer: confirmacao e revalidacao', () => {
  it('estado inicial e review sem aviso', () => {
    expect(initialCheckoutState).toEqual({ kind: 'review', notice: null });
  });

  it('CONFIRM em review com canConfirm vai para revalidating com o hash exibido', () => {
    expect(revalidating).toEqual({ kind: 'revalidating', expectedHash: 'h1' });
  });

  it('CONFIRM sem canConfirm e ignorado', () => {
    expect(checkoutReducer(initialCheckoutState, confirm('h1', false))).toBe(initialCheckoutState);
  });

  it('CONFIRM duplicado ou fora de review e ignorado', () => {
    expect(checkoutReducer(revalidating, confirm('h2'))).toBe(revalidating);
    expect(checkoutReducer(submitting, confirm('h2'))).toBe(submitting);
  });

  it('REVALIDATED com mesmo hash e canCheckout vai para submitting', () => {
    expect(submitting).toEqual({ kind: 'submitting', quoteHash: 'h1', recovering: false });
  });

  it('REVALIDATED com hash diferente volta a review com aviso quote_changed (exige novo clique)', () => {
    expect(checkoutReducer(revalidating, { type: 'REVALIDATED', hash: 'h2', canCheckout: true })).toEqual({
      kind: 'review',
      notice: 'quote_changed',
    });
  });

  it('REVALIDATED sem canCheckout volta a review com aviso unavailable', () => {
    expect(checkoutReducer(revalidating, { type: 'REVALIDATED', hash: 'h1', canCheckout: false })).toEqual({
      kind: 'review',
      notice: 'unavailable',
    });
  });

  it('REVALIDATION_FAILED volta a review com aviso revalidation_failed', () => {
    expect(checkoutReducer(revalidating, { type: 'REVALIDATION_FAILED' })).toEqual({ kind: 'review', notice: 'revalidation_failed' });
  });

  it('REVALIDATED fora de revalidating e ignorado', () => {
    expect(checkoutReducer(initialCheckoutState, { type: 'REVALIDATED', hash: 'h1', canCheckout: true })).toBe(initialCheckoutState);
  });

  it('um novo CONFIRM apos aviso limpa o aviso', () => {
    const warned = checkoutReducer(revalidating, { type: 'REVALIDATED', hash: 'h2', canCheckout: true });
    expect(checkoutReducer(warned, confirm('h2'))).toEqual({ kind: 'revalidating', expectedHash: 'h2' });
  });
});

describe('checkoutReducer: envio', () => {
  it('SUBMIT_RECOVERING marca recovering em submitting', () => {
    expect(checkoutReducer(submitting, { type: 'SUBMIT_RECOVERING' })).toEqual({ kind: 'submitting', quoteHash: 'h1', recovering: true });
  });

  it('SUBMIT_RECOVERING fora de submitting e ignorado', () => {
    expect(checkoutReducer(initialCheckoutState, { type: 'SUBMIT_RECOVERING' })).toBe(initialCheckoutState);
  });

  it('ORDER_CREATED leva a placed com o id', () => {
    expect(checkoutReducer(submitting, { type: 'ORDER_CREATED', orderId: 'ord-9' })).toEqual({ kind: 'placed', orderId: 'ord-9' });
  });

  it('placed e terminal: ignora qualquer evento', () => {
    const placed = checkoutReducer(submitting, { type: 'ORDER_CREATED', orderId: 'ord-9' });
    expect(checkoutReducer(placed, confirm())).toBe(placed);
    expect(checkoutReducer(placed, { type: 'SESSION_EXPIRED' })).toBe(placed);
    expect(checkoutReducer(placed, { type: 'SUBMIT_FAILED', reason: 'unexpected' })).toBe(placed);
  });

  it.each(['quote_changed', 'unavailable', 'idempotency_conflict', 'wallet_disconnected', 'validation', 'recovery_exhausted', 'unexpected'] as const)(
    'SUBMIT_FAILED %s volta a review com aviso igual ao motivo',
    (reason) => {
      expect(checkoutReducer(submitting, { type: 'SUBMIT_FAILED', reason })).toEqual({ kind: 'review', notice: reason });
    },
  );

  it('SUBMIT_FAILED session_expired vira estado proprio', () => {
    expect(checkoutReducer(submitting, { type: 'SUBMIT_FAILED', reason: 'session_expired' })).toEqual({ kind: 'session_expired' });
  });

  it('SESSION_EXPIRED em qualquer etapa nao final vai para session_expired', () => {
    for (const s of [initialCheckoutState, revalidating, submitting]) {
      expect(checkoutReducer(s, { type: 'SESSION_EXPIRED' })).toEqual({ kind: 'session_expired' });
    }
  });
});

describe('checkoutReducer: cotacao atualizada', () => {
  it('QUOTE_UPDATED em review exibe aviso quote_changed', () => {
    expect(checkoutReducer(initialCheckoutState, { type: 'QUOTE_UPDATED' })).toEqual({ kind: 'review', notice: 'quote_changed' });
  });

  it('QUOTE_UPDATED durante revalidating ou submitting nao altera o estado', () => {
    expect(checkoutReducer(revalidating, { type: 'QUOTE_UPDATED' })).toBe(revalidating);
    expect(checkoutReducer(submitting, { type: 'QUOTE_UPDATED' })).toBe(submitting);
  });
});
