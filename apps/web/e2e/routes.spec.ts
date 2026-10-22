import { expect, test, type Page } from '@playwright/test';

async function expectNoActions(page: Page) {
  await expect(page.getByRole('main').getByRole('button')).toHaveCount(0);
}

async function expectBackLink(page: Page, name: string) {
  await expect(page.getByRole('link', { name })).toHaveAttribute('href', '/');
}

test.describe('rotas em pt-BR', () => {
  test('rota inexistente mostra 404 com link de volta ao início', async ({ page }) => {
    await page.goto('/rota-x');

    await expect(page.getByRole('heading', { level: 1, name: 'Página não encontrada' })).toBeVisible();
    await expectBackLink(page, 'Voltar para o início');
    await expectNoActions(page);
  });

  test('voltar para o início a partir do 404 leva a "/" com título "Início — Kurio"', async ({ page }) => {
    await page.goto('/rota-x');

    await page.getByRole('link', { name: 'Voltar para o início' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page).toHaveTitle('Início — Kurio');
  });

  for (const [feature, nome] of [
    ['creators', 'Criadores'],
    ['learn', 'Aprenda'],
  ] as const) {
    test(`/unavailable?feature=${feature} cita "${nome}" e oferece link de volta`, async ({ page }) => {
      await page.goto(`/unavailable?feature=${feature}`);

      await expect(page.getByRole('heading', { level: 1, name: 'Ainda não disponível' })).toBeVisible();
      await expect(page.getByRole('main').getByText(nome)).toBeVisible();
      await expectBackLink(page, 'Voltar para o início');
      await expectNoActions(page);
    });
  }

  for (const url of ['/unavailable?feature=xyz', '/unavailable']) {
    test(`${url} mostra texto genérico sem nome de feature`, async ({ page }) => {
      await page.goto(url);

      await expect(page.getByRole('heading', { level: 1, name: 'Ainda não disponível' })).toBeVisible();
      const main = page.getByRole('main');
      await expect(main.getByText(/Criadores|Aprenda|Entrar|Carrinho|Detalhe do NFT/)).toHaveCount(0);
      await expect(main.locator('p').first()).toBeVisible();
      await expectBackLink(page, 'Voltar para o início');
      await expectNoActions(page);
    });
  }

  for (const [path, nome] of [
    ['/login', 'Entrar'],
    ['/cart', 'Carrinho'],
    ['/nfts/emerald-ape-042', 'Detalhe do NFT'],
  ] as const) {
    test(`${path} não redireciona e mostra "Ainda não disponível" citando "${nome}"`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`));
      await expect(page.getByRole('heading', { level: 1, name: 'Ainda não disponível' })).toBeVisible();
      await expect(page.getByRole('main').getByText(nome)).toBeVisible();
      await expectBackLink(page, 'Voltar para o início');
      await expectNoActions(page);
    });
  }
});

test.describe('rotas em inglês', () => {
  test.use({ locale: 'en-US' });

  test('404 mostra "Page not found" e "Back to home"', async ({ page }) => {
    await page.goto('/rota-x');

    await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
    await expectBackLink(page, 'Back to home');
  });

  test('/unavailable?feature=creators mostra "Not available yet" citando "Creators"', async ({ page }) => {
    await page.goto('/unavailable?feature=creators');

    await expect(page.getByRole('heading', { level: 1, name: 'Not available yet' })).toBeVisible();
    await expect(page.getByRole('main').getByText('Creators')).toBeVisible();
    await expectBackLink(page, 'Back to home');
  });
});
