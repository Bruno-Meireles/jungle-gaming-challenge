import { expect, test, type Locator, type Page } from '@playwright/test';
import { cards, count, grid } from './support/home';

/*
 * Roda em desktop-1440 e mobile-390. Estados da Home (plano M5, itens 30-33). Cenarios MSW pelo
 * localStorage['jg:mocks:scenario'] via addInitScript. Observado no DOM atual (nao inventado):
 * o skeleton e `[data-slot="nft-card-skeleton"]` (aria-hidden, sem papel), o card `[data-slot="nft-card"]`.
 * Convencoes de nome acessivel exigidas (pt-BR):
 * - Carregando: elemento com aria-busy="true" que contem um `status` "Carregando NFTs" e 9 skeletons.
 * - Atualizacao em segundo plano: o mesmo elemento com aria-busy (que contem a list "NFTs") fica "true" e depois "false".
 * - Vazio: heading "Nenhum NFT encontrado", texto "Tente ajustar a busca ou os filtros." e LINK "Limpar filtros"
 *   (navega para "/" sem query).
 * - Erro: role `alert` com o texto "Não foi possível carregar os NFTs" e botao "Tentar novamente"; em en,
 *   "Could not load the NFTs" e "Try again".
 */
const SKELETON = '[data-slot="nft-card-skeleton"]';
const SKELETON_BAR = '[data-slot="skeleton"]';

const useScenario = async (page: Page, scenario: string) => {
  await page.addInitScript((id) => localStorage.setItem('jg:mocks:scenario', id), scenario);
};

const loadingRegion = (page: Page): Locator =>
  page
    .locator('[aria-busy="true"]')
    .filter({ has: page.getByRole('status').filter({ hasText: 'Carregando NFTs' }) });

const resultsRegion = (page: Page): Locator => page.locator('[aria-busy]').filter({ has: grid(page) });

test.describe('home: skeleton (catalog-slow)', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('mostra regiao aria-busy, status "Carregando NFTs" e 9 skeletons com shimmer', async ({ page }) => {
    await useScenario(page, 'catalog-slow');
    await page.goto('/');

    await expect(loadingRegion(page)).toBeVisible();
    await expect(page.locator(SKELETON)).toHaveCount(9);
    await expect(cards(page)).toHaveCount(0);
    const animationName = await page.locator(SKELETON_BAR).first().evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).not.toBe('none');
  });

  test('altura do skeleton e igual a do card carregado (sem CLS, +-1 px)', async ({ page }) => {
    await useScenario(page, 'catalog-slow');
    await page.goto('/');
    await expect(page.locator(SKELETON)).toHaveCount(9);
    const skeletonBox = await page.locator(SKELETON).first().boundingBox();

    await expect(cards(page)).toHaveCount(9);
    await expect(page.locator(SKELETON)).toHaveCount(0);
    const cardBox = await cards(page).first().locator('[data-slot="nft-card"]').boundingBox();

    expect(skeletonBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(Math.abs((skeletonBox?.height ?? 0) - (cardBox?.height ?? 0))).toBeLessThanOrEqual(1);
  });
});

test.describe('home: skeleton com movimento reduzido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('reducedMotion "reduce" desliga a animacao do skeleton', async ({ page }) => {
    await useScenario(page, 'catalog-slow');
    await page.goto('/');

    await expect(page.locator(SKELETON)).toHaveCount(9);
    const names = await page.locator(SKELETON_BAR).evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(names.length).toBeGreaterThan(0);
    expect(new Set(names)).toEqual(new Set(['none']));
  });
});

test.describe('home: vazio', () => {
  test('catalog-empty mostra titulo e texto; "Limpar filtros" leva a /', async ({ page }) => {
    await useScenario(page, 'catalog-empty');
    await page.goto('/?networks=solana');

    await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible();
    await expect(page.getByText('Tente ajustar a busca ou os filtros.')).toBeVisible();
    await expect(cards(page)).toHaveCount(0);

    await page.getByRole('link', { name: 'Limpar filtros' }).click();

    await expect(page).toHaveURL((url) => url.pathname === '/' && url.search === '');
  });

  test('busca sem resultado (?q=zzz) mostra o vazio; "Limpar filtros" volta a / com os 9 cards', async ({ page }) => {
    await page.goto('/?q=zzz');

    await expect(page.getByRole('heading', { name: 'Nenhum NFT encontrado' })).toBeVisible();
    await expect(page.getByText('Tente ajustar a busca ou os filtros.')).toBeVisible();

    await page.getByRole('link', { name: 'Limpar filtros' }).click();

    await expect(page).toHaveURL((url) => url.pathname === '/' && url.search === '');
    await expect(cards(page)).toHaveCount(9);
  });
});

test.describe('home: erro', () => {
  test('catalog-error mostra alert traduzido; "Tentar novamente" e focavel e o erro persiste', async ({ page }) => {
    await useScenario(page, 'catalog-error');
    await page.goto('/');

    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Não foi possível carregar os NFTs');
    const retry = alert.getByRole('button', { name: 'Tentar novamente' });
    await retry.focus();
    await expect(retry).toBeFocused();

    const request = page.waitForRequest((req) => new URL(req.url()).pathname === '/api/nfts');
    await retry.click();
    await request;

    await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os NFTs');
    await expect(cards(page)).toHaveCount(0);
  });

  test('catalog-flaky: erro primeiro e sucesso depois de "Tentar novamente"', async ({ page }) => {
    await useScenario(page, 'catalog-flaky');
    await page.goto('/');

    const alert = page.getByRole('alert');
    await expect(alert).toContainText('Não foi possível carregar os NFTs');

    await alert.getByRole('button', { name: 'Tentar novamente' }).click();

    await expect(cards(page)).toHaveCount(9);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test.describe('em ingles', () => {
    test.use({ locale: 'en-US' });

    test('a mesma mensagem de erro aparece traduzida', async ({ page }) => {
      await useScenario(page, 'catalog-error');
      await page.goto('/');

      const alert = page.getByRole('alert');
      await expect(alert).toContainText('Could not load the NFTs');
      await expect(alert.getByRole('button', { name: 'Try again' })).toBeVisible();
      await expect(alert).not.toContainText('Não foi possível');
    });
  });
});

test.describe('home: atualizacao em segundo plano (catalog-slow)', () => {
  test('mudar a aba mantem os cards anteriores com aria-busy=true; depois false e novos cards, sem skeleton', async ({ page }) => {
    await useScenario(page, 'catalog-slow');
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);
    await expect(count(page, '45 NFTs')).toBeVisible();
    await expect(resultsRegion(page)).toHaveAttribute('aria-busy', 'false');
    const before = await cards(page).first().getByRole('link').innerText();

    await page.getByRole('tablist', { name: 'Exibição' }).getByRole('tab', { name: 'Em alta' }).click();

    await expect(resultsRegion(page)).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator(SKELETON)).toHaveCount(0);
    await expect(cards(page)).toHaveCount(9);
    await expect(cards(page).first().getByRole('link')).toHaveText(before);

    await expect(resultsRegion(page)).toHaveAttribute('aria-busy', 'false');
    await expect(count(page, '10 NFTs')).toBeVisible();
    await expect(page.locator(SKELETON)).toHaveCount(0);
  });
});
