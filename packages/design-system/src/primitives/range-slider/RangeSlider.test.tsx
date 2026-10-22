import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { RangeSlider } from './RangeSlider';

const PRIMARY = 'rgb(210, 138, 76)';
const INK = 'rgb(20, 13, 10)';

const Controlled = ({ initial = [20, 80] as [number, number], step = 5 }) => {
  const [value, setValue] = useState<[number, number]>(initial);
  return (
    <div style={{ width: '258px' }}>
      <RangeSlider
        value={value}
        min={0}
        max={100}
        step={step}
        onValueChange={setValue}
        thumbLabels={['Preço mínimo', 'Preço máximo']}
      />
      <output data-testid="out">{value.join('-')}</output>
    </div>
  );
};

const min = () => page.getByRole('slider', { name: 'Preço mínimo' });
const max = () => page.getByRole('slider', { name: 'Preço máximo' });
const out = () => page.getByTestId('out').element().textContent ?? '';

describe('RangeSlider - comportamento', () => {
  it('expoe dois sliders com nome e aria-valuenow/min/max', async () => {
    await render(<Controlled />);
    await expect.element(min()).toHaveAttribute('aria-valuenow', '20');
    expect(page.getByRole('slider').elements()).toHaveLength(2);
    await expect.element(max()).toHaveAttribute('aria-valuenow', '80');
    await expect.element(min()).toHaveAttribute('aria-valuemin', '0');
    await expect.element(max()).toHaveAttribute('aria-valuemax', '100');
  });

  it('setas movem por step', async () => {
    await render(<Controlled />);
    await expect.element(min()).toBeInTheDocument();
    min().element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(min()).toHaveAttribute('aria-valuenow', '25');
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    await expect.element(min()).toHaveAttribute('aria-valuenow', '15');
    max().element().focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect.element(max()).toHaveAttribute('aria-valuenow', '75');
    expect(out()).toBe('15-75');
  });

  it('minimo nunca ultrapassa o maximo (valor segue ordenado)', async () => {
    await render(<Controlled initial={[45, 50]} />);
    await expect.element(min()).toBeInTheDocument();
    min().element().focus();
    for (let i = 0; i < 5; i++) {
      await userEvent.keyboard('{ArrowRight}');
      const [lo, hi] = out().split('-').map(Number);
      expect(lo).toBeLessThanOrEqual(hi ?? -1);
    }
    // Radix mantem a ordem: ao encostar, o foco passa ao outro thumb (value segue ordenado), nao cruza.
    const [lo, hi] = out().split('-').map(Number);
    expect(lo).toBe(50);
    expect(hi).toBeGreaterThanOrEqual(50);
  });

  it('desabilitado marca os thumbs como data-disabled', async () => {
    await render(
      <RangeSlider
        value={[10, 20]}
        min={0}
        max={100}
        step={5}
        onValueChange={() => {}}
        thumbLabels={['a', 'b']}
        disabled
      />,
    );
    await expect.element(page.getByRole('slider', { name: 'a' })).toHaveAttribute('data-disabled');
  });
});

describe('RangeSlider - getValueText (aria-valuetext)', () => {
  const WithValueText = () => {
    const [value, setValue] = useState<[number, number]>([20, 80]);
    return (
      <div style={{ width: '258px' }}>
        <RangeSlider
          value={value}
          min={0}
          max={100}
          step={5}
          onValueChange={setValue}
          thumbLabels={['Minimum price', 'Maximum price']}
          getValueText={(v) => `${v} credits`}
        />
      </div>
    );
  };
  const lo = () => page.getByRole('slider', { name: 'Minimum price' });
  const hi = () => page.getByRole('slider', { name: 'Maximum price' });

  it('cada thumb expoe aria-valuetext com o texto devolvido por getValueText', async () => {
    await render(<WithValueText />);
    await expect.element(lo()).toHaveAttribute('aria-valuetext', '20 credits');
    await expect.element(hi()).toHaveAttribute('aria-valuetext', '80 credits');
  });

  it('aria-valuetext acompanha o valor ao mover por teclado', async () => {
    await render(<WithValueText />);
    await expect.element(lo()).toBeInTheDocument();
    lo().element().focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.element(lo()).toHaveAttribute('aria-valuetext', '25 credits');
    await expect.element(hi()).toHaveAttribute('aria-valuetext', '80 credits');
  });
});

describe('RangeSlider - medidas', () => {
  it('raiz 258x21; trilho 4px; faixa primary; thumbs 15x15 primary com borda 3px ink', async () => {
    await render(<Controlled />);
    await expect.element(min()).toBeInTheDocument();
    const thumb = min().element() as HTMLElement;
    const t = thumb.getBoundingClientRect();
    expect([t.width, t.height]).toEqual([15, 15]);
    const cs = getComputedStyle(thumb);
    expect(cs.backgroundColor).toBe(PRIMARY);
    expect(cs.borderTopWidth).toBe('3px');
    expect(cs.borderTopColor).toBe(INK);
    expect(parseFloat(cs.borderTopLeftRadius)).toBeGreaterThanOrEqual(7.5);
    const root = thumb.closest('[data-slot="range-slider"]') as HTMLElement;
    expect(root).not.toBeNull();
    const r = root.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([258, 21]);
    const track = root.querySelector('[data-slot="range-slider-track"]') as HTMLElement;
    expect(track.getBoundingClientRect().height).toBe(4);
    const range = root.querySelector('[data-slot="range-slider-range"]') as HTMLElement;
    expect(getComputedStyle(range).backgroundColor).toBe(PRIMARY);
    expect(range.getBoundingClientRect().height).toBe(4);
  });

  it('foco por teclado: outline 2px solid focus no thumb', async () => {
    await render(<Controlled />);
    await expect.element(min()).toBeInTheDocument();
    await userEvent.tab();
    const el = min().element();
    expect(document.activeElement).toBe(el);
    const cs = getComputedStyle(el);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Controlled />);
    await expect.element(min()).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
