import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { renderCheckoutUi } from '../../../test-support/render-checkout';
import type { QuoteView } from '../model/ports';
import { OrderSummary } from './OrderSummary';

const quote: QuoteView = {
  hash: 'h1',
  lines: [
    { tokenId: '042', title: 'Emerald Ape', quantity: 2, unitPriceEth: '0.5', lineTotalEth: '1' },
    { tokenId: '314', title: 'Violet Nomad', quantity: 1, unitPriceEth: '0.25', lineTotalEth: '0.25' },
    { tokenId: '088', title: 'Ivory Baron', quantity: 3, unitPriceEth: '0.1', lineTotalEth: '0.3' },
  ],
  subtotalEth: '1.55',
  discountEth: '0.155',
  networkFeeEth: '0.002',
  totalEth: '1.397',
  canCheckout: true,
};

describe('OrderSummary (pt-BR)', () => {
  it('uma linha por item com titulo, ID do token, quantidade e total da linha (strings da cotacao)', async () => {
    await renderCheckoutUi(<OrderSummary quote={quote} />);
    expect(page.getByText('ID do token').elements()).toHaveLength(3);
    for (const title of ['Emerald Ape', 'Violet Nomad', 'Ivory Baron']) await expect.element(page.getByText(title)).toBeVisible();
    await expect.element(page.getByText('(x 2)')).toBeVisible();
    await expect.element(page.getByText('(x 1)')).toBeVisible();
    await expect.element(page.getByText('(x 3)')).toBeVisible();
    await expect.element(page.getByText('1 ETH', { exact: true })).toBeVisible();
    await expect.element(page.getByText('0,25 ETH', { exact: true })).toBeVisible();
    await expect.element(page.getByText('0,3 ETH', { exact: true })).toBeVisible();
  });

  it('totais: Subtotal, Desconto, Taxa de rede e Total', async () => {
    await renderCheckoutUi(<OrderSummary quote={quote} />);
    for (const [label, value] of [
      ['Subtotal', '1,55 ETH'],
      ['Desconto', '0,155 ETH'],
      ['Taxa de rede', '0,002 ETH'],
      ['Total', '1,397 ETH'],
    ] as const) {
      await expect.element(page.getByText(label, { exact: true })).toBeVisible();
      await expect.element(page.getByText(new RegExp(`${value}$`))).toBeVisible();
    }
  });
});

describe('OrderSummary (en)', () => {
  it('rotulos em ingles e separador decimal ponto', async () => {
    await renderCheckoutUi(<OrderSummary quote={quote} />, 'en');
    await expect.element(page.getByText('Token ID').first()).toBeVisible();
    await expect.element(page.getByText('Network fee', { exact: true })).toBeVisible();
    await expect.element(page.getByText(/1\.397 ETH$/)).toBeVisible();
  });
});
