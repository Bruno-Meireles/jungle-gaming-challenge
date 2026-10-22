import { beforeEach, describe, expect, it } from 'vitest';

import { DESKTOP, MOBILE, renderWidget } from '../../../../tests/measure/harness';
import { expectColor, expectExact, expectPx, px } from '../../../../tests/measure/figma';
import { Catalog } from './Catalog';

/*
 * Medidas da toolbar (abas e ordenacao) contra o Figma: desktop 1440 ("Toolbar" 70351:239 no frame 2:2) e mobile
 * ("Tabs" 70395:241 no frame 14:5226, quadro de 414 validado em 390). Valores: tests/figma/measures.json (de
 * docs/figma/file.json); cada falha cita arquivo:linha e id do no. Renderiza o Catalog real com os handlers MSW.
 */
const rect = (e: Element) => e.getBoundingClientRect();
const style = (e: Element, pseudo?: string) => getComputedStyle(e, pseudo);

type Parts = { tablist: HTMLElement; active: HTMLElement; inactive: HTMLElement; toolbar: HTMLElement; results: HTMLElement };

async function mount(viewport: { width: number; height: number }): Promise<Parts & { sort: HTMLElement | null }> {
  const screen = await renderWidget(<Catalog />, { viewport, mocks: true });
  await expect.element(screen.getByRole('list', { name: /nfts/i })).toBeVisible();
  const tablist = screen.getByRole('tablist').element() as HTMLElement;
  const tabs = [...tablist.querySelectorAll('[role="tab"]')] as HTMLElement[];
  const sort = document.querySelector('[role="combobox"]') as HTMLElement | null;
  return {
    tablist,
    active: tabs.find((t) => t.getAttribute('aria-selected') === 'true') as HTMLElement,
    inactive: tabs.find((t) => t.getAttribute('aria-selected') === 'false') as HTMLElement,
    toolbar: tablist.parentElement?.parentElement as HTMLElement,
    results: document.querySelector('[aria-busy]') as HTMLElement,
    sort,
  };
}

describe('Toolbar @1440 (Figma 2:2, 70351:239)', () => {
  let p: Awaited<ReturnType<typeof mount>>;
  beforeEach(async () => {
    p = await mount(DESKTOP);
  });

  it('abas separadas por 20 (Tabs 70351:240)', () => {
    expectPx(px(style(p.tablist).columnGap), 'toolbar.tabs.gap');
  });

  it('aba: 15px, medium; ativa na cor de destaque, inativa na cor de texto (4:138/4:144)', () => {
    expectPx(px(style(p.active).fontSize), 'toolbar.tab.fs');
    expectExact(Number(style(p.active).fontWeight), 'toolbar.tab.fw');
    expectColor(style(p.active).color, 'toolbar.tabActive.fill');
    expectColor(style(p.inactive).color, 'toolbar.tabInactive.fill');
  });

  it('sublinhado da aba ativa: 2px na cor primaria (Line 3, 4:146)', () => {
    const after = style(p.active, '::after');
    expectPx(px(after.height), 'toolbar.underline.w');
    expectColor(after.backgroundColor, 'toolbar.underline.fill');
  });

  it('ordenacao: 15px regular na cor de texto (4:147)', () => {
    const sort = p.sort as HTMLElement;
    expectPx(px(style(sort).fontSize), 'toolbar.sort.fs');
    expectExact(Number(style(sort).fontWeight), 'toolbar.sort.fw');
    expectColor(style(sort).color, 'toolbar.sort.fill');
  });

  it('32 entre a toolbar e a grade (Frame 233, 70342:2828)', () => {
    expectPx(rect(p.results).top - rect(p.toolbar).bottom, 'toolbar.gap.grid');
  });
});

describe('Toolbar @390 (Figma 14:5226, 70395:241)', () => {
  let p: Awaited<ReturnType<typeof mount>>;
  beforeEach(async () => {
    p = await mount(MOBILE);
  });

  it('abas separadas por 16 (Frame 234, 70367:2847)', () => {
    expectPx(px(style(p.tablist).columnGap), 'toolbarM.tabs.gap');
  });

  it('aba ativa: 14px bold na cor de destaque (15:5361)', () => {
    expectPx(px(style(p.active).fontSize), 'toolbarM.tabActive.fs');
    expectExact(Number(style(p.active).fontWeight), 'toolbarM.tabActive.fw');
    expectColor(style(p.active).color, 'toolbarM.tabActive.fill');
  });

  it('aba inativa: 14px regular (15:5363)', () => {
    expectPx(px(style(p.inactive).fontSize), 'toolbarM.tabInactive.fs');
    expectExact(Number(style(p.inactive).fontWeight), 'toolbarM.tabInactive.fw');
  });

  it('sublinhado da aba ativa: 2px (Line 3, 15:5366)', () => {
    expectPx(px(style(p.active, '::after').height), 'toolbarM.underline.w');
  });

  it('16 entre as abas e a grade (Product Grid, 70395:242)', () => {
    expectPx(rect(p.results).top - rect(p.toolbar).bottom, 'toolbarM.gap.grid');
  });

  it.todo('Lacuna: a ordenacao nao existe no frame mobile (Figma 14:5226 so tem as abas); no app ela fica dentro do Sheet de filtros');
});
