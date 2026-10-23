/** Raiz privada: removida do cache no logout/troca de usuario. */
export const favoritesKeys = {
  all: ['favorites'] as const,
  list: () => ['favorites', 'list'] as const,
};
