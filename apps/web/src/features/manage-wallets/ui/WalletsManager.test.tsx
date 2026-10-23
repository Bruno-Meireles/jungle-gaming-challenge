import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { mountAccount, seedSession, type Locale } from '../../../test-support/account';
import { WalletsManager } from './WalletsManager';

const ADDR = '0x71c7656ec7ab88b098defb751b7401b5f6d8976f';
const TEXT = {
  'pt-BR': {
    primary: 'Carteira principal', secondary: 'Carteira secundária', network: 'Rede', address: 'Endereço da carteira',
    same: 'Igual à carteira principal', save: 'Salvar', add: 'Adicionar',
    noSecondary: 'Você ainda não adicionou uma carteira secundária.',
    noPrimary: 'Você ainda não adicionou uma carteira principal.',
    invalid: 'Endereço de carteira inválido', saved: 'Carteira salva',
  },
  en: {
    primary: 'Primary wallet', secondary: 'Secondary wallet', network: 'Network', address: 'Wallet address',
    same: 'Same as primary wallet', save: 'Save', add: 'Add',
    noSecondary: "You haven't added a secondary wallet yet.",
    noPrimary: "You haven't added a primary wallet yet.",
    invalid: 'Invalid wallet address', saved: 'Wallet saved',
  },
} as const;

describe.each(['pt-BR', 'en'] as const)('WalletsManager (%s)', (locale: Locale) => {
  const t = TEXT[locale];
  const region = (name: string) => page.getByRole('region', { name, exact: true });
  const openSecondary = async (as: 'ana' | 'bruno' = 'ana') => {
    await seedSession(as);
    await mountAccount(locale, <WalletsManager />, '/account/wallets');
    await region(t.secondary).getByRole('button', { name: t.add, exact: true }).click();
  };

  it('Ana: primaria em edicao e secundaria vazia', async () => {
    await seedSession('ana');
    await mountAccount(locale, <WalletsManager />, '/account/wallets');
    await expect.element(region(t.primary).getByLabelText(t.address)).toHaveValue(ADDR);
    await expect.element(region(t.secondary).getByText(t.noSecondary)).toBeVisible();
  });

  it('Bruno: primaria ausente mostra estado vazio; checkbox desabilitado', async () => {
    await openSecondary('bruno');
    await expect.element(region(t.primary).getByText(t.noPrimary)).toBeVisible();
    await expect.element(region(t.secondary).getByRole('checkbox', { name: t.same })).toBeDisabled();
  });

  it('Adicionar secundaria foca a rede', async () => {
    await openSecondary();
    await expect.element(region(t.secondary).getByLabelText(t.network)).toHaveFocus();
  });

  it('checkbox "igual a principal" preenche e trava o endereco', async () => {
    await openSecondary();
    await region(t.secondary).getByRole('checkbox', { name: t.same }).click();
    const address = region(t.secondary).getByLabelText(t.address);
    await expect.element(address).toHaveValue(ADDR);
    await expect.element(address).toBeDisabled();
  });

  it('endereco invalido: erro associado e nao salva', async () => {
    await openSecondary();
    await region(t.secondary).getByLabelText(t.address).fill('0x123');
    await region(t.secondary).getByRole('button', { name: t.save, exact: true }).click();
    await expect.element(region(t.secondary).getByLabelText(t.address)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(page.getByText(t.invalid)).toBeVisible();
  });

  it('salva a secundaria e anuncia sucesso', async () => {
    await openSecondary();
    await region(t.secondary).getByLabelText(t.address).fill('0x1111111111111111111111111111111111111111');
    await region(t.secondary).getByRole('button', { name: t.save, exact: true }).click();
    await expect.element(page.getByRole('status')).toHaveTextContent(t.saved);
    expect(region(t.secondary).getByText(t.noSecondary).elements()).toHaveLength(0);
  });
});
