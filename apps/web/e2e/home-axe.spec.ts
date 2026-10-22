import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { cards, isMobile } from './support/home';

/*
 * Plano M6, item 38. Roda em desktop-1440 e mobile-390. API conferida no pacote instalado
 * (@axe-core/playwright 4.14.0): `new AxeBuilder({ page }).withTags([...]).analyze()` devolve `{ violations }`.
 * Tags: WCAG 2.0/2.1/2.2 A e AA (alvo do enunciado §8) mais `best-practice`. Cenarios MSW pelo
 * localStorage['jg:mocks:scenario'] via addInitScript. Observado: o Sheet de filtros so existe < 1440; no 1440 o
 * mesmo conteudo e a sidebar, ja coberta pela Home carregada.
 */
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const useScenario = async (page: Page, scenario: string) => {
  await page.addInitScript((id) => localStorage.setItem('jg:mocks:scenario', id), scenario);
};

async function violationsOf(page: Page): Promise<string[]> {
  const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
  return results.violations.map(
    (violation) => `${violation.id} (${violation.impact ?? 'n/a'}): ${violation.nodes.map((node) => node.target.join(' ')).join(' | ')}`,
  );
}

test.describe('home: axe', () => {
  test('Home carregada nao tem violacoes', async ({ page }) => {
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);

    expect(await violationsOf(page)).toEqual([]);
  });

  test('estado vazio nao tem violacoes', async ({ page }) => {
    await useScenario(page, 'catalog-empty');
    await page.goto('/?networks=solana');
    await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible();

    expect(await violationsOf(page)).toEqual([]);
  });

  test('estado de erro nao tem violacoes', async ({ page }) => {
    await useScenario(page, 'catalog-error');
    await page.goto('/');
    await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os NFTs');

    expect(await violationsOf(page)).toEqual([]);
  });

  test('Sheet de filtros aberto nao tem violacoes (390)', async ({ page }) => {
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);
    if (!isMobile(page)) {
      await expect(page.getByRole('complementary', { name: 'Filtros' })).toBeVisible();
      return;
    }
    await page.getByRole('button', { name: 'Filtros' }).click();
    await expect(page.getByRole('dialog', { name: 'Filtros' })).toBeVisible();

    expect(await violationsOf(page)).toEqual([]);
  });

  test.describe('em ingles', () => {
    test.use({ locale: 'en-US' });

    test('Home carregada em en nao tem violacoes', async ({ page }) => {
      await page.goto('/');
      await expect(cards(page)).toHaveCount(9);

      expect(await violationsOf(page)).toEqual([]);
    });
  });
});
