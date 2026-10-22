import { expect, test, type Page } from '@playwright/test';
import { cards, count } from './support/home';

/*
 * Roda em desktop-1440 e mobile-390. Cenario `catalog-out-of-order` (plano 3.6): a 1a requisicao a /api/nfts
 * depois da carga inicial leva 1200 ms; as seguintes, 100 ms. O relogio da pagina e controlado por page.clock
 * (os delays do MSW rodam na pagina), entao a ordem de chegada e deterministica.
 * A = aba "Em alta" (lenta, 10 itens); B = aba "Novos lançamentos" (rapida, 45 itens).
 * Convencao exigida: as abas sao tabs do tablist "Exibição" e valem na hora nos dois viewports.
 */
const flushMacrotasks = (page: Page) =>
  page.evaluate(async () => {
    for (let i = 0; i < 10; i += 1) {
      await new Promise<void>((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = () => resolve();
        channel.port2.postMessage(null);
      });
    }
  });

test.describe('home: respostas fora de ordem', () => {
  test('quando a resposta A (lenta) termina, a grade e a URL continuam as de B', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('jg:mocks:scenario', 'catalog-out-of-order'));
    await page.clock.install({ time: new Date('2026-10-02T00:00:00Z') });
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);
    await expect(count(page, '45 NFTs')).toBeVisible();
    await page.clock.pauseAt(new Date('2026-10-02T00:10:00Z'));

    const tabs = page.getByRole('tablist', { name: 'Exibição' });
    await tabs.getByRole('tab', { name: 'Em alta' }).click(); // A: 1200 ms
    await tabs.getByRole('tab', { name: 'Novos lançamentos' }).click(); // B: 100 ms

    await page.clock.runFor(100);
    await expect(count(page, '45 NFTs')).toBeVisible();
    await expect(page).toHaveURL((url) => url.searchParams.get('tab') === 'new');

    await page.clock.runFor(1200); // agora A terminaria
    await flushMacrotasks(page);

    await expect(page).toHaveURL((url) => url.searchParams.get('tab') === 'new');
    await expect(tabs.getByRole('tab', { name: 'Novos lançamentos' })).toHaveAttribute('aria-selected', 'true');
    await expect(count(page, '45 NFTs')).toBeVisible();
    await expect(count(page, '10 NFTs')).toHaveCount(0);
    await expect(cards(page)).toHaveCount(9);
    await expect(cards(page).first()).toContainText('Emerald Ape #042');
  });
});
