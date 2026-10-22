import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Input } from '../../primitives/input';
import { FormField } from './FormField';

/* text-coral = --color-text-coral #F0805F (tokens.css). */
const CORAL = 'rgb(240, 128, 95)';

describe('FormField - comportamento', () => {
  it('gera id e liga o label ao controle', async () => {
    await render(
      <FormField label="E-mail">
        <Input />
      </FormField>,
    );
    const input = page.getByLabelText('E-mail');
    await expect.element(input).toBeInTheDocument();
    expect(input.element().id).not.toBe('');
  });

  it('dois FormField geram ids distintos', async () => {
    await render(
      <>
        <FormField label="Nome">
          <Input />
        </FormField>
        <FormField label="Sobrenome">
          <Input />
        </FormField>
      </>,
    );
    const a = page.getByLabelText('Nome').element().id;
    const b = page.getByLabelText('Sobrenome').element().id;
    expect(a).not.toBe('');
    expect(a).not.toBe(b);
  });

  it('hint e associado ao controle via aria-describedby', async () => {
    await render(
      <FormField label="E-mail" hint="Usaremos para contato">
        <Input />
      </FormField>,
    );
    await expect
      .element(page.getByRole('textbox', { name: 'E-mail' }))
      .toHaveAccessibleDescription('Usaremos para contato');
  });

  it('sem error o controle nao e invalido', async () => {
    await render(
      <FormField label="E-mail" hint="dica">
        <Input />
      </FormField>,
    );
    await expect.element(page.getByLabelText('E-mail')).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('error marca aria-invalid e liga a mensagem ao controle', async () => {
    await render(
      <FormField label="E-mail" error="E-mail invalido">
        <Input />
      </FormField>,
    );
    const input = page.getByLabelText('E-mail');
    await expect.element(input).toHaveAttribute('aria-invalid', 'true');
    await expect.element(input).toHaveAccessibleDescription('E-mail invalido');
  });

  it('hint e error juntos aparecem na descricao, mantendo aria-describedby do filho', async () => {
    await render(
      <>
        <span id="extra">Extra</span>
        <FormField label="E-mail" hint="Dica" error="Erro">
          <Input aria-describedby="extra" />
        </FormField>
      </>,
    );
    const desc = page.getByLabelText('E-mail').element().getAttribute('aria-describedby') ?? '';
    expect(desc.split(' ')).toHaveLength(3);
    await expect.element(page.getByLabelText('E-mail')).toHaveAccessibleDescription('Extra Dica Erro');
  });

  it('role=alert so aparece quando o erro muda depois da montagem', async () => {
    const view = await render(
      <FormField label="E-mail" error="Erro inicial">
        <Input />
      </FormField>,
    );
    expect(document.querySelector('[role="alert"]')).toBeNull();
    await view.rerender(
      <FormField label="E-mail" error="Erro novo">
        <Input />
      </FormField>,
    );
    await expect.element(page.getByRole('alert')).toHaveTextContent('Erro novo');
  });

  it('erro que surge depois da montagem e anunciado como alert', async () => {
    const view = await render(
      <FormField label="E-mail">
        <Input />
      </FormField>,
    );
    expect(document.querySelector('[role="alert"]')).toBeNull();
    await view.rerender(
      <FormField label="E-mail" error="Obrigatorio">
        <Input />
      </FormField>,
    );
    await expect.element(page.getByRole('alert')).toHaveTextContent('Obrigatorio');
  });
});

describe('FormField - medida', () => {
  it('texto de erro usa text-coral', async () => {
    await render(
      <FormField label="E-mail" error="E-mail invalido">
        <Input />
      </FormField>,
    );
    const msg = page.getByText('E-mail invalido').element();
    expect(getComputedStyle(msg).color).toBe(CORAL);
  });

  it('required mostra o asterisco coral e marca o controle como obrigatorio', async () => {
    await render(
      <FormField label="E-mail" required>
        <Input />
      </FormField>,
    );
    await expect.element(page.getByRole('textbox', { name: 'E-mail' })).toBeRequired();
    const star = document.querySelector('[data-slot="label-required"]') as HTMLElement;
    expect(getComputedStyle(star).color).toBe(CORAL);
  });
});

describe('FormField - acessibilidade', () => {
  it('axe sem violacoes com erro, hint e required', async () => {
    const { container } = await render(
      <FormField label="E-mail" required hint="Dica" error="E-mail invalido">
        <Input />
      </FormField>,
    );
    await expectNoA11yViolations(container);
  });
});
