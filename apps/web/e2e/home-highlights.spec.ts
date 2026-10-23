import { expect, test } from '@playwright/test';

/*
 * Convencoes de nome acessivel exigidas (pt-BR):
 * - Hero: region "Destaques"; dentro, 3 botoes "Destaque N de 3" (aria-current="true" no ativo),
 *   uma img cujo nome e o titulo do NFT ativo e o botao "Explorar".
 * - "Explorar" (hero) leva o foco ao elemento #catalog.
 * - Destaque lateral (1440): region "NFT em destaque" com link para /nfts/cosmic-bloom-118.
 * - Header: banner com a marca "Kurio"; navigation "Principal" com links
 *   Início, Mercado, Criadores e Aprenda. O idioma segue a preferência salva ou o idioma do navegador.
 */

const viewports = [
  { name: '1440', size: { width: 1440, height: 900 } },
  { name: '390', size: { width: 390, height: 844 } },
] as const;

for (const { name, size } of viewports) {
  test.describe(`home: destaques (${name})`, () => {
    test.use({ viewport: size });

    test('o hero tem 3 pontos e o primeiro e o atual', async ({ page }) => {
      await page.goto('/');
      const hero = page.getByRole('region', { name: 'Destaques' });

      await expect(hero.getByRole('button', { name: /^Destaque \d de 3$/ })).toHaveCount(3);
      await expect(hero.getByRole('button', { name: 'Destaque 1 de 3' })).toHaveAttribute('aria-current', 'true');
      await expect(hero.getByRole('img', { name: 'Emerald Ape #042' })).toBeVisible();
    });

    test('clicar em "Destaque 2 de 3" troca a imagem e o aria-current', async ({ page }) => {
      await page.goto('/');
      const hero = page.getByRole('region', { name: 'Destaques' });

      await hero.getByRole('button', { name: 'Destaque 2 de 3' }).click();

      await expect(hero.getByRole('img', { name: 'Sage Nomad #009' })).toBeVisible();
      await expect(hero.getByRole('img', { name: 'Emerald Ape #042' })).toHaveCount(0);
      await expect(hero.getByRole('button', { name: 'Destaque 2 de 3' })).toHaveAttribute('aria-current', 'true');
      await expect(hero.getByRole('button', { name: 'Destaque 1 de 3' })).not.toHaveAttribute('aria-current', 'true');
    });

    test('sem autoplay: avancar 30 s nao troca o slide', async ({ page }) => {
      await page.clock.install();
      await page.goto('/');
      const hero = page.getByRole('region', { name: 'Destaques' });
      await expect(hero.getByRole('img', { name: 'Emerald Ape #042' })).toBeVisible();

      await page.clock.runFor(30_000);

      await expect(hero.getByRole('img', { name: 'Emerald Ape #042' })).toBeVisible();
      await expect(hero.getByRole('button', { name: 'Destaque 1 de 3' })).toHaveAttribute('aria-current', 'true');
    });

    test('"Explorar" leva o foco a #catalog', async ({ page }) => {
      await page.goto('/');

      await page.getByRole('region', { name: 'Destaques' }).getByRole('button', { name: 'Explorar' }).click();

      await expect(page.locator('#catalog')).toBeFocused();
    });

    test('o header mostra a marca "Kurio"', async ({ page }) => {
      await page.goto('/');

      await expect(page.getByRole('banner').getByText('Kurio', { exact: true })).toBeVisible();
    });
  });
}

test.describe('home: destaques so no desktop (1440)', () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test('o destaque lateral linka para /nfts/cosmic-bloom-118', async ({ page }) => {
    await page.goto('/');

    const featured = page.getByRole('region', { name: 'NFT em destaque' });
    await expect(featured.getByRole('link')).toHaveAttribute('href', '/nfts/cosmic-bloom-118');
  });

  test('o header tem navigation "Principal" com 4 links e sem seletor de idioma', async ({ page }) => {
    await page.goto('/');
    const header = page.getByRole('banner');
    const nav = header.getByRole('navigation', { name: 'Principal' });

    for (const label of ['Início', 'Mercado', 'Criadores', 'Aprenda']) {
      await expect(nav.getByRole('link', { name: label })).toBeVisible();
    }
    await expect(header.getByRole('combobox', { name: 'Idioma' })).toHaveCount(0);
    await expect(header.getByRole('combobox', { name: 'Language' })).toHaveCount(0);
  });
});
