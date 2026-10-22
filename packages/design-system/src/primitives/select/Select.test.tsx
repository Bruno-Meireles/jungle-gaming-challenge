import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Select } from './Select';
import { SelectContent } from './SelectContent';
import { SelectItem } from './SelectItem';
import { SelectTrigger } from './SelectTrigger';
import { SelectValue } from './SelectValue';

type Props = {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  invalid?: boolean;
  open?: boolean;
};

const Sample = ({ defaultValue, onValueChange, invalid, open }: Props) => (
  <Select defaultValue={defaultValue} onValueChange={onValueChange} open={open}>
    <SelectTrigger aria-label="Ordenar por" aria-invalid={invalid ? 'true' : undefined}>
      <SelectValue placeholder="Selecione" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="recentes">Mais recentes</SelectItem>
      <SelectItem value="menor">Menor preco</SelectItem>
      <SelectItem value="maior">Maior preco</SelectItem>
    </SelectContent>
  </Select>
);

const PRIMARY = 'rgb(210, 138, 76)';
const SECONDARY = 'rgb(179, 148, 99)';
const ERROR = 'rgb(237, 27, 46)';

const trigger = () => page.getByRole('combobox', { name: 'Ordenar por' });

describe('Select - comportamento', () => {
  it('expoe um combobox com nome e mostra o placeholder', async () => {
    await render(<Sample />);
    await expect.element(trigger()).toBeInTheDocument();
    await expect.element(trigger()).toHaveTextContent('Selecione');
  });

  it('Enter abre a lista, setas movem, Enter seleciona e o foco volta ao trigger', async () => {
    const onValueChange = vi.fn();
    await render(<Sample onValueChange={onValueChange} />);
    await expect.element(trigger()).toBeInTheDocument();
    trigger().element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'Mais recentes' })).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => onValueChange.mock.calls).toEqual([['menor']]);
    await expect.element(trigger()).toHaveTextContent('Menor preco');
    await expect.poll(() => page.getByRole('listbox').elements().length).toBe(0);
    await expect.poll(() => document.activeElement).toBe(trigger().element());
  });

  it('Esc fecha sem alterar o valor', async () => {
    const onValueChange = vi.fn();
    await render(<Sample defaultValue="maior" onValueChange={onValueChange} />);
    await expect.element(trigger()).toBeInTheDocument();
    trigger().element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => page.getByRole('listbox').elements().length).toBe(0);
    expect(onValueChange).not.toHaveBeenCalled();
    await expect.element(trigger()).toHaveTextContent('Maior preco');
    await expect.poll(() => document.activeElement).toBe(trigger().element());
  });
});

describe('Select - medidas', () => {
  it('trigger: 40 de altura, raio 5, borda 1px secondary, padding-x 16 e foreground', async () => {
    await render(
      <div style={{ width: '340px' }}>
        <Sample defaultValue="recentes" />
      </div>,
    );
    await expect.element(trigger()).toHaveTextContent('Mais recentes');
    const el = trigger().element();
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([340, 40]);
    expect(cs.borderTopLeftRadius).toBe('5px');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopColor).toBe(SECONDARY);
    expect(cs.paddingLeft).toBe('16px');
    expect(cs.color).toBe('rgb(245, 241, 235)');
  });

  it('chevron 20x20 (Arrow-Down 9:1589) a direita, decorativo', async () => {
    await render(
      <div style={{ width: '340px' }}>
        <Sample />
      </div>,
    );
    await expect.element(trigger()).toBeInTheDocument();
    const el = trigger().element();
    const icon = el.querySelector('[data-slot="select-icon"]') as HTMLElement | null;
    expect(icon).not.toBeNull();
    expect(icon!.getAttribute('aria-hidden')).toBe('true');
    const r = icon!.getBoundingClientRect();
    expect([r.width, r.height]).toEqual([20, 20]);
    const t = el.getBoundingClientRect();
    // borda 1 + padding-x 16 entre o chevron e a borda direita
    expect(Math.round(t.right - 1 - 16 - r.right)).toBe(0);
  });

  it('placeholder usa secondary', async () => {
    await render(<Sample />);
    await expect.element(trigger()).toHaveTextContent('Selecione');
    const value = trigger().element().querySelector('[data-slot="select-value"]') as HTMLElement;
    expect(value).not.toBeNull();
    expect(getComputedStyle(value).color).toBe(SECONDARY);
  });

  it('foco por teclado: borda primary e outline 2px solid focus', async () => {
    await render(<Sample />);
    await expect.element(trigger()).toBeInTheDocument();
    await userEvent.tab();
    const el = trigger().element();
    expect(document.activeElement).toBe(el);
    const cs = getComputedStyle(el);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
    expect(cs.borderTopColor).toBe(PRIMARY);
  });

  it('aria-invalid="true" troca a borda para a cor de erro', async () => {
    await render(<Sample invalid />);
    await expect.element(trigger()).toHaveAttribute('aria-invalid', 'true');
    expect(getComputedStyle(trigger().element()).borderTopColor).toBe(ERROR);
  });

  it('lista aberta: opcao com padding-x 16, painel surface e selecionada com aria-selected', async () => {
    await render(<Sample defaultValue="menor" open />);
    const opt = page.getByRole('option', { name: 'Menor preco' });
    await expect.element(opt).toBeVisible();
    await expect.element(opt).toHaveAttribute('aria-selected', 'true');
    expect(getComputedStyle(opt.element()).paddingLeft).toBe('16px');
    const panel = document.querySelector('[data-slot="select-content"]') as HTMLElement | null;
    expect(panel).not.toBeNull();
    expect(getComputedStyle(panel!).backgroundColor).toBe('rgb(36, 22, 18)');
  });
});

describe('Select - acessibilidade', () => {
  it('nao tem violacoes (axe) fechado', async () => {
    const { container } = await render(<Sample defaultValue="recentes" />);
    await expect.element(trigger()).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });

  it('nao tem violacoes (axe) aberto', async () => {
    await render(<Sample defaultValue="recentes" open />);
    await expect.element(page.getByRole('listbox')).toBeVisible();
    await expectNoA11yViolations(document.body);
  });
});
