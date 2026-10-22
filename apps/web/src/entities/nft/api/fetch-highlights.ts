import { highlightsDtoSchema } from '../../../shared/api/contracts/nfts';
import { getJson, httpClient } from '../../../shared/api/http-client';
import type { Highlights } from '../model/domain/highlights';
import { toNftSummary } from './to-nft-summary';

export async function fetchHighlights(signal: AbortSignal): Promise<Highlights> {
  const dto = await getJson(httpClient, { path: '/highlights', schema: highlightsDtoSchema, signal });
  return { hero: dto.hero.map(toNftSummary), featured: toNftSummary(dto.featured) };
}
