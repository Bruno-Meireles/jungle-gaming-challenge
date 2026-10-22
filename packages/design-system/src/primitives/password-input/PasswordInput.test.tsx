import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { PasswordInput } from './PasswordInput';

const field = () => page.getByLabelText('Senha');

describe('PasswordInput - comportamento', () => {
  it('renderiza type=password por padrao', async () => {
    await render(<PasswordInput aria-label="Senha" />);
    await expect.element(field()).toBeInTheDocument();
    expect(field().element().getAttribute('type')).toBe('password');
  });

  it('botao "Mostrar senha" com aria-pressed=false alterna o tipo para text e de volta', async () => {
    await render(<PasswordInput aria-label="Senha" defaultValue="segredo" />);
    const toggle = page.getByRole('button', { name: 'Mostrar senha' });
    await expect.element(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    expect(field().element().getAttribute('type')).toBe('text');
    const hide = page.getByRole('button', { name: 'Ocultar senha' });
    await expect.element(hide).toHaveAttribute('aria-pressed', 'true');
    await hide.click();
    expect(field().element().getAttribute('type')).toBe('password');
  });

  it('showLabel e hideLabel customizam o nome do botao', async () => {
    await render(<PasswordInput aria-label="Senha" showLabel="Show" hideLabel="Hide" />);
    await page.getByRole('button', { name: 'Show' }).click();
    await expect.element(page.getByRole('button', { name: 'Hide' })).toBeInTheDocument();
  });

  it('o foco permanece no botao apos alternar', async () => {
    await render(<PasswordInput aria-label="Senha" />);
    const toggle = page.getByRole('button', { name: 'Mostrar senha' });
    await expect.element(toggle).toBeInTheDocument();
    toggle.element().focus();
    await toggle.click();
    expect(document.activeElement).toBe(
      page.getByRole('button', { name: 'Ocultar senha' }).element(),
    );
  });

  it('aria-invalid="true" troca a borda para a cor de erro', async () => {
    await render(<PasswordInput aria-label="Senha" aria-invalid="true" />);
    await expect.element(field()).toBeInTheDocument();
    const box = field().element().closest('[data-slot="input"]') as HTMLElement;
    expect(getComputedStyle(box).borderTopColor).toBe('rgb(237, 27, 46)');
  });
});

/*
 * Medida - "Password Input" 70381:243 (docs/figma/file.json:193116-193128): mesmas medidas do Input
 * (340x40, raio 5, padding 16/12, borda 1px). Icone Iconly Hide 9:964 (instancia 9:963).
 * Lacuna: tamanho do icone nao verificado no JSON (vetores relativos); adotado 20x20.
 */
describe('PasswordInput - medidas e a11y', () => {
  it('mede 340x40 com raio 5 e borda 1px', async () => {
    await render(
      <div style={{ width: '340px' }}>
        <PasswordInput aria-label="Senha" />
      </div>,
    );
    await expect.element(field()).toBeInTheDocument();
    const box = field().element().closest('[data-slot="input"]') as HTMLElement;
    const rect = box.getBoundingClientRect();
    expect(rect.height).toBe(40);
    expect(rect.width).toBe(340);
    expect(getComputedStyle(box).borderTopLeftRadius).toBe('5px');
    expect(getComputedStyle(box).borderTopWidth).toBe('1px');
  });

  it('icone do botao e decorativo (aria-hidden) e mede 20x20', async () => {
    await render(<PasswordInput aria-label="Senha" />);
    const toggle = page.getByRole('button', { name: 'Mostrar senha' });
    await expect.element(toggle).toBeInTheDocument();
    const svg = toggle.element().querySelector('svg') as SVGElement;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    const r = svg.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([20, 20]);
  });

  it('nao tem violacoes de acessibilidade (axe), oculto e visivel', async () => {
    const { container } = await render(<PasswordInput aria-label="Senha" />);
    await expectNoA11yViolations(container);
    await page.getByRole('button', { name: 'Mostrar senha' }).click();
    await expectNoA11yViolations(container);
  });
});
