import { toSocketIo } from '@mswjs/socket.io-binding';
import { ws } from 'msw';

import {
  REALTIME_IDENTIFY_EVENT,
  REALTIME_URL,
  nftUpdatedEventSchema,
  orderUpdatedEventSchema,
  realtimeIdentifyPayloadSchema,
  type RealtimeEvent,
} from '../../shared/api/contracts/realtime';
import { readState } from '../state';
import { onCommerceChange } from '../commerce/events';
import { liveEditions, livePrice, nftVersion } from '../commerce/market';
import { readCommerce } from '../commerce/commerce-state';
import { orderDtoSchema } from '../../shared/api/contracts/commerce';

const realtime = ws.link(REALTIME_URL);
type SocketIoSession = ReturnType<typeof toSocketIo>;

const sessions = new Map<SocketIoSession, string | null>();

function resolveUserId(token: string): string | null {
  const state = readState();
  const session = state.sessions.find(
    (candidate) => candidate.token === token && candidate.expiresAt > Date.now(),
  );
  return session?.userId ?? null;
}

function emitToSession(session: SocketIoSession, event: RealtimeEvent): void {
  if (event.type === 'nft.updated') {
    session.client.emit(event.type, event);
    return;
  }
  if (sessions.get(session) === event.userId) session.client.emit(event.type, event);
}

function emitChange(
  change: { type: 'nft'; nftId: string } | { type: 'order'; orderId: string; userId: string },
): void {
  if (change.type === 'nft') {
    const editions = liveEditions(change.nftId);
    const priceEth = livePrice(change.nftId);
    if (priceEth === undefined) return;
    const event = nftUpdatedEventSchema.parse({
      eventId: `nft:${change.nftId}:${nftVersion(change.nftId)}`,
      version: nftVersion(change.nftId),
      occurredAt: new Date().toISOString(),
      type: 'nft.updated',
      resource: { type: 'nft', id: change.nftId },
      data: {
        priceEth,
        editions: editions.map(({ id, priceEth: editionPrice, remaining }) => ({
          id,
          priceEth: editionPrice,
          remaining,
        })),
      },
    });
    for (const session of sessions.keys()) emitToSession(session, event);
    return;
  }

  const stored = readCommerce().orders[change.orderId];
  if (!stored || stored.ownerId !== change.userId) return;
  const order = orderDtoSchema.parse(stored.dto);
  const event = orderUpdatedEventSchema.parse({
    eventId: `order:${change.orderId}:${order.version}`,
    version: order.version,
    occurredAt: order.updatedAt,
    type: 'order.updated',
    resource: { type: 'order', id: change.orderId },
    userId: change.userId,
    data: { status: order.status, transactionRef: order.transactionRef },
  });
  for (const session of sessions.keys()) emitToSession(session, event);
}

onCommerceChange(emitChange);

const realtimeHandler = realtime.addEventListener('connection', (connection) => {
  const socketIo = toSocketIo(connection);
  sessions.set(socketIo, null);
  const pingInterval = setInterval(() => connection.client.send('2'), 20_000);
  connection.client.addEventListener('close', () => {
    clearInterval(pingInterval);
    sessions.delete(socketIo);
  });
  socketIo.client.on(REALTIME_IDENTIFY_EVENT, (_message, payload: unknown) => {
    const parsed = realtimeIdentifyPayloadSchema.safeParse(payload);
    sessions.set(socketIo, parsed.success ? resolveUserId(parsed.data.token) : null);
  });
});

export const realtimeHandlers = [realtimeHandler];

export function broadcastRealtimeEvent(event: RealtimeEvent): void {
  for (const session of sessions.keys()) emitToSession(session, event);
}
