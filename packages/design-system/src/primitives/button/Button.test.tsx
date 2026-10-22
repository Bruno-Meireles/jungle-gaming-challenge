import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { Button } from './Button';

/* Cores dos tokens (docs/design-tokens.md): --color-primary-hover = --color-primary-light #DD9A5F. */
const PRIMARY_HOVER = 'rgb(221, 154, 95)';

describe('Button - comportamento', () => {
  it('renderiza um <button type="button"> com nome acessivel', async () => {
    await render(<Button>Salvar</Button>);
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toBeInTheDocument();
    expect(button.element().tagName).toBe('BUTTON');
    await expect.element(button).toHaveAttribute('type', 'button');
    await expect.element(button).toHaveAttribute('data-slot', 'button');
  });

  it('disabled nao dispara onClick e expoe o atributo', async () => {
    const onClick = vi.fn();
    await render(
      <Button disabled onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
    await expect.element(button).toHaveAttribute('disabled');
  });

  it('loading expoe aria-busy, fica desabilitado e preserva o nome acessivel', async () => {
    const onClick = vi.fn();
    await render(
      <Button loading onClick={onClick}>
        Salvar
      </Button>,
    );
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toHaveAttribute('aria-busy', 'true');
    await expect.element(button).toBeDisabled();
    await button.click({ force: true });
    expect(onClick).not.toHaveBeenCalled();
  });

  it('asChild renderiza o filho (<a>) com as mesmas classes do botao', async () => {
    await render(
      <>
        <Button>Botao</Button>
        <Button asChild>
          <a href="/carrinho">Carrinho</a>
        </Button>
      </>,
    );
    const link = page.getByRole('link', { name: 'Carrinho' });
    await expect.element(link).toBeInTheDocument();
    expect(link.element().tagName).toBe('A');
    await expect.element(link).toHaveAttribute('href', '/carrinho');
    await expect.element(link).toHaveAttribute('data-slot', 'button');
    expect(link.element().className).toBe(page.getByRole('button', { name: 'Botao' }).element().className);
  });

  it('hover no primary troca o fundo para --color-primary-hover', async () => {
    await render(<Button>Salvar</Button>);
    const button = page.getByRole('button', { name: 'Salvar' });
    await expect.element(button).toBeInTheDocument();
    await userEvent.hover(button);
    await expect.poll(() => getComputedStyle(button.element()).backgroundColor).toBe(PRIMARY_HOVER);
  });
});
