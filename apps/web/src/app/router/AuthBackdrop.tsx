import { RouterProvider, createMemoryHistory, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { HomePage } from '../../pages/home';
import { useMediaQuery } from '../../shared/hooks';
import { parseSearch, stringifySearch } from './search-serialization';

/*
 * Fundo do modal de login/cadastro no desktop: sempre a Home, decorativa (`inert`). Roda num router em memoria
 * proprio para que a normalizacao de URL do catalogo nao reescreva a URL real (/login?redirect=...).
 */
let backdropRouter: ReturnType<typeof createBackdropRouter> | undefined;

function createBackdropRouter() {
  const root = createRootRoute();
  const home = createRoute({ getParentRoute: () => root, path: '/', component: HomePage });
  return createRouter({
    routeTree: root.addChildren([home]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
    parseSearch,
    stringifySearch,
  });
}

export function AuthBackdrop({ children }: { children: ReactNode }) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  backdropRouter ??= createBackdropRouter();
  return (
    <>
      {isDesktop ? (
        <div inert aria-hidden="true">
          <RouterProvider router={backdropRouter} />
        </div>
      ) : null}
      {children}
    </>
  );
}
