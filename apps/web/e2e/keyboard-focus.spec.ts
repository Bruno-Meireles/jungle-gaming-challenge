import { expect, test } from '@playwright/test';
import { loginToHome } from './support/session';

/* Plano de testes §9 item 11: teclado, foco de dialogos e validacao de formularios. */

test.describe('teclado e foco', () => {
  test('dialogo de login (desktop): foco entra, fica preso e Esc fecha voltando a pagina anterior', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 768, 'em mobile login e pagina, nao dialogo');
    await page.goto('/');
    await page.getByRole('link', { name: 'Entrar' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator(':focus')).toHaveCount(1);
    for (let index = 0; index < 12; index += 1) {
      await page.keyboard.press('Tab');
      await expect(dialog.locator(':focus')).toHaveCount(1);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/$/);
  });

  test('recibo (desktop) abre como dialogo com foco e fecha com Esc', async ({ page }) => {
    test.skip((page.viewportSize()?.width ?? 0) < 768, 'recibo mobile e pagina');
    await loginToHome(page);
    await page.goto('/orders/ord-ana-0001');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect.poll(() => page.evaluate(() => document.activeElement?.closest('[role="dialog"]') !== null)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('formulario de login associa erros aos campos (aria-invalid e descricao)', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
    const email = page.getByLabel('E-mail', { exact: true });
    await expect(email).toHaveAttribute('aria-invalid', 'true');
    const describedBy = await email.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`[id="${describedBy?.split(' ').pop()}"]`)).toContainText('Campo obrigatório');
  });

  test('operacao completa do carrinho por teclado e foco visivel', async ({ page }) => {
    await page.goto('/nfts/emerald-ape-042');
    const buy = page.getByRole('button', { name: 'Comprar', exact: true });
    await buy.focus();
    await expect(buy).toBeFocused();
    const outline = await buy.evaluate((element) => getComputedStyle(element).outlineStyle);
    expect(outline).not.toBe('none');
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/\/cart$/);
    const remove = page.getByRole('button', { name: /^Remover .* do carrinho$/ });
    await remove.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByText('Seu carrinho está vazio.')).toBeVisible();
  });

  test('link para o conteudo e primeiro foco da pagina', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Pular para o conteúdo' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#content')).toBeFocused();
  });
});
