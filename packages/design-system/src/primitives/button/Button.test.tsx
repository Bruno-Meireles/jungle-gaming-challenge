import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from './Button';

/* Cores dos tokens (docs/design-tokens.md): --color-primary-hover = --color-primary-light #DD9A5F. */
const PRIMARY_HOVER = 'rgb(221, 154, 95)';

describe('Button - comportamento', () => {
  it('renderiza um <button type="button"> com nome acessivel', async () => {
    await render(<Button>Salvar</Button>);
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toBeInTheDocument();
    expect(button.element().tagName).toBe('BUTTON');
    await expect.element(button).toHaveAttribute('type', 'button');
    await expect.element(button).toHaveAttribute('data-slot', 'button');
  });

  it('disabled nao dispara onClick e expoe o atributo', async () => {
    const onClick = vi.fn();
    await render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
    await expect.element(button).toHaveAttribute('disabled');
  });

  it('loading expoe aria-busy, fica desabilitado e preserva o nome acessivel', async () => {
    const onClick = vi.fn();
    await render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild renderiza o filho (<a>) com as mesmas classes do botao', async () => {
    await render(
      <>
        <Button>Botao</Button>
        <Button asChild>
          <a href="/carrinho">Carrinho</a>
        </Button>
      </>,
    );
    const link = page.getByRole('link', { name: 'Carrinho' });
    await expect.element(link).toBeInTheDocument();
    expect(link.element().tagName).toBe('A');
    await expect.element(link).toHaveAttribute('href', '/carrinho');
    await expect.element(link).toHaveAttribute('data-slot', 'button');
    expect(link.element().className).toBe(page.getByRole('button', { name: 'Botao' }).element().className);
  });

  it('hover no primary troca o fundo para --color-primary-hover', async () => {
    await render(<Button>Salvar</Button>);
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toBeInTheDocument();
    await userEvent.hover(button);
    await expect.poll(() => getComputedStyle(button.element()).backgroundColor).toBe(PRIMARY_HOVER);
  });
});

/*
 * Medida (ADR-08), docs/figma/file.json. Cores = tokens de docs/design-tokens.md.
 *
 * primary md - "Save Button" 70386:262 (file.json:253028-253230): 131x40, cornerRadius 3 (= --radius-3),
 *   fill #D28A4C (--color-primary), texto "Salvar" #140D0A (--color-ink), Roboto Mono 700 14/16
 *   (= --text-body-14-bold-lh-16), 131 - 51 (texto) = 80 => padding-x 40.
 * primary lg - "Frame 324" I70522:3321;70504:3188 (file.json:120883, "Confirmar compra" 11:2862): 405x45,
 *   radius 8, padding 16/12, texto 15/16 bold (= --text-body-15-bold-lh-16).
 * primary block - "Button" 70370:249 (file.json:88645, "Conectar e finalizar" no Checkout CTA 332x72):
 *   largura FILL do container (332), altura 40, radius 3, texto 15/16 bold.
 * outline - "Frame 162" 70342:2757 ("Favoritar", file.json:52684, texto 11:1242 em 53754): 130x40, sem fill,
 *   stroke 1px #D28A4C INSIDE (53790-53811), cornerRadius 6, layout horizontal gap 8, icone 20 em x=13 =>
 *   padding-x 13; texto #E89B55 (--color-text-accent) Roboto Mono 500 14/20 (= --text-body-14-medium-lh-20).
 * ghost - texto "Continuar explorando" 11:2842 (file.json:88882): sem fill/stroke/raio, 181x20, #E89B55,
 *   15px peso 400, lineHeight 19.78 = "normal" (estilo 70321:337 = --text-body-15-regular-lh-16).
 * icon - "Search Icon" 70486:519 (file.json:995) 20x20 e "Cart Icon" 70486:521 (1467) 24x24, fill #F5F1EB
 *   (--color-foreground), sem fundo/borda. LACUNA: o Figma nao tem container de botao; area clicavel derivada =
 *   24x24 (maior icone, minimo WCAG 2.5.8).
 * disabled - sem no no Figma: tokens semanticos --color-disabled-bg #55321F e --color-disabled-text #B39463.
 */
const PRIMARY = 'rgb(210, 138, 76)';
const INK = 'rgb(20, 13, 10)';
const TEXT_ACCENT = 'rgb(232, 155, 85)';
const FOREGROUND = 'rgb(245, 241, 235)';
const DISABLED_BG = 'rgb(85, 50, 31)';
const DISABLED_TEXT = 'rgb(179, 148, 99)';
const TRANSPARENT = 'rgba(0, 0, 0, 0)';

async function styleOf(name: string) {
  const locator = page.getByRole('button', { name });
  await expect.element(locator).toBeInTheDocument();
  const el = locator.element();
  return { el, cs: getComputedStyle(el), rect: el.getBoundingClientRect() };
}

