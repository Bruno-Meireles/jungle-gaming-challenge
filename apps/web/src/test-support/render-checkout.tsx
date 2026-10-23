import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { render } from 'vitest-browser-react';

import '../app/styles.css';
import { createI18n } from '../app/i18n/init';
import { resources } from '../app/i18n/resources';

export type TestLocale = 'pt-BR' | 'en';

/** Renderiza `ui` com i18n real do app e um router em memoria com rotas stub (links resolvem href). */
export function renderCheckoutUi(ui: ReactNode, locale: TestLocale = 'pt-BR') {
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path });
  const router = createRouter({
    routeTree: rootRoute.addChildren([stub('/'), stub('/checkout'), stub('/cart'), stub('/account/wallets')]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  const i18n = createI18n({ resources, locale });
  return render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
}
