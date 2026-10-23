import { describe, expect, it } from 'vitest';

import type { OrderStatus } from './order';
import { fingerprintOf, isTerminalStatus, shouldApplyOrderUpdate } from './order-status';

describe('isTerminalStatus', () => {
  it.each([
    ['pending', false],
    ['confirmed', true],
    ['refused', true],
  ] as const)('%s -> %s', (status, expected) => {
    expect(isTerminalStatus(status)).toBe(expected);
  });
});

describe('shouldApplyOrderUpdate', () => {
  const known = (status: OrderStatus, version: number) => ({ status, version });

  it('aplica quando o pedido ainda e desconhecido', () => {
    expect(shouldApplyOrderUpdate(undefined, known('pending', 0))).toBe(true);
  });

  it('aplica somente versao maior que a conhecida (ignora duplicata e antigo)', () => {
    expect(shouldApplyOrderUpdate(known('pending', 2), known('confirmed', 3))).toBe(true);
    expect(shouldApplyOrderUpdate(known('pending', 2), known('confirmed', 2))).toBe(false);
    expect(shouldApplyOrderUpdate(known('pending', 2), known('confirmed', 1))).toBe(false);
  });

  it('nunca altera pedido terminal', () => {
    expect(shouldApplyOrderUpdate(known('confirmed', 1), known('refused', 9))).toBe(false);
    expect(shouldApplyOrderUpdate(known('refused', 1), known('confirmed', 9))).toBe(false);
  });
});

describe('fingerprintOf', () => {
  it('e deterministico, com 8 hex, e muda com o conteudo', () => {
    const a = fingerprintOf({ q: 'a', n: 1 });

    expect(a).toMatch(/^[0-9a-f]{8}$/);
    expect(fingerprintOf({ q: 'a', n: 1 })).toBe(a);
    expect(fingerprintOf({ q: 'a', n: 2 })).not.toBe(a);
  });
});
