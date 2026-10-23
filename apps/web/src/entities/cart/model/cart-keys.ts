import type { NetworkId } from '../../../shared/api/contracts/ids';

/** Raiz privada: removida do cache no logout/troca de usuario (clearPrivateSessionState). */
export const cartKeys = {
  all: ['cart'] as const,
  current: () => ['cart', 'current'] as const,
  quote: (networkId: NetworkId) => ['cart', 'quote', { networkId }] as const,
};
