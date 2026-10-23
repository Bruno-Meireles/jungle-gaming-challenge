import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { QuantityStepper } from './QuantityStepper';

/*
 * Plano cart.md C4: tamanho `sm` do carrinho. Figma 11:1278, "Frame 47" 11:2028 (docs/figma/file.json:78068): 75x30,
 * gap 12; botoes 20x30 com raio 20. O tamanho padrao `md` continua o do detalhe (33x49.5, raio 33).
 */
const props = {
  label: 'Quantidade',
  decrementLabel: 'Diminuir',
  incrementLabel: 'Aumentar',
  value: 2,
  min: 1,
  max: 5,
  onValueChange: () => {},
} as const;

describe('QuantityStepper - size sm (carrinho)', () => {
  it('botoes medem 20x30 com raio 20', async () => {
    await render(<QuantityStepper {...props} size="sm" />);
    await expect.element(page.getByRole('button', { name: 'Diminuir' })).toBeInTheDocument();
    for (const name of ['Diminuir', 'Aumentar']) {
      const el = page.getByRole('button', { name }).element();
      const rect = el.getBoundingClientRect();
      expect(rect.width, `${name} largura`).toBe(20);
      expect(rect.height, `${name} altura`).toBe(30);
      expect(getComputedStyle(el).borderTopLeftRadius, `${name} raio`).toBe('20px');
    }
  });

  it('gap de 12 entre botao, campo e botao', async () => {
    await render(<QuantityStepper {...props} size="sm" />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeInTheDocument();
    const d = dec.element().getBoundingClientRect();
    const field = page.getByRole('textbox', { name: 'Quantidade' }).element().getBoundingClientRect();
    const inc = page.getByRole('button', { name: 'Aumentar' }).element().getBoundingClientRect();
    expect(field.left - d.right).toBe(12);
    expect(inc.left - field.right).toBe(12);
  });

  it('o grupo mede 30 de altura', async () => {
    await render(<QuantityStepper {...props} size="sm" />);
    const group = page.getByRole('group', { name: 'Quantidade' });
    await expect.element(group).toBeInTheDocument();
    expect(group.element().getBoundingClientRect().height).toBe(30);
  });

  it('sem size, continua md (33x49.5)', async () => {
    await render(<QuantityStepper {...props} />);
    const dec = page.getByRole('button', { name: 'Diminuir' });
    await expect.element(dec).toBeInTheDocument();
    const rect = dec.element().getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([33, 49.5]);
  });
});
