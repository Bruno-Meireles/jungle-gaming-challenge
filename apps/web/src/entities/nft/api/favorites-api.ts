import { favoritesDtoSchema } from '../../../shared/api/contracts/commerce';
import { getJson, httpClient } from '../../../shared/api/http-client';
import { z } from 'zod';

import { sendJson } from '../../../shared/api/send-json';

export type Favorites = { nftIds: string[]; version: number };

export function fetchFavorites(signal?: AbortSignal): Promise<Favorites> {
  return getJson(httpClient, { path: '/favorites', schema: favoritesDtoSchema, signal });
}

const empty = z.unknown();

export async function addFavorite(nftId: string): Promise<void> {
  await sendJson(httpClient, { method: 'put', path: `/favorites/${encodeURIComponent(nftId)}`, schema: empty });
}

export async function removeFavorite(nftId: string): Promise<void> {
  await sendJson(httpClient, { method: 'delete', path: `/favorites/${encodeURIComponent(nftId)}`, schema: empty });
}
