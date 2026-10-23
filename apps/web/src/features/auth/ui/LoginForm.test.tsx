import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import { describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../app/styles.css';
import { createI18n } from '../../../app/i18n/init';
import { resources } from '../../../app/i18n/resources';
import { LoginForm } from './LoginForm';

type Props = Parameters<typeof LoginForm>[0];
type Failure = Props['failure'];

/*
 * Textos esperados por idioma. pt-BR segue o Figma (9:115 / 16:1022); en e as mensagens de erro e de
 * login social indisponivel sao decisao deste teste (o Figma nao as define) e valem como contrato de i18n.
 */
const TEXT = {
  'pt-BR': {
    email: 'E-mail',
    password: 'Senha',
    submit: 'Entrar',
    forgot: 'Esqueceu a senha?',
    or: 'Ou continue com',
    socialNote: 'Login social indisponível nesta demonstração',
    show: 'Mostrar senha',
    hide: 'Ocultar senha',
    required: 'Campo obrigatório',
    invalidEmail: 'Informe um e-mail válido',
    invalidCredentials: 'E-mail ou senha incorretos',
    network: 'Não foi possível conectar. Verifique sua conexão.',
    retry: 'Tentar novamente',
    unexpected: 'Algo deu errado. Tente novamente mais tarde.',
  },
  en: {
    email: 'Email',
    password: 'Password',
    submit: 'Sign in',
    forgot: 'Forgot password?',
    or: 'Or continue with',
    socialNote: 'Social sign-in is unavailable in this demo',
    show: 'Show password',
    hide: 'Hide password',
    required: 'This field is required',
    invalidEmail: 'Enter a valid email address',
    invalidCredentials: 'Incorrect email or password',
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
    <LoginForm
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

async function renderLogin(locale: Locale, props: Partial<Props> = {}, failOnSubmit?: Failure) {
  const rootRoute = createRootRoute({ component: () => <Host props={props} failOnSubmit={failOnSubmit} /> });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path });
  const router = createRouter({
    routeTree: rootRoute.addChildren([stub('/'), stub('/unavailable'), stub('/signup')]),
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

describe.each(['pt-BR', 'en'] as const)('LoginForm (%s)', (locale) => {
  const t = TEXT[locale];
  const email = () => page.getByLabelText(t.email, { exact: true });
  const password = () => page.getByLabelText(t.password, { exact: true });
  const submit = () => page.getByRole('button', { name: t.submit, exact: true });

  it('associa label a cada campo e define autocomplete', async () => {
    await renderLogin(locale);
    await expect.element(email()).toHaveAttribute('autocomplete', 'email');
    await expect.element(email()).toHaveAttribute('type', 'email');
    await expect.element(password()).toHaveAttribute('autocomplete', 'current-password');
    await expect.element(password()).toHaveAttribute('type', 'password');
  });

  it('link de recuperacao de senha aponta para /unavailable?feature=forgot-password', async () => {
    await renderLogin(locale);
    await expect
      .element(page.getByRole('link', { name: t.forgot }))
      .toHaveAttribute('href', '/unavailable?feature=forgot-password');
  });

  it('login social: Google e Facebook com aria-disabled e texto explicativo associado', async () => {
    await renderLogin(locale);
    await expect.element(page.getByText(t.or)).toBeVisible();
    for (const name of ['Google', 'Facebook']) {
      const button = page.getByRole('button', { name, exact: true });
      await expect.element(button).toHaveAttribute('aria-disabled', 'true');
      expect(describedText(button.element())).toContain(t.socialNote);
    }
  });

  it('login social nao dispara o submit do formulario', async () => {
    const onSubmit = vi.fn();
    await renderLogin(locale, { onSubmit });
    await page.getByRole('button', { name: 'Google', exact: true }).click({ force: true });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submit chama onSubmit com e-mail e senha digitados', async () => {
    const onSubmit = vi.fn();
    await renderLogin(locale, { onSubmit });
    await email().fill('ana@example.test');
    await password().fill('JungleDemo-Ana-2026!');
    await submit().click();
    expect(onSubmit).toHaveBeenCalledExactlyOnceWith({ email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' });
  });

  it('pending desabilita o botao, marca aria-busy e impede novo submit por Enter', async () => {
    const onSubmit = vi.fn();
    await renderLogin(locale, { onSubmit, pending: true });
    await expect.element(submit()).toBeDisabled();
    await expect.element(submit()).toHaveAttribute('aria-busy', 'true');
    await email().fill('ana@example.test');
    await password().fill('x');
    await userEvent.keyboard('{Enter}');
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('fieldErrors mostra mensagem traduzida com aria-invalid e aria-describedby', async () => {
    await renderLogin(locale, { fieldErrors: { email: 'invalid_email', password: 'required' } });
    await expect.element(email()).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(email().element())).toContain(t.invalidEmail);
    await expect.element(password()).toHaveAttribute('aria-invalid', 'true');
    expect(describedText(password().element())).toContain(t.required);
  });

  it('campos sem erro nao ficam aria-invalid', async () => {
    await renderLogin(locale, { fieldErrors: { email: 'required' } });
    await expect.element(password()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('invalid_credentials mostra um alerta generico sem marcar campos', async () => {
    await renderLogin(locale, { failure: { kind: 'invalid_credentials' } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.invalidCredentials);
    await expect.element(email()).not.toHaveAttribute('aria-invalid', 'true');
    await expect.element(password()).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('unexpected mostra alerta generico', async () => {
    await renderLogin(locale, { failure: { kind: 'unexpected' } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.unexpected);
  });

  it('network mostra alerta com Tentar novamente, que chama onRetry e mantem os valores digitados', async () => {
    const onRetry = vi.fn();
    await renderLogin(locale, { onRetry }, { kind: 'network', retryable: true });
    await email().fill('ana@example.test');
    await password().fill('JungleDemo-Ana-2026!');
    await submit().click();

    await expect.element(page.getByRole('alert')).toHaveTextContent(t.network);
    await expect.element(email()).toHaveValue('ana@example.test');
    await expect.element(password()).toHaveValue('JungleDemo-Ana-2026!');

    await page.getByRole('button', { name: t.retry, exact: true }).click();
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('alternar senha: botao com aria-pressed muda o tipo do campo e o nome', async () => {
    await renderLogin(locale);
    const show = page.getByRole('button', { name: t.show, exact: true });
    await expect.element(show).toHaveAttribute('aria-pressed', 'false');
    await show.click();
    await expect.element(password()).toHaveAttribute('type', 'text');
    await expect.element(page.getByRole('button', { name: t.hide, exact: true })).toHaveAttribute('aria-pressed', 'true');
  });
});
