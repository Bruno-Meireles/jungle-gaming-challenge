import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { mountWithRouter, nft, type Locale } from '../../../test-support/nft-detail';
import { NftDetailPage, pageNftDetailLocales } from '..';

const TEXT = {
  'pt-BR': {
    loading: 'Carregando NFT',
    error: 'Não foi possível carregar este NFT.',
    retry: 'Tentar novamente',
    notFound: 'NFT não encontrado',
    home: 'Voltar ao início',
    buy: 'Comprar',
    soldOut: 'Esgotada',
    inc: 'Aumentar quantidade',
    max: 'Máximo de 3 por pedido',
    description: 'Um macaco esmeralda raro.',
    reviews: 'Avaliações de colecionadores (124)',
    details: 'Detalhes do NFT',
    price: { def: '1,19 ETH', small: '1,69 ETH' },
  },
  en: {
    loading: 'Loading NFT',
    error: 'Could not load this NFT.',
    retry: 'Try again',
    notFound: 'NFT not found',
    home: 'Back to home',
    buy: 'Buy now',
    soldOut: 'Sold out',
    inc: 'Increase quantity',
    max: 'Maximum 3 per order',
    description: 'A rare emerald ape.',
    reviews: 'Collector reviews (124)',
    details: 'NFT details',
    price: { def: '1.19 ETH', small: '1.69 ETH' },
  },
} as const;

type Props = Parameters<typeof NftDetailPage>[0];

const baseProps = (over: Partial<Props> = {}): Props => ({
  result: { status: 'success', nft },
  search: { tab: 'details' },
  onRetry: () => {},
  onEditionChange: () => {},
  onTabChange: () => {},
  addToCart: { submit: () => {}, pending: false, failure: null, retry: () => {} },
  favorite: { favorited: false, authenticated: true, redirectTo: '/nfts/emerald-ape-042', onToggle: () => {} },
  ...over,
});

describe('pageNftDetailLocales', () => {
  it('traz title e description nos dois idiomas', () => {
    for (const l of ['pt-BR', 'en'] as const) {
      expect(pageNftDetailLocales[l]).toHaveProperty('title');
      expect(pageNftDetailLocales[l]).toHaveProperty('description');
    }
  });
});

describe.each(['pt-BR', 'en'] as Locale[])('NftDetailPage (%s)', (locale) => {
  const t = TEXT[locale];
  const mount = (over: Partial<Props> = {}) => mountWithRouter(locale, <NftDetailPage {...baseProps(over)} />);

  it('Pending: regiao nomeada com aria-busy e sem conteudo de dados', async () => {
    await mount({ result: { status: 'pending' } });
    await expect.element(page.getByLabelText(t.loading, { exact: true })).toHaveAttribute('aria-busy', 'true');
    expect(page.getByRole('button', { name: t.buy }).elements()).toHaveLength(0);
  });

  it('Error: alerta com Tentar novamente que chama onRetry', async () => {
    const onRetry = vi.fn();
    await mount({ result: { status: 'error' }, onRetry });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.error);
    await page.getByRole('button', { name: t.retry, exact: true }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('NotFound: titulo e link para a home', async () => {
    await mount({ result: { status: 'not-found' } });
    await expect.element(page.getByRole('heading', { level: 1, name: t.notFound, exact: true })).toBeVisible();
    await expect.element(page.getByRole('link', { name: t.home, exact: true })).toHaveAttribute('href', '/');
  });

  it('sucesso: h1 com o titulo, descricao no idioma e edicao padrao com preco ETH formatado', async () => {
    await mount();
    await expect.element(page.getByRole('heading', { level: 1, name: nft.title, exact: true })).toBeVisible();
    await expect.element(page.getByText(t.description)).toBeVisible();
    await expect.element(page.getByText(t.price.def, { exact: true }).first()).toBeVisible();
    await expect.element(page.getByRole('radio', { name: /50/ })).toBeChecked();
  });

  it('edicao da URL seleciona essa edicao; invalida cai na padrao', async () => {
    await mount({ search: { tab: 'details', edition: '1-10' } });
    await expect.element(page.getByRole('radio', { name: /10/ })).toBeChecked();
    await expect.element(page.getByText(t.price.small, { exact: true }).first()).toBeVisible();
  });

  it('edicao invalida na URL usa a padrao', async () => {
    await mount({ search: { tab: 'details', edition: 'nope' } });
    await expect.element(page.getByRole('radio', { name: /50/ })).toBeChecked();
  });

  it('edicao esgotada na URL: comprar desabilitado e texto Esgotada', async () => {
    await mount({ search: { tab: 'details', edition: '1-1' } });
    await expect.element(page.getByRole('button', { name: t.buy, exact: true })).toBeDisabled();
    await expect.element(page.getByText(t.soldOut).first()).toBeVisible();
  });

  it('limite de quantidade da edicao (3) mostra a mensagem', async () => {
    await mount({ search: { tab: 'details', edition: '1-10' } });
    const inc = page.getByRole('button', { name: t.inc, exact: true });
    await inc.click();
    await inc.click();
    await expect.element(page.getByText(t.max)).toBeVisible();
  });

  it('escolher outra edicao chama onEditionChange com o id', async () => {
    const onEditionChange = vi.fn();
    await mount({ onEditionChange });
    await page.getByRole('radio', { name: /10/ }).click();
    expect(onEditionChange).toHaveBeenCalledExactlyOnceWith('1-10');
  });

  it('abas: tab da URL e navegacao por teclado chamam onTabChange', async () => {
    const onTabChange = vi.fn();
    await mount({ search: { tab: 'reviews' }, onTabChange });
    await expect.element(page.getByRole('tab', { name: t.reviews, exact: true })).toHaveAttribute('aria-selected', 'true');
    (page.getByRole('tab', { name: t.reviews, exact: true }).element() as HTMLElement).focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(onTabChange).toHaveBeenCalledWith('details');
  });

  it('define document.title a partir do namespace da pagina', async () => {
    await mount();
    await expect.poll(() => document.title).toContain(nft.title);
  });
});
