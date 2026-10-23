import { expect, test, type Page } from '@playwright/test';

/* Carrossel do Hero: deslizar (toque), arrastar (mouse), bolinhas, teclado, sem autoplay e movimento reduzido. */

const hero = (page: Page) => page.getByRole('region', { name: 'Destaques' });
const dot = (page: Page, index: number) => hero(page).getByRole('button', { name: 'Destaque ' + String(index) + ' de 3' });
const track = (page: Page) => hero(page).locator('img').first().locator('..');

async function openHome(page: Page) {
  await page.goto('/');
  await expect(hero(page).getByRole('img').first()).toBeVisible();
}

test.describe('carrossel do hero', () => {
  test('arrastar com o mouse troca o slide e sincroniza a bolinha', async ({ page }) => {
    await openHome(page);
    const box = await hero(page).getByRole('img').first().boundingBox();
    if (!box) throw new Error('imagem sem caixa');
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width * 0.8, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.3, y, { steps: 8 });
    await page.mouse.up();
    await expect(dot(page, 2)).toHaveAttribute('aria-current', 'true');
    await expect(dot(page, 1)).not.toHaveAttribute('aria-current', 'true');
    await expect(hero(page).getByRole('img')).toHaveCount(1);

    await page.mouse.move(box.x + box.width * 0.2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.8, y, { steps: 8 });
    await page.mouse.up();
    await expect(dot(page, 1)).toHaveAttribute('aria-current', 'true');
  });

  test('gesto de deslizar por toque avanca e nao passa do ultimo slide', async ({ page }) => {
    await openHome(page);
    const swipe = (fromX: number, toX: number) =>
      track(page).evaluate(
        (element, [from, to]) => {
          const rect = element.getBoundingClientRect();
          const y = rect.top + rect.height / 2;
          const fire = (type: string, x: number) =>
            element.dispatchEvent(
              new PointerEvent(type, { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, clientX: rect.left + rect.width * x, clientY: y }),
            );
          fire('pointerdown', from ?? 0);
          fire('pointermove', to ?? 0);
          fire('pointerup', to ?? 0);
        },
        [fromX, toX],
      );
    await swipe(0.8, 0.2);
    await expect(dot(page, 2)).toHaveAttribute('aria-current', 'true');
    await swipe(0.8, 0.2);
    await expect(dot(page, 3)).toHaveAttribute('aria-current', 'true');
    await swipe(0.8, 0.2);
    await expect(dot(page, 3)).toHaveAttribute('aria-current', 'true');
    await swipe(0.2, 0.8);
    await expect(dot(page, 2)).toHaveAttribute('aria-current', 'true');
  });

  test('bolinhas por teclado (Tab + Enter) e sem autoplay', async ({ page }) => {
    await openHome(page);
    await dot(page, 3).focus();
    await page.keyboard.press('Enter');
    await expect(dot(page, 3)).toHaveAttribute('aria-current', 'true');
    await page.waitForTimeout(6_500);
    await expect(dot(page, 3)).toHaveAttribute('aria-current', 'true');
    await expect(hero(page).getByRole('img')).toHaveCount(1);
  });

  test('transicao deslizante existe e some com movimento reduzido', async ({ page }) => {
    await openHome(page);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(track(page)).toHaveCSS('transition-property', /transform/);
    await expect(track(page)).toHaveCSS('transition-duration', '0.3s');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(track(page)).toHaveCSS('transition-property', 'none');
  });
});
