import { expect, test, type Locator, type Page } from '@playwright/test';
import { cards, grid, isMobile } from './support/home';

/*
 * Plano M6, item 36. Roda em desktop-1440 e mobile-390. Observado no DOM atual (nao inventado):
 * - Ordem do DOM em 1440: skip link, banner (marca, nav Principal, botao Buscar, combobox Idioma, Carrinho, Entrar),
 *   main (hero, sidebar "Filtros", destaque, Resultados: abas, "Ordenar por", cards, Paginacao), contentinfo.
 * - Em 390: skip link, banner, searchbox "Buscar", botao "Filtros", hero, abas, cards, Paginacao. Ordenacao e
 *   filtros ficam no Sheet.
 * - O rodape (contentinfo "Rodapé do site") ainda nao tem elementos focaveis; entra na ordem quando existirem.
 * Foco visivel = outline-style diferente de none e largura > 0 (plano 36).
 */
const MAX_TABS_PER_STEP = 40;

const isFocused = (locator: Locator): Promise<boolean> =>
  locator.evaluate((el) => el === document.activeElement);

/** Pressiona Tab ate `target` ter o foco; falha se passar do limite (ordem errada ou alvo inalcancavel). */
async function tabTo(page: Page, target: Locator, label: string): Promise<void> {
  for (let step = 0; step < MAX_TABS_PER_STEP; step += 1) {
    await page.keyboard.press('Tab');
    if (await isFocused(target)) return;
  }
  throw new Error(`"${label}" nao recebeu foco em ${MAX_TABS_PER_STEP} Tabs a partir do alvo anterior`);
}

async function expectVisibleFocusRing(target: Locator, label: string): Promise<void> {
  const ring = await target.evaluate((el) => {
    const style = getComputedStyle(el);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
  });
  expect.soft(ring.style, `outline-style de "${label}"`).not.toBe('none');
  expect(ring.width).toBeGreaterThan(0);
}

test.describe('home: teclado na pagina', () => {
  test('a ordem de Tab segue skip link, navegacao, busca, filtros, abas, ordenacao, cards e paginacao, cada alvo com foco visivel', async ({ page }) => {
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);

    const steps: Array<[string, Locator]> = isMobile(page)
      ? [
          ['skip link', page.getByRole('link', { name: 'Pular para o conteúdo' })],
          ['campo de busca', page.getByRole('searchbox', { name: 'Buscar' })],
          ['botao Filtros', page.getByRole('button', { name: 'Filtros' })],
          ['aba selecionada', page.getByRole('tab', { name: 'Todos os NFTs' })],
          ['primeiro card', cards(page).first().getByRole('link')],
          ['paginacao', page.getByRole('navigation', { name: 'Paginação' }).getByRole('link', { name: '2' })],
        ]
      : [
          ['skip link', page.getByRole('link', { name: 'Pular para o conteúdo' })],
          ['navegacao', page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Início' })],
          ['botao Buscar', page.getByRole('button', { name: 'Buscar' })],
          ['filtros', page.getByRole('complementary', { name: 'Filtros' }).getByRole('checkbox').first()],
          ['aba selecionada', page.getByRole('tab', { name: 'Todos os NFTs' })],
          ['ordenacao', page.getByRole('combobox', { name: 'Ordenar por' })],
          ['primeiro card', cards(page).first().getByRole('link')],
          ['paginacao', page.getByRole('navigation', { name: 'Paginação' }).getByRole('link', { name: '2' })],
        ];

    for (const [label, target] of steps) {
      await tabTo(page, target, label);
      await expectVisibleFocusRing(target, label);
    }
  });

  test('o foco visivel aparece tambem no botao Entrar e no link do carrinho do cabecalho', async ({ page }) => {
    await page.goto('/');
    await expect(grid(page)).toBeVisible();

    for (const [label, target] of [
      ['carrinho', page.getByRole('link', { name: 'Carrinho' })],
      ['entrar', page.getByRole('link', { name: 'Entrar' })],
    ] as const) {
      await tabTo(page, target, label);
      await expectVisibleFocusRing(target, label);
    }
  });
});

test.describe('home: nomes acessiveis dos controles', () => {
  test('todo checkbox, slider e campo do painel de filtros tem nome acessivel', async ({ page }) => {
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);
    let panel: Locator;
    if (isMobile(page)) {
      await page.getByRole('button', { name: 'Filtros' }).click();
      panel = page.getByRole('dialog', { name: 'Filtros' });
    } else {
      panel = page.getByRole('complementary', { name: 'Filtros' });
    }
    await expect(panel).toBeVisible();

    const snapshot = await panel.ariaSnapshot();
    const lines = snapshot.split('\n').map((line) => line.trim());
    const controls = lines.filter((line) => /^- (checkbox|slider|searchbox|textbox|combobox|spinbutton|radio|switch)\b/.test(line));
    expect(controls.length).toBeGreaterThanOrEqual(14);
    const unnamed = controls.filter((line) => !/^- \w+ "[^"]+"/.test(line));
    expect(unnamed).toEqual([]);
  });

  test('o campo de busca tem nome acessivel', async ({ page }) => {
    await page.goto('/');
    if (!isMobile(page)) await page.getByRole('button', { name: 'Buscar' }).click();

    await expect(page.getByRole('searchbox', { name: 'Buscar' })).toBeVisible();
  });
});

test.describe('home: Sheet de filtros pelo teclado', () => {
  test('foco preso no dialog, Esc fecha e devolve o foco ao botao Filtros', async ({ page }) => {
    await page.goto('/');
    await expect(cards(page)).toHaveCount(9);
    if (!isMobile(page)) {
      await expect(page.getByRole('button', { name: 'Filtros' })).toHaveCount(0);
      return;
    }
    const trigger = page.getByRole('button', { name: 'Filtros' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect(dialog).toBeVisible();
    await expect.poll(() => dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);

    for (let press = 0; press < 40; press += 1) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    for (let press = 0; press < 5; press += 1) {
      await page.keyboard.press('Shift+Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }

    await page.keyboard.press('Escape');

    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
});
