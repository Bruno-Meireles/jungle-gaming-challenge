import type { QueryClient } from '@tanstack/react-query';

import type {
  ChangePasswordRequest,
  Profile,
  SaveWalletRequest,
  UpdateProfileRequest,
  Wallet,
  WalletsResponse,
} from '../../../shared/api/contracts/account';
import type { HttpClient } from '../../../shared/api/http-client';
import { SESSION_QUERY_ROOT } from '../../../shared/api/query-roots';
import { changePassword, fetchProfile, fetchWallets, saveWallet, updateProfile } from '../api/account-api';
import { toAccountFailure } from './account-failure';
import { userKeys } from './user-keys';

async function mapFailure<T>(promise: Promise<T>): Promise<T> {
  try {
    return await promise;
  } catch (error) {
    return Promise.reject(toAccountFailure(error));
  }
}

export function loadProfile(client?: HttpClient, signal?: AbortSignal): Promise<Profile> {
  return mapFailure(fetchProfile(client, signal));
}

export function loadWallets(client?: HttpClient, signal?: AbortSignal): Promise<WalletsResponse> {
  return mapFailure(fetchWallets(client, signal));
}

/** Atualiza o cache do perfil e invalida a sessao (nome/avatar do cabecalho). */
export async function submitProfile(
  queryClient: QueryClient,
  body: UpdateProfileRequest,
  client?: HttpClient,
): Promise<Profile> {
  const profile = await mapFailure(updateProfile(body, client));
  queryClient.setQueryData(userKeys.profile(), profile);
  void queryClient.invalidateQueries({ queryKey: [SESSION_QUERY_ROOT] });
  return profile;
}

export function submitPasswordChange(body: ChangePasswordRequest, client?: HttpClient): Promise<undefined> {
  return mapFailure(changePassword(body, client));
}

/** Upsert por `kind`: substitui a carteira do mesmo tipo no cache ou acrescenta. */
export async function submitWallet(
  queryClient: QueryClient,
  body: SaveWalletRequest,
  client?: HttpClient,
): Promise<Wallet> {
  const wallet = await mapFailure(saveWallet(body, client));
  queryClient.setQueryData<WalletsResponse>(userKeys.wallets(), (current) => {
    const others = (current?.wallets ?? []).filter((w) => w.kind !== wallet.kind);
    const wallets = [...others, wallet].sort((a, b) => Number(b.kind === 'primary') - Number(a.kind === 'primary'));
    return { wallets };
  });
  return wallet;
}
