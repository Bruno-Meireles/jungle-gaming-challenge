import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { addFavorite, fetchFavorites, removeFavorite, type Favorites } from '../api/favorites-api';
import { favoritesKeys } from './favorites-keys';

/** Favoritos do usuario autenticado (ative com enabled=false para visitante). */
export function useFavorites(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: favoritesKeys.list(),
    queryFn: ({ signal }) => fetchFavorites(signal),
    enabled: options?.enabled ?? true,
  });
}

type ToggleInput = { nftId: string; favorite: boolean };

/** Otimista com rollback: aplica no cache, reverte se a API falhar, reconcilia ao fim. */
export function useToggleFavorite() {
  const client = useQueryClient();
  return useMutation<void, unknown, ToggleInput, { previous?: Favorites }>({
    mutationFn: ({ nftId, favorite }) => (favorite ? addFavorite(nftId) : removeFavorite(nftId)),
    onMutate: async ({ nftId, favorite }) => {
      await client.cancelQueries({ queryKey: favoritesKeys.list() });
      const previous = client.getQueryData<Favorites>(favoritesKeys.list());
      if (previous) {
        const rest = previous.nftIds.filter((id) => id !== nftId);
        client.setQueryData(favoritesKeys.list(), {
          ...previous,
          nftIds: favorite ? [...rest, nftId] : rest,
        });
      }
      return { previous };
    },
    onError: (_error, _input, context) => {
      if (context?.previous) client.setQueryData(favoritesKeys.list(), context.previous);
    },
    onSettled: () => client.invalidateQueries({ queryKey: favoritesKeys.all }),
  });
}
