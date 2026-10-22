import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { Button } from '@jg/design-system';
import './styles.css';

/*
 * I1: prova que o app consome o DS pelo entrypoint publicado (exports -> dist):
 * - `@import "@jg/design-system/styles.css"` resolve via `exports`;
 * - o `@source` do CSS do DS faz o Tailwind do app gerar as utilities usadas dentro do dist.
 */
describe('integracao app + design system', () => {
  it('Button do DS computa cor e fonte dos tokens no app', async () => {
    await render(<Button>Comprar</Button>);
    const button = page.getByRole('button', { name: 'Comprar' }).element();
    const style = getComputedStyle(button);
    expect(style.backgroundColor).toBe('rgb(210, 138, 76)');
    expect(style.fontFamily).toContain('Roboto Mono');
  });
});
