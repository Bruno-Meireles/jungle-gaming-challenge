import { beforeEach, describe, expect, it } from 'vitest';

import { DESKTOP, MOBILE, renderWidget } from '../../../../tests/measure/harness';
import { expectColor, expectExact, expectPx, px } from '../../../../tests/measure/figma';
import { FilterSheet } from './FilterSheet';
import { FilterSidebar } from './FilterSidebar';

/*
 * Medidas do painel de filtros contra o Figma: sidebar desktop 1440 ("Filters" 70485:382 no frame 2:2) e botao de
 * filtros mobile ("Frame 402" 70410:4122 no frame 14:5226). Valores: tests/figma/measures.json (de
 * docs/figma/file.json); cada falha cita arquivo:linha e id do no. Facetas vindas dos handlers MSW.
 */
const rect = (e: Element) => e.getBoundingClientRect();
const style = (e: Element) => getComputedStyle(e);

describe('Sidebar de filtros @1440 (Figma 2:2, 70485:382)', () => {
  let aside: HTMLElement;
  let titles: HTMLElement[];
  let groups: HTMLElement[];

  beforeEach(async () => {
    const screen = await renderWidget(<FilterSidebar />, { viewport: DESKTOP, mocks: true });
    await expect.element(screen.getByRole('button', { name: 'Aplicar' })).toBeVisible();
    aside = screen.getByRole('complementary').element() as HTMLElement;
    groups = [...aside.querySelectorAll('[role="group"]')] as HTMLElement[];
    titles = [...aside.querySelectorAll('h3')] as HTMLElement[];
  });

  it('largura 310, padding 20, fundo de superficie (70485:382)', () => {
    expectPx(rect(aside).width, 'side.w');
    expectPx(px(style(aside).paddingLeft), 'side.padL');
    expectPx(px(style(aside).paddingTop), 'side.padT');
    expectColor(style(aside).backgroundColor, 'side.fill');
  });

  it('desvio documentado: raio 8 (o no 70485:382 nao define raio; 0 so inferido, side.radius)', () => {
    expect.soft(px(style(aside).borderTopLeftRadius), 'desvio documentado: raio 8 mantido (.AI/plans/home.md, item 39)').toBe(8);
  });

  it('grupos separados por 40 (Frame 140, 70485:317)', () => {
    const [collections, price] = groups as [HTMLElement, HTMLElement];
    expectPx(rect(price).top - rect(collections).bottom, 'side.gap.groups');
  });

  it('titulo do grupo: 18px, bold, cor de texto (70485:319)', () => {
    const s = style(titles[0] as HTMLElement);
    expectPx(px(s.fontSize), 'side.title.fs');
    expectExact(Number(s.fontWeight), 'side.title.fw');
    expectColor(s.color, 'side.title.fill');
  });

  it('12px entre o titulo e a lista (70485:320)', () => {
    const title = titles[0] as HTMLElement;
    const list = (groups[0] as HTMLElement).querySelector('ul') as HTMLElement;
    expectPx(rect(list).top - rect(title).bottom, 'side.gap.titleList');
  });

  it('linhas de colecao com 40 de altura e texto de 15px (70485:321/323)', () => {
    const row = (groups[0] as HTMLElement).querySelector('li') as HTMLElement;
    expectPx(rect(row).height, 'side.row.h');
    expectPx(px(style(row.querySelector('label') as HTMLElement).fontSize), 'side.row.fs');
  });

  it('linhas de rede com 40 de altura (70485:372)', () => {
    const row = (groups[2] as HTMLElement).querySelector('li') as HTMLElement;
    expectPx(rect(row).height, 'side.networkRow.h');
  });

  it('rotulo da faixa: 15px, cor de texto (70485:366)', () => {
    const label = [...aside.querySelectorAll('p')].find((p) => p.textContent?.startsWith('Preço:')) as HTMLElement;
    expectPx(px(style(label).fontSize), 'side.price.fs');
    expectColor(style(label).color, 'side.price.fill');
  });

  it('botao Aplicar 92x36, raio 6, primario, 16px bold (70485:367/368)', () => {
    const btn = [...aside.querySelectorAll('button')].find((b) => b.textContent === 'Aplicar') as HTMLElement;
    expectPx(rect(btn).width, 'side.apply.w');
    expectPx(rect(btn).height, 'side.apply.h');
    expectPx(px(style(btn).borderTopLeftRadius), 'side.apply.radius');
    expectColor(style(btn).backgroundColor, 'side.apply.fill');
    expectPx(px(style(btn).fontSize), 'side.apply.fs');
    expectExact(Number(style(btn).fontWeight), 'side.apply.fw');
  });

  it('marcador do slider com 15px (70485:361)', () => {
    const thumb = aside.querySelector('[role="slider"]') as HTMLElement;
    expectPx(rect(thumb).width, 'side.thumb.w');
  });
});

describe('Botao de filtros @390 (Figma 14:5226, 70410:4122)', () => {
  let button: HTMLElement;
  beforeEach(async () => {
    const screen = await renderWidget(<FilterSheet />, { viewport: MOBILE });
    button = screen.getByRole('button', { name: 'Filtros' }).element() as HTMLElement;
  });

  it('botao 45x45 com raio 14 (70410:4122)', () => {
    expectPx(rect(button).width, 'sideM.filterButton.w');
    expectPx(rect(button).height, 'sideM.filterButton.h');
    expectPx(px(style(button).borderTopLeftRadius), 'sideM.filterButton.radius');
  });

  it.todo('Lacuna: fundo do botao mobile (70410:4122) e gradiente linear translucido (primario a 45%); comparacao de gradiente fora do escopo das medidas, app usa gradiente opaco');
  it.todo('Lacuna: layout interno do Sheet de filtros nao existe no Figma (so o botao); sem medidas para o conteudo do Sheet');
});
