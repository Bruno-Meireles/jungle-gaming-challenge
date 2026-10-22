import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Badge } from './Badge';

/*
 * Medida count (ADR-08) - "Badge Count" do header (instancia I70522:3240;70504:3015):
 *  - circulo "Badge" (ELLIPSE 70486:522), file.json:2291-2376: bbox 16x16 (2368-2369), caminho circular
 *    (2331), fill r.8235 g.5412 b.2980 (2316-2318) = #D28A4C = --color-primary (tokens.css:13) = rgb(210, 138, 76).
 *    Contorno de 2px OUTSIDE na cor #140D0A (2353-2354): nao medido aqui (nao e fill nem box; decisao de
 *    implementacao do code-writer, registrada como Lacuna na entrega).
 *  - texto "Badge Count" (TEXT 70486:523), file.json:2409-2519: fill #140D0A (2436-2438) = --color-ink
 *    (tokens.css:14) = rgb(20, 13, 10); Roboto Mono Medium, fontWeight 500 (2503), fontSize 10 (2505),
 *    lineHeightPx 13.19 em modo INTRINSIC_% 100 (2509-2511).
 *
 * Medida label "RARO" (frame mobile Inicio, grupo 15:5496, file.json:281881-282078 / 14:5226 no plano):
 *  - Rectangle 9 (15:5418), file.json:281887-281969: bbox 68x32 (281935-281936), fill #D28A4C (281906-281908)
 *    = --color-primary; NAO ha cornerRadius no no (canto reto). Q20: nao replicar o canto reto/vazamento
 *    defeituoso do Figma; por isso nenhuma asserção de raio no label (Lacuna: raio nominal ausente no Figma).
 *  - texto "RARO" (15:5419), 281970-282078: relativeTransform x=8, y=7 (282036, 282042) => padding-left 8, padding-top 7;
 *    fill #140D0A (281995-281997) = --color-ink; Roboto Mono 500 (282062), fontSize 13 (282063), lineHeightPx 16 (282067).
 */
const PRIMARY = 'rgb(210, 138, 76)';
const INK = 'rgb(20, 13, 10)';

describe('Badge', () => {
  it('count mostra o numero e expoe role=img com aria-label como nome acessivel', async () => {
    await render(<Badge variant="count" aria-label="6 itens no carrinho">6</Badge>);
    const badge = page.getByRole('img', { name: '6 itens no carrinho' });
    await expect.element(badge).toBeInTheDocument();
    await expect.element(badge).toHaveTextContent('6');
  });

  it('label renderiza o texto', async () => {
    await render(<Badge variant="label">RARO</Badge>);
    await expect.element(page.getByText('RARO')).toBeVisible();
  });

  it('count mede 16x16 circular, fundo primary, texto ink 10px/500', async () => {
    await render(
      <Badge variant="count" data-testid="b">
        6
      </Badge>,
    );
    await expect.element(page.getByTestId('b')).toBeInTheDocument();
    const el = page.getByTestId('b').element();
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    expect(rect.width).toBe(16);
    expect(rect.height).toBe(16);
    expect(Number.parseFloat(cs.borderTopLeftRadius)).toBeGreaterThanOrEqual(8);
    expect(cs.backgroundColor).toBe(PRIMARY);
    expect(cs.color).toBe(INK);
    expect(cs.fontSize).toBe('10px');
    expect(cs.fontWeight).toBe('500');
    expect(Number.parseFloat(cs.lineHeight)).toBeCloseTo(13.19, 0);
  });

  it('label mede 68x32 com padding 8/7, fundo primary, texto ink 13px/500, line-height 16px', async () => {
    await render(
      <Badge variant="label" data-testid="b">
        RARO
      </Badge>,
    );
    await expect.element(page.getByTestId('b')).toBeInTheDocument();
    const el = page.getByTestId('b').element();
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    expect(rect.height).toBe(32);
    expect(cs.paddingLeft).toBe('8px');
    expect(cs.paddingTop).toBe('7px');
    expect(cs.backgroundColor).toBe(PRIMARY);
    expect(cs.color).toBe(INK);
    expect(cs.fontSize).toBe('13px');
    expect(cs.fontWeight).toBe('500');
    expect(cs.lineHeight).toBe('16px');
  });

  it('count nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(
      <Badge variant="count" aria-label="6 itens no carrinho">
        6
      </Badge>,
    );
    await expect.element(page.getByRole('img', { name: '6 itens no carrinho' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('label nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Badge variant="label">RARO</Badge>);
    await expect.element(page.getByText('RARO')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
