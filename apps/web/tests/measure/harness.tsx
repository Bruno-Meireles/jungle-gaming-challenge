import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import { I18nextProvider } from 'react-i18next';
import { page } from 'vitest/browser';
import { render } from 'vitest-browser-react';

import '../../src/app/styles.css';
import { createI18n } from '../../src/app/i18n/init';
import { resources } from '../../src/app/i18n/resources';
import { createQueryClient } from '../../src/app/providers/query-client';
import { parseSearch, stringifySearch } from '../../src/app/router/search-serialization';
import { homeSearchSchema } from '../../src/pages/home';

export const DESKTOP = { width: 1440, height: 900 } as const;
export const MOBILE = { width: 390, height: 844 } as const;

let workerStarted = false;
/** Liga o worker MSW (handlers do app, cenario `default`) para widgets que consultam o catalogo. */
async function startMocks(): Promise<void> {
  if (workerStarted) return;
  const { worker } = await import('../../src/mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
  workerStarted = true;
}

function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  const [i18n] = useState(() => createI18n({ resources, locale: 'pt-BR' }));
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </QueryClientProvider>
  );
}

/**
 * Renderiza um widget isolado no viewport pedido, com i18n pt-BR, TanStack Query e roteador em memoria.
 * `mocks: true` serve o catalogo pelos handlers MSW reais (nada de resposta fictica no componente).
 */
export async function renderWidget(
  ui: ReactNode,
  { viewport, mocks = false, path = '/' }: { viewport: { width: number; height: number }; mocks?: boolean; path?: string },
) {
  await page.viewport(viewport.width, viewport.height);
  if (mocks) await startMocks();
  const rootRoute = createRootRoute({ component: () => <>{ui}</> });
  const home = createRoute({ getParentRoute: () => rootRoute, path: '/', validateSearch: homeSearchSchema });
  const stub = (p: string) => createRoute({ getParentRoute: () => rootRoute, path: p });
  const router = createRouter({
    routeTree: rootRoute.addChildren([home, stub('/unavailable'), stub('/login'), stub('/cart')]),
    history: createMemoryHistory({ initialEntries: [path] }),
    parseSearch,
    stringifySearch,
  });
  const screen = await render(
    <Providers>
      <RouterProvider router={router} />
    </Providers>,
  );
  await document.fonts.ready;
  return screen;
}
