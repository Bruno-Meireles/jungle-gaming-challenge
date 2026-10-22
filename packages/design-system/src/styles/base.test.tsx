import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../test/entry.css';

describe('estilos base do design system', () => {
  it('body usa ink como cor de fundo', () => {
    expect(getComputedStyle(document.body).backgroundColor).toBe('rgb(20, 13, 10)'); // #140D0A
  });

  it('body usa foreground como cor do texto', () => {
    expect(getComputedStyle(document.body).color).toBe('rgb(245, 241, 235)'); // #F5F1EB
  });

  // Guarda: passa ja no RED porque o preflight do Tailwind aplica --font-sans (Roboto Mono) ao html.
  it('body usa Roboto Mono como fonte', () => {
    expect(getComputedStyle(document.body).fontFamily.startsWith('"Roboto Mono"')).toBe(true);
  });

  describe('foco visivel', () => {
    const expectFocusOutline = (el: Element) => {
      const style = getComputedStyle(el);
      expect(style.outlineStyle).toBe('solid');
      expect(style.outlineWidth).toBe('2px');
      expect(style.outlineColor).toBe('rgb(210, 138, 76)'); // #D28A4C (--color-focus -> primary)
      expect(style.outlineOffset).toBe('2px');
    };

    it('link focado por Tab tem outline solido de 2px com a cor de foco e offset 2px', async () => {
      await render(<a href="#x">link</a>);
      await userEvent.tab();
      const link = document.querySelector('a') as HTMLAnchorElement;
      expect(document.activeElement).toBe(link);
      expectFocusOutline(link);
    });

    // Guarda: :focus-visible nao dispara por mouse; pode passar ja no RED.
    it('link focado por clique de mouse nao exibe outline', async () => {
      await render(<a href="#x">link</a>);
      const link = document.querySelector('a') as HTMLAnchorElement;
      await userEvent.click(link);
      expect(document.activeElement).toBe(link);
      expect(link.matches(':focus-visible')).toBe(false);
      expect(getComputedStyle(link).outlineStyle).toBe('none');
    });

    it.each([
      ['button', <button key="b">ok</button>],
      ['input', <input key="i" aria-label="campo" />],
      ['[tabindex="0"]', <div key="t" tabIndex={0}>foco</div>],
    ])('%s focado por Tab tem o mesmo outline de foco', async (_nome, ui) => {
      await render(ui);
      await userEvent.tab();
      expect(document.activeElement).not.toBe(document.body);
      expectFocusOutline(document.activeElement as Element);
    });
  });
});
