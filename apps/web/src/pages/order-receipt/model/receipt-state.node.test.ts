import { describe, expect, it } from 'vitest';

import type { ReceiptSnapshot } from '../../../widgets/order-receipt/model/ports';
import { parseOrderId, toReceiptState } from './receipt-state';

const snapshot = (status: ReceiptSnapshot['status']): ReceiptSnapshot => ({
  id: 'ord-1',
  status,
  createdAt: '2026-03-05T23:30:00Z',
  networkId: 'ethereum',
  walletAddress: '0xA91F3b5c7d9e1f2a4b6c8d0e1f3a5b7c9d1eE82C',
  transactionRef: status === 'confirmed' ? '0xabc' : null,
  items: [],
  subtotalEth: '1',
  discountEth: '0',
  networkFeeEth: '0.001',
  totalEth: '1.001',
});

describe('parseOrderId', () => {
  it.each(['ord-ana-0001', 'A_b-9', 'a'.repeat(64)])('aceita %s', (id) => {
    expect(parseOrderId(id)).toBe(id);
  });

  it.each(['', 'a'.repeat(65), 'ord/1', 'ord 1', '../x', '<script>', undefined, 42])('rejeita %s', (id) => {
    expect(parseOrderId(id)).toBeNull();
  });
});

describe('toReceiptState', () => {
  it('carregando', () => {
    expect(toReceiptState({ status: 'loading' })).toEqual({ kind: 'loading' });
  });

  it('404/403 vira not_found', () => {
    expect(toReceiptState({ status: 'error', failure: 'not_found' })).toEqual({ kind: 'not_found' });
  });

  it.each(['network', 'unexpected'] as const)('falha %s vira error', (failure) => {
    expect(toReceiptState({ status: 'error', failure })).toEqual({ kind: 'error' });
  });

  it.each(['pending', 'confirmed', 'refused'] as const)('pedido %s carrega o snapshot', (status) => {
    const order = snapshot(status);
    expect(toReceiptState({ status: 'success', order })).toEqual({ kind: status, order });
  });
});