describe('Button - medidas', () => {
  it('primary md: 40 de altura, raio 3, padding-x 40, 14/16 peso 700, fundo primary e texto ink', async () => {
    await render(<Button>Salvar</Button>);
    const { cs, rect } = await styleOf('Salvar');
    expect(rect.height).toBe(40);
    expect(cs.borderTopLeftRadius).toBe('3px');
    expect(cs.paddingLeft).toBe('40px');
    expect(cs.paddingRight).toBe('40px');
    expect(cs.fontSize).toBe('14px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('700');
    expect(cs.backgroundColor).toBe(PRIMARY);
    expect(cs.color).toBe(INK);
  });

  it('primary lg: 45 de altura, raio 8, padding-x 16, 15/16 peso 700', async () => {
    await render(<Button size="lg">Confirmar compra</Button>);
    const { cs, rect } = await styleOf('Confirmar compra');
    expect(rect.height).toBe(45);
    expect(cs.borderTopLeftRadius).toBe('8px');
    expect(cs.paddingLeft).toBe('16px');
    expect(cs.fontSize).toBe('15px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('700');
    expect(cs.backgroundColor).toBe(PRIMARY);
  });

  it('primary block: ocupa a largura do container, 40 de altura, raio 3, 15/16 peso 700', async () => {
    await render(
      <div style={{ width: '332px' }}>
        <Button size="block">Conectar e finalizar</Button>
      </div>,
    );
    const { cs, rect } = await styleOf('Conectar e finalizar');
    expect(rect.width).toBe(332);
    expect(rect.height).toBe(40);
    expect(cs.borderTopLeftRadius).toBe('3px');
    expect(cs.fontSize).toBe('15px');
    expect(cs.fontWeight).toBe('700');
  });

  it('outline: sem fundo, borda 1px primary, raio 6, altura 40, padding-x 13, gap 8, texto 14/20 peso 500 text-accent', async () => {
    await render(
      <Button variant="outline">
        <svg aria-hidden="true" width="20" height="20" />
        Favoritar
      </Button>,
    );
    const { cs, rect } = await styleOf('Favoritar');
    expect(rect.height).toBe(40);
    expect(cs.backgroundColor).toBe(TRANSPARENT);
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopStyle).toBe('solid');
    expect(cs.borderTopColor).toBe(PRIMARY);
    expect(cs.borderTopLeftRadius).toBe('6px');
    expect(cs.paddingLeft).toBe('13px');
    expect(cs.columnGap).toBe('8px');
    expect(cs.color).toBe(TEXT_ACCENT);
    expect(cs.fontSize).toBe('14px');
    expect(cs.lineHeight).toBe('20px');
    expect(cs.fontWeight).toBe('500');
  });

  it('ghost: sem fundo, borda, raio e padding; texto 15px peso 400 text-accent', async () => {
    await render(<Button variant="ghost">Continuar explorando</Button>);
    const { cs } = await styleOf('Continuar explorando');
    expect(cs.backgroundColor).toBe(TRANSPARENT);
    expect(cs.borderTopWidth).toBe('0px');
    expect(cs.borderTopLeftRadius).toBe('0px');
    expect(cs.paddingLeft).toBe('0px');
    expect(cs.color).toBe(TEXT_ACCENT);
    expect(cs.fontSize).toBe('15px');
    expect(cs.fontWeight).toBe('400');
  });

  it('icon: nome acessivel vem do aria-label; 24x24 sem fundo, cor foreground', async () => {
    await render(
      <Button variant="icon" aria-label="Buscar">
        <svg aria-hidden="true" width="20" height="20" />
      </Button>,
    );
    const { cs, rect } = await styleOf('Buscar');
    expect(rect.width).toBe(24);
    expect(rect.height).toBe(24);
    expect(cs.backgroundColor).toBe(TRANSPARENT);
    expect(cs.borderTopWidth).toBe('0px');
    expect(cs.color).toBe(FOREGROUND);
  });

  it('icon exige aria-label nos tipos', () => {
    // @ts-expect-error variant="icon" sem aria-label nao compila
    const semNome = <Button variant="icon" />;
    const comNome = <Button variant="icon" aria-label="Carrinho" />;
    expect([semNome, comNome]).toHaveLength(2);
  });

  it('disabled usa --color-disabled-bg e --color-disabled-text e nao muda no hover', async () => {
    await render(<Button disabled>Salvar</Button>);
    const locator = page.getByRole('button', { name: 'Salvar' });
    await expect.element(locator).toBeInTheDocument();
    await userEvent.hover(locator, { force: true });
    const cs = getComputedStyle(locator.element());
    expect(cs.backgroundColor).toBe(DISABLED_BG);
    expect(cs.color).toBe(DISABLED_TEXT);
  });

  it('foco por Tab mostra outline 2px --color-focus com offset 2px (o Button nao o anula)', async () => {
    await render(<Button>Salvar</Button>);
    const locator = page.getByRole('button', { name: 'Salvar' });
    await expect.element(locator).toBeInTheDocument();
    await userEvent.tab();
    await expect.element(locator).toHaveFocus();
    const cs = getComputedStyle(locator.element());
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineOffset).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });
});

describe('Button - acessibilidade (axe)', () => {
  it('nao tem violacoes em nenhuma variante ou estado', async () => {
    const { container } = await render(
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
        <Button>Primary</Button>
        <Button size="lg">Primary lg</Button>
        <Button size="block">Primary block</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="icon" aria-label="Buscar">
          <svg aria-hidden="true" width="20" height="20" />
        </Button>
        <Button disabled>Desabilitado</Button>
        <Button loading>Carregando</Button>
        <Button asChild>
          <a href="/carrinho">Link</a>
        </Button>
      </div>,
    );
    await expect.element(page.getByRole('button', { name: 'Primary', exact: true })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
