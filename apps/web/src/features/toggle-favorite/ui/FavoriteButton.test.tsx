import { describe, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';

import { mountWithRouter, type Locale } from '../../../test-support/nft-detail';
import { FavoriteButton } from '..';

const NAME = { 'pt-BR': 'Favoritar', en: 'Favorite' } as const;

describe.each(['pt-BR', 'en'] as Locale[])('FavoriteButton (%s)', (locale) => {
  const button = () => page.getByRole('button', { name: NAME[locale], exact: true });
  const mount = (props: Partial<Parameters<typeof FavoriteButton>[0]> = {}) =>
    mountWithRouter(
      locale,
      <FavoriteButton favorited={false} authenticated redirectTo="/nfts/emerald-ape-042?edition=1-10" onToggle={() => {}} {...props} />,
    );

  it('nome fixo e aria-pressed reflete favorited', async () => {
    await mount({ favorited: false });
    await expect.element(button()).toHaveAttribute('aria-pressed', 'false');
  });

  it('favorited=true marca aria-pressed', async () => {
    await mount({ favorited: true });
    await expect.element(button()).toHaveAttribute('aria-pressed', 'true');
  });

  it('com sessao, clicar chama onToggle e nao navega', async () => {
    const onToggle = vi.fn();
    const { router } = await mount({ onToggle });
    await button().click();
    expect(onToggle).toHaveBeenCalledOnce();
    expect(router.state.location.pathname).toBe('/nfts/emerald-ape-042');
  });

  it('sem sessao, clicar vai para /login com redirect e nao chama onToggle', async () => {
    const onToggle = vi.fn();
    const { router } = await mount({ authenticated: false, onToggle });
    await button().click();
    expect(onToggle).not.toHaveBeenCalled();
    await expect.poll(() => router.state.location.pathname).toBe('/login');
    expect(router.state.location.search).toEqual({ redirect: '/nfts/emerald-ape-042?edition=1-10' });
  });
});
