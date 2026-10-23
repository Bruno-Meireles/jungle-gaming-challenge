import { describe, expect, it } from 'vitest';

import { canConfirm } from './can-confirm';
import type { ConnectionView, QuoteState } from './ports';

const connected: ConnectionView = { status: 'connected', networkId: 'ethereum' };
const ready: QuoteState = {
  status: 'ready',
  quote: {
    hash: 'h1',
    lines: [],
    subtotalEth: '1',
    discountEth: '0',
    networkFeeEth: '0.001',
    totalEth: '1.001',
    canCheckout: true,
  },
};
const base = { formValid: true, connection: connected, network: 'ethereum', quote: ready };

describe('canConfirm', () => {
  it('e verdadeiro com formulario valido, carteira conectada na rede escolhida e cotacao pronta', () => {
    expect(canConfirm(base)).toBe(true);
  });

  it('exige formulario valido', () => {
    expect(canConfirm({ ...base, formValid: false })).toBe(false);
  });

  it.each(['disconnected', 'connecting', 'rejected'] as const)('exige conexao conectada (%s)', (status) => {
    expect(canConfirm({ ...base, connection: { status, networkId: null } })).toBe(false);
  });

  it('exige que a rede da conexao seja a rede selecionada', () => {
    expect(canConfirm({ ...base, network: 'polygon' })).toBe(false);
  });

  it.each(['loading', 'error'] as const)('exige cotacao pronta (%s)', (status) => {
    expect(canConfirm({ ...base, quote: { status } })).toBe(false);
  });

  it('exige quote.canCheckout', () => {
    expect(canConfirm({ ...base, quote: { status: 'ready', quote: { ...ready.quote, canCheckout: false } } as QuoteState })).toBe(false);
  });
});
