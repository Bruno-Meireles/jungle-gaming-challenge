import { expect, test } from '@playwright/test';
import { cards, commitSheet, count, isMobile, openFilterPanel, titles } from './support/home';

/*
 * Roda nos projetos desktop-1440 (sidebar) e mobile-390 (Sheet "Filtros" + "Aplicar").
 * Decisoes de contrato (nao definidas no plano):
 * - Fixture: collections=digital-art&networks=polygon daria resultado vazio (toda "Arte digital" e Ethereum);
 *   usamos Fotografia + Polygon (5 itens) para provar a combinacao.
 * - Arrays na URL em chave repetida (collections=a&collections=b), sem JSON.
 * - Preco: o thumb maximo comeca em "12,30 ETH"; Aplicar grava min/max como strings decimais.
 */
const FOTOGRAFIA_POLYGON = [
  'Sage Nomad #009',
  'Coral Drift #476',
  'Pearl Vandal #244',
  'Peach Golem #590',
  'Citrine Wave #349',
];

const valueOf = (valuetext: string | null): number =>
  Number((valuetext ?? '').replace(/\s*ETH$/, '').replace(',', '.'));

test.describe('home: filtros', () => {
  test('colecao + rede combinadas: URL, contagens da API e page volta a 1', async ({ page }) => {
    await page.goto('/?page=2');
    let panel = await openFilterPanel(page);
    await expect(panel.getByRole('checkbox', { name: /^Fotografia.*\b5\b/ })).toBeVisible();

    await panel.getByRole('checkbox', { name: /^Polygon/ }).check();
    if (!isMobile(page)) {
      // no desktop os checkboxes valem na hora, sem Aplicar
      await expect(page).toHaveURL((url) => url.searchParams.getAll('networks').join() === 'polygon');
    }
    await commitSheet(page, panel);
    await expect(page).toHaveURL((url) => url.searchParams.getAll('networks').join() === 'polygon');
    await expect(page).toHaveURL((url) => !url.searchParams.has('page'));

    // facetas disjuntivas: as contagens de colecao respeitam a rede escolhida
    panel = await openFilterPanel(page);
    await expect(panel.getByRole('checkbox', { name: /^Polygon/ })).toBeChecked();
    await expect(panel.getByRole('checkbox', { name: /^Arte digital.*\b0\b/ })).toBeVisible();
    await expect(panel.getByRole('checkbox', { name: /^Fotografia.*\b5\b/ })).toBeVisible();

    await panel.getByRole('checkbox', { name: /^Fotografia/ }).check();
    await commitSheet(page, panel);

    await expect(page).toHaveURL((url) => {
      const p = url.searchParams;
      return p.getAll('collections').join() === 'photography' && p.getAll('networks').join() === 'polygon' && !p.has('page');
    });
    await expect(count(page, '5 NFTs')).toBeVisible();
    await expect(cards(page)).toHaveCount(5);
    expect((await titles(page)).sort()).toEqual([...FOTOGRAFIA_POLYGON].sort());
  });

  test('faixa de preco por teclado + Aplicar: min/max decimais, aria-valuetext e rotulo', async ({ page }) => {
    await page.goto('/');
    const panel = await openFilterPanel(page);
    const min = panel.getByRole('slider', { name: 'Preço mínimo' });
    const max = panel.getByRole('slider', { name: 'Preço máximo' });
    await expect(max).toHaveAttribute('aria-valuetext', '12,30 ETH');

    await max.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(max).toHaveAttribute('aria-valuetext', '12,29 ETH');
    await min.focus();
    for (let i = 0; i < 15; i += 1) await page.keyboard.press('PageUp');
    const minText = await min.getAttribute('aria-valuetext');
    expect(minText).toMatch(/^\d+,\d+ ETH$/);
    const minValue = valueOf(minText);
    expect(minValue).toBeGreaterThan(1);

    const range = `${(minText ?? '').replace(' ETH', '')} - 12,29`;
    await expect(panel.getByText(`Preço: ${range} ETH`)).toBeVisible();
    await expect(page).toHaveURL((url) => !url.searchParams.has('min') && !url.searchParams.has('max'));

    await panel.getByRole('button', { name: 'Aplicar' }).click();

    await expect(page).toHaveURL((url) => url.searchParams.get('max') === '12.29');
    const urlMin = new URL(page.url()).searchParams.get('min') ?? '';
    expect(urlMin).toMatch(/^\d+(\.\d{1,18})?$/);
    expect(Number(urlMin)).toBeCloseTo(minValue, 10);
    if (isMobile(page)) await expect(panel).toBeHidden();

    await expect(cards(page).first()).toBeVisible();
    const texts = await cards(page).allTextContents();
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) {
      const price = valueOf(/(\d+,\d+) ETH/.exec(text)?.[0] ?? null);
      expect(price).toBeGreaterThanOrEqual(minValue);
      expect(price).toBeLessThanOrEqual(12.29);
    }
  });
});
