import { beforeEach, describe, expect, it } from 'vitest';

import { PageContainer } from '../../../shared/ui';
import { DESKTOP, MOBILE, renderWidget } from '../../../../tests/measure/harness';
import { expectColor, expectExact, expectPx, figma, px } from '../../../../tests/measure/figma';
import { Hero } from './Hero';

/*
 * Medidas do Hero contra o Figma: desktop 1440 (frame 2:2, "Hero" 70347:239) e mobile (frame 14:5226 de 414 px,
 * "Hero Banner" 70395:240, validado em 390). Valores: tests/figma/measures.json (de docs/figma/file.json);
 * cada falha cita arquivo:linha e id do no. Os handlers MSW servem os destaques (cenario default).
 */
type Parts = {
  section: HTMLElement;
  eyebrow: HTMLElement;
  title: HTMLElement;
  text: HTMLElement;
  button: HTMLElement;
  image: HTMLElement;
  dots: HTMLElement[];
};

async function mount(viewport: { width: number; height: number }): Promise<Parts> {
  const screen = await renderWidget(
    <PageContainer>
      <Hero exploreTargetId="catalog" />
    </PageContainer>,
    { viewport, mocks: true },
  );
  await expect.element(screen.getByRole('img')).toBeVisible();
  const image = screen.getByRole('img').element() as HTMLElement;
  const section = screen.getByRole('region').element() as HTMLElement;
  const [eyebrow, text] = [...section.querySelectorAll('p')] as HTMLElement[];
  return {
    section,
    eyebrow: eyebrow as HTMLElement,
    text: text as HTMLElement,
    title: section.querySelector('h1') as HTMLElement,
    button: screen.getByRole('button', { name: /explorar/i }).element() as HTMLElement,
    image,
    dots: [...section.querySelectorAll('[role="group"] button > span')] as HTMLElement[],
  };
}

const rect = (e: HTMLElement) => e.getBoundingClientRect();
const style = (e: HTMLElement) => getComputedStyle(e);

describe('Hero @1440 (Figma 2:2, 70347:239)', () => {
  let p: Parts;
  beforeEach(async () => {
    p = await mount(DESKTOP);
  });

  it('altura 450 e recuo esquerdo 40 (70347:239)', () => {
    expectPx(rect(p.section).height, 'hero.h');
    expectPx(px(style(p.section).paddingLeft), 'hero.padL');
  });

  it('gap de 110 entre texto e imagem; coluna de texto com 600 (70342:2674/2672)', () => {
    expectPx(px(style(p.section).columnGap), 'hero.gap');
    expectPx(rect(p.eyebrow.parentElement?.parentElement as HTMLElement).width, 'hero.copy.w');
  });

  it('bloco de texto centrado: 43px do topo do hero (70342:2672)', () => {
    const copy = p.eyebrow.parentElement?.parentElement as HTMLElement;
    expectPx(rect(copy).top - rect(p.section).top, 'hero.copy.top');
  });

  it('imagem 450x450 com raio 24 (70342:2673)', () => {
    expectPx(rect(p.image).width, 'hero.image.w');
    expectPx(rect(p.image).height, 'hero.image.h');
    expectPx(px(style(p.image).borderTopLeftRadius), 'hero.image.radius');
  });

  it('eyebrow: 14px, medium, line-height 16 (3:113)', () => {
    expectPx(px(style(p.eyebrow).fontSize), 'hero.eyebrow.fs');
    expectExact(Number(style(p.eyebrow).fontWeight), 'hero.eyebrow.fw');
    expectPx(px(style(p.eyebrow).lineHeight), 'hero.eyebrow.lh');
  });

  it('titulo: Roboto Mono 43, bold, line-height 70, cor de texto (3:107)', () => {
    const s = style(p.title);
    const font = figma<string>('hero.title.font');
    expect.soft(s.fontFamily, font.cite).toContain(font.value);
    expectPx(px(s.fontSize), 'hero.title.fs');
    expectExact(Number(s.fontWeight), 'hero.title.fw');
    expectPx(s.lineHeight, 'hero.title.lh');
    expectColor(s.color, 'hero.title.fill');
  });

  it('descricao: 14px, line-height 24, largura maxima 557, cor secundaria (3:114)', () => {
    const s = style(p.text);
    expectPx(px(s.fontSize), 'hero.text.fs');
    expectPx(s.lineHeight, 'hero.text.lh');
    expectPx(rect(p.text).width, 'hero.text.w');
    expectColor(s.color, 'hero.text.fill');
  });

  it('espacamentos verticais: eyebrow-titulo 8, titulo-descricao 4, descricao-botao 32 (Frames 132/133/134)', () => {
    expectPx(rect(p.title).top - rect(p.eyebrow).bottom, 'hero.gap.eyebrowTitle');
    expectPx(rect(p.text).top - rect(p.title).bottom, 'hero.gap.titleText');
    expectPx(rect(p.button).top - rect(p.text).bottom, 'hero.gap.textButton');
  });

  it('botao Explorar 140x40, raio 6, preenchimento primario (70342:2667)', () => {
    expectPx(rect(p.button).width, 'hero.button.w');
    expectPx(rect(p.button).height, 'hero.button.h');
    expectPx(px(style(p.button).borderTopLeftRadius), 'hero.button.radius');
    expectColor(style(p.button).backgroundColor, 'hero.button.fill');
  });

  it('texto do botao: 16px, bold, line-height 20, cor escura (3:127)', () => {
    const s = style(p.button);
    expectPx(px(s.fontSize), 'hero.button.fs');
    expectExact(Number(s.fontWeight), 'hero.button.fw');
    expectPx(s.lineHeight, 'hero.button.lh');
    expectColor(s.color, 'hero.button.fill.text');
  });

  it('pontos do carrossel: 8px, passo de 16, a 43 da base e 600 da esquerda do hero (3:128/3:130)', () => {
    const [first, second] = p.dots as [HTMLElement, HTMLElement];
    expectPx(rect(first).width, 'hero.dot.w');
    expectPx(rect(second).left - rect(first).left, 'hero.dot.pitch');
    expectPx(rect(p.section).bottom - rect(first).bottom, 'hero.dot.bottom');
    expectPx(rect(first).left - rect(p.section).left, 'hero.dot.left');
    expectColor(style(p.dots[0] as HTMLElement).backgroundColor, 'hero.dot.fill');
  });
});

