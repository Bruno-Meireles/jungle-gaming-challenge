import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { mountAccount, type Locale } from '../../../test-support/account';
import { AccountNav } from './AccountNav';

const TEXT = {
  'pt-BR': { nav: 'Meu perfil', profile: 'Perfil', wallets: 'Carteiras', activity: 'Atividade', watchlist: 'Lista de interesse', offers: 'Ofertas', downloads: 'Arquivos baixados', support: 'Suporte', logout: 'Sair' },
  en: { nav: 'My profile', profile: 'Profile', wallets: 'Wallets', activity: 'Activity', watchlist: 'Watchlist', offers: 'Offers', downloads: 'Downloaded files', support: 'Support', logout: 'Sign out' },
} as const;

describe.each(['pt-BR', 'en'] as const)('AccountNav (%s)', (locale: Locale) => {
  const t = TEXT[locale];

  it('nav rotulada com Perfil/Carteiras e aria-current na pagina atual', async () => {
    await mountAccount(locale, <AccountNav onLogout={() => {}} />, '/account/wallets');
    await expect.element(page.getByRole('navigation', { name: t.nav })).toBeVisible();
    await expect.element(page.getByRole('link', { name: t.wallets, exact: true })).toHaveAttribute('aria-current', 'page');
    await expect.element(page.getByRole('link', { name: t.profile, exact: true })).not.toHaveAttribute('aria-current');
    await expect.element(page.getByRole('link', { name: t.profile, exact: true })).toHaveAttribute('href', '/account/profile');
  });

  it('itens sem tela apontam para /unavailable?feature=', async () => {
    await mountAccount(locale, <AccountNav onLogout={() => {}} />);
    const items = [['activity', t.activity], ['watchlist', t.watchlist], ['offers', t.offers], ['downloads', t.downloads], ['support', t.support]] as const;
    for (const [id, name] of items) {
      await expect.element(page.getByRole('link', { name, exact: true })).toHaveAttribute('href', `/unavailable?feature=${id}`);
    }
  });

  it('Sair chama onLogout', async () => {
    const onLogout = vi.fn();
    await mountAccount(locale, <AccountNav onLogout={onLogout} />);
    await page.getByRole('button', { name: t.logout, exact: true }).click();
    expect(onLogout).toHaveBeenCalledOnce();
  });

  it('ordem de tab segue a ordem visual: Perfil, Carteiras', async () => {
    await mountAccount(locale, <AccountNav onLogout={() => {}} />);
    await userEvent.tab();
    await expect.element(page.getByRole('link', { name: t.profile, exact: true })).toHaveFocus();
    await userEvent.tab();
    await expect.element(page.getByRole('link', { name: t.wallets, exact: true })).toHaveFocus();
  });
});
