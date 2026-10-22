import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { RadioGroup } from './RadioGroup';
import { RadioGroupItem } from './RadioGroupItem';

const Group = ({ defaultValue }: { defaultValue?: string }) => (
  <RadioGroup aria-label="Carteira" defaultValue={defaultValue}>
    <RadioGroupItem value="a" aria-label="MetaMask" />
    <RadioGroupItem value="b" aria-label="Coinbase Wallet" />
    <RadioGroupItem value="c" aria-label="WalletConnect" />
  </RadioGroup>
);

const PRIMARY = 'rgb(210, 138, 76)';

describe('RadioGroup - comportamento', () => {
  it('expoe um radiogroup com nome e radios com nome', async () => {
    await render(<Group />);
    await expect.element(page.getByRole('radiogroup', { name: 'Carteira' })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: 'MetaMask' })).toBeInTheDocument();
    expect(page.getByRole('radio').elements()).toHaveLength(3);
  });

  it('setas movem foco e selecao entre os radios (roving)', async () => {
    await render(<Group defaultValue="a" />);
    const a = page.getByRole('radio', { name: 'MetaMask' });
    const b = page.getByRole('radio', { name: 'Coinbase Wallet' });
    await expect.element(a).toBeChecked();
    a.element().focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(b).toBeChecked();
    expect(document.activeElement).toBe(b.element());
    await userEvent.keyboard('{ArrowUp}');
    await expect.element(a).toBeChecked();
  });

  it('Tab entra no radio selecionado (so ele tem tabindex 0)', async () => {
    await render(
      <>
        <button type="button">antes</button>
        <Group defaultValue="b" />
      </>,
    );
    page.getByRole('button', { name: 'antes' }).element().focus();
    await userEvent.tab();
    await expect.element(page.getByRole('radio', { name: 'Coinbase Wallet' })).toBeChecked();
    expect(document.activeElement).toBe(page.getByRole('radio', { name: 'Coinbase Wallet' }).element());
    expect(page.getByRole('radio', { name: 'MetaMask' }).element().getAttribute('tabindex')).toBe('-1');
  });

  it('item disabled fica desabilitado e nao marcado', async () => {
    await render(
      <RadioGroup aria-label="Carteira">
        <RadioGroupItem value="a" aria-label="MetaMask" disabled />
      </RadioGroup>,
    );
    const a = page.getByRole('radio', { name: 'MetaMask' });
    await expect.element(a).toBeDisabled();
    await expect.element(a).not.toBeChecked();
  });
});

describe('RadioGroup - medidas', () => {
  it('default: indicador 16x16 circular, borda 1.2px primary; marcado mostra miolo 10x10 primary', async () => {
    await render(<Group defaultValue="a" />);
    const a = page.getByRole('radio', { name: 'MetaMask' });
    await expect.element(a).toBeChecked();
    const cs = getComputedStyle(a.element());
    const rect = a.element().getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([16, 16]);
    // rounded-full computa um valor enorme (calc(infinity * 1px)); circular = raio >= metade do lado.
    expect(parseFloat(cs.borderTopLeftRadius)).toBeGreaterThanOrEqual(8);
    expect(cs.borderTopWidth).toBe('1.2px');
    expect(cs.borderTopColor).toBe(PRIMARY);
    const dot = a.element().querySelector('[data-slot="radio-indicator"]') as HTMLElement;
    expect(dot).not.toBeNull();
    const d = dot.getBoundingClientRect();
    expect([d.width, d.height]).toEqual([10, 10]);
    expect(getComputedStyle(dot).backgroundColor).toBe(PRIMARY);
    const other = page.getByRole('radio', { name: 'Coinbase Wallet' }).element();
    expect(other.querySelector('[data-slot="radio-indicator"]')).toBeNull();
  });

  it('card: 45 de altura, raio 3, borda 1px border, padding 12, gap 10, indicador 16 e texto foreground', async () => {
    await render(
      <div style={{ width: '405px' }}>
        <RadioGroup aria-label="Carteira">
          <RadioGroupItem variant="card" value="a">
            MetaMask
          </RadioGroupItem>
        </RadioGroup>
      </div>,
    );
    const el = page.getByRole('radio', { name: 'MetaMask' });
    await expect.element(el).toBeInTheDocument();
    const cs = getComputedStyle(el.element());
    const rect = el.element().getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([405, 45]);
    expect(cs.borderTopLeftRadius).toBe('3px');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopColor).toBe('rgb(63, 35, 25)');
    expect(cs.paddingLeft).toBe('12px');
    expect(cs.columnGap).toBe('10px');
    expect(cs.color).toBe('rgb(245, 241, 235)');
    const ind = el.element().querySelector('[data-slot="radio-circle"]') as HTMLElement;
    expect(ind).not.toBeNull();
    const r = ind.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([16, 16]);
  });

  it('card selecionado: borda primary, padding 16, gap 12 e miolo preenchido', async () => {
    await render(
      <div style={{ width: '405px' }}>
        <RadioGroup aria-label="Carteira" defaultValue="a">
          <RadioGroupItem variant="card" value="a">
            MetaMask
          </RadioGroupItem>
        </RadioGroup>
      </div>,
    );
    const el = page.getByRole('radio', { name: 'MetaMask' });
    await expect.element(el).toBeChecked();
    const cs = getComputedStyle(el.element());
    expect(cs.borderTopColor).toBe(PRIMARY);
    expect(cs.paddingLeft).toBe('16px');
    expect(cs.columnGap).toBe('12px');
    const dot = el.element().querySelector('[data-slot="radio-indicator"]') as HTMLElement;
    expect(dot).not.toBeNull();
    expect(getComputedStyle(dot).backgroundColor).toBe(PRIMARY);
  });

  it('foco por teclado: outline 2px solid focus', async () => {
    await render(<Group defaultValue="a" />);
    await userEvent.tab();
    const a = page.getByRole('radio', { name: 'MetaMask' }).element();
    expect(document.activeElement).toBe(a);
    const cs = getComputedStyle(a);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('nao tem violacoes de acessibilidade (axe), default e card', async () => {
    const { container } = await render(
      <>
        <Group defaultValue="a" />
        <RadioGroup aria-label="Rede" defaultValue="x">
          <RadioGroupItem variant="card" value="x">
            Ethereum
          </RadioGroupItem>
          <RadioGroupItem variant="card" value="y" disabled>
            Polygon
          </RadioGroupItem>
        </RadioGroup>
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
