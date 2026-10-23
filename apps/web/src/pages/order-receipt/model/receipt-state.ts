import type { ReceiptSnapshot, ReceiptState } from '../../../widgets/order-receipt';

const ORDER_ID = /^[A-Za-z0-9_-]{1,64}$/;

export function parseOrderId(value: unknown): string | null {
  return typeof value === 'string' && ORDER_ID.test(value) ? value : null;
}

export type ReceiptQuery =
  | { status: 'loading' }
  | { status: 'error'; failure: 'not_found' | 'network' | 'unexpected' }
  | { status: 'success'; order: ReceiptSnapshot };

export function toReceiptState(query: ReceiptQuery): ReceiptState {
  if (query.status === 'loading') return { kind: 'loading' };
  if (query.status === 'error') return { kind: query.failure === 'not_found' ? 'not_found' : 'error' };
  return { kind: query.order.status, order: query.order };
}
