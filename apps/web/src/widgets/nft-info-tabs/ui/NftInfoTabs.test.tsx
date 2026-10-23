import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { mountWithRouter, nft, type Locale } from '../../../test-support/nft-detail';
import { NftInfoTabs } from '..';

const TEXT = {
  'pt-BR': { details: 'Detalhes', reviews: 'Avaliações', description: 'Um macaco esmeralda raro.', attr: 'Fundo', attrValue: 'Verde', royalty: 'Royalties', reviewCount: '124 avaliações' },
  en: { details: 'Details', reviews: 'Reviews', description: 'A rare emerald ape.', attr: 'Background', attrValue: 'Green', royalty: 'Royalties', reviewCount: '124 reviews' },
} as const;

type Props = Parameters<typeof NftInfoTabs>[0];

describe.each(['pt-BR', 'en'] as Locale[])('NftInfoTabs (%s)', (locale) => {
  const t = TEXT[locale];
  const mount = (props: Partial<Props> = {}) =>
    mountWithRouter(locale, <NftInfoTabs nft={nft} tab="details" onTabChange={() => {}} {...props} />);
  const tab = (name: string) => page.getByRole('tab', { name, exact: true });

  it('tablist com duas abas e a ativa com aria-selected', async () => {
    await mount();
    expect(page.getByRole('tab').elements()).toHaveLength(2);
    await expect.element(tab(t.details)).toHaveAttribute('aria-selected', 'true');
    await expect.element(tab(t.reviews)).toHaveAttribute('aria-selected', 'false');
  });

  it('detalhes: descricao no idioma, atributo, contrato abreviado e royalties', async () => {
    await mount();
    const panel = page.getByRole('tabpanel');
    await expect.element(panel).toHaveTextContent(t.description);
    await expect.element(panel).toHaveTextContent(t.attr);
    await expect.element(panel).toHaveTextContent(t.attrValue);
    await expect.element(panel).toHaveTextContent('0x1234…5678');
    await expect.element(panel).toHaveTextContent(t.royalty);
    await expect.element(panel).toHaveTextContent('ERC-721');
  });

  it('avaliacoes: mostra a quantidade de avaliacoes', async () => {
    await mount({ tab: 'reviews' });
    await expect.element(tab(t.reviews)).toHaveAttribute('aria-selected', 'true');
    await expect.element(page.getByRole('tabpanel')).toHaveTextContent(t.reviewCount);
  });

  it('clicar na aba chama onTabChange', async () => {
    const onTabChange = vi.fn();
    await mount({ onTabChange });
    await tab(t.reviews).click();
    expect(onTabChange).toHaveBeenCalledExactlyOnceWith('reviews');
  });

  it('teclado: seta direita na aba ativa pede a proxima aba; so a ativa fica no tab order', async () => {
    const onTabChange = vi.fn();
    await mount({ onTabChange });
    await expect.element(tab(t.reviews)).toHaveAttribute('tabindex', '-1');
    (tab(t.details).element() as HTMLElement).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(onTabChange).toHaveBeenCalledWith('reviews');
  });

  it('tabpanel e rotulado pela aba ativa', async () => {
    await mount();
    await expect.element(page.getByRole('tabpanel', { name: t.details, exact: true })).toBeVisible();
  });
});
