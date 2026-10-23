import { useMutation, useQueryClient } from '@tanstack/react-query';

import { saveWallet } from '../../../entities/user';
import { WALLETS_KEY } from './use-wallets-query';

export function useSaveWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    retry: 0,
    mutationFn: (body: Parameters<typeof saveWallet>[0]) => saveWallet(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: WALLETS_KEY }),
  });
}
