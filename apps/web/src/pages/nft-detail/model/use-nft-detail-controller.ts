import { useLocation, useNavigate } from '@tanstack/react-router';

import { useFavorites, useNftDetail, useToggleFavorite } from '../../../entities/nft';
import { useAddToCart } from '../../../entities/cart';
import { useSession } from '../../../entities/session';
import type { AddToCartController, AddToCartFailure } from '../../../features/add-to-cart';
import type { FavoriteButtonProps } from '../../../features/toggle-favorite';
import type { NftDetailResult } from '../ui/NftDetailPage';
import type { NftDetailSearch } from './nft-detail-search';

/** Adaptador fino: liga as queries/mutations ao NftDetailPage (props apresentacionais). */
export function useNftDetailController(nftId: string, search: NftDetailSearch) {
  const detail = useNftDetail(nftId);
  const session = useSession();
  const authenticated = session.data?.status === 'authenticated';
  const favorites = useFavorites({ enabled: authenticated });
  const toggle = useToggleFavorite();
  const add = useAddToCart();
  const navigate = useNavigate();
  const location = useLocation();

  const result: NftDetailResult = detail.notFound
    ? { status: 'not-found' }
    : detail.isError
      ? { status: 'error' }
      : detail.data
        ? { status: 'success', nft: detail.data }
        : { status: 'pending' };

  const failure: AddToCartFailure | null = add.error
    ? add.error.kind === 'availability_conflict' || add.error.kind === 'not_found'
      ? { kind: 'conflict' }
      : { kind: 'network', retryable: true }
    : null;
  const addToCart: AddToCartController = {
    submit: (input) =>
      add.mutate(input, { onSuccess: () => void navigate({ to: '/cart' }) }),
    pending: add.isPending,
    failure,
    retry: () => {
      if (add.variables) add.mutate(add.variables, { onSuccess: () => void navigate({ to: '/cart' }) });
    },
  };

  const favorite: FavoriteButtonProps = {
    favorited: favorites.data?.nftIds.includes(nftId) ?? false,
    authenticated,
    redirectTo: location.href,
    onToggle: () =>
      toggle.mutate({ nftId, favorite: !(favorites.data?.nftIds.includes(nftId) ?? false) }),
  };

  const setSearch = (patch: Partial<NftDetailSearch>) =>
    void navigate({ to: '.', search: { ...search, ...patch }, replace: true });

  return {
    result,
    favorite,
    addToCart,
    onRetry: () => void detail.refetch(),
    onEditionChange: (edition: string) => setSearch({ edition }),
    onTabChange: (tab: NftDetailSearch['tab']) => setSearch({ tab }),
  };
}
