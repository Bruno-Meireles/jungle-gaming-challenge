import { expect, test, type Page } from '@playwright/test';
import { cards, grid } from './support/home';

/*
 * Plano M6, item 37. Roda em desktop-1440, mobile-390 (sem tag) e tablet-768 (so os testes com @tablet).
 * Observado no DOM atual (nao inventado): no 1440 existe o `complementary` "Filtros" e nao ha botao "Filtros";
 * em 768 e 390 existe o botao "Filtros" (abre o dialog) e nao ha `complementary`; em 390 ha o searchbox "Buscar".
 * Convencao exigida (ainda inexistente): a barra inferior e um `navigation` "Navegação inferior" visivel so abaixo
 * de 768 (plano Q11: sem barra em 768; widgets/bottom-nav "so <768").
 * Colunas = quantidade de posicoes x distintas dos cards da grade.
 */
const bottomNav = (page: Page) => page.getByRole('navigation', { name: 'Navegação inferior' });

async function columnsOf(page: Page): Promise<number> {
  await expect(cards(page)).toHaveCount(9);
  const lefts = await cards(page).evaluateAll((items) => items.map((el) => Math.round(el.getBoundingClientRect().left)));
  return new Set(lefts).size;
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
}

test.describe('home: layout 1440 e 390', () => {
  test('1440 tem sidebar e grade de 3 colunas, sem botao de filtros nem barra inferior; 390 tem busca, filtros, 2 colunas e barra inferior', async ({ page }) => {
    await page.goto('/');
    await expect(grid(page)).toBeVisible();
    const width = page.viewportSize()?.width ?? 0;

    if (width >= 1440) {
      await expect(page.getByRole('complementary', { name: 'Filtros' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Filtros' })).toHaveCount(0);
      expect(await columnsOf(page)).toBe(3);
      await expect(bottomNav(page)).toBeHidden();
    } else {
      await expect(page.getByRole('searchbox', { name: 'Buscar' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Filtros' })).toBeVisible();
      await expect(page.getByRole('complementary', { name: 'Filtros' })).toBeHidden();
      expect(await columnsOf(page)).toBe(2);
      await expect(bottomNav(page)).toBeVisible();
    }
    await expectNoHorizontalOverflow(page);
  });

  test('em 320 de largura nao ha rolagem horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/');
    await expect(grid(page)).toBeVisible();
    await expect(cards(page)).toHaveCount(9);

    await expectNoHorizontalOverflow(page);
  });
});

test.describe('home: layout 768', () => {
  test('@tablet tem botao de filtros e 2 colunas, sem sidebar nem barra inferior, sem overflow', async ({ page }) => {
    await page.goto('/');
    await expect(grid(page)).toBeVisible();

    await expect(page.getByRole('button', { name: 'Filtros' })).toBeVisible();
    await expect(page.getByRole('complementary', { name: 'Filtros' })).toBeHidden();
    expect(await columnsOf(page)).toBe(2);
    await expect(bottomNav(page)).toBeHidden();
    await expectNoHorizontalOverflow(page);
  });
});
