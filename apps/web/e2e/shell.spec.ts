import { expect, test } from '@playwright/test';

test.describe('shell em pt-BR', () => {
  test('expõe os landmarks banner, main e contentinfo', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('main')).toHaveAttribute('id', 'content');
    await expect(page.getByRole('contentinfo')).toBeVisible();
  });

  test('define lang pt-BR e o título "Início — Kurio"', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
    await expect(page).toHaveTitle('Início — Kurio');
  });

  test('o primeiro Tab foca "Pular para o conteúdo" e Enter leva o foco ao main', async ({ page }) => {
    await page.goto('/');

    await page.keyboard.press('Tab');
    const skipLink = page.getByRole('link', { name: 'Pular para o conteúdo' });
    await expect(skipLink).toBeFocused();

    await page.keyboard.press('Enter');
    const main = page.getByRole('main');
    await expect(main).toBeFocused();
    await expect(main).toHaveAttribute('tabindex', '-1');
  });
});

test.describe('shell em inglês', () => {
  test.use({ locale: 'en-US' });

  test('define lang en, título "Home — Kurio" e skip link "Skip to content"', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle('Home — Kurio');

    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  });
});
