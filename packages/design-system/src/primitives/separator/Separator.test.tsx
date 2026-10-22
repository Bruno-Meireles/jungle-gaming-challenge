import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { Separator } from './Separator';

/*
 * Medida (ADR-08) - "Header With Divider" (componente 70504:3017, docs/figma/file.json:398011).
 * A linha divisoria e o filho "Line 1" (LINE, id I70522:3240;70504:3016), file.json:3736-3822:
 *  - strokeWeight 0.3 (file.json:3770), strokeAlign CENTER, fills [] -> a linha e um STROKE, nao um fill;
 *    absoluteBoundingBox.height 0 (3785) e absoluteRenderBounds.height ~0.3 (3791): espessura = 0.3px.
 *  - cor do stroke r 0.8235 g 0.5412 b 0.2980 (3757-3759) = #D28A4C = rgb(210, 138, 76),
 *    variavel 70320:303 / estilo 70323:301, que em src/styles/tokens.css:13 e --color-primary.
 *    (--color-border #3F2319 NAO e a cor desta linha; ele pertence ao "Divider" do rodape, file.json:194924.)
 *  - largura 1200 com layoutSizingHorizontal FILL (3784, 3815): ocupa 100% do container.
 * Variante vertical: derivada (nao ha no Figma); espessura/cor iguais, eixos trocados.
 */
const THICKNESS_PX = 0.3;
const LINE_COLOR = 'rgb(210, 138, 76)';

describe('Separator', () => {
  it('por padrao e um separator horizontal acessivel', async () => {
    await render(<Separator />);
    await expect.element(page.getByRole('separator')).toBeInTheDocument();
  });

  it('orientation="vertical" expoe aria-orientation=vertical', async () => {
    await render(<Separator orientation="vertical" />);
    await expect.element(page.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('decorative remove a semantica de separator (role=none)', async () => {
    await render(<Separator decorative data-testid="sep" />);
    await expect.element(page.getByTestId('sep')).toHaveAttribute('role', 'none');
    await expect.element(page.getByRole('separator')).not.toBeInTheDocument();
  });

  it('horizontal mede a espessura, a cor e a largura da linha do Header With Divider', async () => {
    await render(
      <div style={{ width: '400px' }}>
        <Separator data-testid="sep" />
      </div>,
    );
    await expect.element(page.getByTestId('sep')).toBeInTheDocument();
    const el = page.getByTestId('sep').element();
    const rect = el.getBoundingClientRect();
    expect(rect.height).toBeCloseTo(THICKNESS_PX, 1);
    expect(rect.width).toBe(400);
    expect(getComputedStyle(el).backgroundColor).toBe(LINE_COLOR);
  });

  it('vertical (derivado) troca os eixos: largura = espessura, altura 100% do container', async () => {
    await render(
      <div style={{ height: '120px' }}>
        <Separator orientation="vertical" data-testid="sep" />
      </div>,
    );
    await expect.element(page.getByTestId('sep')).toBeInTheDocument();
    const el = page.getByTestId('sep').element();
    const rect = el.getBoundingClientRect();
    expect(rect.width).toBeCloseTo(THICKNESS_PX, 1);
    expect(rect.height).toBe(120);
    expect(getComputedStyle(el).backgroundColor).toBe(LINE_COLOR);
  });
});
