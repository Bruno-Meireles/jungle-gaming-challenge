import { HttpResponse, http } from 'msw';

import { readCommerce, updateCommerce } from '../commerce/commerce-state';
import { activeScenario } from '../commerce/scenario';
import { NFT_FIXTURES } from '../fixtures/nfts';
import { commerceLatency, notFound, requireUser, unavailable } from './commerce-http';

function listOf(userId: string): { nftIds: string[]; version: number } {
  return readCommerce().favorites[userId] ?? { nftIds: [], version: 0 };
}

function change(userId: string, nftId: string, add: boolean): void {
  updateCommerce((s) => {
    const current = s.favorites[userId] ?? { nftIds: [], version: 0 };
    const has = current.nftIds.includes(nftId);
    if (has === add) return;
    s.favorites[userId] = {
      nftIds: add ? [...current.nftIds, nftId] : current.nftIds.filter((id) => id !== nftId),
      version: current.version + 1,
    };
  });
}

function handle(add: boolean) {
  return async ({ request, params }: { request: Request; params: Record<string, unknown> }) => {
    await commerceLatency();
    const user = requireUser(request);
    if (user instanceof Response) return user;
    if (activeScenario() === 'favorites-error') return unavailable();
    const nftId = String(params.nftId);
    if (!NFT_FIXTURES.some((n) => n.id === nftId)) return notFound();
    change(user.id, nftId, add);
    return new HttpResponse(null, { status: 204 });
  };
}

export const favoritesHandlers = [
  http.get('*/api/favorites', async ({ request }) => {
    await commerceLatency();
    const user = requireUser(request);
    if (user instanceof Response) return user;
    return HttpResponse.json(listOf(user.id));
  }),
  http.put('*/api/favorites/:nftId', handle(true)),
  http.delete('*/api/favorites/:nftId', handle(false)),
];
