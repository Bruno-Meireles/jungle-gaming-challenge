import { useQuery } from '@tanstack/react-query';

import { isApiError } from '../../../shared/api/api-error';
import { fetchNftDetail } from '../api/fetch-nft-detail';
import { nftKeys } from './nft-keys';

export type NftDetailStatus = 'pending' | 'error' | 'not-found' | 'success';

/** Detalhe publico do NFT; 404 vira `not-found` e nao e repetido. */
export function useNftDetail(nftId: string) {
  const query = useQuery({
    queryKey: nftKeys.detail(nftId),
    queryFn: ({ signal }) => fetchNftDetail(nftId, signal),
    retry: (count, error) => !(isApiError(error) && error.code === 'not_found') && count < 1,
  });
  const notFound = query.isError && isApiError(query.error) && query.error.code === 'not_found';
  return { ...query, notFound };
}
