import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { render } from 'vitest-browser-react';

import '../app/styles.css';
import { createI18n } from '../app/i18n/init';
import { resources } from '../app/i18n/resources';
import { login } from '../entities/user/api/auth-api';
import { worker } from '../mocks/browser';
import { resetMockState } from '../mocks/reset';
import { SESSION_TOKEN_STORAGE_KEY } from '../shared/api/contracts/auth';

export type Locale = 'pt-BR' | 'en';
const CREDENTIALS = {
  ana: { email: 'ana@example.test', password: 'JungleDemo-Ana-2026!' },
  bruno: { email: 'bruno@example.test', password: 'JungleDemo-Bruno-2026!' },
} as const;

let started = false;
/** MSW real no navegador: estado do mock restaurado e sessao semeada pelo login real (token em localStorage). */
export async function seedSession(as: keyof typeof CREDENTIALS | null) {
  if (!started) {
    await worker.start({ onUnhandledRequest: 'error', quiet: true });
    started = true;
  }
  worker.resetHandlers();
  localStorage.clear();
  resetMockState();
  if (as) {
    const auth = await login(CREDENTIALS[as]);
    localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, auth.token);
  }
}

export async function mountAccount(locale: Locale, ui: ReactNode, initial = '/account/profile') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      stub('/'),
      stub('/login'),
      stub('/unavailable'),
      stub('/account/profile'),
      stub('/account/wallets'),
    ]),
    history: createMemoryHistory({ initialEntries: [initial] }),
  });
  const i18n = createI18n({ resources, locale });
  const screen = await render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <RouterProvider router={router} />
      </I18nextProvider>
    </QueryClientProvider>,
  );
  return { router, screen, queryClient };
}
