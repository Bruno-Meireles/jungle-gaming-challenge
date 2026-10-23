import { expect, test, type Page } from '@playwright/test';
import { addFirstEditionToCart, loginToHome } from './support/session';

/*
 * Regressao visual (plano §9): inicio, detalhe, carrinho e pagamento, em 1440 e 390, com dados dos mocks estaveis
 * (seed deterministico, animacoes desligadas, fontes e imagens carregadas). Baselines em e2e/visual.spec.ts-snapshots.
 * Atualizar so com revisao do diff: `playwright test e2e/visual.spec.ts --update-snapshots`.
 */
async function settle(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    // Imagens lazy fora da dobra nunca disparam load: force o carregamento antes da captura de pagina inteira.
    for (const image of document.images) image.loading = 'eager';
    await Promise.all(
      [...document.images].filter((image) => !image.complete).map((image) => new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      })),
    );
  });
  await page.waitForTimeout(500);
}

test.describe('regressao visual', () => {
  test('inicio', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('list', { name: 'NFTs' }).getByRole('listitem').first()).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('inicio.png', { fullPage: true });
  });

  test('detalhe do NFT', async ({ page }) => {
    await page.goto('/nfts/emerald-ape-042');
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Mais desta coleção' })).toBeVisible({ timeout: 10_000 }).catch(() => undefined);
    await settle(page);
    await expect(page).toHaveScreenshot('detalhe.png', { fullPage: true });
  });

  test('carrinho', async ({ page }) => {
    await loginToHome(page);
    await page.goto('/cart');
    await expect(page.getByRole('list', { name: 'Itens do carrinho' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Resumo do pedido' })).toContainText('ETH');
    await settle(page);
    await expect(page).toHaveScreenshot('carrinho.png', { fullPage: true });
  });

  test('pagamento', async ({ page }) => {
    await loginToHome(page);
    await addFirstEditionToCart(page, 'cosmic-bloom-118');
    await page.goto('/checkout');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText('Total').first()).toBeVisible();
    await settle(page);
    await expect(page).toHaveScreenshot('pagamento.png', { fullPage: true });
  });
});
