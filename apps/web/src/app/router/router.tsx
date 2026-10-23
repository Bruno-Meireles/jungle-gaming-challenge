import { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext, createRoute, createRouter, useRouter } from '@tanstack/react-router';
import { HomePage, homeSearchSchema } from '../../pages/home';
import { LoginPage, loginSearchSchema, useLoginController } from '../../pages/login';
import { NotFoundPage } from '../../pages/not-found';
import { SignupPage, signupSearchSchema, useSignupController } from '../../pages/signup';
import { UnavailablePage, unavailableSearchSchema } from '../../pages/unavailable';
import { RootLayout } from '../layouts/RootLayout';
import { safeRedirect } from '../../shared/lib/navigation/safe-redirect';
import { AuthBackdrop } from './AuthBackdrop';
import { CheckoutRoute, NftDetailRoute, OrderRoute } from './private-routes';
import { AccountLayout, AccountProfilePage, AccountWalletsPage } from '../../pages/account';
import { CartPage } from '../../pages/cart';
import { nftDetailSearchSchema } from '../../pages/nft-detail';
import { Navigate } from '@tanstack/react-router';
import { redirectIfAuthenticated, requireAuth, type RouterContext } from './guards';
import { parseSearch, stringifySearch } from './search-serialization';

const rootRoute = createRootRouteWithContext<RouterContext>()({ component: RootLayout, notFoundComponent: NotFoundPage });
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

// O router mescla o search bruto com a saida do validateSearch: revalida aqui para nunca propagar redirect externo.
function internalRedirect(value: string | undefined): string | undefined {
  const safe = safeRedirect(value, '');
  return safe === '' ? undefined : safe;
}

function dismissAuth(router: ReturnType<typeof useRouter>) {
  // Fechar volta ao historico anterior; sem historico interno, vai para a Home.
  if (router.history.canGoBack()) router.history.back();
  else router.history.replace('/');
}

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: loginSearchSchema,
  beforeLoad: redirectIfAuthenticated,
  component: function LoginRoute() {
    const redirect = internalRedirect(loginRoute.useSearch().redirect);
    const router = useRouter();
    const controller = useLoginController(redirect);
    return (
      <AuthBackdrop>
        <LoginPage redirect={redirect} controller={controller} onDismiss={() => dismissAuth(router)} />
      </AuthBackdrop>
    );
  },
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  validateSearch: signupSearchSchema,
  beforeLoad: redirectIfAuthenticated,
  component: function SignupRoute() {
    const redirect = internalRedirect(signupRoute.useSearch().redirect);
    const router = useRouter();
    const controller = useSignupController(redirect);
    return (
      <AuthBackdrop>
        <SignupPage redirect={redirect} controller={controller} onDismiss={() => dismissAuth(router)} />
      </AuthBackdrop>
    );
  },
});

const cartRoute = createRoute({ getParentRoute: () => rootRoute, path: '/cart', component: CartPage });
const nftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/nfts/$nftId',
  validateSearch: nftDetailSearchSchema,
  component: function NftRoute() {
    return <NftDetailRoute nftId={nftRoute.useParams().nftId} search={nftRoute.useSearch()} />;
  },
});
const checkoutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/checkout', beforeLoad: requireAuth, component: CheckoutRoute });
const orderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  beforeLoad: requireAuth,
  component: function OrderPageRoute() {
    return <OrderRoute rawOrderId={orderRoute.useParams().orderId} />;
  },
});
const accountRoute = createRoute({ getParentRoute: () => rootRoute, path: '/account', beforeLoad: requireAuth, component: AccountLayout });
const accountIndexRoute = createRoute({ getParentRoute: () => accountRoute, path: '/', component: () => <Navigate to="/account/profile" replace /> });
const profileRoute = createRoute({ getParentRoute: () => accountRoute, path: '/profile', component: AccountProfilePage });
const walletsRoute = createRoute({ getParentRoute: () => accountRoute, path: '/wallets', component: AccountWalletsPage });

const routeTree = rootRoute.addChildren([
  homeRoute,
  unavailableRoute,
  loginRoute,
  signupRoute,
  cartRoute,
  nftRoute,
  checkoutRoute,
  orderRoute,
  accountRoute.addChildren([accountIndexRoute, profileRoute, walletsRoute]),
]);

// O QueryClient real entra em <RouterProvider context> (ver App.tsx).
const placeholderContext = { queryClient: new QueryClient() } satisfies RouterContext;

export const router = createRouter({ routeTree, parseSearch, stringifySearch, context: placeholderContext });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