describe('Hero @390 (Figma 14:5226, 70395:240; quadro de 414, validado em 390)', () => {
  let p: Parts;
  beforeEach(async () => {
    p = await mount(MOBILE);
  });

  it('banner a 24px da borda, altura 190, padding 16 (70395:240)', () => {
    expectPx(rect(p.section).left, 'heroM.left');
    expectPx(rect(p.section).height, 'heroM.h');
    expectPx(px(style(p.section).paddingLeft), 'heroM.padL');
  });

  it('gap de 8 entre texto e imagem (70410:4129)', () => {
    expectPx(px(style(p.section).columnGap), 'heroM.gap');
  });

  it('imagem 138x138 com raio 16 (14:5238)', () => {
    expectPx(rect(p.image).width, 'heroM.image.w');
    expectPx(rect(p.image).height, 'heroM.image.h');
    expectPx(px(style(p.image).borderTopLeftRadius), 'heroM.image.radius');
  });

  it('eyebrow 12px medium line-height 16 (14:5288)', () => {
    expectPx(px(style(p.eyebrow).fontSize), 'heroM.eyebrow.fs');
    expectExact(Number(style(p.eyebrow).fontWeight), 'heroM.eyebrow.fw');
    expectPx(px(style(p.eyebrow).lineHeight), 'heroM.eyebrow.lh');
  });

  it('titulo 18px bold line-height 29 (14:5234)', () => {
    expectPx(px(style(p.title).fontSize), 'heroM.title.fs');
    expectExact(Number(style(p.title).fontWeight), 'heroM.title.fw');
    expectPx(px(style(p.title).lineHeight), 'heroM.title.lh');
  });

  it('descricao 12px line-height 18 cor secundaria (14:5289)', () => {
    expectPx(px(style(p.text).fontSize), 'heroM.text.fs');
    expectPx(px(style(p.text).lineHeight), 'heroM.text.lh');
    expectColor(style(p.text).color, 'heroM.text.fill');
  });

  it('espacamentos: eyebrow-titulo 6, titulo-descricao 6 (Frame 55)', () => {
    expectPx(rect(p.title).top - rect(p.eyebrow).bottom, 'heroM.gap.eyebrowTitle');
    expectPx(rect(p.text).top - rect(p.title).bottom, 'heroM.gap.titleText');
  });

  it('Explorar e um link de texto 12px bold na cor de destaque, sem preenchimento (15:5294)', () => {
    const s = style(p.button);
    expectPx(px(s.fontSize), 'heroM.explore.fs');
    expectExact(Number(s.fontWeight), 'heroM.explore.fw');
    expectColor(s.color, 'heroM.explore.fill');
    expect.soft(s.backgroundColor, 'Figma 15:5294: texto sem preenchimento (fundo transparente)').toBe('rgba(0, 0, 0, 0)');
  });

  it.todo('Lacuna: fundo do banner mobile (gradiente/mascara 14:5290 com elipses) nao e uma cor solida legivel no file.json; sem medida de cor');
});
