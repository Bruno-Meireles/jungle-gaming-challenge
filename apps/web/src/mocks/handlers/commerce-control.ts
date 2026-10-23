import { HttpResponse, http } from 'msw';
import { z } from 'zod';

import { emitCommerceChange } from '../commerce/events';
import { setEdition } from '../commerce/market';
import { settleOrder } from '../commerce/order-store';
import { broadcastRealtimeEvent } from '../realtime/socket-handler';
import { realtimeEventSchema } from '../../shared/api/contracts/realtime';
import { invalid, notFound } from './commerce-http';

const nftChange = z.object({
  nftId: z.string(),
  editionId: z.string(),
  priceEth: z.string().optional(),
  remaining: z.number().int().min(0).optional(),
  replayEvent: realtimeEventSchema.optional(),
});
const orderSettle = z.object({ orderId: z.string(), status: z.enum(['confirmed', 'refused']) });

/*
 * Controles do mock (E2E/demonstracao): alteram o estado simulado e avisam o tempo real.
 * Sao handlers MSW, nunca atalhos na UI.
 */
export const commerceControlHandlers = [
  http.post('*/api/__mock/nft', async ({ request }) => {
    const body = nftChange.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid();
    const { nftId, editionId, replayEvent, ...patch } = body.data;
    if (replayEvent) {
      try {
        broadcastRealtimeEvent(replayEvent);
      } catch (error) {
        console.error('mock_realtime_broadcast_failed', error);
        return HttpResponse.json({ code: 'realtime_broadcast_failed' }, { status: 500 });
      }
      return HttpResponse.json({ accepted: true });
    }
    try {
      const version = setEdition(nftId, editionId, patch);
      emitCommerceChange({ type: 'nft', nftId });
      return HttpResponse.json({ version });
    } catch {
      return notFound();
    }
  }),

  http.post('*/api/__mock/order', async ({ request }) => {
    const body = orderSettle.safeParse(await request.json().catch(() => null));
    if (!body.success) return invalid();
    const order = settleOrder(body.data.orderId, body.data.status);
    return order ? HttpResponse.json(order) : notFound();
  }),
];
