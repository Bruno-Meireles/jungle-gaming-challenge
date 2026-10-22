import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Sheet, type SheetProps } from './Sheet';
import { SheetClose, SheetDescription, SheetTitle } from './SheetParts';

const Example = ({
  defaultOpen = false,
  side = 'bottom',
}: {
  defaultOpen?: boolean;
  side?: SheetProps['side'];
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir filtros
      </button>
      <Sheet side={side} open={open} onOpenChange={setOpen}>
        <SheetTitle>Filtros</SheetTitle>
        <SheetDescription>Refine a lista de NFTs.</SheetDescription>
        <label>
          Preco minimo
          <input type="text" />
        </label>
        <button type="button">Aplicar</button>
        <SheetClose closeLabel="Fechar" />
      </Sheet>
    </>
  );
};

// A folha desliza ao abrir; mede-se a posicao final, depois das animacoes terminarem.
async function settled(el: Element) {
  await Promise.all(el.getAnimations().map((a) => a.finished));
  return el.getBoundingClientRect();
}

afterEach(async () => {
  await page.viewport(1440, 900);
  await userEvent.unhover(document.body);
});

describe('Sheet - foco e semantica (como C23.1-4)', () => {
  it('ao abrir: role=dialog modal, rotulado pelo titulo, descrito, foco dentro', async () => {
    await render(<Example />);
    await page.getByRole('button', { name: 'Abrir filtros' }).click();
    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect.element(dialog).toBeInTheDocument();
    await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
    await expect.element(dialog).toHaveAccessibleDescription('Refine a lista de NFTs.');
    expect(dialog.element().contains(document.activeElement)).toBe(true);
  });

  it('Tab circula dentro da folha (focus trap) em ambos os sentidos', async () => {
    await render(<Example defaultOpen />);
    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect.element(dialog).toBeInTheDocument();
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(dialog.element().contains(document.activeElement)).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await userEvent.tab({ shift: true });
      expect(dialog.element().contains(document.activeElement)).toBe(true);
    }
  });

  it('Esc fecha e devolve o foco ao botao que abriu', async () => {
    await render(<Example />);
    const opener = page.getByRole('button', { name: 'Abrir filtros' });
    await opener.click();
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener.element());
  });

  it('botao de fechar tem nome "Fechar" e fecha a folha', async () => {
    await render(<Example defaultOpen />);
    await page.getByRole('button', { name: 'Fechar' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('Sheet - ancoragem (derivado; sem frame no Figma)', () => {
  it('side=bottom em 390: ancorada na base, largura total, cantos superiores 8, surface-card', async () => {
    await page.viewport(390, 844);
    await render(<Example defaultOpen side="bottom" />);
    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect.element(dialog).toBeInTheDocument();
    const el = dialog.element();
    const rect = await settled(el);
    expect([rect.left, rect.right, rect.bottom]).toEqual([0, 390, 844]);
    expect(rect.top).toBeGreaterThan(0);
    expect(getComputedStyle(el).borderTopLeftRadius).toBe('8px');
    expect(getComputedStyle(el).backgroundColor).toBe('rgb(36, 22, 18)');
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it('side=left: ancorada a esquerda, altura total, nao cobre toda a largura', async () => {
    await page.viewport(390, 844);
    await render(<Example defaultOpen side="left" />);
    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect.element(dialog).toBeInTheDocument();
    const rect = await settled(dialog.element());
    expect([rect.left, rect.top, rect.bottom]).toEqual([0, 0, 844]);
    expect(rect.right).toBeLessThan(390);
  });

  it('side=right: ancorada a direita, altura total', async () => {
    await page.viewport(390, 844);
    await render(<Example defaultOpen side="right" />);
    const dialog = page.getByRole('dialog', { name: 'Filtros' });
    await expect.element(dialog).toBeInTheDocument();
    const rect = await settled(dialog.element());
    expect([rect.right, rect.top, rect.bottom]).toEqual([390, 0, 844]);
    expect(rect.left).toBeGreaterThan(0);
  });
});

describe('Sheet - acessibilidade', () => {
  it('aberta nao tem violacoes (axe)', async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole('dialog', { name: 'Filtros' })).toBeInTheDocument();
    await expectNoA11yViolations(document.body);
  });
});
