import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../src/app/styles.css';
import { createI18n } from '../../src/app/i18n/init';
import { resources } from '../../src/app/i18n/resources';

export type TestLocale = 'pt-BR' | 'en';
export const DESKTOP = { width: 1440, height: 900 } as const;
export const TABLET = { width: 768, height: 1024 } as const;
export const MOBILE = { width: 390, height: 844 } as const;

/**
 * Monta a UI apresentacional do carrinho com i18n real (recursos do app) no idioma pedido e um roteador em memoria
 * com as rotas que ela referencia. Sem rede: os componentes testados recebem tudo por props.
 */
export async function mountCart(
  ui: ReactNode,
  { locale = 'pt-BR', viewport = DESKTOP }: { locale?: TestLocale; viewport?: { width: number; height: number } } = {},
) {
  await page.viewport(viewport.width, viewport.height);
  const i18n = createI18n({ resources, locale });
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const stub = (path: string) => createRoute({ getParentRoute: () => rootRoute, path, component: () => <p>{path}</p> });
  const router = createRouter({
    routeTree: rootRoute.addChildren([stub('/'), stub('/cart'), stub('/login'), stub('/checkout'), stub('/nfts/$nftId')]),
    history: createMemoryHistory({ initialEntries: ['/cart'] }),
  });
  const screen = await render(
    <I18nextProvider i18n={i18n}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
  return { screen, router };
}
