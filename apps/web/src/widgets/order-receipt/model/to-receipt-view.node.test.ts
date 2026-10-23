import { describe, expect, it } from 'vitest';

import type { ReceiptSnapshot } from './ports';
import { toReceiptView } from './to-receipt-view';

const order: ReceiptSnapshot = {
  id: 'ord-1',
  status: 'confirmed',
  createdAt: '2026-03-05T23:30:00Z',
  networkId: 'ethereum',
  walletAddress: '0xA91F3b5c7d9e1f2a4b6c8d0e1f3a5b7c9d1eE82C',
  transactionRef: '0xdeadbeef',
  items: [
    { tokenId: '042', title: 'Emerald Ape', quantity: 2, unitPriceEth: '10', lineTotalEth: '20' },
    { tokenId: '314', title: 'Violet Nomad', quantity: 6, unitPriceEth: '1.1', lineTotalEth: '6.6' },
  ],
  subtotalEth: '26.6',
  discountEth: '0',
  networkFeeEth: '0.246',
  totalEth: '26.846',
};

describe('toReceiptView', () => {
  it('formata valores ETH como string decimal por locale', () => {
    expect(toReceiptView(order, 'pt-BR').total).toBe('26,846 ETH');
    expect(toReceiptView(order, 'en').total).toBe('26.846 ETH');
    expect(toReceiptView(order, 'pt-BR').networkFee).toBe('0,246 ETH');
  });

  it('itens: edicoes = quantity e total da linha formatado', () => {
    const { items } = toReceiptView(order, 'pt-BR');
    expect(items.map((i) => [i.title, i.editions, i.totalLabel])).toEqual([
      ['Emerald Ape', 2, '20 ETH'],
      ['Violet Nomad', 6, '6,6 ETH'],
    ]);
  });

  it('data em UTC (independe do fuso da maquina)', () => {
    expect(toReceiptView(order, 'pt-BR').date).toContain('23:30');
    expect(toReceiptView(order, 'pt-BR').date).toContain('2026');
    expect(toReceiptView(order, 'en').date).toContain('11:30');
  });

  it('carteira abreviada e id da transacao', () => {
    const view = toReceiptView(order, 'en');
    expect(view.wallet).toBe('0xA91F…E82C');
    expect(view.transactionRef).toBe('0xdeadbeef');
  });

  it('explorer por rede', () => {
    expect(toReceiptView(order, 'en').explorerUrl).toContain('etherscan.io');
    expect(toReceiptView(order, 'en').explorerUrl).toContain('0xdeadbeef');
    expect(toReceiptView({ ...order, networkId: 'polygon' }, 'en').explorerUrl).toContain('polygonscan.com');
  });

  it('sem referencia de transacao nao ha link de explorer', () => {
    expect(toReceiptView({ ...order, transactionRef: null }, 'en').explorerUrl).toBeNull();
  });

  it('linha de desconto so aparece quando diferente de zero', () => {
    expect(toReceiptView(order, 'pt-BR').discount).toBeNull();
    expect(toReceiptView({ ...order, discountEth: '2.66' }, 'pt-BR').discount).toBe('2,66 ETH');
  });
});
