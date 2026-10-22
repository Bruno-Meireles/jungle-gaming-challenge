import { describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import '../../test/entry.css';
import { expectNoA11yViolations } from '../../test/axe';
import { Label } from './Label';

/*
 * Medida (ADR-08) - rotulo "Nome de exibicao" do formulario de Perfil (Frame 239, file.json:107295-107600;
 * mesma estrutura repetida em file.json:239229-239500):
 *  - TEXT "Nome de exibicao" (I70522:3321;70504:3054), file.json:107312-107507: Roboto Mono (fontFamily), fontWeight 400,
 *    fontSize 15, lineHeightPx 15 (estilo TEXT 70321:341 = --text-body-15-regular-lh-15, docs/design-tokens.md:98);
 *    fill r.9608 g.9451 b.9216 = #F5F1EB = --color-foreground (estilo de fill 70323:306) = rgb(245, 241, 235).
 *  - TEXT "*" (I70522:3321;70504:3055), file.json:107507-107600: fill r.9412 g.5020 b.3725 = #F0805F =
 *    --color-text-coral (estilo 70323:305, alias --color-destructive-text) = rgb(240, 128, 95);
 *    estilo TEXT 70321:311 = --text-title-22-regular: fontSize 22, lineHeightPx 29, fontWeight 400.
 *  - Frame 239 (HORIZONTAL, counterAxisAlignItems CENTER, sem itemSpacing, file.json:107552-107553): bbox 159x29 =
 *    texto 145x15 + asterisco 14x29 lado a lado, sem espaco entre eles; altura da linha = 29 (a do asterisco).
 *
 * Decisao (plano C6 item 2: "asterisco text-coral aria-hidden + `required` no campo"): o Label NAO controla o campo.
 * `required` apenas desenha o asterisco decorativo (aria-hidden), sem alterar o nome acessivel do rotulo;
 * a obrigatoriedade semantica vai no atributo `required` do input (responsabilidade do FormField/consumidor).
 */
const FOREGROUND = 'rgb(245, 241, 235)';
const CORAL = 'rgb(240, 128, 95)';

describe('Label', () => {
  it('associa-se ao campo via htmlFor (getByLabelText encontra o input)', async () => {
    await render(
      <>
        <Label htmlFor="nome">Nome de exibição</Label>
        <input id="nome" />
      </>,
    );
    await expect.element(page.getByLabelText('Nome de exibição')).toBeInTheDocument();
    await expect.element(page.getByLabelText('Nome de exibição')).toHaveAttribute('id', 'nome');
  });

  it('required desenha um asterisco decorativo (aria-hidden, text-coral) sem mudar o nome acessivel', async () => {
    await render(
      <>
        <Label htmlFor="nome" required>
          Nome de exibição
        </Label>
        <input id="nome" required />
      </>,
    );
    const star = page.getByText('*');
    await expect.element(star).toBeInTheDocument();
    await expect.element(star).toHaveAttribute('aria-hidden', 'true');
    expect(getComputedStyle(star.element()).color).toBe(CORAL);
    // nome acessivel exato = sem o asterisco
    await expect.element(page.getByLabelText('Nome de exibição', { exact: true })).toBeInTheDocument();
  });

  it('sem required nao renderiza asterisco', async () => {
    await render(<Label htmlFor="nome">Nome de exibição</Label>);
    await expect.element(page.getByText('Nome de exibição')).toBeInTheDocument();
    await expect.element(page.getByText('*')).not.toBeInTheDocument();
  });

  it('mede fonte, peso, line-height e cor do rotulo "Nome de exibicao"', async () => {
    await render(<Label data-testid="lbl">Nome de exibição</Label>);
    await expect.element(page.getByTestId('lbl')).toBeInTheDocument();
    const cs = getComputedStyle(page.getByTestId('lbl').element());
    expect(cs.fontFamily).toContain('Roboto Mono');
    expect(cs.fontSize).toBe('15px');
    expect(cs.fontWeight).toBe('400');
    expect(cs.lineHeight).toBe('15px');
    expect(cs.color).toBe(FOREGROUND);
  });

  it('mede o asterisco: 22px / 29px / 400 e cor coral, colado ao texto', async () => {
    await render(
      <Label data-testid="lbl" required>
        Nome de exibição
      </Label>,
    );
    await expect.element(page.getByTestId('lbl')).toBeInTheDocument();
    const star = page.getByText('*').element();
    const cs = getComputedStyle(star);
    expect(cs.fontSize).toBe('22px');
    expect(cs.lineHeight).toBe('29px');
    expect(cs.fontWeight).toBe('400');
    expect(cs.color).toBe(CORAL);
    const rect = page.getByTestId('lbl').element().getBoundingClientRect();
    expect(rect.height).toBe(29);
  });

  it('nao tem violacoes de acessibilidade (axe)', async () => {
    const { container } = await render(
      <>
        <Label htmlFor="nome" required>
          Nome de exibição
        </Label>
        <input id="nome" required />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
