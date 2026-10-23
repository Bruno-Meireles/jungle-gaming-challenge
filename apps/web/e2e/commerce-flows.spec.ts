import { expect, test, type Page, type Request } from '@playwright/test';
import { addFirstEditionToCart, loginToHome, useScenario } from './support/session';

/* Plano de testes §9 itens 4, 5, 7 e 12: favoritos, carrinho, falhas de pagamento, clique repetido e timeout. */

async function fillCheckout(page: Page) {
  await page.getByLabel('Nome do perfil').fill('Ana Collector');
  await page.getByLabel('Código de indicação').fill('JUNGLE2026');
  await page.getByLabel('Nome ENS').fill('ana-collector');
  await page.getByRole('radio').first().click();
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByText('Carteira conectada').first()).toBeVisible();
}

async function openCheckoutAsAna(page: Page) {
  await loginToHome(page);
  await page.goto('/cart');
  await page.getByRole('link', { name: 'Finalizar compra' }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await fillCheckout(page);
}

const orderPosts = (page: Page) => {
  const posts: Request[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && /\/api\/orders$/.test(request.url())) posts.push(request);
  });
  return posts;
};

test.describe('favoritos', () => {
  test('favoritar persiste apos refresh e visitante e levado ao login', async ({ page }) => {
    await page.goto('/nfts/emerald-ape-042');
    await page.getByRole('button', { name: 'Favoritar' }).click();
    await expect(page).toHaveURL(/\/login\?redirect=/);
    await loginToHome(page);
    await page.goto('/nfts/emerald-ape-042');
    const favorite = page.getByRole('button', { name: 'Favoritar' });
    await favorite.click();
    await expect(favorite).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.getByRole('button', { name: 'Favoritar' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('falha da mutation reverte o estado otimista', async ({ page }) => {
    await useScenario(page, 'favorites-error');
    await loginToHome(page);
    await page.goto('/nfts/emerald-ape-042');
    const favorite = page.getByRole('button', { name: 'Favoritar' });
    await favorite.click();
    await expect(favorite).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('carrinho', () => {
  test('alterar quantidade atualiza o resumo e persiste apos refresh', async ({ page }) => {
    await loginToHome(page);
    await page.goto('/cart');
    const summary = page.getByRole('region', { name: 'Resumo do pedido' });
    await expect(summary).toContainText('Total');
    const before = await summary.innerText();
    await page.getByRole('button', { name: /^Aumentar a quantidade de/ }).and(page.locator(':enabled')).first().click();
    await expect(page.locator('input[inputmode=numeric]').first()).toHaveValue('3');
    await expect.poll(async () => summary.innerText()).not.toBe(before);
    await page.reload();
    await expect(page.locator('input[inputmode=numeric]').first()).toHaveValue('3');
  });

  test('itens do visitante sao preservados ao autenticar', async ({ page }) => {
    await addFirstEditionToCart(page, 'sage-nomad-009');
    await expect(page.getByRole('list', { name: 'Itens do carrinho' }).getByRole('listitem')).toHaveCount(1);
    await loginToHome(page);
    await page.goto('/cart');
    await expect(page.getByRole('list', { name: 'Itens do carrinho' }).getByText('Sage Nomad #009')).toBeVisible();
  });

  test('cupom valido e removivel; expirado mostra erro', async ({ page }) => {
    await loginToHome(page);
    await page.goto('/cart');
    await page.getByLabel('Cupom de desconto').fill('EXPIRED2025');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await expect(page.getByText('Cupom expirado.')).toBeVisible();
    await page.getByLabel('Cupom de desconto').fill('LAUNCH10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await expect(page.getByRole('button', { name: 'Remover cupom' })).toBeVisible();
    await page.getByRole('button', { name: 'Remover cupom' }).click();
    await expect(page.getByLabel('Cupom de desconto')).toBeVisible();
  });
});

test.describe('pagamento: falhas e recuperacao', () => {
  test('pagamento recusado leva ao recibo com estado recusado', async ({ page }) => {
    await useScenario(page, 'order-refused');
    await openCheckoutAsAna(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page).toHaveURL(/\/orders\//);
    await expect(page.getByText('Pagamento recusado').first()).toBeVisible();
    await expect(page.getByText('Pagamento aprovado')).toHaveCount(0);
  });

  test('cliques repetidos criam um unico pedido', async ({ page }) => {
    const posts = orderPosts(page);
    await openCheckoutAsAna(page);
    const button = page.getByRole('button', { name: 'Confirmar compra' });
    await button.dblclick();
    await expect(page).toHaveURL(/\/orders\//);
    expect(posts.length).toBe(1);
  });

  test('timeout apos criar o pedido recupera o mesmo pedido pela idempotencia', async ({ page }) => {
    await useScenario(page, 'order-timeout');
    const posts = orderPosts(page);
    await openCheckoutAsAna(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page).toHaveURL(/\/orders\//, { timeout: 45_000 });
    const keys = new Set(posts.map((request) => request.headers()['idempotency-key']));
    expect(posts.length).toBeGreaterThanOrEqual(1);
    expect(keys.size).toBe(1);
  });

  test('cotacao alterada na confirmacao exige nova confirmacao', async ({ page }) => {
    await useScenario(page, 'quote-changed-on-confirm');
    await openCheckoutAsAna(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page.getByText('A cotação mudou. Revise os valores e confirme novamente.')).toBeVisible();
    await expect(page).toHaveURL(/\/checkout$/);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page).toHaveURL(/\/orders\//);
  });

  test('sessao expirada durante o checkout leva ao login com retomada', async ({ page }) => {
    await useScenario(page, 'checkout-session-expired');
    await openCheckoutAsAna(page);
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout/);
  });
});

test.describe('estados de carregamento e erro', () => {
  test('catalogo lento mostra skeletons e depois o conteudo', async ({ page }) => {
    await useScenario(page, 'catalog-slow');
    await page.goto('/');
    await expect(page.locator('[data-slot="skeleton"]').first()).toBeVisible();
    await expect(page.getByRole('list', { name: 'NFTs' }).getByRole('listitem').first()).toBeVisible({ timeout: 15_000 });
  });

  test('carrinho lento mostra skeleton do resumo e das linhas', async ({ page }) => {
    await useScenario(page, 'cart-slow');
    await loginToHome(page);
    await page.goto('/cart');
    await expect(page.getByRole('status', { name: 'Carregando o carrinho' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Itens do carrinho' })).toBeVisible({ timeout: 15_000 });
  });

  test('detalhe lento mostra skeleton ocupado', async ({ page }) => {
    await useScenario(page, 'nft-detail-slow');
    await page.goto('/nfts/emerald-ape-042');
    await expect(page.getByRole('region', { name: 'Carregando NFT' })).toHaveAttribute('aria-busy', 'true');
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible({ timeout: 15_000 });
  });

  test('falha do detalhe mostra erro e recupera na nova tentativa', async ({ page }) => {
    await useScenario(page, 'nft-detail-error');
    await page.goto('/nfts/emerald-ape-042');
    await expect(page.getByText('Não foi possível carregar este NFT.')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('jg:mocks:scenario', 'default'));
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Emerald Ape #042' })).toBeVisible();
  });

  test('falha do carrinho mostra erro e recupera na nova tentativa', async ({ page }) => {
    await loginToHome(page);
    await page.evaluate(() => localStorage.setItem('jg:mocks:scenario', 'cart-error'));
    await page.goto('/cart');
    await expect(page.getByText('Não foi possível carregar o carrinho.')).toBeVisible();
    await page.evaluate(() => localStorage.setItem('jg:mocks:scenario', 'default'));
    await page.getByRole('button', { name: 'Tentar novamente' }).click();
    await expect(page.getByRole('list', { name: 'Itens do carrinho' })).toBeVisible();
  });
});
