import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { renderCheckoutUi } from '../../../test-support/render-checkout';
import type { ReceiptView } from '../model/ports';
import { OrderReceipt } from './OrderReceipt';
import { OrderStatusPanel } from './OrderStatusPanel';

const view: ReceiptView = {
  id: 'ord-ana-0001',
  transactionRef: '0xdeadbeef',
  date: '5 de mar. de 2026, 23:30',
  wallet: '0xA91F…E82C',
  explorerUrl: 'https://etherscan.io/tx/0xdeadbeef',
  items: [
    { key: '042', title: 'Emerald Ape', editions: 2, totalLabel: '20 ETH' },
    { key: '314', title: 'Violet Nomad', editions: 6, totalLabel: '6,6 ETH' },
  ],
  networkFee: '0,246 ETH',
  discount: null,
  total: '26,846 ETH',
};

describe('OrderReceipt (pt-BR)', () => {
  it('mostra transacao, data, carteira, itens com edicoes, taxa e total do snapshot', async () => {
    await renderCheckoutUi(<OrderReceipt view={view} />);
    await expect.element(page.getByText('ID da transação')).toBeVisible();
    await expect.element(page.getByText('0xdeadbeef')).toBeVisible();
    await expect.element(page.getByText('5 de mar. de 2026, 23:30')).toBeVisible();
    await expect.element(page.getByText('0xA91F…E82C')).toBeVisible();
    await expect.element(page.getByText('Emerald Ape')).toBeVisible();
    await expect.element(page.getByText(/2 edições/)).toBeVisible();
    await expect.element(page.getByText(/6 edições/)).toBeVisible();
    await expect.element(page.getByText('6,6 ETH', { exact: true })).toBeVisible();
    await expect.element(page.getByText('0,246 ETH', { exact: true })).toBeVisible();
    await expect.element(page.getByText('26,846 ETH', { exact: true })).toBeVisible();
  });

  it('sem desconto nao mostra a linha de desconto', async () => {
    await renderCheckoutUi(<OrderReceipt view={view} />);
    await expect.element(page.getByText('Taxa de rede')).toBeVisible();
    expect(page.getByText('Desconto').query()).toBeNull();
  });

  it('com desconto mostra a linha de desconto', async () => {
    await renderCheckoutUi(<OrderReceipt view={{ ...view, discount: '2,66 ETH' }} />);
    await expect.element(page.getByText('Desconto')).toBeVisible();
    await expect.element(page.getByText('2,66 ETH', { exact: true })).toBeVisible();
  });

  it('link do explorer abre em nova aba com rel seguro', async () => {
    await renderCheckoutUi(<OrderReceipt view={view} />);
    const link = page.getByRole('link', { name: /explorador/i });
    await expect.element(link).toHaveAttribute('href', 'https://etherscan.io/tx/0xdeadbeef');
    await expect.element(link).toHaveAttribute('target', '_blank');
    await expect.element(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});

describe('OrderStatusPanel (pt-BR)', () => {
  it('pendente: role=status, sem texto de sucesso', async () => {
    await renderCheckoutUi(<OrderStatusPanel state={{ kind: 'pending' }} onRetry={() => {}} />);
    await expect.element(page.getByRole('status')).toMatchTextContent('Aguardando a confirmação do pagamento');
    expect(page.getByText(/confirmad[oa]\b/i).query()).toBeNull();
    expect(page.getByRole('alert').query()).toBeNull();
  });

  it('recusado: role=alert e link Voltar ao pagamento para /checkout', async () => {
    await renderCheckoutUi(<OrderStatusPanel state={{ kind: 'refused' }} onRetry={() => {}} />);
    await expect.element(page.getByRole('alert')).toMatchTextContent('Pagamento recusado');
    await expect.element(page.getByRole('link', { name: 'Voltar ao pagamento' })).toHaveAttribute('href', '/checkout');
  });

  it('nao encontrado', async () => {
    await renderCheckoutUi(<OrderStatusPanel state={{ kind: 'not_found' }} onRetry={() => {}} />);
    await expect.element(page.getByText('Pedido não encontrado')).toBeVisible();
  });

  it('erro: alerta e botao Tentar novamente chama onRetry', async () => {
    const onRetry = vi.fn();
    await renderCheckoutUi(<OrderStatusPanel state={{ kind: 'error' }} onRetry={onRetry} />);
    await expect.element(page.getByRole('alert')).toMatchTextContent('Não foi possível carregar o pedido');
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('carregando: role=status', async () => {
    await renderCheckoutUi(<OrderStatusPanel state={{ kind: 'loading' }} onRetry={() => {}} />);
    await expect.element(page.getByRole('status')).toBeVisible();
  });
});
