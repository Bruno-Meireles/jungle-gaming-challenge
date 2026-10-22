import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-react';
import '../test/entry.css';
import { AXE_TAGS, expectNoA11yViolations } from './axe';

/* Garante que o helper de axe realmente cobre WCAG 2.1/2.2 e best-practice (nao so wcag2a/aa). */
describe('helper de axe', () => {
  it('inclui as tags wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa e best-practice', () => {
    expect(AXE_TAGS).toEqual(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']);
  });

  it('detecta alvo de toque pequeno (wcag22aa target-size)', async () => {
    const { container } = await render(
      <div style={{ display: 'flex', gap: 0 }}>
        <button type="button" aria-label="a" style={{ width: 12, height: 12, padding: 0 }} />
        <button type="button" aria-label="b" style={{ width: 12, height: 12, padding: 0 }} />
      </div>,
    );
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/target-size/);
  });

  it('detecta pulo de nivel de titulo (best-practice heading-order)', async () => {
    const { container } = await render(
      <>
        <h1>Titulo</h1>
        <h3>Pulou</h3>
      </>,
    );
    await expect(expectNoA11yViolations(container)).rejects.toThrow(/heading-order/);
  });
});
