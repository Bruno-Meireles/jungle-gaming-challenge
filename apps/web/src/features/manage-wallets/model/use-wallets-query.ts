import { useQuery } from '@tanstack/react-query';

import { fetchWallets } from '../../../entities/user';

export const WALLETS_KEY = ['account', 'wallets'] as const;

export function useWalletsQuery() {
  return useQuery({
    queryKey: WALLETS_KEY,
    queryFn: ({ signal }) => fetchWallets(undefined, signal),
    select: (data) => data.wallets,
  });
}
