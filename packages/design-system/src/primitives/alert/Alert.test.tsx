import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Alert } from './Alert';

/*
 * Alert e derivado (Q10/Q18): o Figma nao tem nos de alerta; o comportamento vem do plano (C22)
 * e as cores dos tokens existentes (error, success, primary). Sem medida do Figma a testar.
 */
describe('Alert', () => {
  it('tom error usa role=alert (assertivo)', async () => {
    await render(<Alert tone="error">Pagamento recusado</Alert>);
    await expect.element(page.getByRole('alert').getByText('Pagamento recusado')).toBeVisible();
  });

  it('tons info e success usam role=status (polido)', async () => {
    await render(
      <>
        <Alert tone="info">Frete calculado</Alert>
        <Alert tone="success">Pedido criado</Alert>
      </>,
    );
    await expect.element(page.getByRole('status').first().getByText('Frete calculado')).toBeVisible();
    await expect.element(page.getByRole('status').nth(1).getByText('Pedido criado')).toBeVisible();
    expect(page.getByRole('alert').elements()).toHaveLength(0);
  });

  it('title e children aparecem e o slot action e focavel por teclado', async () => {
    let clicked = 0;
    await render(
      <Alert
        tone="error"
        title="Falha na rede"
        action={
          <button type="button" onClick={() => clicked++}>
            Tentar de novo
          </button>
        }
      >
        Nao foi possivel salvar
      </Alert>,
    );
    await expect.element(page.getByText('Falha na rede')).toBeVisible();
    await expect.element(page.getByText('Nao foi possivel salvar')).toBeVisible();
    await userEvent.tab();
    const action = page.getByRole('button', { name: 'Tentar de novo' });
    await expect.element(action).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(clicked).toBe(1);
  });

  it('o tom nao depende so da cor: rotulo textual para leitor de tela e icone proprio por tom', async () => {
    await render(
      <>
        <Alert tone="error">a</Alert>
        <Alert tone="info">b</Alert>
        <Alert tone="success">c</Alert>
      </>,
    );
    await expect.element(page.getByText('Erro', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('Informação', { exact: true })).toBeInTheDocument();
    await expect.element(page.getByText('Sucesso', { exact: true })).toBeInTheDocument();
    const svgs = Array.from(document.querySelectorAll('svg'));
    expect(svgs).toHaveLength(3);
    expect(new Set(svgs.map((s) => s.innerHTML)).size).toBe(3);
    for (const svg of svgs) {
      expect(svg.getAttribute('aria-hidden')).toBe('true');
    }
  });

  it('tom error tem contorno de 1px na cor --color-error', async () => {
    await render(<Alert tone="error">Falha</Alert>);
    const cs = getComputedStyle(page.getByRole('alert').element());
    expect(cs.borderTopWidth).toBe('1px');
    expect(cs.borderTopColor).toBe('rgb(237, 27, 46)');
  });

  it.each(['error', 'info', 'success'] as const)(
    'tom %s nao tem violacoes de acessibilidade (axe)',
    async (tone) => {
      const { container } = await render(
        <Alert tone={tone} title="Titulo" action={<button type="button">Acao</button>}>
          Mensagem
        </Alert>,
      );
      await expect.element(page.getByText('Mensagem')).toBeVisible();
      await expectNoA11yViolations(container);
    },
  );
});
