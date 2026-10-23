import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { readToken, sessionKeys, type Session } from '../../entities/session';
import { useRealtimeSync } from '../../entities/realtime';
import type { RealtimeEvent } from '../../shared/api/contracts/realtime';
import { applyRealtimeEvent, reconcileRealtimeQueries } from './query-sync';

export function RealtimeSessionBridge() {
  const queryClient = useQueryClient();
  const subscribe = useCallback(
    (onStoreChange: () => void) =>
      queryClient.getQueryCache().subscribe(() => onStoreChange()),
    [queryClient],
  );
  const getSession = useCallback(
    () => queryClient.getQueryData<Session>(sessionKeys.current()),
    [queryClient],
  );
  const session = useSyncExternalStore(subscribe, getSession, getSession);
  const identity = useMemo(() => {
    if (session?.status !== 'authenticated') return null;
    const token = readToken();
    return token ? { userId: session.user.id, token } : null;
  }, [session]);

  const onEvent = useCallback(
    (event: RealtimeEvent) => {
      if (identity) applyRealtimeEvent(queryClient, identity.userId, event);
    },
    [identity, queryClient],
  );
  const onReconnect = useCallback(() => reconcileRealtimeQueries(queryClient), [queryClient]);

  useRealtimeSync(identity, { onEvent, onReconnect });
  return null;
}
