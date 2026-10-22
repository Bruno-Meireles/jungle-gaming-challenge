import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Avatar } from './Avatar';

/*
 * Medida (ADR-08) - "Avatar" do Perfil do Colecionador (9:1238), circulo do "Avatar Field" (70386:252):
 *  - bbox 50x50 (file.json:243605-243606), cornerRadius 25 (243564) = --radius-25 (tokens.css:323);
 *  - fill r.1843 g.1137 b.0824 (243569-243572) = #2F1D15 = --color-surface-raised = rgb(47, 29, 21);
 *  - stroke 1px INSIDE (243566-243567) #3F2319 (VariableID:70320:320) = --color-border = rgb(63, 35, 25).
 * Fallback: icone "Iconly/Curved/Image 2" (9:1550 / instancia 9:1560), 20x20, traco 1.5 na cor #D28A4C
 * = --color-primary = rgb(210, 138, 76). O fallback e um ReactNode do consumidor; a cor primary vem do
 * container (currentColor).
 * Imagens: data URI local (sem rede).
 */
const PX_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const BROKEN = 'data:image/png;base64,AAAA';

const icon = (
  <svg data-testid="fallback-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
    <rect x="2" y="2" width="16" height="16" />
  </svg>
);

describe('Avatar', () => {
  it('com src valido expoe uma img com o alt como nome acessivel', async () => {
    await render(<Avatar src={PX_PNG} alt="Foto de Ana" fallback={icon} />);
    const img = page.getByRole('img', { name: 'Foto de Ana' });
    await expect.element(img).toBeInTheDocument();
    expect(img.element().tagName).toBe('IMG');
    expect(img.element().getAttribute('src')).toBe(PX_PNG);
  });

  it('sem src mostra o fallback, nenhuma <img>, e o nome acessivel via role=img', async () => {
    await render(<Avatar alt="Foto de Ana" fallback={icon} />);
    await expect.element(page.getByTestId('fallback-icon')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    await expect.element(page.getByRole('img', { name: 'Foto de Ana' })).toBeInTheDocument();
  });

  it('com src que falha ao carregar mostra o fallback com nome acessivel', async () => {
    await render(<Avatar src={BROKEN} alt="Foto de Ana" fallback={icon} />);
    await expect.element(page.getByTestId('fallback-icon')).toBeInTheDocument();
    expect(document.querySelector('img')).toBeNull();
    await expect.element(page.getByRole('img', { name: 'Foto de Ana' })).toBeInTheDocument();
  });

  it('mede 50x50 circular, fundo surface-raised, borda 1px border', async () => {
    await render(<Avatar data-testid="a" alt="Foto de Ana" fallback={icon} />);
    await expect.element(page.getByTestId('a')).toBeInTheDocument();
    const el = page.getByTestId('a').element();
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    expect(rect.width).toBe(50);
    expect(rect.height).toBe(50);
    expect(Number.parseFloat(cs.borderTopLeftRadius)).toBeGreaterThanOrEqual(25);
    expect(cs.backgroundColor).toBe('rgb(47, 29, 21)');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopColor).toBe('rgb(63, 35, 25)');
  });

  it('fallback usa a cor primary', async () => {
    await render(<Avatar alt="Foto de Ana" fallback={icon} />);
    await expect.element(page.getByTestId('fallback-icon')).toBeInTheDocument();
    const cs = getComputedStyle(page.getByTestId('fallback-icon').element().parentElement as Element);
    expect(cs.color).toBe('rgb(210, 138, 76)');
  });

  it('nao tem violacoes de acessibilidade (axe) com imagem e com fallback', async () => {
    const { container, rerender } = await render(<Avatar src={PX_PNG} alt="Foto de Ana" fallback={icon} />);
    await expect.element(page.getByRole('img', { name: 'Foto de Ana' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
    await rerender(<Avatar alt="Foto de Ana" fallback={icon} />);
    await expect.element(page.getByTestId('fallback-icon')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
