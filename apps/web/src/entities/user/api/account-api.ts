import {
  profileSchema,
  walletSchema,
  walletsResponseSchema,
  type ChangePasswordRequest,
  type Profile,
  type SaveWalletRequest,
  type UpdateProfileRequest,
  type Wallet,
  type WalletsResponse,
} from '../../../shared/api/contracts/account';
import { getJson, httpClient, sendJson, type HttpClient } from '../../../shared/api/http-client';

export function fetchProfile(client: HttpClient = httpClient, signal?: AbortSignal): Promise<Profile> {
  return getJson(client, { path: '/account/profile', schema: profileSchema, signal });
}

export function updateProfile(body: UpdateProfileRequest, client: HttpClient = httpClient): Promise<Profile> {
  return sendJson(client, { method: 'put', path: '/account/profile', body, schema: profileSchema });
}

export function changePassword(body: ChangePasswordRequest, client: HttpClient = httpClient): Promise<undefined> {
  return sendJson(client, { method: 'put', path: '/account/password', body });
}

export function fetchWallets(client: HttpClient = httpClient, signal?: AbortSignal): Promise<WalletsResponse> {
  return getJson(client, { path: '/account/wallets', schema: walletsResponseSchema, signal });
}

/** Upsert por `kind` (principal ou secundaria). */
export function saveWallet(body: SaveWalletRequest, client: HttpClient = httpClient): Promise<Wallet> {
  return sendJson(client, { method: 'put', path: '/account/wallets', body, schema: walletSchema });
}
