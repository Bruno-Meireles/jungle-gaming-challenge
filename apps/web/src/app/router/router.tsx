import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { HomePage, homeSearchSchema } from '../../pages/home';
import { NotFoundPage } from '../../pages/not-found';
import { UnavailablePage, unavailableSearchSchema } from '../../pages/unavailable';
import { RootLayout } from '../layouts/RootLayout';
import { parseSearch, stringifySearch } from './search-serialization';

const rootRoute = createRootRoute({ component: RootLayout, notFoundComponent: NotFoundPage });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/',
  validateSearch: homeSearchSchema,
  component: HomePage,
});
const unavailableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unavailable',
  validateSearch: unavailableSearchSchema,
  component: function UnavailableRoute() {
    const { feature } = unavailableRoute.useSearch();
    return <UnavailablePage feature={feature} />;
  },
});

function stubRoute<P extends string>(path: P, feature: string) {
  return createRoute({
    getParentRoute: () => rootRoute,
    path,
    component: () => <UnavailablePage feature={feature} />,
  });
}

const routeTree = rootRoute.addChildren([
  homeRoute,
  unavailableRoute,
  stubRoute('/login', 'auth'),
  stubRoute('/cart', 'cart'),
  stubRoute('/nfts/$nftId', 'nft-detail'),
]);

export const router = createRouter({ routeTree, parseSearch, stringifySearch });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
