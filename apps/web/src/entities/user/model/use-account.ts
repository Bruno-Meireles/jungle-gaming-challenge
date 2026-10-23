import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ChangePasswordRequest,
  Profile,
  SaveWalletRequest,
  UpdateProfileRequest,
  Wallet,
  WalletsResponse,
} from '../../../shared/api/contracts/account';
import type { AccountFailure } from './account-failure';
import { loadProfile, loadWallets, submitPasswordChange, submitProfile, submitWallet } from './account-operations';
import { userKeys } from './user-keys';

export function useProfile() {
  return useQuery<Profile, AccountFailure>({
    queryKey: userKeys.profile(),
    queryFn: ({ signal }) => loadProfile(undefined, signal),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation<Profile, AccountFailure, UpdateProfileRequest>({
    mutationFn: (body) => submitProfile(queryClient, body),
  });
}

export function useChangePassword() {
  return useMutation<undefined, AccountFailure, ChangePasswordRequest>({
    mutationFn: (body) => submitPasswordChange(body),
  });
}

export function useWallets() {
  return useQuery<WalletsResponse, AccountFailure>({
    queryKey: userKeys.wallets(),
    queryFn: ({ signal }) => loadWallets(undefined, signal),
  });
}

export function useSaveWallet() {
  const queryClient = useQueryClient();
  return useMutation<Wallet, AccountFailure, SaveWalletRequest>({
    mutationFn: (body) => submitWallet(queryClient, body),
  });
}
