import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../app/styles.css';
import { createI18n } from '../../../app/i18n/init';
import { resources } from '../../../app/i18n/resources';
import { SignupPage, pageSignupLocales } from '..';

type Props = Parameters<typeof SignupPage>[0];

const TEXT = {
  'pt-BR': {
    title: 'Criar conta',
    subtitle: 'Criar perfil de colecionador',
    footer: 'Já tem uma conta?',
    link: 'Entre',
    username: 'Nome de usuário',
    email: 'E-mail',
    password: 'Senha',
    confirm: 'Confirmar senha',
    emailTaken: 'Este e-mail já está em uso',
    usernameTaken: 'Este nome de usuário já está em uso',
    network: 'Não foi possível conectar. Verifique sua conexão.',
    retry: 'Tentar novamente',
  },
  en: {
    title: 'Create account',
    subtitle: 'Create a collector profile',
    footer: 'Already have an account?',
    link: 'Sign in',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirm: 'Confirm password',
    emailTaken: 'This email is already in use',
    usernameTaken: 'This username is already taken',
    network: 'Could not connect. Check your connection.',
    retry: 'Try again',
  },
} as const;

type Locale = keyof typeof TEXT;

const controllerBase = (): Props['controller'] => ({
  submit: () => {},
  pending: false,
  failure: null,
  retry: () => {},
});

async function mount(locale: Locale, props: Partial<Props> = {}) {
  const rootRoute = createRootRoute({
    component: () => <SignupPage controller={controllerBase()} onDismiss={() => {}} {...props} />,
  });
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

afterEach(() => page.viewport(1440, 900));

describe('pageSignupLocales', () => {
  it('traz title e description nos dois idiomas', () => {
    for (const l of ['pt-BR', 'en'] as const) {
      expect(pageSignupLocales[l]).toHaveProperty('title');
      expect(pageSignupLocales[l]).toHaveProperty('description');
    }
  });
});

describe.each(['pt-BR', 'en'] as const)('SignupPage (%s)', (locale) => {
  const t = TEXT[locale];
  const field = (label: string) => page.getByLabelText(label, { exact: true });
  const toggle = () => page.getByRole('link', { name: t.link, exact: true });

  it('desktop: dialog com nome do titulo, subtitulo e rodape', async () => {
    await mount(locale);
    await expect.element(page.getByRole('dialog', { name: t.title, exact: true })).toBeVisible();
    await expect.element(page.getByText(t.subtitle)).toBeVisible();
    await expect.element(page.getByText(t.footer)).toBeVisible();
    await expect.element(toggle()).toBeVisible();
  });

  it('mobile: h1 e sem dialog', async () => {
    await page.viewport(390, 844);
    await mount(locale);
    await expect.element(page.getByRole('heading', { level: 1, name: t.title, exact: true })).toBeVisible();
    expect(page.getByRole('dialog').elements()).toHaveLength(0);
  });

  it('define document.title a partir do namespace pageSignup', async () => {
    await mount(locale);
    await expect.poll(() => document.title).toBe(resources[locale].pageSignup.title);
  });

  it('submit chama controller.submit com os valores digitados', async () => {
    const submit = vi.fn();
    await mount(locale, { controller: { ...controllerBase(), submit } });
    await field(t.username).fill('ana');
    await field(t.email).fill('ana@example.test');
    await field(t.password).fill('JungleDemo-Ana-2026!');
    await field(t.confirm).fill('JungleDemo-Ana-2026!');
    await page.getByRole('button', { name: t.title, exact: true }).click();
    expect(submit).toHaveBeenCalledExactlyOnceWith({
      username: 'ana',
      email: 'ana@example.test',
      password: 'JungleDemo-Ana-2026!',
      confirmPassword: 'JungleDemo-Ana-2026!',
    });
  });

  it('pending desabilita o botao de envio', async () => {
    await mount(locale, { controller: { ...controllerBase(), pending: true } });
    await expect.element(page.getByRole('button', { name: t.title, exact: true })).toBeDisabled();
  });

  it('account_conflict marca os campos conflitantes', async () => {
    await mount(locale, {
      controller: { ...controllerBase(), failure: { kind: 'account_conflict', fields: ['email', 'username'] } },
    });
    await expect.element(field(t.email)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(field(t.username)).toHaveAttribute('aria-invalid', 'true');
    await expect.element(page.getByText(t.emailTaken)).toBeVisible();
    await expect.element(page.getByText(t.usernameTaken)).toBeVisible();
  });

  it('network mostra alerta e Tentar novamente chama controller.retry', async () => {
    const retry = vi.fn();
    await mount(locale, { controller: { ...controllerBase(), failure: { kind: 'network', retryable: true }, retry } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.network);
    await page.getByRole('button', { name: t.retry, exact: true }).click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it('link de alternancia aponta para /login sem redirect quando ausente', async () => {
    await mount(locale);
    await expect.element(toggle()).toHaveAttribute('href', '/login');
  });

  it('link de alternancia preserva redirect', async () => {
    await mount(locale, { redirect: '/cart' });
    await expect.element(toggle()).toHaveAttribute('href', '/login?redirect=%2Fcart');
  });

  it('Esc chama onDismiss', async () => {
    const onDismiss = vi.fn();
    await mount(locale, { onDismiss });
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalled();
  });
});
