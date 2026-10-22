import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Input } from './Input';

/* Cores esperadas (tokens.css): input-border = secondary #B39463; erro #ED1B2E; disabled-bg = border-soft #55321F. */
const ERROR = 'rgb(237, 27, 46)';

const root = (el: Element) => el.closest('[data-slot="input"]') as HTMLElement;

describe('Input - comportamento', () => {
  it('renderiza um textbox com nome acessivel via label htmlFor', async () => {
    await render(
      <>
        <label htmlFor="email">E-mail</label>
        <Input id="email" placeholder="contato@email.com" />
      </>,
    );
    await expect.element(page.getByRole('textbox', { name: 'E-mail' })).toBeInTheDocument();
  });

  it('aria-invalid="true" troca a borda para a cor de erro', async () => {
    await render(<Input aria-label="E-mail" aria-invalid="true" />);
    const el = page.getByRole('textbox', { name: 'E-mail' });
    await expect.element(el).toBeInTheDocument();
    expect(getComputedStyle(root(el.element())).borderTopColor).toBe(ERROR);
  });

  it('startSlot e decorativo, nao focavel, e o input mantem o nome acessivel', async () => {
    await render(
      <Input aria-label="Buscar" startSlot={<svg data-testid="icon" width="14" height="14" />} />,
    );
    const icon = page.getByTestId('icon').element();
    expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(icon.closest('[tabindex]')).toBeNull();
    await expect.element(page.getByRole('textbox', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('endSlot e renderizado ao lado do input', async () => {
    await render(<Input aria-label="Valor" endSlot={<span data-testid="end">ETH</span>} />);
    await expect.element(page.getByTestId('end')).toBeInTheDocument();
    await expect.element(page.getByRole('textbox', { name: 'Valor' })).toBeInTheDocument();
  });

  it('disabled desabilita o input e usa o fundo desabilitado', async () => {
    await render(<Input aria-label="Nome" disabled />);
    const el = page.getByRole('textbox', { name: 'Nome' });
    await expect.element(el).toBeDisabled();
    expect(getComputedStyle(root(el.element())).backgroundColor).toBe('rgb(85, 50, 31)');
  });
});

/*
 * Medida - "Email Input" 70381:242 (docs/figma/file.json:192892-193115): 340x40 FILL (193078-193085, 193109),
 * cornerRadius 5 (193043), strokeWeight 1 INSIDE (193045-193046), padding L/R 16 T/B 12 (193057-193060).
 * Placeholder: texto 9:958 com estilo 70321:351 (14/16/400) e fill 70323:310 = --color-secondary (#B39463).
 * Foco "Password Input" 70381:243 (193116-193128): stroke = variavel 70320:303 = --color-primary (#D28A4C).
 * Texto digitado: estilo 70321:332 (16/16/400), fill 70323:306 = --color-foreground (#F5F1EB).
 * Desvio de contraste (decisao do usuario): borda em repouso = --color-secondary (Figma: --color-border #3F2319).
 * Variantes de perfil/pagamento: "Username Input" 70383:242 tem as mesmas medidas (340x40, raio 5, 16/12); os campos
 * de 417px (70386:249, 70390:248/253) sao seletores/carteiras sem raio, fora do escopo do Input (Lacuna: Select).
 */
const SECONDARY = 'rgb(179, 148, 99)';
const PRIMARY = 'rgb(210, 138, 76)';
const FOREGROUND = 'rgb(245, 241, 235)';

describe('Input - medidas e foco', () => {
  it('mede altura 40, largura FILL, raio 5, padding 16/12 e borda 1px na cor input-border', async () => {
    await render(
      <div style={{ width: '340px' }}>
        <Input aria-label="E-mail" placeholder="contato@email.com" />
      </div>,
    );
    const input = page.getByRole('textbox', { name: 'E-mail' });
    await expect.element(input).toBeInTheDocument();
    const box = root(input.element());
    const cs = getComputedStyle(box);
    const rect = box.getBoundingClientRect();
    expect(rect.height).toBe(40);
    expect(rect.width).toBe(340);
    expect(cs.borderTopLeftRadius).toBe('5px');
    expect(cs.paddingLeft).toBe('16px');
    expect(cs.paddingRight).toBe('16px');
    expect(cs.paddingTop).toBe('12px');
    expect(cs.paddingBottom).toBe('12px');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopStyle).toBe('solid');
    expect(cs.borderTopColor).toBe(SECONDARY);
  });

  it('placeholder usa secondary 14/16 regular', async () => {
    await render(<Input aria-label="E-mail" placeholder="contato@email.com" />);
    const el = page.getByRole('textbox', { name: 'E-mail' });
    await expect.element(el).toBeInTheDocument();
    const ph = getComputedStyle(el.element(), '::placeholder');
    expect(ph.color).toBe(SECONDARY);
    expect(ph.fontSize).toBe('14px');
    // Chrome fixa line-height do ::placeholder de input em 'normal' (nao estilizavel): a altura de linha 16 vem do input.
    expect(getComputedStyle(el.element()).lineHeight).toBe('16px');
    expect(ph.fontWeight).toBe('400');
  });

  it('texto digitado usa foreground 16/16 regular', async () => {
    await render(<Input aria-label="Senha" defaultValue="abc" />);
    const el = page.getByRole('textbox', { name: 'Senha' });
    await expect.element(el).toBeInTheDocument();
    const cs = getComputedStyle(el.element());
    expect(cs.color).toBe(FOREGROUND);
    expect(cs.fontSize).toBe('16px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('400');
  });

  it('foco: borda primary e outline de foco no campo', async () => {
    await render(<Input aria-label="E-mail" />);
    const el = page.getByRole('textbox', { name: 'E-mail' });
    await expect.element(el).toBeInTheDocument();
    el.element().focus();
    const cs = getComputedStyle(root(el.element()));
    expect(cs.borderTopColor).toBe(PRIMARY);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(
      <Input aria-label="Buscar" placeholder="Buscar" startSlot={<svg width="14" height="14" />} />,
    );
    await expectNoA11yViolations(container);
  });
});
