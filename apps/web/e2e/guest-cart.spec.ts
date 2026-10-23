import { expect, test } from '@playwright/test';

test.describe('visitante: detalhe do NFT e carrinho', () => {
  test('detalhe mostra titulo, edicoes e adiciona ao carrinho', async ({ page }) => {
    await page.goto('/nfts/emerald-ape-042');
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible();
    await page.getByRole('button', { name: 'Comprar', exact: true }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByRole('list', { name: 'Itens do carrinho' }).getByRole('listitem')).toHaveCount(1);
    await expect(page.getByRole('link', { name: 'Conectar e finalizar' })).toBeVisible();
  });

  test('NFT inexistente mostra estado de nao encontrado', async ({ page }) => {
    await page.goto('/nfts/nao-existe');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('não encontrado');
  });

  test('carrinho vazio oferece continuar explorando', async ({ page }) => {
    await page.goto('/cart');
    await expect(page.getByText('Seu carrinho está vazio.')).toBeVisible();
  });

  test('remover item deixa o carrinho vazio', async ({ page }) => {
    await page.goto('/nfts/emerald-ape-042');
    await page.getByRole('button', { name: 'Comprar', exact: true }).click();
    await page.getByRole('button', { name: /^Remover .* do carrinho$/ }).click();
    await expect(page.getByText('Seu carrinho está vazio.')).toBeVisible();
  });
});
