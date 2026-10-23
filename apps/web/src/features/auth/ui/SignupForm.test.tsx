import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../app/styles.css';
import { createI18n } from '../../../app/i18n/init';
import { resources } from '../../../app/i18n/resources';
import { SignupForm } from './SignupForm';

type Props = Parameters<typeof SignupForm>[0];
type Failure = Props['failure'];

/*
 * Textos esperados por idioma. pt-BR dos rotulos segue o Figma (9:1022 / 16:1228); en e as mensagens
 * de erro sao decisao deste teste (o Figma nao as define) e valem como contrato de i18n.
 */
const TEXT = {
  'pt-BR': {
    username: 'Nome de usuário',
    email: 'E-mail',
    password: 'Senha',
    confirm: 'Confirmar senha',
    submit: 'Criar conta',
    show: 'Mostrar senha',
    required: 'Campo obrigatório',
    mismatch: 'As senhas não coincidem',
    emailTaken: 'Este e-mail já está em uso',
    usernameTaken: 'Este nome de usuário já está em uso',
    conflict: 'Não foi possível criar a conta com esses dados',
    network: 'Não foi possível conectar. Verifique sua conexão.',
    retry: 'Tentar novamente',
    unexpected: 'Algo deu errado. Tente novamente mais tarde.',
  },
  en: {
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirm: 'Confirm password',
    submit: 'Create account',
    show: 'Show password',
    required: 'This field is required',
    mismatch: 'Passwords do not match',
    emailTaken: 'This email is already in use',
    usernameTaken: 'This username is already taken',
    conflict: 'We could not create the account with these details',
    network: 'Could not connect. Check your connection.',
    retry: 'Try again',
    unexpected: 'Something went wrong. Please try again later.',
  },
} as const;

type Locale = keyof typeof TEXT;

const baseProps: Props = { onSubmit: () => {}, pending: false, failure: null };

/** Host controla `failure`: se `failOnSubmit`, o submit leva o pai a reportar essa falha (como o hook faria). */
function Host({ props, failOnSubmit }: { props: Partial<Props>; failOnSubmit?: Failure }) {
  const [failure, setFailure] = useState<Failure>(props.failure ?? null);
  return (
    <SignupForm
      {...baseProps}
      {...props}
      failure={failure}
      onSubmit={(values) => {
        props.onSubmit?.(values);
        if (failOnSubmit) setFailure(failOnSubmit);
      }}
    />
  );
}

async function renderSignup(locale: Locale, props: Partial<Props> = {}, failOnSubmit?: Failure) {
  const rootRoute = createRootRoute({ component: () => <Host props={props} failOnSubmit={failOnSubmit} /> });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path });
  const router = createRouter({
    routeTree: rootRoute.addChildren([stub('/'), stub('/login')]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  const i18n = createI18n({ resources, locale });
  return render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
}

const describedText = (el: Element) =>
  (el.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .map((id) => document.getElementById(id)?.textContent ?? '')
    .join(' ');

const VALUES = {
  username: 'ana',
  email: 'ana@example.test',
  password: 'JungleDemo-Ana-2026!',
  confirmPassword: 'JungleDemo-Ana-2026!',
};

describe.each(['pt-BR', 'en'] as const)('SignupForm (%s)', (locale) => {
  const t = TEXT[locale];
  const username = () => page.getByLabelText(t.username, { exact: true });
  const email = () => page.getByLabelText(t.email, { exact: true });
  const password = () => page.getByLabelText(t.password, { exact: true });
  const confirm = () => page.getByLabelText(t.confirm, { exact: true });
  const submit = () => page.getByRole('button', { name: t.submit, exact: true });
  const fillAll = async () => {
    await username().fill(VALUES.username);
    await email().fill(VALUES.email);
    await password().fill(VALUES.password);
    await confirm().fill(VALUES.confirmPassword);
  };

  it('associa label a cada campo e define autocomplete', async () => {
    await renderSignup(locale);
    await expect.element(username()).toHaveAttribute('autocomplete', 'username');
    await expect.element(email()).toHaveAttribute('autocomplete', 'email');
    await expect.element(email()).toHaveAttribute('type', 'email');
    await expect.element(password()).toHaveAttribute('autocomplete', 'new-password');
    await expect.element(confirm()).toHaveAttribute('autocomplete', 'new-password');
  });

  it('submit chama onSubmit com os quatro valores digitados', async () => {
    const onSubmit = vi.fn();
    await renderSignup(locale, { onSubmit });
    await fillAll();
    await submit().click();
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(VALUES);
  });

  it('pending desabilita o botao, marca aria-busy e impede novo submit por Enter', async () => {
    const onSubmit = vi.fn();
    await renderSignup(locale, { onSubmit, pending: true });
    await expect.element(submit()).toBeDisabled();
    await expect.element(submit()).toHaveAttribute('aria-busy', 'true');
    await fillAll();
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fieldErrors mostra mensagem traduzida com aria-invalid e aria-describedby', async () => {
    await renderSignup(locale, { fieldErrors: { username: 'required', confirmPassword: 'password_mismatch' } });
    await expect.element(username()).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(username().element())).toContain(t.required);
    await expect.element(confirm()).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(confirm().element())).toContain(t.mismatch);
    await expect.element(email()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('account_conflict em email marca so o campo e-mail', async () => {
    await renderSignup(locale, { failure: { kind: 'account_conflict', fields: ['email'] } });
    await expect.element(email()).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(email().element())).toContain(t.emailTaken);
    await expect.element(username()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('account_conflict em username marca so o campo nome de usuario', async () => {
    await renderSignup(locale, { failure: { kind: 'account_conflict', fields: ['username'] } });
    await expect.element(username()).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(username().element())).toContain(t.usernameTaken);
    await expect.element(email()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('account_conflict sem campos mostra alerta generico sem marcar campos', async () => {
    await renderSignup(locale, { failure: { kind: 'account_conflict', fields: [] } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.conflict);
    await expect.element(email()).not.toHaveAttribute('aria-invalid', 'true');
    await expect.element(username()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('unexpected mostra alerta generico', async () => {
    await renderSignup(locale, { failure: { kind: 'unexpected' } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.unexpected);
  });

  it('network mostra alerta com Tentar novamente, que chama onRetry e mantem os valores digitados', async () => {
    const onRetry = vi.fn();
    await renderSignup(locale, { onRetry }, { kind: 'network', retryable: true });
    await fillAll();
    await submit().click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(t.network);
    await expect.element(username()).toHaveValue(VALUES.username);
    await expect.element(email()).toHaveValue(VALUES.email);
    await expect.element(password()).toHaveValue(VALUES.password);
    await expect.element(confirm()).toHaveValue(VALUES.confirmPassword);

    await page.getByRole('button', { name: t.retry, exact: true }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('cada campo de senha tem seu proprio botao de alternar com aria-pressed', async () => {
    await renderSignup(locale);
    const toggles = page.getByRole('button', { name: t.show, exact: true });
    await expect.element(toggles.first()).toHaveAttribute('aria-pressed', 'false');
    await toggles.first().click();
    await expect.element(password()).toHaveAttribute('type', 'text');
    await expect.element(confirm()).toHaveAttribute('type', 'password');
  });
});
