import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { pressArrow } from '../../test/keyboard';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { ChipGroup } from './ChipGroup';
import { ChipGroupItem } from './ChipGroupItem';

afterEach(async () => {
  await userEvent.unhover(document.body);
});

function Editions({ onChange, disabledSecond = false }: { onChange?: (v: string) => void; disabledSecond?: boolean }) {
  const [value, setValue] = useState('1');
  return (
    <ChipGroup
      aria-label="Edições"
      value={value}
      onValueChange={(v) => {
        setValue(v);
        onChange?.(v);
      }}
    >
      <ChipGroupItem value="1">1/50</ChipGroupItem>
      <ChipGroupItem value="2" disabled={disabledSecond}>
        1/10
      </ChipGroupItem>
      <ChipGroupItem value="3">1/1</ChipGroupItem>
    </ChipGroup>
  );
}

/*
 * Figma: "Edições" (11:2024, file.json:76842) e "Edição: 1/50" (22:1316) existem so como TEXTO; nao ha forma de chip
 * desenhada. Lacuna registrada: medida DERIVADA (altura 40 como Button/Input, raio 3 do Button, padding-x 16,
 * 14/16 regular foreground, borda 1px secondary; selecionado = fundo primary + texto ink + bold 700).
 */
const PRIMARY = 'rgb(210, 138, 76)';
const SECONDARY = 'rgb(179, 148, 99)';
const INK = 'rgb(20, 13, 10)';

describe('ChipGroup - comportamento', () => {
  it('expoe radiogroup com nome e itens radio, apenas o selecionado marcado', async () => {
    await render(<Editions />);
    await expect.element(page.getByRole('radiogroup', { name: 'Edições' })).toBeInTheDocument();
    await expect.element(page.getByRole('radio', { name: '1/50' })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: '1/10' })).not.toBeChecked();
    await expect.element(page.getByRole('radio', { name: '1/1' })).not.toBeChecked();
  });

  it('clicar seleciona o chip e chama onValueChange', async () => {
    const calls: string[] = [];
    await render(<Editions onChange={(v) => calls.push(v)} />);
    await page.getByRole('radio', { name: '1/1' }).click();
    await expect.element(page.getByRole('radio', { name: '1/1' })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: '1/50' })).not.toBeChecked();
    expect(calls).toEqual(['3']);
  });

  it('setas movem foco e selecao (roving) e Tab entra no selecionado', async () => {
    await render(<Editions />);
    await expect.element(page.getByRole('radio', { name: '1/50' })).toBeInTheDocument();
    await userEvent.tab();
    expect(document.activeElement).toBe(page.getByRole('radio', { name: '1/50' }).element());
    await pressArrow('ArrowRight');
    await expect.element(page.getByRole('radio', { name: '1/10' })).toBeChecked();
    expect(document.activeElement).toBe(page.getByRole('radio', { name: '1/10' }).element());
    await pressArrow('ArrowLeft');
    await expect.element(page.getByRole('radio', { name: '1/50' })).toBeChecked();
  });

  it('item disabled: anunciado como desabilitado, nao selecionavel por clique e pulado pelas setas', async () => {
    const calls: string[] = [];
    await render(<Editions disabledSecond onChange={(v) => calls.push(v)} />);
    const second = page.getByRole('radio', { name: '1/10' });
    await expect.element(second).toBeDisabled();
    (second.element() as HTMLElement).click(); // clique nativo: o click forcado do Playwright em item desabilitado trava (flake de 15s)
    await expect.element(second).not.toBeChecked();
    page.getByRole('radio', { name: '1/50' }).element().focus();
    expect(document.activeElement).toBe(page.getByRole('radio', { name: '1/50' }).element());
    await pressArrow('ArrowRight');
    expect(document.activeElement).toBe(page.getByRole('radio', { name: '1/1' }).element());
    await expect.element(page.getByRole('radio', { name: '1/1' })).toBeChecked();
    expect(calls).toEqual(['3']);
  });
});

describe('ChipGroup - medidas, foco e axe', () => {
  it('chip normal: 40px de altura, raio 3, borda 1px secondary, padding 16, 14/16 regular', async () => {
    await render(<Editions />);
    const chip = page.getByRole('radio', { name: '1/10' });
    await expect.element(chip).toBeInTheDocument();
    const el = chip.element();
    const cs = getComputedStyle(el);
    expect(el.getBoundingClientRect().height).toBe(40);
    expect(cs.borderTopLeftRadius).toBe('3px');
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopStyle).toBe('solid');
    expect(cs.borderTopColor).toBe(SECONDARY);
    expect(cs.paddingLeft).toBe('16px');
    expect(cs.paddingRight).toBe('16px');
    expect(cs.fontSize).toBe('14px');
    expect(cs.lineHeight).toBe('16px');
    expect(cs.fontWeight).toBe('400');
    expect(cs.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('chip selecionado: fundo primary, texto ink e peso 700 (estado nao so por cor)', async () => {
    await render(<Editions />);
    const chip = page.getByRole('radio', { name: '1/50' });
    await expect.element(chip).toBeChecked();
    const el = chip.element();
    const cs = getComputedStyle(el);
    expect(cs.backgroundColor).toBe(PRIMARY);
    expect(cs.color).toBe(INK);
    expect(cs.borderTopColor).toBe(PRIMARY);
    expect(cs.fontWeight).toBe('700');
    expect(el.getBoundingClientRect().height).toBe(40);
  });

  it('foco por teclado mostra outline 2px focus', async () => {
    await render(<Editions />);
    const chip = page.getByRole('radio', { name: '1/50' });
    await expect.element(chip).toBeInTheDocument();
    await userEvent.tab();
    const cs = getComputedStyle(chip.element());
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
    expect(cs.outlineColor).toBe(PRIMARY);
  });

  it('disabled usa cursor not-allowed e opacidade reduzida', async () => {
    await render(<Editions disabledSecond />);
    const chip = page.getByRole('radio', { name: '1/10' });
    await expect.element(chip).toBeInTheDocument();
    const cs = getComputedStyle(chip.element());
    expect(cs.cursor).toBe('not-allowed');
    expect(Number(cs.opacity)).toBeLessThan(1);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Editions disabledSecond />);
    await expect.element(page.getByRole('radiogroup')).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
