import { beforeEach, describe, it } from 'vitest';
import { page } from 'vitest/browser';
import { expect } from 'vitest';

import { mountAccount, seedSession, type Locale } from '../../../test-support/account';
import { AccountProfilePage } from './AccountProfilePage';
import { AccountWalletsPage } from './AccountWalletsPage';

const TEXT = {
  'pt-BR': { profile: 'Perfil', wallets: 'Carteiras', profileTitle: 'Perfil — Kurio', walletsTitle: 'Carteiras — Kurio' },
  en: { profile: 'Profile', wallets: 'Wallets', profileTitle: 'Profile — Kurio', walletsTitle: 'Wallets — Kurio' },
} as const;

describe.each(['pt-BR', 'en'] as const)('paginas da conta (%s)', (locale: Locale) => {
  const t = TEXT[locale];
  beforeEach(() => seedSession('ana'));

  it('AccountProfilePage: title e h1', async () => {
    await mountAccount(locale, <AccountProfilePage />);
    await expect.element(page.getByRole('heading', { level: 1, name: t.profile, exact: true })).toBeVisible();
    await expect.poll(() => document.title).toBe(t.profileTitle);
  });

  it('AccountWalletsPage: title e h1', async () => {
    await mountAccount(locale, <AccountWalletsPage />, '/account/wallets');
    await expect.element(page.getByRole('heading', { level: 1, name: t.wallets, exact: true })).toBeVisible();
    await expect.poll(() => document.title).toBe(t.walletsTitle);
  });
});
