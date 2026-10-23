/** Raiz privada: removida do cache no logout/troca de usuario. */
export const userKeys = {
  all: ['user'] as const,
  profile: () => ['user', 'profile'] as const,
  wallets: () => ['user', 'wallets'] as const,
};
