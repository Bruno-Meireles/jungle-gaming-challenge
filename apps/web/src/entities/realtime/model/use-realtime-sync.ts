import { useEffect, useRef } from 'react';

import {
  REALTIME_EVENT_NAMES,
  REALTIME_IDENTIFY_EVENT,
  REALTIME_URL,
  realtimeIdentifyPayloadSchema,
  realtimeEventSchema,
  type RealtimeEvent,
} from '../../../shared/api/contracts/realtime';
import { registerPrivateTeardown } from '../../../shared/lib/private-state/teardown';

export type RealtimeIdentity = { userId: string; token: string };

export type RealtimeSyncHandlers = {
  onEvent: (event: RealtimeEvent) => void;
  onReconnect: () => void;
};

export function useRealtimeSync(
  identity: RealtimeIdentity | null,
  handlers: RealtimeSyncHandlers,
): void {
  const handlersRef = useRef(handlers);
  const userId = identity?.userId;
  const token = identity?.token;

  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  useEffect(() => {
    if (!userId || !token) return;

    let disposed = false;
    let socket: import('socket.io-client').Socket | undefined;
    const seenEventIds = new Set<string>();
    const resourceVersions = new Map<string, number>();

    const disconnect = () => {
      disposed = true;
      socket?.removeAllListeners();
      socket?.disconnect();
      socket = undefined;
    };
    const unregisterTeardown = registerPrivateTeardown(disconnect);

    const acceptEvent = (event: RealtimeEvent): boolean => {
      if (seenEventIds.has(event.eventId)) return false;
      const resourceKey = `${event.resource.type}:${event.resource.id}`;
      const knownVersion = resourceVersions.get(resourceKey) ?? -1;
      seenEventIds.add(event.eventId);
      if (event.version <= knownVersion) return false;
      resourceVersions.set(resourceKey, event.version);
      if (seenEventIds.size > 500) {
        const oldest = seenEventIds.values().next().value;
        if (oldest !== undefined) seenEventIds.delete(oldest);
      }
      return true;
    };

    void import('socket.io-client')
      .then(({ io }) => {
        if (disposed) return;
        const client = io(REALTIME_URL, {
          path: '/socket.io/',
          transports: ['websocket'],
          autoConnect: false,
          reconnection: true,
          reconnectionDelay: 500,
          reconnectionDelayMax: 5000,
        });
        socket = client;
        client.on('connect', () => {
          client.emit(REALTIME_IDENTIFY_EVENT, realtimeIdentifyPayloadSchema.parse({ token }));
          handlersRef.current.onReconnect();
        });
        for (const eventName of REALTIME_EVENT_NAMES) {
          client.on(eventName, (payload: unknown) => {
            const parsed = realtimeEventSchema.safeParse(payload);
            if (!parsed.success) {
              console.error('realtime_invalid_event', eventName, parsed.error);
              return;
            }
            if (parsed.data.type !== eventName || !acceptEvent(parsed.data)) return;
            handlersRef.current.onEvent(parsed.data);
          });
        }
        client.on('connect_error', (error) => console.error('realtime_connection_failed', error));
        client.connect();
      })
      .catch((error: unknown) => {
        if (!disposed) console.error('realtime_client_load_failed', error);
      });

    return () => {
      disconnect();
      unregisterTeardown();
    };
  }, [token, userId]);
}
