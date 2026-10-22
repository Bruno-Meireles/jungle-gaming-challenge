import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { Input } from './Input';

/* Cores esperadas (tokens.css): input-border = secondary #B39463; erro #ED1B2E; disabled-bg = border-soft #55321F. */
const ERROR = 'rgb(237, 27, 46)';

const root = (el: Element) => el.closest('[data-slot="input"]') as HTMLElement;

describe('Input - comportamento', () => {
  it('renderiza um textbox com nome acessivel via label htmlFor', async () => {
    await render(
      <>
        <label htmlFor="email">E-mail</label>
        <Input id="email" placeholder="contato@email.com" />
      </>,
    );
    await expect.element(page.getByRole('textbox', { name: 'E-mail' })).toBeInTheDocument();
  });

  it('aria-invalid="true" troca a borda para a cor de erro', async () => {
    await render(<Input aria-label="E-mail" aria-invalid="true" />);
    const el = page.getByRole('textbox', { name: 'E-mail' });
    await expect.element(el).toBeInTheDocument();
    expect(getComputedStyle(root(el.element())).borderTopColor).toBe(ERROR);
  });

  it('startSlot e decorativo, nao focavel, e o input mantem o nome acessivel', async () => {
    await render(
      <Input aria-label="Buscar" startSlot={<svg data-testid="icon" width="14" height="14" />} />,
    );
    const icon = page.getByTestId('icon').element();
    expect(icon.closest('[aria-hidden="true"]')).not.toBeNull();
    expect(icon.closest('[tabindex]')).toBeNull();
    await expect.element(page.getByRole('textbox', { name: 'Buscar' })).toBeInTheDocument();
  });

  it('endSlot e renderizado ao lado do input', async () => {
    await render(<Input aria-label="Valor" endSlot={<span data-testid="end">ETH</span>} />);
    await expect.element(page.getByTestId('end')).toBeInTheDocument();
    await expect.element(page.getByRole('textbox', { name: 'Valor' })).toBeInTheDocument();
  });

  it('disabled desabilita o input e usa o fundo desabilitado', async () => {
    await render(<Input aria-label="Nome" disabled />);
    const el = page.getByRole('textbox', { name: 'Nome' });
    await expect.element(el).toBeDisabled();
    expect(getComputedStyle(root(el.element())).backgroundColor).toBe('rgb(85, 50, 31)');
  });
});
