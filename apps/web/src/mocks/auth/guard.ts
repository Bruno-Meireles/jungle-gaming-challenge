import { HttpResponse, delay } from 'msw';

import { readState } from '../state';
import type { SessionRecord, UserRecord } from '../state/state-schema';

export const AUTH_LATENCY_MS = 100;
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const sessionInvalid = () => HttpResponse.json({ code: 'session_invalid' }, { status: 401 });

export function bearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  return header?.startsWith('Bearer ') ? header.slice('Bearer '.length) : null;
}

export type Authenticated = { user: UserRecord; session: SessionRecord };

/** Sessao valida (token existente e nao expirado) ou null. */
export function authenticate(request: Request): Authenticated | null {
  const token = bearerToken(request);
  if (!token) return null;
  const state = readState();
  const session = state.sessions.find((s) => s.token === token && s.expiresAt > Date.now());
  const user = session ? state.users.find((u) => u.id === session.userId) : undefined;
  return session && user ? { user, session } : null;
}

export function toSessionUser(user: UserRecord) {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

export async function simulateLatency(): Promise<void> {
  await delay(AUTH_LATENCY_MS);
}
