import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Textarea } from './Textarea';

/*
 * Lacuna: o Figma (docs/figma/file.json) nao tem Textarea; "Bio Field" 70386:246 e um campo de 417x40 sem raio de
 * textarea e "Description" 70342:2780 e texto estatico. Adotamos as medidas do Email Input 70381:242 (raio 5, padding
 * 16/12, borda 1px, texto 16/16 foreground, placeholder 14/16 secondary) e altura minima 96 (decisao do DS).
 * Tokens: input-border = secondary #B39463; foco primary #D28A4C; erro #ED1B2E; disabled-bg #55321F.
 */
const SECONDARY = 'rgb(179, 148, 99)';
const PRIMARY = 'rgb(210, 138, 76)';
const ERROR = 'rgb(237, 27, 46)';
const FOREGROUND = 'rgb(245, 241, 235)';

describe('Textarea - comportamento', () => {
  it('renderiza um textbox multilinha com nome acessivel via label htmlFor', async () => {
    await render(
      <>
        <label htmlFor="msg">Mensagem</label>
        <Textarea id="msg" placeholder="Escreva aqui" />
      </>,
    );
    const el = page.getByRole('textbox', { name: 'Mensagem' });
    await expect.element(el).toBeInTheDocument();
    expect(el.element().tagName).toBe('TEXTAREA');
  });

  it('aria-invalid="true" troca a borda para a cor de erro', async () => {
    await render(<Textarea aria-label="Mensagem" aria-invalid="true" />);
    const el = page.getByRole('textbox', { name: 'Mensagem' });
    await expect.element(el).toBeInTheDocument();
    expect(getComputedStyle(el.element()).borderTopColor).toBe(ERROR);
  });

  it('disabled desabilita o campo e usa o fundo desabilitado', async () => {
    await render(<Textarea aria-label="Mensagem" disabled />);
    const el = page.getByRole('textbox', { name: 'Mensagem' });
    await expect.element(el).toBeDisabled();
    expect(getComputedStyle(el.element()).backgroundColor).toBe('rgb(85, 50, 31)');
  });
});

describe('Textarea - medidas e foco', () => {
  it('mede largura FILL, altura minima 96, raio 5, padding 16/12 e borda 1px na cor input-border', async () => {
    await render(
      <div style={{ width: '340px' }}>
        <Textarea aria-label="Mensagem" />
      </div>,
    );
    const el = page.getByRole('textbox', { name: 'Mensagem' });
    await expect.element(el).toBeInTheDocument();
    const cs = getComputedStyle(el.element());
    const rect = el.element().getBoundingClientRect();
    expect(rect.width).toBe(340);
    expect(rect.height).toBeGreaterThanOrEqual(96);
    expect(cs.minHeight).toBe('96px');
    expect(cs.borderTopLeftRadius).toBe('5px');
    expect(cs.paddingLeft).toBe('16px');
    expect(cs.paddingRight).toBe('16px');
    expect(cs.paddingTop).toBe('12px');
    expect(cs.paddingBottom).toBe('12px');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopStyle).toBe('solid');
    expect(cs.borderTopColor).toBe(SECONDARY);
  });

  it('placeholder usa secondary 14 regular e texto digitado foreground 16/16', async () => {
    await render(
      <>
        <Textarea aria-label="Vazio" placeholder="Escreva aqui" />
        <Textarea aria-label="Cheio" defaultValue="abc" />
      </>,
    );
    const empty = page.getByRole('textbox', { name: 'Vazio' });
    const full = page.getByRole('textbox', { name: 'Cheio' });
    await expect.element(empty).toBeInTheDocument();
    const ph = getComputedStyle(empty.element(), '::placeholder');
    expect(ph.color).toBe(SECONDARY);
    expect(ph.fontSize).toBe('14px');
    expect(ph.fontWeight).toBe('400');
    const cs = getComputedStyle(full.element());
    expect(cs.color).toBe(FOREGROUND);
    expect(cs.fontSize).toBe('16px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('400');
  });

  it('foco: borda primary e outline de foco', async () => {
    await render(<Textarea aria-label="Mensagem" />);
    const el = page.getByRole('textbox', { name: 'Mensagem' });
    await expect.element(el).toBeInTheDocument();
    el.element().focus();
    const cs = getComputedStyle(el.element());
    expect(cs.borderTopColor).toBe(PRIMARY);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Textarea aria-label="Mensagem" placeholder="Escreva aqui" />);
    await expectNoA11yViolations(container);
  });
});
