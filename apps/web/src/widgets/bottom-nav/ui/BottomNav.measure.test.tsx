import { beforeEach, describe, expect, it } from 'vitest';

import { MOBILE, renderWidget } from '../../../../tests/measure/harness';
import { expectColor, expectPx, figma } from '../../../../tests/measure/figma';
import { BottomNav } from './BottomNav';

/*
 * Medidas da barra inferior mobile contra o Figma 14:5226 ("Tab Bar" 70395:245, quadro de 414 validado em 390):
 * fundo 15:5504, botao central 15:5507, icones 15:5519/5523/5529. Valores: tests/figma/measures.json (de
 * docs/figma/file.json); cada falha cita arquivo:linha e id do no.
 */
const rect = (e: Element) => e.getBoundingClientRect();
const style = (e: Element) => getComputedStyle(e);

describe('Barra inferior @390 (Figma 14:5226, 70395:245)', () => {
  let nav: HTMLElement;
  let links: HTMLElement[];

  beforeEach(async () => {
    const screen = await renderWidget(<BottomNav />, { viewport: MOBILE });
    nav = screen.getByRole('navigation').element() as HTMLElement;
    links = [...nav.querySelectorAll('a')] as HTMLElement[]; // inicio, favoritos, scan, loja, perfil
  });

  it('barra com 94,9 de altura e largura total do quadro (15:5504)', () => {
    expectPx(rect(nav).height, 'tabbar.bar.h');
    expect.soft(rect(nav).width, 'Figma 15:5504: a barra ocupa a largura inteira do quadro (largura do viewport)').toBe(window.innerWidth);
  });

  it('fundo de superficie (15:5504)', () => {
    expectColor(style(nav).backgroundColor, 'tabbar.bar.fill');
  });

  it('sombra 0 -10 30 em rgba(10,6,4,0.45) (15:5504, efeito DROP_SHADOW)', () => {
    const { rgb, alpha, x, y, blur } = figma<{ rgb: number[]; alpha: number; x: number; y: number; blur: number }>('tabbar.bar.shadow').value;
    const expected = `rgba(${rgb.join(', ')}, ${alpha}) ${x}px ${y}px ${blur}px 0px`;
    expect.soft(style(nav).boxShadow, figma('tabbar.bar.shadow').cite).toContain(expected);
  });

  it('botao central 65x65 (Ellipse 39, 15:5507)', () => {
    const scan = links[2] as HTMLElement;
    expectPx(rect(scan).width, 'tabbar.center.w');
    expectPx(rect(scan).height, 'tabbar.center.h');
  });

  it('botao central sobe 31 acima do topo da barra (15:5507 x 15:5504)', () => {
    expectPx(rect(nav).top - rect(links[2] as HTMLElement).top, 'tabbar.center.rise');
  });

  it('icone de inicio 20x20, a 36 da borda esquerda (15:5519)', () => {
    const svg = (links[0] as HTMLElement).querySelector('svg') as SVGElement;
    expectPx(rect(svg).width, 'tabbar.icon.w');
    expectPx(rect(svg).height, 'tabbar.icon.h');
    expectPx(rect(svg).left - rect(nav).left, 'tabbar.home.left');
  });

  it('icones inativos na cor secundaria (15:5523)', () => {
    expectColor(style(links[1] as HTMLElement).color, 'tabbar.icon.fill');
    expectColor(style(links[3] as HTMLElement).color, 'tabbar.icon.fill');
  });

  it('icone de scan 26,8x24 na cor de texto (15:5529/5530)', () => {
    const scan = links[2] as HTMLElement;
    const svg = scan.querySelector('svg') as SVGElement;
    expectPx(rect(svg).width, 'tabbar.scan.w');
    expectPx(rect(svg).height, 'tabbar.scan.h');
    expectColor(style(scan).color, 'tabbar.scan.fill');
  });

  it.todo('Lacuna: forma do topo da barra (vetor 15:5504 com entalhe) nao tem raio numerico no file.json; sem medida de raio');
  it.todo('Lacuna: icone de favoritos (15:5527) e itens inativos: o Figma nao define o estado ativo/foco da barra');
});
