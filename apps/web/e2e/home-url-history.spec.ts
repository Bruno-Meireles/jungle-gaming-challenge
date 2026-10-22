import { expect, test } from '@playwright/test';
import { cards, count, titles } from './support/home';

/*
 * Roda em desktop-1440 e mobile-390 (paginacao igual nos dois, Q12).
 * Convencoes de nome acessivel exigidas (pt-BR):
 * - Paginacao: navigation "Paginação" com links "1".."N" (aria-current="page" no atual) e "Próxima página".
 * - Titulo dos resultados: heading "Resultados" (focavel por script) que recebe o foco apos trocar de pagina.
 * Fixture: 45 itens = 5 paginas de 9; Solana tem 15 itens = 2 paginas (9 + 6).
 */
const pagination = (page: import('@playwright/test').Page) => page.getByRole('navigation', { name: 'Paginação' });

test.describe('home: paginacao e historico', () => {
  test('page=2 traz itens distintos, marca a pagina atual e leva o foco ao titulo dos resultados', async ({ page }) => {
    await page.goto('/?networks=solana');
    await expect(cards(page)).toHaveCount(9);
    const first = await titles(page);

    await pagination(page).getByRole('link', { name: '2', exact: true }).click();

    await expect(page).toHaveURL((url) => url.searchParams.get('page') === '2' && url.searchParams.get('networks') === 'solana');
    await expect(cards(page)).toHaveCount(6);
    const second = await titles(page);
    expect(second.filter((title) => first.includes(title))).toEqual([]);
    await expect(pagination(page).getByRole('link', { name: '2', exact: true })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'Resultados' })).toBeFocused();
  });

  test('voltar restaura a pagina 1 e os filtros; refresh mantem a pagina', async ({ page }) => {
    await page.goto('/?networks=solana');
    await expect(cards(page)).toHaveCount(9);
    const first = await titles(page);
    await pagination(page).getByRole('link', { name: '2', exact: true }).click();
    await expect(page).toHaveURL((url) => url.searchParams.get('page') === '2');
    await expect(cards(page)).toHaveCount(6);
    const second = await titles(page);

    await page.reload();

    await expect(page).toHaveURL((url) => url.searchParams.get('page') === '2');
    await expect(cards(page)).toHaveCount(6);
    expect(await titles(page)).toEqual(second);

    await page.goBack();

    await expect(page).toHaveURL((url) => !url.searchParams.has('page') && url.searchParams.get('networks') === 'solana');
    await expect(cards(page)).toHaveCount(9);
    expect(await titles(page)).toEqual(first);
  });

  test('?page=999 vira a ultima pagina por replace (voltar nao reabre o 999)', async ({ page }) => {
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);

    await page.goto('/?page=999');

    await expect(page).toHaveURL((url) => url.searchParams.get('page') === '5');
    await expect(pagination(page).getByRole('link', { name: '5', exact: true })).toHaveAttribute('aria-current', 'page');
    await page.goBack();
    await expect(page).toHaveURL((url) => url.pathname === '/' && url.search === '');
  });

  test('?tab=foo&page=-3 vira "/" sem erro', async ({ page }) => {
    await page.goto('/?tab=foo&page=-3');

    await expect(page).toHaveURL('/');
    await expect(cards(page)).toHaveCount(9);
    await expect(count(page, '45 NFTs')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('q, min e max sobrevivem como strings (sem coercao a number) e collections repetida e lida', async ({ page }) => {
    await page.goto('/?collections=music&collections=photography&q=17&min=0.000000000000000001&max=12.30');

    await expect(count(page, '1 NFT')).toBeVisible();
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).first()).toContainText('Ash Cantor #173');
    // a URL nao pode ser reescrita por coercao a number (1e-18, 12.3) nem a collections em JSON
    await expect(page).toHaveURL((url) => {
      const p = url.searchParams;
      return (
        p.get('q') === '17' &&
        p.get('min') === '0.000000000000000001' &&
        p.get('max') === '12.30' &&
        p.getAll('collections').sort().join() === 'music,photography'
      );
    });
  });
});
