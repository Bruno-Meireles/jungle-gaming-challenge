import { delay, http, HttpResponse } from 'msw';

import type { NftSummaryDto } from '../../shared/api/contracts/nfts';
import { NFT_FIXTURES } from '../fixtures/nfts';
import { readScenario } from '../scenario';

const HERO_IDS = ['emerald-ape-042', 'sage-nomad-009', 'neon-vessel-552'] as const;
const FEATURED_ID = 'cosmic-bloom-118';
const DEFAULT_LATENCY_MS = 120;
const SLOW_LATENCY_MS = 1500;

function byId(id: string): NftSummaryDto {
  const item = NFT_FIXTURES.find((candidate) => candidate.id === id);
  if (item === undefined) throw new Error(`fixture ausente: ${id}`);
  return item;
}

export const highlightsHandler = http.get('/api/highlights', async () => {
  await delay(readScenario(localStorage) === 'catalog-slow' ? SLOW_LATENCY_MS : DEFAULT_LATENCY_MS);
  return HttpResponse.json({ hero: HERO_IDS.map(byId), featured: byId(FEATURED_ID) });
});
