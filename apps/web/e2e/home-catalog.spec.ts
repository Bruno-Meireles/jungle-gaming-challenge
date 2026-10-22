import { expect, test } from '@playwright/test';

// Convencao de nome acessivel exigida: a grade e uma lista (role list) de nome "NFTs",
// cada card e um listitem e o titulo e um link (nome = titulo do NFT).
const GRID = { name: 'NFTs' };

test.describe('home: catalogo com sucesso (pt-BR)', () => {
  test('lista 9 cards, o primeiro e "Emerald Ape #042" com "1,19 ETH"', async ({ page }) => {
    await page.goto('/');

    const cards = page.getByRole('list', GRID).getByRole('listitem');
    await expect(cards).toHaveCount(9);
    await expect(cards.first().getByRole('link', { name: 'Emerald Ape #042' })).toBeVisible();
    await expect(cards.first()).toContainText('1,19 ETH');
  });

  test('a regiao status anuncia "45 NFTs"', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('status').filter({ hasText: '45 NFTs' })).toBeVisible();
  });

  test('o link do titulo leva a /nfts/emerald-ape-042', async ({ page }) => {
    await page.goto('/');

    const link = page.getByRole('list', GRID).getByRole('link', { name: 'Emerald Ape #042' });
    await expect(link).toHaveAttribute('href', '/nfts/emerald-ape-042');
    await link.click();

    await expect(page).toHaveURL(/\/nfts\/emerald-ape-042$/);
  });

  test('com ?sort=price-asc o primeiro preco e "0,000000000000000001 ETH"', async ({ page }) => {
    await page.goto('/?sort=price-asc');

    const first = page.getByRole('list', GRID).getByRole('listitem').first();
    await expect(first).toContainText('0,000000000000000001 ETH');
  });
});
