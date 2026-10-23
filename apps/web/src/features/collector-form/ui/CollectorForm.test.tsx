import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';

import { renderCheckoutUi } from '../../../test-support/render-checkout';
import { CollectorForm } from './CollectorForm';

type Props = Parameters<typeof CollectorForm>[0];

const empty = { displayName: '', email: '', username: '', profileName: '', referralCode: '', ensName: '', secondaryWalletOrEns: '', note: '' };
const base: Props = { values: empty, errors: {}, focusField: null, onChange: () => {} };

const describedText = (el: Element) =>
  (el.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

describe('CollectorForm (pt-BR, labels do Figma 11:2862)', () => {
  it('expoe um campo por label do Figma', async () => {
    await renderCheckoutUi(<CollectorForm {...base} />);
    for (const label of ['Nome de exibição', 'E-mail', 'Nome de usuário', 'Nome do perfil', 'Código de indicação', 'Nome ENS']) {
      await expect.element(page.getByLabelText(label, { exact: true })).toBeVisible();
    }
    await expect.element(page.getByLabelText(/^Observação/)).toBeVisible();
    await expect.element(page.getByLabelText(/secundária/i)).toBeVisible();
  });

  it('e-mail com type=email e autocomplete', async () => {
    await renderCheckoutUi(<CollectorForm {...base} />);
    const email = page.getByLabelText('E-mail', { exact: true });
    await expect.element(email).toHaveAttribute('type', 'email');
    await expect.element(email).toHaveAttribute('autocomplete', 'email');
  });

  it('pre-preenche com os valores recebidos', async () => {
    await renderCheckoutUi(<CollectorForm {...base} values={{ ...empty, displayName: 'Ana Souza', email: 'ana@example.com' }} />);
    await expect.element(page.getByLabelText('Nome de exibição', { exact: true })).toHaveValue('Ana Souza');
    await expect.element(page.getByLabelText('E-mail', { exact: true })).toHaveValue('ana@example.com');
  });

  it('digitar chama onChange com campo e valor', async () => {
    const onChange = vi.fn();
    await renderCheckoutUi(<CollectorForm {...base} onChange={onChange} />);
    await userEvent.type(page.getByLabelText('Nome ENS', { exact: true }), 'a');
    expect(onChange).toHaveBeenCalledWith('ensName', 'a');
  });

  it('erro fica associado ao campo por aria-describedby e aria-invalid', async () => {
    await renderCheckoutUi(<CollectorForm {...base} errors={{ email: 'invalid_email', displayName: 'required', ensName: 'invalid_ens' }} />);
    const email = page.getByLabelText('E-mail', { exact: true });
    await expect.element(email).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(email.element())).toContain('Informe um e-mail válido');
    expect(describedText(page.getByLabelText('Nome de exibição', { exact: true }).element())).toContain('Campo obrigatório');
    expect(describedText(page.getByLabelText('Nome ENS', { exact: true }).element())).not.toBe('');
    await expect.element(page.getByLabelText('Nome do perfil', { exact: true })).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('foca o campo indicado em focusField (primeiro invalido)', async () => {
    await renderCheckoutUi(<CollectorForm {...base} errors={{ username: 'required' }} focusField="username" />);
    await expect.element(page.getByLabelText('Nome de usuário', { exact: true })).toHaveFocus();
  });
});

describe('CollectorForm (en)', () => {
  it('labels e erros em ingles', async () => {
    await renderCheckoutUi(<CollectorForm {...base} errors={{ displayName: 'required' }} />, 'en');
    const field = page.getByLabelText('Display name', { exact: true });
    await expect.element(field).toBeVisible();
    expect(describedText(field.element())).toContain('This field is required');
  });
});
