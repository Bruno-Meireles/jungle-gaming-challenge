import { expect, type Locator, type Page } from '@playwright/test';

/*
 * Convencoes de nome acessivel exigidas da Home (pt-BR), compartilhadas pelos specs de filtros, ordenacao, abas,
 * busca, paginacao e historico:
 * - Grade: list "NFTs" com listitems; titulo = link; contagem em role status ("45 NFTs").
 * - Filtros: no 1440 e um `complementary` "Filtros" sempre visivel; em 390 (e 768) um botao "Filtros" abre um
 *   `dialog` "Filtros" (Sheet) com os mesmos controles mais o Select "Ordenar por"; la, tudo so vale ao clicar
 *   no botao "Aplicar" do dialog, que fecha o Sheet e devolve o foco ao botao "Filtros".
 * - Dentro do painel: group "Colecoes" e group "Rede" com checkboxes cujo nome comeca pelo rotulo e inclui a
 *   contagem da API ("Fotografia (5)"); group "Faixa de preco" com sliders "Preco minimo" e "Preco maximo",
 *   o rotulo "Preco: 0,02 - 12,30 ETH" e o botao "Aplicar".
 */
export const isMobile = (page: Page): boolean => (page.viewportSize()?.width ?? 0) < 768;

export const grid = (page: Page): Locator => page.getByRole('list', { name: 'NFTs' });
export const cards = (page: Page): Locator => grid(page).getByRole('listitem');
export const count = (page: Page, text: string): Locator => page.getByRole('status').filter({ hasText: text });

export async function titles(page: Page): Promise<string[]> {
  return cards(page).getByRole('link').allTextContents();
}

export async function openFilterPanel(page: Page): Promise<Locator> {
  if (!isMobile(page)) return page.getByRole('complementary', { name: 'Filtros' });
  await page.getByRole('button', { name: 'Filtros' }).click();
  const dialog = page.getByRole('dialog', { name: 'Filtros' });
  await expect(dialog).toBeVisible();
  return dialog;
}

/** Em 390 confirma o Sheet; no 1440 nao ha o que confirmar (checkboxes e abas valem na hora). */
export async function commitSheet(page: Page, panel: Locator): Promise<void> {
  if (!isMobile(page)) return;
  await panel.getByRole('button', { name: 'Aplicar' }).click();
  await expect(panel).toBeHidden();
}

export const searchParamsOf = (url: URL): URLSearchParams => url.searchParams;
