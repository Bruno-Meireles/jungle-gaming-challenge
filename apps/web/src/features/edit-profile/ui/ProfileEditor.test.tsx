import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';

import { worker } from '../../../mocks/browser';
import { mountAccount, seedSession, type Locale } from '../../../test-support/account';
import { ProfileEditor } from './ProfileEditor';

const TEXT = {
  'pt-BR': {
    displayName: 'Nome de exibição', username: 'Nome de usuário', email: 'E-mail', current: 'Senha atual',
    next: 'Nova senha', confirm: 'Confirmar nova senha', save: 'Salvar', change: 'Alterar',
    required: 'Campo obrigatório', invalidEmail: 'Informe um e-mail válido', mismatch: 'As senhas não coincidem',
    emailTaken: 'Este e-mail já está em uso', wrongCurrent: 'Senha atual incorreta',
    network: 'Não foi possível conectar. Verifique sua conexão.', retry: 'Tentar novamente', saved: 'Perfil atualizado',
    avatarType: 'Use uma imagem PNG, JPEG ou WebP',
  },
  en: {
    displayName: 'Display name', username: 'Username', email: 'Email', current: 'Current password',
    next: 'New password', confirm: 'Confirm new password', save: 'Save', change: 'Change',
    required: 'This field is required', invalidEmail: 'Enter a valid email address', mismatch: 'Passwords do not match',
    emailTaken: 'This email is already in use', wrongCurrent: 'Incorrect current password',
    network: 'Could not connect. Check your connection.', retry: 'Try again', saved: 'Profile updated',
    avatarType: 'Use a PNG, JPEG or WebP image',
  },
} as const;

const slow = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe.each(['pt-BR', 'en'] as const)('ProfileEditor (%s)', (locale: Locale) => {
  const t = TEXT[locale];
  const field = (name: string) => page.getByLabelText(name, { exact: true });
  const save = () => page.getByRole('button', { name: t.save, exact: true });

  beforeEach(() => seedSession('ana'));

  it('carrega o perfil de Ana nos campos', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await expect.element(field(t.displayName)).toHaveValue('Ana Souza');
    await expect.element(field(t.username)).toHaveValue('ana');
    await expect.element(field(t.email)).toHaveValue('ana@example.test');
  });

  it('mostra skeleton aria-busy enquanto carrega', async () => {
    worker.use(
      http.get('*/api/account/profile', async () => {
        await slow(400);
        return HttpResponse.json({ code: 'internal_error' }, { status: 500 });
      }),
    );
    await mountAccount(locale, <ProfileEditor />);
    await expect.element(page.getByTestId('profile-form-skeleton')).toHaveAttribute('aria-busy', 'true');
  });

  it('erro de consulta oferece Tentar novamente que recarrega', async () => {
    let fail = true;
    worker.use(http.get('*/api/account/profile', () => (fail ? HttpResponse.json({ code: 'internal_error' }, { status: 500 }) : undefined)));
    await mountAccount(locale, <ProfileEditor />);
    const retry = page.getByRole('button', { name: t.retry, exact: true });
    await expect.element(retry).toBeVisible();
    fail = false;
    await retry.click();
    await expect.element(field(t.displayName)).toHaveValue('Ana Souza');
  });

  it('validacao no submit: erro associado, aria-invalid e foco no primeiro invalido', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await field(t.displayName).fill('');
    await field(t.email).fill('x');
    await save().click();
    await expect.element(field(t.displayName)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(field(t.displayName)).toHaveFocus();
    await expect.element(page.getByText(t.required)).toBeVisible();
    await expect.element(page.getByText(t.invalidEmail)).toBeVisible();
    await expect.element(field(t.email)).toHaveAttribute('aria-describedby');
  });

  it('senhas divergentes mostram erro apenas no cliente', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await field(t.current).fill('JungleDemo-Ana-2026!');
    await field(t.next).fill('NovaSenha-2026');
    await field(t.confirm).fill('Outra-2026-xx');
    await save().click();
    await expect.element(page.getByText(t.mismatch)).toBeVisible();
  });

  it('salva e anuncia sucesso em regiao viva', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await field(t.displayName).fill('Ana Maria');
    await save().click();
    await expect.element(page.getByRole('status')).toHaveTextContent(t.saved);
    await expect.element(field(t.displayName)).toHaveValue('Ana Maria');
  });

  it('conflito de e-mail aparece no campo', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await field(t.email).fill('bruno@example.test');
    await save().click();
    await expect.element(page.getByText(t.emailTaken)).toBeVisible();
    await expect.element(field(t.email)).toHaveAttribute('aria-invalid', 'true');
  });

  it('senha atual errada marca o campo senha atual', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await field(t.current).fill('errada-12345');
    await field(t.next).fill('NovaSenha-2026');
    await field(t.confirm).fill('NovaSenha-2026');
    await save().click();
    await expect.element(page.getByText(t.wrongCurrent)).toBeVisible();
    await expect.element(field(t.current)).toHaveAttribute('aria-invalid', 'true');
  });

  it('falha de rede mostra alerta e mantem os valores digitados', async () => {
    worker.use(http.put('*/api/account/profile', () => HttpResponse.error()));
    await mountAccount(locale, <ProfileEditor />);
    await field(t.displayName).fill('Ana Maria');
    await save().click();
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.network);
    await expect.element(field(t.displayName)).toHaveValue('Ana Maria');
  });

  it('sessao expirada navega para /login?redirect=', async () => {
    worker.use(http.put('*/api/account/profile', () => HttpResponse.json({ code: 'session_invalid' }, { status: 401 })));
    const { router } = await mountAccount(locale, <ProfileEditor />);
    await save().click();
    await expect.poll(() => router.state.location.pathname).toBe('/login');
    expect(router.state.location.href).toContain('redirect=');
  });

  it('enviando desabilita o Salvar (sem duplo submit)', async () => {
    worker.use(
      http.put('*/api/account/profile', async () => {
        await slow(500);
        return HttpResponse.json({ code: 'internal_error' }, { status: 500 });
      }),
    );
    await mountAccount(locale, <ProfileEditor />);
    await save().click();
    await expect.element(save()).toHaveAttribute('aria-disabled', 'true');
  });

  it('avatar: input aceita png/jpeg/webp e rejeita tipo invalido com mensagem', async () => {
    await mountAccount(locale, <ProfileEditor />);
    await expect.element(page.getByRole('button', { name: t.change, exact: true })).toBeVisible();
    const input = page.getByTestId('avatar-input');
    await expect.element(input).toHaveAttribute('accept', 'image/png,image/jpeg,image/webp');
    await input.upload(new File(['x'], 'a.gif', { type: 'image/gif' }));
    await expect.element(page.getByText(t.avatarType)).toBeVisible();
  });
});
