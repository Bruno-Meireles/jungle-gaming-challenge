import { beforeEach, describe, expect, it } from 'vitest';

import { DESKTOP, renderWidget } from '../../../../tests/measure/harness';
import { expectColor, expectExact, expectPx, figma, px } from '../../../../tests/measure/figma';
import { Header } from './Header';

/*
 * Medidas do Header contra o Figma desktop 1440 (frame 2:2, "Header With Divider" 70522:3240).
 * Valores em tests/figma/measures.json (gerado de docs/figma/file.json por tests/figma/extract-measures.mjs);
 * cada falha cita arquivo:linha e id do no. Mobile (14:5226) nao tem header: Lacuna abaixo.
 */
describe('Header @1440 (Figma 2:2)', () => {
  let header: HTMLElement;
  const el = (name: string, role: 'link' | 'navigation' = 'link') => {
    const found = [...header.querySelectorAll(role === 'link' ? 'a' : 'nav')].find(
      (n) => n.textContent?.trim() === name || n.getAttribute('aria-label') === name,
    );
    if (!found) throw new Error(`elemento ${name} nao encontrado`);
    return found as HTMLElement;
  };

  beforeEach(async () => {
    const screen = await renderWidget(<Header />, { viewport: DESKTOP });
    header = screen.getByRole('banner').element() as HTMLElement;
  });

  it('comeca 24px abaixo do topo do frame (70522:3240)', () => {
    expectPx(header.getBoundingClientRect().top + px(getComputedStyle(header).paddingTop), 'header.top');
  });

  it('logo 160x34,3 (70486:509)', () => {
    const logo = header.querySelector('a[href="/"]') as HTMLElement;
    const r = logo.getBoundingClientRect();
    expectPx(r.width, 'header.logo.w');
    expectPx(r.height, 'header.logo.h');
  });

  it('marca em Roboto Mono 14 bold, cor de texto (70486:510)', () => {
    const logo = header.querySelector('a[href="/"]') as HTMLElement;
    const s = getComputedStyle(logo);
    const font = figma<string>('header.brand.font');
    expect.soft(s.fontFamily, font.cite).toContain(font.value);
    expectPx(px(s.fontSize), 'header.brand.fs');
    expectExact(Number(s.fontWeight), 'header.brand.fw');
    expectColor(s.color, 'header.brand.fill');
  });

  it('item de navegacao com 45px de altura (70486:512)', () => {
    expectPx(el('Início').getBoundingClientRect().height, 'header.navItem.h');
  });

  it('gap entre itens da navegacao 40 (70486:511)', () => {
    expectPx(px(getComputedStyle(el('Início').closest('ul') as HTMLElement).columnGap), 'header.nav.gap');
  });

  it('item ativo: 16px, bold, line-height 21,1 e cor de destaque (70486:513)', () => {
    const s = getComputedStyle(el('Início'));
    expectPx(px(s.fontSize), 'header.navActive.fs');
    expectExact(Number(s.fontWeight), 'header.navActive.fw');
    expectPx(px(s.lineHeight), 'header.navActive.lh');
    expectColor(s.color, 'header.navActive.fill');
  });

  it('sublinhado do item ativo: 3px na cor primaria (70486:514)', () => {
    const after = getComputedStyle(el('Início'), '::after');
    expectPx(px(after.height), 'header.navActive.underlineW');
    expectColor(after.backgroundColor, 'header.navActive.underlineFill');
  });

  it('item inativo: 16px, regular, line-height 21,1, cor de texto (70486:515)', () => {
    const s = getComputedStyle(el('Criadores'));
    expectPx(px(s.fontSize), 'header.navInactive.fs');
    expectExact(Number(s.fontWeight), 'header.navInactive.fw');
    expectPx(px(s.lineHeight), 'header.navInactive.lh');
    expectColor(s.color, 'header.navInactive.fill');
  });

  it('acoes do cabecalho com gap 28 (70486:518)', () => {
    const actions = el('Entrar').closest('div') as HTMLElement;
    expectPx(px(getComputedStyle(actions).columnGap), 'header.actions.gap');
  });

  it('icone do carrinho 24px (70486:521)', () => {
    const svg = header.querySelector('a[href="/cart"] svg') as SVGElement;
    expectPx(svg.getBoundingClientRect().width, 'header.cart.w');
  });

  it('botao Entrar 100x35, raio 6, preenchimento primario (70486:525)', () => {
    const btn = el('Entrar');
    const r = btn.getBoundingClientRect();
    expectPx(r.width, 'header.login.w');
    expectPx(r.height, 'header.login.h');
    expectPx(px(getComputedStyle(btn).borderTopLeftRadius), 'header.login.radius');
    expectColor(getComputedStyle(btn).backgroundColor, 'header.login.fill');
  });

  it('conteudo do botao Entrar: gap 4, 16px medium, texto escuro (70486:526/528)', () => {
    const btn = el('Entrar');
    const s = getComputedStyle(btn);
    expectPx(px(s.columnGap), 'header.login.gap');
    expectPx(px(s.fontSize), 'header.login.fs');
    expectExact(Number(s.fontWeight), 'header.login.fw');
    expectColor(s.color, 'header.login.fill.text');
  });

  it('divisor do cabecalho: traco de 0,3 na cor primaria (I70522:3240;70504:3016)', () => {
    const row = header.querySelector('.border-b') as HTMLElement;
    const s = getComputedStyle(row);
    expectPx(px(s.borderBottomWidth), 'header.divider.w');
    expectColor(s.borderBottomColor, 'header.divider.stroke');
  });

  it.todo('Lacuna: o frame mobile 14:5226 nao tem header (comeca na barra de busca em y=40); nao ha medida para o header em 390');
  it.todo('Lacuna: icone de busca 20px (70486:519) e botao de busca sao do slice features/catalog-search; medir no teste da feature');
});

