import { expect, test } from '@playwright/test';
import { cards, commitSheet, count, isMobile, openFilterPanel } from './support/home';

/*
 * Roda em desktop-1440 e mobile-390.
 * Convencoes de nome acessivel exigidas (pt-BR):
 * - Ordenacao: combobox "Ordenar por" (Select do DS), com 4 options na ordem do contrato
 *   recent, price-asc, price-desc, popular. No 1440 fica na pagina e vale na hora; em 390 fica dentro do
 *   dialog "Filtros" e so vale apos "Aplicar".
 * - Abas: tablist "Exibição" com tabs "Todos os NFTs", "Novos lançamentos" e "Em alta" (setas ativam,
 *   aria-selected), visiveis nos dois viewports.
 * Observacao de fixture: com MOCK_NOW 2026-10-02 todos os 45 itens foram listados nos ultimos 30 dias, entao
 * "Novos lançamentos" mostra os mesmos 45; "Em alta" (popularity >= 80) tem 10.
 */
test.describe('home: ordenacao', () => {
  test('Select por teclado: sort=price-desc e o primeiro card e o mais caro', async ({ page }) => {
    await page.goto('/');
    const scope = isMobile(page) ? await openFilterPanel(page) : page;

    const sort = scope.getByRole('combobox', { name: 'Ordenar por' });
    await sort.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('option')).toHaveCount(4);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    if (isMobile(page)) {
      await expect(page).toHaveURL((url) => !url.searchParams.has('sort'));
      await commitSheet(page, scope as ReturnType<typeof page.locator>);
    }

    await expect(page).toHaveURL((url) => url.searchParams.get('sort') === 'price-desc');
    await expect(cards(page).first()).toContainText('Onyx Relic #333');
    await expect(cards(page).first()).toContainText('12,30 ETH');
  });
});

test.describe('home: abas', () => {
  test('setas trocam a aba, gravam ?tab e reiniciam a pagina', async ({ page }) => {
    await page.goto('/?page=2');
    const tabs = page.getByRole('tablist', { name: 'Exibição' });
    const all = tabs.getByRole('tab', { name: 'Todos os NFTs' });
    const news = tabs.getByRole('tab', { name: 'Novos lançamentos' });
    const trending = tabs.getByRole('tab', { name: 'Em alta' });
    await expect(all).toHaveAttribute('aria-selected', 'true');

    await all.focus();
    await page.keyboard.press('ArrowRight');

    await expect(news).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL((url) => url.searchParams.get('tab') === 'new' && !url.searchParams.has('page'));
    await expect(count(page, '45 NFTs')).toBeVisible();

    await page.keyboard.press('ArrowRight');

    await expect(trending).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL((url) => url.searchParams.get('tab') === 'trending');
    await expect(count(page, '45 NFTs')).toBeVisible();
    await expect(cards(page)).toHaveCount(9);
    await expect(cards(page).first()).toContainText('Mint Cipher #308');

    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');

    await expect(all).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL((url) => !url.searchParams.has('tab'));
    await expect(count(page, '45 NFTs')).toBeVisible();
  });
});
