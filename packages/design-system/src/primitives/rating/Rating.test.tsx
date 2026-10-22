import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Rating } from './Rating';

/*
 * Medida (ADR-08) - "Frame 40" do card (10:244 / 11:1210), 5x instancia "Iconly/Bold/Star" (componente 11:1192):
 *  - cada estrela: instancia 15x15 (file.json bbox 15x15), vetor 12.5x11.88 dentro dela;
 *  - espaco entre estrelas: itemSpacing 4 (instancias em x 2585, 2604, 2623 => passo 19 = 15 + 4);
 *  - estrela cheia: fill #D28A4C = --color-primary = rgb(210, 138, 76);
 *  - estrela vazia (5a, 11:1207): fill #CFB28C = --color-text-secondary = rgb(207, 178, 140).
 * Frame horizontal: 5*15 + 4*4 = 91 de largura, 15 de altura (o frame 20 de altura inclui o texto, fora do componente).
 */
const stars = () => Array.from(document.querySelectorAll('[data-slot="rating"] svg'));
const fillOf = (el: Element) => getComputedStyle(el).color;
const FULL = 'rgb(210, 138, 76)';
const EMPTY = 'rgb(207, 178, 140)';

describe('Rating', () => {
  it('expoe um unico role=img com o nome vindo da prop label', async () => {
    await render(<Rating value={4} max={5} label="Avaliacao 4 de 5, 19 avaliacoes" />);
    const img = page.getByRole('img', { name: 'Avaliacao 4 de 5, 19 avaliacoes' });
    await expect.element(img).toBeInTheDocument();
    expect(document.querySelectorAll('[role="img"]').length).toBe(1);
  });

  it('renderiza 5 estrelas escondidas da arvore de acessibilidade', async () => {
    await render(<Rating value={4} max={5} label="Avaliacao" />);
    await expect.element(page.getByRole('img', { name: 'Avaliacao' })).toBeInTheDocument();
    const s = stars();
    expect(s.length).toBe(5);
    for (const star of s) expect(star.getAttribute('aria-hidden')).toBe('true');
  });

  it('value=4 pinta 4 estrelas primary e 1 text-secondary', async () => {
    await render(<Rating value={4} max={5} label="Avaliacao" />);
    await expect.element(page.getByRole('img', { name: 'Avaliacao' })).toBeInTheDocument();
    expect(stars().map(fillOf)).toEqual([FULL, FULL, FULL, FULL, EMPTY]);
  });

  it('value fracionario arredonda e fora da faixa e limitado a 0..5', async () => {
    const { rerender } = await render(<Rating value={3.6} max={5} label="Avaliacao" />);
    await expect.element(page.getByRole('img', { name: 'Avaliacao' })).toBeInTheDocument();
    expect(stars().filter((s) => fillOf(s) === FULL).length).toBe(4);
    await rerender(<Rating value={9} max={5} label="Avaliacao" />);
    expect(stars().filter((s) => fillOf(s) === FULL).length).toBe(5);
    await rerender(<Rating value={-2} max={5} label="Avaliacao" />);
    expect(stars().filter((s) => fillOf(s) === FULL).length).toBe(0);
  });

  it('mede 5 estrelas de 15x15 com espaco de 4px (91x15)', async () => {
    await render(<Rating value={4} max={5} label="Avaliacao" data-testid="r" />);
    await expect.element(page.getByTestId('r')).toBeInTheDocument();
    const rect = page.getByTestId('r').element().getBoundingClientRect();
    expect(rect.width).toBe(91);
    expect(rect.height).toBe(15);
    const s = stars().map((el) => el.getBoundingClientRect());
    expect(s.length).toBe(5);
    for (const r of s) {
      expect(r.width).toBe(15);
      expect(r.height).toBe(15);
    }
    for (let i = 1; i < s.length; i++) expect(s[i]!.left - s[i - 1]!.right).toBe(4);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Rating value={4} max={5} label="Avaliacao 4 de 5" />);
    await expect.element(page.getByRole('img', { name: 'Avaliacao 4 de 5' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
