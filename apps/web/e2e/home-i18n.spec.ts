import { expect, test, type Page } from '@playwright/test';
import { cards, grid, isMobile } from './support/home';

/*
 * Plano M6, item 35. Roda em desktop-1440 e mobile-390. Observado no DOM atual (nao inventado):
 * - O seletor de idioma (combobox "Idioma"/"Language") existe so no header >= 1440; abaixo disso o idioma vem do
 *   `jg:locale` salvo ou de `navigator.languages` (Q8). Por isso o clique no seletor roda so em 1440, e em 390
 *   o idioma salvo (`jg:locale`) e o primeiro acesso em `en-US` fazem o papel.
 * - Strings em en: docs em src/**\/config/locales/en.ts. O preco do primeiro card e "1,19 ETH" (pt-BR) / "1.19 ETH" (en).
 * - Ordenacao e colecoes: no 1440 estao na pagina (combobox "Ordenar por" e group "Coleções"); em 390 vivem no Sheet.
 */
const LOCALE_KEY = 'jg:locale';

const expectPortuguese = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
  await expect(page).toHaveTitle('Início — Kurio');
  await expect(page.getByRole('tablist', { name: 'Exibição' }).getByRole('tab', { name: 'Todos os NFTs' })).toBeVisible();
  await expect(cards(page).first().getByText('1,19 ETH')).toBeVisible();
};

const expectEnglish = async (page: Page) => {
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page).toHaveTitle('Home — Kurio');
  const tabs = page.getByRole('tablist', { name: 'View' });
  await expect(tabs.getByRole('tab', { name: 'All NFTs' })).toBeVisible();
  await expect(tabs.getByRole('tab', { name: 'New releases' })).toBeVisible();
  await expect(tabs.getByRole('tab', { name: 'Trending' })).toBeVisible();
  await expect(grid(page)).toBeVisible();
  await expect(cards(page).first().getByText('1.19 ETH')).toBeVisible();
  await expect(page.getByText('1,19 ETH')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Results' })).toBeVisible();
};

test.describe('home: idioma pelo seletor (1440)', () => {
  test('o seletor troca para en: lang, titulo, navegacao, abas, ordenacao, colecoes e preco; reload mantem en', async ({ page }) => {
    await page.goto('/');
    await expectPortuguese(page);
    if (isMobile(page)) {
      await expect(page.getByRole('combobox', { name: 'Idioma' })).toHaveCount(0);
      return;
    }

    await page.getByRole('combobox', { name: 'Idioma' }).click();
    await page.getByRole('option', { name: 'English' }).click();

    await expectEnglish(page);
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Market' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Creators' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Learn' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Language' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Sort by' })).toContainText('Recently listed');
    const filters = page.getByRole('complementary', { name: 'Filters' });
    await expect(filters.getByRole('group', { name: 'Collections' })).toBeVisible();
    await expect(filters.getByRole('checkbox', { name: 'Digital art (5)' })).toBeVisible();

    await page.reload();

    await expectEnglish(page);
    await expect(page.getByRole('combobox', { name: 'Language' })).toContainText('English');
    expect(await page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY)).toBe('en');
  });

  test('voltar para Portugues pelo seletor restaura pt-BR', async ({ page }) => {
    await page.goto('/');
    if (isMobile(page)) {
      await expect(page.getByRole('combobox', { name: 'Idioma' })).toHaveCount(0);
      return;
    }
    await page.getByRole('combobox', { name: 'Idioma' }).click();
    await page.getByRole('option', { name: 'English' }).click();
    await expectEnglish(page);

    await page.getByRole('combobox', { name: 'Language' }).click();
    await page.getByRole('option', { name: 'Português' }).click();

    await expectPortuguese(page);
  });
});

test.describe('home: idioma salvo em jg:locale (1440 e 390)', () => {
  test('com jg:locale=en e navegador pt-BR a Home abre em en, inclusive o Sheet de filtros em 390', async ({ page }) => {
    await page.goto('/');
    await expectPortuguese(page);
    await page.evaluate((key) => localStorage.setItem(key, 'en'), LOCALE_KEY);

    await page.reload();

    await expectEnglish(page);
    if (isMobile(page)) {
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
