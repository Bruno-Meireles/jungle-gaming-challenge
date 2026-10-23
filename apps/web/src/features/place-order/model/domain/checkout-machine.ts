export type CheckoutNotice =
  | 'quote_changed'
  | 'unavailable'
  | 'revalidation_failed'
  | 'idempotency_conflict'
  | 'wallet_disconnected'
  | 'validation'
  | 'recovery_exhausted'
  | 'unexpected';

export type SubmitFailure = Exclude<CheckoutNotice, 'revalidation_failed'>;

export type CheckoutState =
  | { kind: 'review'; notice: CheckoutNotice | null }
  | { kind: 'revalidating'; expectedHash: string }
  | { kind: 'submitting'; quoteHash: string; recovering: boolean }
  | { kind: 'placed'; orderId: string }
  | { kind: 'session_expired' };

export type CheckoutEvent =
  | { type: 'CONFIRM'; displayedHash: string; canConfirm: boolean }
  | { type: 'REVALIDATED'; hash: string; canCheckout: boolean }
  | { type: 'REVALIDATION_FAILED' }
  | { type: 'SUBMIT_RECOVERING' }
  | { type: 'ORDER_CREATED'; orderId: string }
  | { type: 'SUBMIT_FAILED'; reason: SubmitFailure | 'session_expired' }
  | { type: 'QUOTE_UPDATED' }
  | { type: 'SESSION_EXPIRED' };

export const initialCheckoutState: CheckoutState = { kind: 'review', notice: null };

const review = (notice: CheckoutNotice): CheckoutState => ({ kind: 'review', notice });

function onRevalidated(state: CheckoutState, event: Extract<CheckoutEvent, { type: 'REVALIDATED' }>): CheckoutState {
  if (state.kind !== 'revalidating') return state;
  if (!event.canCheckout) return review('unavailable');
  if (event.hash !== state.expectedHash) return review('quote_changed');
  return { kind: 'submitting', quoteHash: event.hash, recovering: false };
}

function onSubmitFailed(state: CheckoutState, reason: SubmitFailure | 'session_expired'): CheckoutState {
  if (state.kind !== 'submitting') return state;
  return reason === 'session_expired' ? { kind: 'session_expired' } : review(reason);
}

function onOtherEvent(state: CheckoutState, event: CheckoutEvent): CheckoutState {
  switch (event.type) {
    case 'REVALIDATION_FAILED':
      return state.kind === 'revalidating' ? review('revalidation_failed') : state;
    case 'SUBMIT_RECOVERING':
      return state.kind === 'submitting' ? { ...state, recovering: true } : state;
    case 'ORDER_CREATED':
      return state.kind === 'submitting' ? { kind: 'placed', orderId: event.orderId } : state;
    case 'SUBMIT_FAILED':
      return onSubmitFailed(state, event.reason);
    case 'QUOTE_UPDATED':
      return state.kind === 'review' ? review('quote_changed') : state;
    default:
      return state;
  }
}

export function checkoutReducer(state: CheckoutState, event: CheckoutEvent): CheckoutState {
  if (state.kind === 'placed') return state;
  switch (event.type) {
    case 'CONFIRM':
      return state.kind === 'review' && event.canConfirm ? { kind: 'revalidating', expectedHash: event.displayedHash } : state;
    case 'REVALIDATED':
      return onRevalidated(state, event);
    case 'SESSION_EXPIRED':
      return { kind: 'session_expired' };
    default:
      return onOtherEvent(state, event);
  }
}
