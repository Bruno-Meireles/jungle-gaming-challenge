import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { QuantityStepper } from './QuantityStepper';

afterEach(async () => {
  await userEvent.unhover(document.body);
});

function Controlled({ min = 1, max = 5, start = 2 }: { min?: number; max?: number; start?: number }) {
  const [value, setValue] = useState(start);
  return <QuantityStepper label="Quantidade" value={value} min={min} max={max} onValueChange={setValue} />;
}

describe('QuantityStepper - comportamento', () => {
  it('expoe um grupo com nome e botoes Diminuir/Aumentar com nomes acessiveis', async () => {
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />);
    await expect.element(page.getByRole('group', { name: 'Quantidade' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Diminuir' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Aumentar' })).toBeInTheDocument();
  });

  it('aceita nomes customizados para os botoes', async () => {
    await render(
      <QuantityStepper
        label="Quantidade"
        value={2}
        min={1}
        max={5}
        onValueChange={() => {}}
        decrementLabel="Remover um"
        incrementLabel="Adicionar um"
      />,
    );
    await expect.element(page.getByRole('button', { name: 'Remover um' })).toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Adicionar um' })).toBeInTheDocument();
  });

  it('aumentar chama onValueChange(value + 1)', async () => {
    const calls: number[] = [];
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={(n) => calls.push(n)} />);
    await page.getByRole('button', { name: 'Aumentar' }).click();
    expect(calls).toEqual([3]);
  });

  it('diminuir chama onValueChange(value - 1)', async () => {
    const calls: number[] = [];
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={(n) => calls.push(n)} />);
    await page.getByRole('button', { name: 'Diminuir' }).click();
    expect(calls).toEqual([1]);
  });

  it('no min o botao Diminuir fica desabilitado e nao dispara', async () => {
    const calls: number[] = [];
    await render(<QuantityStepper label="Quantidade" value={1} min={1} max={5} onValueChange={(n) => calls.push(n)} />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Aumentar' })).toBeEnabled();
    await dec.click({ force: true });
    expect(calls).toEqual([]);
  });

  it('no max o botao Aumentar fica desabilitado e nao dispara', async () => {
    const calls: number[] = [];
    await render(<QuantityStepper label="Quantidade" value={5} min={1} max={5} onValueChange={(n) => calls.push(n)} />);
    const inc = page.getByRole('button', { name: 'Aumentar' });
    await expect.element(inc).toBeDisabled();
    await expect.element(page.getByRole('button', { name: 'Diminuir' })).toBeEnabled();
    await inc.click({ force: true });
    expect(calls).toEqual([]);
  });

  it('o valor aparece em <output> com aria-live=polite', async () => {
    await render(<QuantityStepper label="Quantidade" value={3} min={1} max={5} onValueChange={() => {}} />);
    const out = page.getByRole('status');
    await expect.element(out).toHaveTextContent('3');
    const el = out.element();
    expect(el.tagName).toBe('OUTPUT');
    expect(el.getAttribute('aria-live')).toBe('polite');
  });

  it('modo controlado: o valor exibido acompanha o pai e para nos limites', async () => {
    await render(<Controlled min={1} max={3} start={2} />);
    const out = page.getByRole('status');
    await page.getByRole('button', { name: 'Aumentar' }).click();
    await expect.element(out).toHaveTextContent('3');
    await expect.element(page.getByRole('button', { name: 'Aumentar' })).toBeDisabled();
    await page.getByRole('button', { name: 'Diminuir' }).click();
    await page.getByRole('button', { name: 'Diminuir' }).click();
    await expect.element(out).toHaveTextContent('1');
    await expect.element(page.getByRole('button', { name: 'Diminuir' })).toBeDisabled();
  });

  it('teclado: Tab alcanca os botoes e Enter/Space acionam', async () => {
    await render(<Controlled min={1} max={5} start={2} />);
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Diminuir' }).element());
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('status')).toHaveTextContent('1');
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole('button', { name: 'Aumentar' }).element());
    await userEvent.keyboard(' ');
    await expect.element(page.getByRole('status')).toHaveTextContent('2');
  });
});

/*
 * Medidas - grupo "01" 70342:2762/11:1238 (Frame 48 70410:4189, docs/figma/file.json:51135): auto-layout horizontal, gap 12,
 * centralizado. Botoes "Add Button" 70410:4190/4194: 33x49.5, raio 33 (--radius-33), fill primary (var 70320:303),
 * stroke 1 INSIDE ink; glifos 15.4 (menos 15.4x2.2, mais 15.4x15.4) em ink (var 70320:311). Valor "1" 70410:4200:
 * Roboto Mono 20/28 regular, foreground (var 70320:308), largura 13.
 * Desvios (nao desenhados no Figma): hover = primary-hover, foco = outline 2px focus offset 2px, disabled = tokens disabled-*.
 */
