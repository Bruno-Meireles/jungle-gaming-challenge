import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Checkbox } from './Checkbox';

function Controlled({ onChange }: { onChange?: (v: boolean | 'indeterminate') => void }) {
  const [checked, setChecked] = useState<boolean | 'indeterminate'>(false);
  return (
    <>
      <Checkbox
        aria-label="Igual à carteira principal"
        checked={checked}
        onCheckedChange={(v) => {
          setChecked(v);
          onChange?.(v);
        }}
      />
      <output data-testid="state">{String(checked)}</output>
    </>
  );
}

describe('Checkbox - comportamento', () => {
  it('expoe role=checkbox com nome acessivel e estado desmarcado', async () => {
    await render(<Checkbox aria-label="Ethereum" />);
    const cb = page.getByRole('checkbox', { name: 'Ethereum' });
    await expect.element(cb).toBeInTheDocument();
    await expect.element(cb).not.toBeChecked();
  });

  it('nome acessivel via label htmlFor', async () => {
    await render(
      <>
        <Checkbox id="eth" />
        <label htmlFor="eth">Ethereum</label>
      </>,
    );
    await expect.element(page.getByRole('checkbox', { name: 'Ethereum' })).toBeInTheDocument();
  });

  it('Space alterna o estado quando focado', async () => {
    await render(<Checkbox aria-label="Ethereum" />);
    const cb = page.getByRole('checkbox', { name: 'Ethereum' });
    await expect.element(cb).toBeInTheDocument();
    cb.element().focus();
    await userEvent.keyboard(' ');
    await expect.element(cb).toBeChecked();
    await userEvent.keyboard(' ');
    await expect.element(cb).not.toBeChecked();
  });

  it('modo controlado: onCheckedChange recebe o novo valor e o pai define o estado', async () => {
    const calls: Array<boolean | 'indeterminate'> = [];
    await render(<Controlled onChange={(v) => calls.push(v)} />);
    const cb = page.getByRole('checkbox', { name: 'Igual à carteira principal' });
    await expect.element(cb).not.toBeChecked();
    await cb.click();
    await expect.element(cb).toBeChecked();
    expect(calls).toEqual([true]);
    await expect.element(page.getByTestId('state')).toHaveTextContent('true');
  });

  it('controlado sem atualizacao do pai nao muda sozinho', async () => {
    await render(<Checkbox aria-label="Fixo" checked={false} onCheckedChange={() => {}} />);
    const cb = page.getByRole('checkbox', { name: 'Fixo' });
    await expect.element(cb).toBeInTheDocument();
    await cb.click();
    await expect.element(cb).not.toBeChecked();
  });

  it('disabled impede alternar e desabilita o controle', async () => {
    await render(<Checkbox aria-label="Bloqueado" disabled />);
    const cb = page.getByRole('checkbox', { name: 'Bloqueado' });
    await expect.element(cb).toBeDisabled();
    await cb.click({ force: true });
    await expect.element(cb).not.toBeChecked();
  });
});

/*
 * Medida - indicador da carteira secundaria (Ellipse 22, 9:1867, docs/figma/file.json:273758-273905):
 * 16x16, stroke 1.5 INSIDE na cor primary (variavel 70320:303), sem fill; texto ao lado 14/16 regular foreground
 * (estilo 70321:351) a 8px (x 5897+16 -> 5921). Os filtros (70485:381) nao desenham caixa, so texto e contagem.
 * Q21: indicador circular (rounded-full); marcado = fundo primary + check ink.
 */
const PRIMARY = 'rgb(210, 138, 76)';
const DISABLED_BG = 'rgb(85, 50, 31)'; // --color-disabled-bg = border-soft #55321F
const DISABLED_TEXT = 'rgb(179, 148, 99)'; // --color-disabled-text = secondary #B39463

describe('Checkbox - medidas, foco e forma', () => {
  it('mede 16x16 circular (Q21: raio >= metade do lado), borda primary, sem glifo', async () => {
    await render(<Checkbox aria-label="Ethereum" />);
    const cb = page.getByRole('checkbox', { name: 'Ethereum' });
    await expect.element(cb).toBeInTheDocument();
    const el = cb.element();
    const rect = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    expect(rect.width).toBe(16);
    expect(rect.height).toBe(16);
    expect(cs.borderTopStyle).toBe('solid');
    expect(cs.borderTopColor).toBe(PRIMARY);
    for (const corner of [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomLeftRadius, cs.borderBottomRightRadius]) {
      expect(Number.parseFloat(corner)).toBeGreaterThanOrEqual(8);
    }
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(el.querySelector('svg')).toBeNull();
  });

  it('marcado: fundo primary e glifo de check (forma, nao so cor)', async () => {
    await render(<Checkbox aria-label="Ethereum" defaultChecked />);
    const cb = page.getByRole('checkbox', { name: 'Ethereum' });
    await expect.element(cb).toBeChecked();
    const el = cb.element();
    expect(getComputedStyle(el).backgroundColor).toBe(PRIMARY);
    const glyph = el.querySelector('svg');
    expect(glyph).not.toBeNull();
    expect(glyph?.getAttribute('aria-hidden')).toBe('true');
  });

  it('foco por teclado mostra outline 2px focus', async () => {
    await render(<Checkbox aria-label="Ethereum" />);
    const cb = page.getByRole('checkbox', { name: 'Ethereum' });
    await expect.element(cb).toBeInTheDocument();
    await userEvent.tab();
    expect(document.activeElement).toBe(cb.element());
    const cs = getComputedStyle(cb.element());
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('disabled usa cursor not-allowed e os tokens disabled-bg/disabled-text, sem opacidade (Q10)', async () => {
    await render(<Checkbox aria-label="Bloqueado" disabled />);
    const cb = page.getByRole('checkbox', { name: 'Bloqueado' });
    await expect.element(cb).toBeInTheDocument();
    const cs = getComputedStyle(cb.element());
    expect(cs.cursor).toBe('not-allowed');
    expect(cs.opacity).toBe('1');
    expect(cs.backgroundColor).toBe(DISABLED_BG);
    expect(cs.borderTopColor).toBe(DISABLED_TEXT);
  });

  it('disabled marcado mantem o check visivel (estado nao depende so de cor) com a cor disabled-text', async () => {
    await render(<Checkbox aria-label="Bloqueado" disabled defaultChecked />);
    const cb = page.getByRole('checkbox', { name: 'Bloqueado' });
    await expect.element(cb).toBeChecked();
    const el = cb.element();
    const glyph = el.querySelector('svg');
    expect(glyph).not.toBeNull();
    expect(getComputedStyle(el).backgroundColor).toBe(DISABLED_BG);
    expect(getComputedStyle(glyph as Element).color).toBe(DISABLED_TEXT);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(
      <>
        <Checkbox id="a" />
        <label htmlFor="a">Ethereum</label>
        <Checkbox aria-label="Marcado" defaultChecked />
        <Checkbox aria-label="Bloqueado" disabled />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
