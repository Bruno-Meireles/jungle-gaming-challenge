import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { VisuallyHidden } from './VisuallyHidden';

const getHidden = () => page.getByText('somente leitor de tela').element() as HTMLElement;

describe('VisuallyHidden', () => {
  it('permanece na arvore acessivel (encontravel por texto, sem display:none/visibility:hidden)', async () => {
    await render(<VisuallyHidden>somente leitor de tela</VisuallyHidden>);
    await expect.element(page.getByText('somente leitor de tela')).toBeInTheDocument();
    const style = getComputedStyle(getHidden());
    expect(style.display).not.toBe('none');
    expect(style.visibility).toBe('visible');
  });

  it('ocupa caixa de 1x1 px', async () => {
    await render(<VisuallyHidden>somente leitor de tela</VisuallyHidden>);
    const rect = getHidden().getBoundingClientRect();
    expect(rect.width).toBe(1);
    expect(rect.height).toBe(1);
  });

  it('e posicionado de forma absoluta, recortado e sem overflow visivel', async () => {
    await render(<VisuallyHidden>somente leitor de tela</VisuallyHidden>);
    const style = getComputedStyle(getHidden());
    expect(style.position).toBe('absolute');
    expect(style.overflow).toBe('hidden');
    expect(style.clip !== 'auto' || style.clipPath !== 'none').toBe(true);
  });
});
