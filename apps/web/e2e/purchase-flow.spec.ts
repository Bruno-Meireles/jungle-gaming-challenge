import { expect, test, type Page } from '@playwright/test';

const ANA = { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' };

async function login(page: Page, credentials = ANA) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill(credentials.email);
  await page.getByLabel('Senha', { exact: true }).fill(credentials.password);
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  await expect(page).toHaveURL(/\/$/);
}

test.describe('fluxo de compra (mocks MSW)', () => {
  test('checkout exige login e volta ao destino depois de entrar', async ({ page }) => {
    await page.goto('/checkout');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fcheckout/);
    await page.getByLabel('E-mail').fill(ANA.email);
    await page.getByLabel('Senha', { exact: true }).fill(ANA.password);
    await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
    await expect(page).toHaveURL(/\/checkout$/);
  });

  test('carrinho semeado mostra itens, resumo e permite cupom', async ({ page }) => {
    await login(page);
    await page.goto('/cart');
    await expect(page.getByRole('heading', { level: 1, name: 'Carrinho' })).toBeVisible();
    await expect(page.getByRole('list', { name: 'Itens do carrinho' }).getByRole('listitem')).toHaveCount(3);
    await expect(page.getByRole('region', { name: 'Resumo do pedido' })).toContainText('Total');
    await page.getByLabel('Cupom de desconto').fill('LAUNCH10');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await expect(page.getByText('Cupom LAUNCH10 aplicado').first()).toBeVisible();
  });

  test('cupom invalido mostra erro no campo', async ({ page }) => {
    await login(page);
    await page.goto('/cart');
    await page.getByLabel('Cupom de desconto').fill('NOPE');
    await page.getByRole('button', { name: 'Aplicar cupom' }).click();
    await expect(page.getByText('Cupom inválido.')).toBeVisible();
  });

  test('compra completa gera recibo do pedido', async ({ page }) => {
    await login(page);
    await page.goto('/cart');
    await page.getByRole('link', { name: 'Finalizar compra' }).click();
    await expect(page).toHaveURL(/\/checkout$/);
    await page.getByLabel('Nome do perfil').fill('Ana Collector');
    await page.getByLabel('Código de indicação').fill('JUNGLE2026');
    await page.getByLabel('Nome ENS').fill('ana-collector');
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: 'Conectar carteira' }).click();
    await expect(page.getByText('Carteira conectada').first()).toBeVisible();
    await page.getByRole('button', { name: 'Confirmar compra' }).click();
    await expect(page).toHaveURL(/\/orders\/[\w-]+$/);
    await expect(page.getByText(/Pedido|Recibo/).first()).toBeVisible();
  });

  test('logout limpa a sessao e protege as rotas privadas', async ({ page }) => {
    await login(page);
    await page.getByRole('button', { name: 'Sair' }).click();
    await expect(page.getByRole('link', { name: 'Entrar' })).toBeVisible();
    await page.goto('/account/profile');
    await expect(page).toHaveURL(/\/login/);
  });
});
