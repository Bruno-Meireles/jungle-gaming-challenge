import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { mountWithRouter, type Locale } from '../../../test-support/nft-detail';
import { AddToCartButton } from '..';

const TEXT = {
  'pt-BR': { buy: 'Comprar', conflict: 'Esta edição mudou ou esgotou. Atualize e tente de novo.', network: 'Não foi possível conectar. Verifique sua conexão.', retry: 'Tentar novamente' },
  en: { buy: 'Buy now', conflict: 'This edition changed or sold out. Refresh and try again.', network: 'Could not connect. Check your connection.', retry: 'Try again' },
} as const;

type Props = Parameters<typeof AddToCartButton>[0];

describe.each(['pt-BR', 'en'] as Locale[])('AddToCartButton (%s)', (locale) => {
  const t = TEXT[locale];
  const controller = (over: Partial<Props['controller']> = {}): Props['controller'] => ({ submit: () => {}, pending: false, failure: null, retry: () => {}, ...over });
  const mount = (props: Partial<Props> = {}) =>
    mountWithRouter(locale, <AddToCartButton nftId="emerald-ape-042" editionId="1-10" quantity={2} controller={controller()} {...props} />);
  const buy = () => page.getByRole('button', { name: t.buy, exact: true });

  it('clicar envia {nftId, editionId, quantity} ao controller', async () => {
    const submit = vi.fn();
    await mount({ controller: controller({ submit }) });
    await buy().click();
    expect(submit).toHaveBeenCalledExactlyOnceWith({ nftId: 'emerald-ape-042', editionId: '1-10', quantity: 2 });
  });

  it('disabled desabilita o botao', async () => {
    await mount({ disabled: true });
    await expect.element(buy()).toBeDisabled();
  });

  it('pending desabilita e marca aria-busy (evita envio duplicado)', async () => {
    await mount({ controller: controller({ pending: true }) });
    await expect.element(buy()).toBeDisabled();
    await expect.element(buy()).toHaveAttribute('aria-busy', 'true');
  });

  it('falha conflict (409) mostra alerta com a mensagem', async () => {
    await mount({ controller: controller({ failure: { kind: 'conflict' } }) });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.conflict);
  });

  it('falha network mostra alerta e Tentar novamente chama retry', async () => {
    const retry = vi.fn();
    await mount({ controller: controller({ failure: { kind: 'network', retryable: true }, retry }) });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.network);
    await page.getByRole('button', { name: t.retry, exact: true }).click();
    expect(retry).toHaveBeenCalledOnce();
  });
});
