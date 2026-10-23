import { expect, test, type Page } from '@playwright/test';
import { cards, grid, isMobile } from './support/home';

/*
 * Plano M6, item 35. Roda em desktop-1440 e mobile-390.
 * - O idioma vem de `jg:locale` salvo ou de `navigator.languages`; nao ha controle de troca no header.
 * - Strings em en: docs em src/**\/config/locales/en.ts. O preco do primeiro card e "1,19 ETH" (pt-BR) / "1.19 ETH" (en).
 * - Ordenacao e colecoes: no 1440 estao na pagina (combobox "Ordenar por" e group "Coleções"); em 390 vivem no Sheet.
 */
const LOCALE_KEY = 'jg:locale';

const expectPortuguese = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveTitle('Início — Kurio');
  await expect(page.getByRole('combobox', { name: 'Idioma' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Language' })).toHaveCount(0);
  await expect(page.getByRole('tablist', { name: 'Exibição' }).getByRole('tab', { name: 'Todos os NFTs' })).toBeVisible();
  await expect(cards(page).first().getByText('1,19 ETH')).toBeVisible();
};

const expectEnglish = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Home — Kurio');
  await expect(page.getByRole('combobox', { name: 'Idioma' })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Language' })).toHaveCount(0);
  const tabs = page.getByRole('tablist', { name: 'View' });
  await expect(tabs.getByRole('tab', { name: 'All NFTs' })).toBeVisible();
  await expect(tabs.getByRole('tab', { name: 'New releases' })).toBeVisible();
  await expect(tabs.getByRole('tab', { name: 'Trending' })).toBeVisible();
  await expect(grid(page)).toBeVisible();
  await expect(cards(page).first().getByText('1.19 ETH')).toBeVisible();
  await expect(page.getByText('1,19 ETH')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
};

test.describe('home: sem seletor de idioma', () => {
  test('nao exibe controle de idioma no header e mantem a Home em portugues', async ({ page }) => {
    await page.goto('/');
    await expectPortuguese(page);
  });
});

test.describe('home: idioma salvo em jg:locale (1440 e 390)', () => {
  test('com jg:locale=en a Home abre em ingles, inclusive o Sheet de filtros em 390', async ({ page }) => {
    await page.addInitScript((key) => localStorage.setItem(key, 'en'), LOCALE_KEY);
    await page.goto('/');
    await expectEnglish(page);
    if (page.viewportSize()?.width === 390) {
      await page.getByRole('button', { name: 'Filters' }).click();
      const dialog = page.getByRole('dialog', { name: 'Filters' });
      await expect(dialog).toBeVisible();
      await expect(dialog.getByRole('combobox', { name: 'Sort by' })).toBeVisible();
      await expect(dialog.getByRole('group', { name: 'Collections' })).toBeVisible();
      await expect(dialog.getByRole('group', { name: 'Price range' })).toBeVisible();
      await expect(dialog.getByRole('button', { name: 'Apply' })).toBeVisible();
    }
  });
});

test.describe('home: primeiro acesso em en-US', () => {
  test.use({ locale: 'en-US' });

  test('sem idioma salvo a Home abre em en (navigator.languages)', async ({ page }) => {
    await page.goto('/');

    await expectEnglish(page);
    if (isMobile(page)) {
      await expect(page.getByRole('searchbox', { name: 'Search' })).toBeVisible();
    } else {
      await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Home' })).toBeVisible();
    }
  });
});
