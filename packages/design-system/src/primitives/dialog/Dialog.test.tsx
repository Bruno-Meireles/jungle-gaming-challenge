import { useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Dialog } from './Dialog';
import { DialogClose } from './DialogClose';
import { DialogContent } from './DialogContent';
import { DialogDescription } from './DialogDescription';
import { DialogTitle } from './DialogTitle';

const Example = ({ defaultOpen = false }: { defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir entrada
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Entrar</DialogTitle>
          <DialogDescription>Acesse sua conta de colecionador.</DialogDescription>
          <label>
            E-mail
            <input type="email" />
          </label>
          <button type="button">Continuar</button>
          <DialogClose closeLabel="Fechar" />
        </DialogContent>
      </Dialog>
    </>
  );
};

const SURFACE_CARD = 'rgb(36, 22, 18)';
const FOREGROUND = 'rgb(245, 241, 235)';
const PRIMARY = 'rgb(210, 138, 76)';

afterEach(async () => {
  await page.viewport(1440, 900);
  await userEvent.unhover(document.body);
});

describe('Dialog - comportamento', () => {
  it('ao abrir: role=dialog modal, rotulado pelo titulo, descrito, foco dentro', async () => {
    await render(<Example />);
    await page.getByRole('button', { name: 'Abrir entrada' }).click();
    const dialog = page.getByRole('dialog', { name: 'Entrar' });
    await expect.element(dialog).toBeInTheDocument();
    await expect.element(dialog).toHaveAttribute('aria-modal', 'true');
    await expect.element(dialog).toHaveAccessibleDescription('Acesse sua conta de colecionador.');
    expect(dialog.element().contains(document.activeElement)).toBe(true);
    await expect.element(page.getByRole('heading', { name: 'Entrar' })).toBeInTheDocument();
  });

  it('Tab circula dentro do dialogo (focus trap) em ambos os sentidos', async () => {
    await render(<Example defaultOpen />);
    const dialog = page.getByRole('dialog', { name: 'Entrar' });
    await expect.element(dialog).toBeInTheDocument();
    const inside = () => dialog.element().contains(document.activeElement);
    for (let i = 0; i < 6; i++) {
      await userEvent.tab();
      expect(inside()).toBe(true);
    }
    for (let i = 0; i < 6; i++) {
      await userEvent.tab({ shift: true });
      expect(inside()).toBe(true);
    }
    // o botao de fundo fica aria-hidden (nao e achado por role) e nao pode receber o foco
    expect(document.activeElement).not.toBe(page.getByText('Abrir entrada').element());
  });

  it('Esc fecha e devolve o foco ao botao que abriu', async () => {
    await render(<Example />);
    const opener = page.getByRole('button', { name: 'Abrir entrada' });
    await opener.click();
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    expect(document.activeElement).toBe(opener.element());
  });

  it('botao de fechar tem nome "Fechar" e fecha o dialogo', async () => {
    await render(<Example defaultOpen />);
    const close = page.getByRole('button', { name: 'Fechar' });
    await expect.element(close).toBeInTheDocument();
    await close.click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
  });

  it('closeLabel personaliza o nome do botao de fechar', async () => {
    await render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Entrar</DialogTitle>
          <DialogDescription>Descricao</DialogDescription>
          <DialogClose closeLabel="Close" />
        </DialogContent>
      </Dialog>,
    );
    await expect.element(page.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });
});

describe('Dialog - medidas (Figma Sign In/Sign Up Modal 70381:239 / 70383:239)', () => {
  it('painel: 500 de largura, surface-card, raio 8, sombra do DS; foreground', async () => {
    await render(<Example defaultOpen />);
    const el = page.getByRole('dialog', { name: 'Entrar' }).element();
    const cs = getComputedStyle(el);
    expect(el.getBoundingClientRect().width).toBe(500);
    expect(cs.backgroundColor).toBe(SURFACE_CARD);
    expect(cs.borderTopLeftRadius).toBe('8px');
    expect(cs.boxShadow).toContain('rgba(10, 6, 4, 0.45)');
    expect(cs.color).toBe(FOREGROUND);
  });

  it('painel centralizado na janela', async () => {
    await render(<Example defaultOpen />);
    const rect = page.getByRole('dialog', { name: 'Entrar' }).element().getBoundingClientRect();
    expect(Math.round(rect.left + rect.width / 2)).toBe(720);
    expect(Math.round(rect.top + rect.height / 2)).toBe(450);
  });

  it('overlay cobre a janela com ink translucido', async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]');
    expect(overlay).not.toBeNull();
    const rect = overlay!.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([1440, 900]);
    expect(getComputedStyle(overlay!).backgroundColor).toBe('rgba(10, 6, 4, 0.45)');
  });

  it('overlay usa o token --color-overlay (sem rgba arbitrario no componente)', async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole('dialog')).toBeInTheDocument();
    const overlay = document.querySelector('[data-slot="dialog-overlay"]') as Element;
    expect(getComputedStyle(document.documentElement).getPropertyValue('--color-overlay').trim()).toBe('rgba(10, 6, 4, 0.45)');
    expect(overlay.className).toContain('bg-overlay');
    expect(overlay.className).not.toContain('rgba');
  });

  it('titulo 20/500 e descricao 13/400 lh16 em foreground', async () => {
    await render(<Example defaultOpen />);
    const title = getComputedStyle(page.getByRole('heading', { name: 'Entrar' }).element());
    expect([title.fontSize, title.fontWeight, title.color]).toEqual(['20px', '500', FOREGROUND]);
    const desc = getComputedStyle(page.getByText('Acesse sua conta de colecionador.').element());
    expect([desc.fontSize, desc.fontWeight, desc.lineHeight]).toEqual(['13px', '400', '16px']);
  });

  it('botao fechar 18x18 no canto superior direito (12 da borda direita, 11 do topo), icone primary', async () => {
    await render(<Example defaultOpen />);
    const panel = page.getByRole('dialog', { name: 'Entrar' }).element().getBoundingClientRect();
    const close = page.getByRole('button', { name: 'Fechar' }).element();
    const rect = close.getBoundingClientRect();
    expect([rect.width, rect.height]).toEqual([18, 18]);
    expect(panel.right - rect.right).toBe(12);
    expect(rect.top - panel.top).toBe(11);
    expect(getComputedStyle(close).color).toBe(PRIMARY);
  });

  it('foco por teclado no fechar: outline 2px solid primary', async () => {
    await render(<Example defaultOpen />);
    const close = page.getByRole('button', { name: 'Fechar' }).element();
    close.focus();
    await userEvent.keyboard('{Shift>}{/Shift}');
    const cs = getComputedStyle(close);
    expect([cs.outlineStyle, cs.outlineWidth, cs.outlineColor]).toEqual(['solid', '2px', PRIMARY]);
  });

  it('em 390 de largura nao ha overflow horizontal e o painel cabe na janela', async () => {
    await page.viewport(390, 844);
    await render(<Example defaultOpen />);
    const dialog = page.getByRole('dialog', { name: 'Entrar' });
    await expect.element(dialog).toBeInTheDocument();
    const rect = dialog.element().getBoundingClientRect();
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.right).toBeLessThanOrEqual(390);
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(390);
  });

  it('dialogo aberto nao tem violacoes de acessibilidade (axe)', async () => {
    await render(<Example defaultOpen />);
    await expect.element(page.getByRole('dialog', { name: 'Entrar' })).toBeInTheDocument();
    await expectNoA11yViolations(document.body);
  });
});
