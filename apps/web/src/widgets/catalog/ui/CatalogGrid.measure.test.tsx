import { beforeEach, describe, expect, it } from 'vitest';

import { DESKTOP, MOBILE, renderWidget } from '../../../../tests/measure/harness';
import { expectExact, expectPx, figma, px } from '../../../../tests/measure/figma';
import { Catalog } from './Catalog';

/*
 * Medidas da grade de cards contra o Figma: desktop 1440 ("Product Grid" 70342:2830, 842 de largura, linhas
 * "Grid Rows" 70342:2828) e mobile ("Product Grid" 70395:242, 366 no quadro de 414). O Catalog e renderizado dentro de
 * uma coluna com a largura do no do Figma, para isolar a grade do layout da pagina (coberto pelo E2E home-layout).
 * Valores: tests/figma/measures.json (de docs/figma/file.json); cada falha cita arquivo:linha e id do no.
 */
const rect = (e: Element) => e.getBoundingClientRect();

async function mountGrid(viewport: { width: number; height: number }, widthKey: string) {
  const width = figma(widthKey).value;
  const screen = await renderWidget(
    <div style={{ width }}>
      <Catalog />
    </div>,
    { viewport, mocks: true },
  );
  await expect.element(screen.getByRole('list', { name: /nfts/i })).toBeVisible();
  const list = screen.getByRole('list', { name: /nfts/i }).element() as HTMLElement;
  const items = [...list.children] as HTMLElement[];
  return { list, items };
}

describe('Grade @1440 (Figma 2:2, 70342:2830)', () => {
  let g: Awaited<ReturnType<typeof mountGrid>>;
  beforeEach(async () => {
    g = await mountGrid(DESKTOP, 'grid.w');
  });

  it('3 colunas de 258 (Frame 141, 70342:2678)', () => {
    const columns = getComputedStyle(g.list).gridTemplateColumns.split(' ');
    expectExact(columns.length, 'grid.cols');
    expectPx(px(columns[0] as string), 'grid.col.w');
  });

  it('gap entre colunas 32 (Frame 206, 70342:2802)', () => {
    const [a, b] = g.items as [HTMLElement, HTMLElement];
    expectPx(rect(b).left - rect(a).right, 'grid.gap.col');
  });

  it('gap entre linhas 72 (Grid Rows, 70342:2828)', () => {
    const [a, , , d] = g.items as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    expectPx(rect(d).top - rect(a).bottom, 'grid.gap.row');
  });
});

describe('Grade @390 (Figma 14:5226, 70395:242; quadro de 414)', () => {
  let g: Awaited<ReturnType<typeof mountGrid>>;
  beforeEach(async () => {
    g = await mountGrid(MOBILE, 'gridM.w');
  });

  it('2 colunas de 175 (Column L, 70395:243)', () => {
    const columns = getComputedStyle(g.list).gridTemplateColumns.split(' ');
    expectExact(columns.length, 'gridM.cols');
    expectPx(px(columns[0] as string), 'gridM.col.w');
  });

  it('gap entre colunas 16 (Product Grid, 70395:242)', () => {
    const [a, b] = g.items as [HTMLElement, HTMLElement];
    expectPx(rect(b).left - rect(a).right, 'gridM.gap.col');
  });

  it('gap entre linhas 24 (Column L, 70395:243)', () => {
    const [a, , c] = g.items as [HTMLElement, HTMLElement, HTMLElement];
    expectPx(rect(c).top - rect(a).bottom, 'gridM.gap.row');
  });

  it('coluna direita deslocada 32 para baixo (Column R, 70395:244)', () => {
    const [a, b] = g.items as [HTMLElement, HTMLElement];
    expectPx(rect(b).top - rect(a).top, 'gridM.colR.offset');
  });
});
