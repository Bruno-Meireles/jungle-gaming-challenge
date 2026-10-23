import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { cartKeys } from '../../../entities/cart';
import { favoritesKeys } from '../../../entities/nft';
import { clearIdempotencyKeys, orderKeys } from '../../../entities/order';
import { ANONYMOUS, clearToken, sessionKeys } from '../../../entities/session';
import { logout as requestLogout, userKeys } from '../../../entities/user';
import { runPrivateTeardowns } from '../../../shared/lib/private-state/teardown';

const PRIVATE_ROOTS = [cartKeys.all, orderKeys.all, favoritesKeys.all, userKeys.all] as const;

/** Descarta todo estado privado do viewer: cache, chaves de idempotencia e subscriptions. Nao toca na sessao. */
export function clearPrivateData(queryClient: QueryClient): void {
  runPrivateTeardowns();
  for (const queryKey of PRIVATE_ROOTS) {
    void queryClient.cancelQueries({ queryKey });
    queryClient.removeQueries({ queryKey });
  }
  clearIdempotencyKeys();
}

/** Logout e troca de usuario: token apagado, sessao anonima, nada do usuario anterior permanece. */
export function clearPrivateSessionState(queryClient: QueryClient): void {
  clearToken();
  clearPrivateData(queryClient);
  queryClient.setQueryData(sessionKeys.current(), ANONYMOUS);
}

/** O logout local vale mesmo se o servidor falhar (rede/5xx): o token e descartado de qualquer forma. */
export async function logout(queryClient: QueryClient, request: () => Promise<unknown> = requestLogout): Promise<void> {
  try {
    await request();
  } catch {
    // sessao expira no servidor; localmente o usuario ja saiu
  } finally {
    clearPrivateSessionState(queryClient);
    void queryClient.invalidateQueries({ queryKey: cartKeys.all });
  }
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: () => logout(queryClient) });
}
