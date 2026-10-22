import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Skeleton } from './Skeleton';

/*
 * Skeleton nao tem frame no Figma (desvio ADR-12): derivado de --color-surface-card/--color-surface-raised.
 * Duracao/curva do shimmer sao derivadas (Lacuna aceita) - ver .AI/plans/executions/skeleton.md.
 * O comportamento sob prefers-reduced-motion e provado no Playwright (golden/motion.spec.ts).
 */
describe('Skeleton', () => {
  it('e decorativo (aria-hidden) e aceita classes de tamanho do consumidor', async () => {
    await render(<Skeleton data-testid="sk" className="h-[40px] w-[200px]" />);
    const el = page.getByTestId('sk');
    await expect.element(el).toHaveAttribute('aria-hidden', 'true');
    await expect.element(el).toHaveAttribute('data-slot', 'skeleton');
    await expect.element(el).toHaveClass('h-[40px]', 'w-[200px]');
  });

  it('mantem as dimensoes informadas (bounding box igual ao tamanho passado, sem CLS)', async () => {
    await render(<Skeleton data-testid="sk" className="h-[40px] w-[200px]" />);
    await expect.element(page.getByTestId('sk')).toBeInTheDocument();
    const rect = page.getByTestId('sk').element().getBoundingClientRect();
    expect(rect.width).toBe(200);
    expect(rect.height).toBe(40);
  });

  it('aplica a animacao shimmer com movimento normal', async () => {
    await render(<Skeleton data-testid="sk" className="h-[40px] w-[200px]" />);
    await expect.element(page.getByTestId('sk')).toBeInTheDocument();
    const style = getComputedStyle(page.getByTestId('sk').element());
    expect(style.animationName).not.toBe('none');
    expect(style.animationName).toContain('shimmer');
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Skeleton className="h-[40px] w-[200px]" />);
    await expectNoA11yViolations(container);
  });
});