const PRIMARY = 'rgb(210, 138, 76)';
const PRIMARY_HOVER = 'rgb(221, 154, 95)';
const INK = 'rgb(20, 13, 10)';
const FOREGROUND = 'rgb(245, 241, 235)';
const DISABLED_BG = 'rgb(85, 50, 31)';

describe('QuantityStepper - medidas, estados e a11y', () => {
  it('botoes medem 33x49.5, raio 33, fundo primary e borda 1px ink', async () => {
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeInTheDocument();
    for (const name of ['Diminuir', 'Aumentar']) {
      const el = page.getByRole('button', { name }).element();
      const rect = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      expect(rect.width).toBe(33);
      expect(rect.height).toBe(49.5);
      expect(cs.borderTopLeftRadius).toBe('33px');
      expect(cs.backgroundColor).toBe(PRIMARY);
      expect(cs.borderTopWidth).toBe('1px');
      expect(cs.borderTopStyle).toBe('solid');
      expect(cs.borderTopColor).toBe(INK);
    }
  });

  it('glifos sao svg aria-hidden: menos 15.4x2.2 e mais 15.4x15.4 em ink', async () => {
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeInTheDocument();
    const minus = dec.element().querySelector('svg');
    const plus = page.getByRole('button', { name: 'Aumentar' }).element().querySelector('svg');
    expect(minus?.getAttribute('aria-hidden')).toBe('true');
    expect(plus?.getAttribute('aria-hidden')).toBe('true');
    const m = minus!.getBoundingClientRect();
    const p = plus!.getBoundingClientRect();
    expect(m.width).toBeCloseTo(15.4, 1);
    expect(p.width).toBeCloseTo(15.4, 1);
    expect(p.height).toBeCloseTo(15.4, 1);
    expect(getComputedStyle(dec.element()).color).toBe(INK);
  });

  it('valor em 20/28 regular foreground e gap 12 entre os itens', async () => {
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />);
    const out = page.getByRole('status');
    await expect.element(out).toBeInTheDocument();
    const cs = getComputedStyle(out.element());
    expect(cs.fontSize).toBe('20px');
    expect(cs.lineHeight).toBe('28px');
    expect(cs.fontWeight).toBe('400');
    expect(cs.color).toBe(FOREGROUND);
    const dec = page.getByRole('button', { name: 'Diminuir' }).element().getBoundingClientRect();
    const o = out.element().getBoundingClientRect();
    const inc = page.getByRole('button', { name: 'Aumentar' }).element().getBoundingClientRect();
    expect(o.left - dec.right).toBe(12);
    expect(inc.left - o.right).toBe(12);
    expect(getComputedStyle(page.getByRole('group').element()).display).toBe('flex');
  });

  it('hover troca o fundo para primary-hover', async () => {
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />);
    const inc = page.getByRole('button', { name: 'Aumentar' });
    await inc.hover();
    await expect.poll(() => getComputedStyle(inc.element()).backgroundColor).toBe(PRIMARY_HOVER);
  });

  it('foco por teclado mostra outline 2px focus', async () => {
    await render(<QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeInTheDocument();
    await userEvent.tab();
    expect(document.activeElement).toBe(dec.element());
    const cs = getComputedStyle(dec.element());
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('desabilitado usa tokens disabled e cursor not-allowed', async () => {
    await render(<QuantityStepper label="Quantidade" value={1} min={1} max={5} onValueChange={() => {}} />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeDisabled();
    const cs = getComputedStyle(dec.element());
    expect(cs.backgroundColor).toBe(DISABLED_BG);
    expect(cs.cursor).toBe('not-allowed');
  });

  it('nao tem violacoes de acessibilidade (axe) no meio e nos limites', async () => {
    const { container } = await render(
      <>
        <QuantityStepper label="Quantidade" value={2} min={1} max={5} onValueChange={() => {}} />
        <QuantityStepper label="No minimo" value={1} min={1} max={5} onValueChange={() => {}} />
        <QuantityStepper label="No maximo" value={5} min={1} max={5} onValueChange={() => {}} />
      </>,
    );
    await expect.element(page.getByRole('group', { name: 'No maximo' })).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
