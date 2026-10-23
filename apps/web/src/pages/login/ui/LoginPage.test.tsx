import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { I18nextProvider } from 'react-i18next';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../../app/styles.css';
import { createI18n } from '../../../app/i18n/init';
import { resources } from '../../../app/i18n/resources';
import { LoginPage, pageLoginLocales } from '..';

type Props = Parameters<typeof LoginPage>[0];

const TEXT = {
  'pt-BR': {
    title: 'Entrar',
    subtitle: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
    footer: 'Novo na Kurio?',
    link: 'Crie uma conta',
    email: 'E-mail',
    password: 'Senha',
    invalidCredentials: 'E-mail ou senha incorretos',
    network: 'Não foi possível conectar. Verifique sua conexão.',
    retry: 'Tentar novamente',
  },
  en: {
    title: 'Sign in',
    subtitle: 'Sign in to manage your wallet, collection and creator profile.',
    footer: 'New to Kurio?',
    link: 'Create an account',
    email: 'Email',
    password: 'Password',
    invalidCredentials: 'Incorrect email or password',
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
    component: () => <LoginPage controller={controllerBase()} onDismiss={() => {}} {...props} />,
  });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path });
  const router = createRouter({
    routeTree: rootRoute.addChildren([stub('/'), stub('/signup'), stub('/unavailable')]),
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

describe('pageLoginLocales', () => {
  it('traz title e description nos dois idiomas', () => {
    for (const l of ['pt-BR', 'en'] as const) {
      expect(pageLoginLocales[l]).toHaveProperty('title');
      expect(pageLoginLocales[l]).toHaveProperty('description');
    }
  });
});

describe.each(['pt-BR', 'en'] as const)('LoginPage (%s)', (locale) => {
  const t = TEXT[locale];
  const email = () => page.getByLabelText(t.email, { exact: true });
  const password = () => page.getByLabelText(t.password, { exact: true });
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

  it('define document.title a partir do namespace pageLogin', async () => {
    await mount(locale);
    await expect.poll(() => document.title).toBe(resources[locale].pageLogin.title);
  });

  it('submit chama controller.submit com os valores digitados', async () => {
    const submit = vi.fn();
    await mount(locale, { controller: { ...controllerBase(), submit } });
    await email().fill('ana@example.test');
    await password().fill('JungleDemo-Ana-2026!');
    await page.getByRole('button', { name: t.title, exact: true }).click();
    expect(submit).toHaveBeenCalledExactlyOnceWith({ email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' });
  });

  it('pending desabilita o botao de envio', async () => {
    await mount(locale, { controller: { ...controllerBase(), pending: true } });
    await expect.element(page.getByRole('button', { name: t.title, exact: true })).toBeDisabled();
  });

  it('invalid_credentials mostra alerta', async () => {
    await mount(locale, { controller: { ...controllerBase(), failure: { kind: 'invalid_credentials' } } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.invalidCredentials);
  });

  it('network mostra alerta e Tentar novamente chama controller.retry', async () => {
    const retry = vi.fn();
    await mount(locale, { controller: { ...controllerBase(), failure: { kind: 'network', retryable: true }, retry } });
    await expect.element(page.getByRole('alert')).toHaveTextContent(t.network);
    await page.getByRole('button', { name: t.retry, exact: true }).click();
    expect(retry).toHaveBeenCalledOnce();
  });

  it('fieldErrors do controller chegam ao formulario', async () => {
    await mount(locale, { controller: { ...controllerBase(), fieldErrors: { email: 'required' } } });
    await expect.element(email()).toHaveAttribute('aria-invalid', 'true');
  });

  it('link de alternancia aponta para /signup sem redirect quando ausente', async () => {
    await mount(locale);
    await expect.element(toggle()).toHaveAttribute('href', '/signup');
  });

  it('link de alternancia preserva redirect', async () => {
    await mount(locale, { redirect: '/cart' });
    await expect.element(toggle()).toHaveAttribute('href', '/signup?redirect=%2Fcart');
  });

  it('Esc chama onDismiss', async () => {
    const onDismiss = vi.fn();
    await mount(locale, { onDismiss });
    await expect.element(page.getByRole('dialog')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    expect(onDismiss).toHaveBeenCalled();
  });
});
