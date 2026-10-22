import { expect, test } from '@playwright/test';
import { cards, count, isMobile, titles } from './support/home';

/*
 * Roda em desktop-1440 e mobile-390.
 * Convencoes de nome acessivel exigidas (pt-BR):
 * - Campo de busca = searchbox "Buscar" (input type=search). Em 390 esta sempre visivel (como no frame);
 *   no 1440 o botao "Buscar" (no banner, aria-expanded) abre o campo e leva o foco a ele.
 * - A busca e submetida por Enter (push no historico): ?q=nomad.
 * - Esc fecha o campo no 1440, devolve o foco ao botao "Buscar" e volta aria-expanded para false.
 */
const openSearch = async (page: import('@playwright/test').Page) => {
  if (!isMobile(page)) {
    const toggle = page.getByRole('button', { name: 'Buscar' });
    await expect(toggle).toBeVisible();
    // com ?q ja presente o campo pode nascer aberto; fechado, o botao anuncia aria-expanded=false
    if ((await toggle.getAttribute('aria-expanded')) === 'false') await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  }
  const field = page.getByRole('searchbox', { name: 'Buscar' });
  await expect(field).toBeVisible();
  return field;
};

test.describe('home: busca', () => {
  test('Enter submete ?q=nomad e a grade mostra so nomes com "Nomad"', async ({ page }) => {
    await page.goto('/');
    const field = await openSearch(page);

    await field.fill('nomad');
    await field.press('Enter');

    await expect(page).toHaveURL((url) => url.searchParams.get('q') === 'nomad');
    await expect(count(page, '3 NFTs')).toBeVisible();
    await expect(cards(page)).toHaveCount(3);
    for (const title of await titles(page)) expect(title).toContain('Nomad');
  });

  test('limpar o campo e submeter remove o param q', async ({ page }) => {
    await page.goto('/?q=nomad');
    const field = await openSearch(page);
    await expect(field).toHaveValue('nomad');

    await field.fill('');
    await field.press('Enter');

    await expect(page).toHaveURL((url) => !url.searchParams.has('q'));
    await expect(count(page, '45 NFTs')).toBeVisible();
  });

  test('Esc fecha o campo e devolve o foco ao botao (1440); em 390 o campo e permanente', async ({ page }) => {
    await page.goto('/');
    const field = await openSearch(page);
    await field.focus();
    await expect(field).toBeFocused();

    await page.keyboard.press('Escape');

    if (isMobile(page)) {
      await expect(field).toBeVisible();
      return;
    }

    const toggle = page.getByRole('button', { name: 'Buscar' });
    await expect(field).toBeHidden();
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});
