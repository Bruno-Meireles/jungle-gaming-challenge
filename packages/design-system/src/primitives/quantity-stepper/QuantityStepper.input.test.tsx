import { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { QuantityStepper } from './QuantityStepper';

/*
 * Plano cart.md C4: o valor passa a ser um <input inputMode="numeric"> com nome acessivel (o mesmo `label` do grupo).
 * Commit em Enter/blur; valor invalido reverte; fora dos limites e limitado a [min, max]; ArrowUp/ArrowDown ajustam.
 * Digitar nao dispara onValueChange. O `<output>` antigo sai (testes antigos de role=status serao corrigidos no GREEN).
 */
function Harness({ max = 5, min = 1, start = 2, calls }: { max?: number; min?: number; start?: number; calls: number[] }) {
  const [value, setValue] = useState(start);
  return (
    <QuantityStepper
      label="Quantidade"
      decrementLabel="Diminuir"
      incrementLabel="Aumentar"
      value={value}
      min={min}
      max={max}
      onValueChange={(n) => {
        calls.push(n);
        setValue(n);
      }}
    />
  );
}

const field = () => page.getByRole('textbox', { name: 'Quantidade' });

describe('QuantityStepper - input editavel', () => {
  it('mostra o valor num input numerico com nome acessivel', async () => {
    await render(<Harness calls={[]} start={3} />);
    await expect.element(field()).toHaveValue('3');
    expect(field().element().getAttribute('inputmode')).toBe('numeric');
  });

  it('digitar nao confirma; Enter confirma o novo valor', async () => {
    const calls: number[] = [];
    await render(<Harness calls={calls} />);
    await field().fill('4');
    expect(calls).toEqual([]);
    await userEvent.keyboard('{Enter}');
    expect(calls).toEqual([4]);
    await expect.element(field()).toHaveValue('4');
  });

  it('blur confirma o valor digitado', async () => {
    const calls: number[] = [];
    await render(<Harness calls={calls} />);
    await field().fill('3');
    await userEvent.tab();
    expect(calls).toEqual([3]);
  });

  it('acima do maximo e limitado ao maximo e o campo mostra o valor limitado', async () => {
    const calls: number[] = [];
    await render(<Harness calls={calls} max={5} />);
    await field().fill('99');
    await userEvent.keyboard('{Enter}');
    expect(calls).toEqual([5]);
    await expect.element(field()).toHaveValue('5');
  });

  it('abaixo do minimo e limitado ao minimo', async () => {
    const calls: number[] = [];
    await render(<Harness calls={calls} min={1} start={3} />);
    await field().fill('0');
    await userEvent.keyboard('{Enter}');
    expect(calls).toEqual([1]);
    await expect.element(field()).toHaveValue('1');
  });

  it.each(['abc', '', '1.5', '-2'])('entrada invalida (%j) reverte ao valor anterior sem confirmar', async (raw) => {
    const calls: number[] = [];
    await render(<Harness calls={calls} start={2} />);
    await field().fill(raw);
    await userEvent.keyboard('{Enter}');
    expect(calls).toEqual([]);
    await expect.element(field()).toHaveValue('2');
  });

  it('ArrowUp e ArrowDown no campo aumentam e diminuem em 1, respeitando os limites', async () => {
    const calls: number[] = [];
    await render(<Harness calls={calls} min={1} max={3} start={2} />);
    await field().click();
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{ArrowDown}');
    expect(calls).toEqual([3, 2]);
    await expect.element(field()).toHaveValue('2');
  });

  it('os botoes continuam funcionando com o campo', async () => {
    const calls: number[] = [];
    await render(<Harness calls={calls} start={2} />);
    await page.getByRole('button', { name: 'Aumentar' }).click();
    await expect.element(field()).toHaveValue('3');
    expect(calls).toEqual([3]);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(<Harness calls={[]} />);
    await expect.element(field()).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});
