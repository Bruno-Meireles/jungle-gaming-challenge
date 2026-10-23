import { QueryClient } from '@tanstack/react-query';
import { redirect } from '@tanstack/react-router';
import { sessionQueryOptions } from '../../entities/session';
import { safeRedirect } from '../../shared/lib/navigation/safe-redirect';

export type RouterContext = { queryClient: QueryClient };

function routerContext(context: unknown): RouterContext {
  if (typeof context === 'object' && context !== null && 'queryClient' in context && context.queryClient instanceof QueryClient) {
    return { queryClient: context.queryClient };
  }
  throw new Error('router context sem queryClient');
}

/** Rotas A: sem sessao, vai para /login?redirect=<caminho+search> (so caminhos internos). */
export async function requireAuth({ context, location }: { context: unknown; location: { href: string } }) {
  const session = await routerContext(context).queryClient.ensureQueryData(sessionQueryOptions());
  if (session.status === 'anonymous') {
    throw redirect({ to: '/login', search: { redirect: safeRedirect(location.href) }, replace: true });
  }
}

/** /login e /signup: logado volta para `redirect` (validado) ou `/`. */
export async function redirectIfAuthenticated({
  context,
  search,
}: {
  context: RouterContext;
  search: { redirect?: string | undefined };
}) {
  const session = await context.queryClient.ensureQueryData(sessionQueryOptions());
  if (session.status === 'authenticated') throw redirect({ href: safeRedirect(search.redirect), replace: true });
}
