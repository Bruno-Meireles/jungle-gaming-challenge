import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { HomePage } from '../../pages/home';
import { NotFoundPage } from '../../pages/not-found';
import { UnavailablePage, unavailableSearchSchema } from '../../pages/unavailable';
import { RootLayout } from '../layouts/RootLayout';

const rootRoute = createRootRoute({ component: RootLayout, notFoundComponent: NotFoundPage });
const homeRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const unavailableRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/unavailable',
  validateSearch: unavailableSearchSchema,
  component: function UnavailableRoute() {
    const { feature } = unavailableRoute.useSearch();
    return <UnavailablePage feature={feature} />;
  },
});

function stubRoute(path: string, feature: string) {
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

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
