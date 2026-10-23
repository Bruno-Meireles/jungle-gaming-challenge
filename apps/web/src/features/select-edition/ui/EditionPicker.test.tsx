import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { editions, mountWithRouter, type Locale } from '../../../test-support/nft-detail';
import { EditionPicker } from '..';

/* Rotulos e textos sao contrato de i18n definido por este teste (Figma nao fixa o en). */
const TEXT = {
  'pt-BR': { group: 'Edição', limited: (n: number) => `Limitada · ${n}`, open: 'Aberta', soldOut: 'Esgotada', price: ['3,50 ETH', '1,69 ETH', '1,19 ETH', '0,25 ETH'] },
  en: { group: 'Edition', limited: (n: number) => `Limited · ${n}`, open: 'Open', soldOut: 'Sold out', price: ['3.50 ETH', '1.69 ETH', '1.19 ETH', '0.25 ETH'] },
} as const;

describe.each(['pt-BR', 'en'] as Locale[])('EditionPicker (%s)', (locale) => {
  const t = TEXT[locale];
  const mount = (props: Partial<Parameters<typeof EditionPicker>[0]> = {}) =>
    mountWithRouter(locale, <EditionPicker editions={editions} selectedId="1-50" onSelect={() => {}} {...props} />);

  it('expoe um radiogroup nomeado com uma opcao por edicao e a selecionada marcada', async () => {
    await mount();
    await expect.element(page.getByRole('radiogroup', { name: t.group })).toBeVisible();
    expect(page.getByRole('radio').elements()).toHaveLength(4);
    await expect.element(page.getByRole('radio', { name: new RegExp(t.limited(50)) })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: new RegExp(t.open) })).not.toBeChecked();
  });

  it('mostra o preco ETH formatado de cada edicao a partir da string decimal', async () => {
    await mount();
    for (const price of t.price) await expect.element(page.getByText(price, { exact: true })).toBeVisible();
  });

  it('edicao esgotada fica desabilitada e traz o texto Esgotada', async () => {
    await mount();
    await expect.element(page.getByRole('radio', { name: new RegExp(t.limited(1)) })).toBeDisabled();
    await expect.element(page.getByText(t.soldOut)).toBeVisible();
  });

  it('clicar numa edicao chama onSelect com o id', async () => {
    const onSelect = vi.fn();
    await mount({ onSelect });
    await page.getByRole('radio', { name: new RegExp(t.limited(10)) }).click();
    expect(onSelect).toHaveBeenCalledExactlyOnceWith('1-10');
  });

  it('setas movem a selecao entre edicoes disponiveis (pula a esgotada)', async () => {
    const onSelect = vi.fn();
    await mount({ onSelect, selectedId: '1-10' });
    (page.getByRole('radio', { name: new RegExp(t.limited(10)) }).element() as HTMLElement).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onSelect).not.toHaveBeenCalledWith('1-1');
    await userEvent.keyboard('{ArrowRight}');
    expect(onSelect).toHaveBeenLastCalledWith('1-50');
  });
});
