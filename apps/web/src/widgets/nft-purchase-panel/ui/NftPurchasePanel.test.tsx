import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { defaultEdition, editions, mountWithRouter, type Locale } from '../../../test-support/nft-detail';
import { NftPurchasePanel } from '..';

const TEXT = {
  'pt-BR': {
    buy: 'Comprar',
    qty: 'Quantidade',
    inc: 'Aumentar quantidade',
    dec: 'Diminuir quantidade',
    max: (n: number) => `Máximo de ${n} por pedido`,
    soldOut: 'Esgotada',
    price1: '1,19 ETH',
    total2: '2,38 ETH',
    total3Small: '5,07 ETH',
    limited10: /Limitada · 10/,
    favorite: 'Favoritar',
  },
  en: {
    buy: 'Buy now',
    qty: 'Quantity',
    inc: 'Increase quantity',
    dec: 'Decrease quantity',
    max: (n: number) => `Maximum ${n} per order`,
    soldOut: 'Sold out',
    price1: '1.19 ETH',
    total2: '2.38 ETH',
    total3Small: '5.07 ETH',
    limited10: /Limited · 10/,
    favorite: 'Favorite',
  },
} as const;

type Props = Parameters<typeof NftPurchasePanel>[0];

describe.each(['pt-BR', 'en'] as Locale[])('NftPurchasePanel (%s)', (locale) => {
  const t = TEXT[locale];
  const props = (over: Partial<Props> = {}): Props => ({
    nftId: 'emerald-ape-042',
    editions,
    selectedEditionId: defaultEdition.id,
    onSelectEdition: () => {},
    addToCart: { submit: () => {}, pending: false, failure: null, retry: () => {} },
    favorite: { favorited: false, authenticated: true, redirectTo: '/nfts/emerald-ape-042', onToggle: () => {} },
    ...over,
  });
  const mount = (over: Partial<Props> = {}) => mountWithRouter(locale, <NftPurchasePanel {...props(over)} />);
  const qty = () => page.getByRole('spinbutton', { name: t.qty, exact: true });
  const inc = () => page.getByRole('button', { name: t.inc, exact: true });
  const dec = () => page.getByRole('button', { name: t.dec, exact: true });

  it('mostra o preco da edicao selecionada e quantidade inicial 1', async () => {
    await mount();
    await expect.element(page.getByText(t.price1, { exact: true }).first()).toBeVisible();
    await expect.element(qty()).toHaveValue(1);
  });

  it('stepper: minimo 1 (diminuir desabilitado) e aumentar incrementa', async () => {
    await mount();
    await expect.element(dec()).toBeDisabled();
    await inc().click();
    await expect.element(qty()).toHaveValue(2);
    await expect.element(dec()).toBeEnabled();
  });

  it('total = preco x quantidade em aritmetica decimal exata (sem float)', async () => {
    await mount();
    await inc().click();
    await expect.element(page.getByText(t.total2, { exact: true })).toBeVisible();
  });

  it('no limite min(remaining, maxPerOrder) desabilita aumentar e mostra a mensagem', async () => {
    await mount({ selectedEditionId: '1-10' });
    await inc().click();
    await inc().click();
    await expect.element(qty()).toHaveValue(3);
    await expect.element(inc()).toBeDisabled();
    await expect.element(page.getByText(t.max(3))).toBeVisible();
    await expect.element(page.getByText(t.total3Small, { exact: true })).toBeVisible();
  });

  it('teclado: foco no stepper e Enter aumenta', async () => {
    await mount();
    (inc().element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(qty()).toHaveValue(2);
  });

  it('comprar envia {nftId, editionId, quantity}', async () => {
    const submit = vi.fn();
    await mount({ addToCart: { submit, pending: false, failure: null, retry: () => {} } });
    await inc().click();
    await page.getByRole('button', { name: t.buy, exact: true }).click();
    expect(submit).toHaveBeenCalledExactlyOnceWith({ nftId: 'emerald-ape-042', editionId: '1-50', quantity: 2 });
  });

  it('trocar de edicao chama onSelectEdition', async () => {
    const onSelectEdition = vi.fn();
    await mount({ onSelectEdition });
    await page.getByRole('radio', { name: t.limited10 }).click();
    expect(onSelectEdition).toHaveBeenCalledExactlyOnceWith('1-10');
  });

  it('edicao esgotada selecionada: comprar desabilitado e texto de esgotada', async () => {
    await mount({ selectedEditionId: '1-1' });
    await expect.element(page.getByRole('button', { name: t.buy, exact: true })).toBeDisabled();
    await expect.element(page.getByText(t.soldOut).first()).toBeVisible();
    await expect.element(inc()).toBeDisabled();
  });

  it('inclui o botao de favoritar', async () => {
    await mount();
    await expect.element(page.getByRole('button', { name: t.favorite, exact: true })).toBeVisible();
  });
});
