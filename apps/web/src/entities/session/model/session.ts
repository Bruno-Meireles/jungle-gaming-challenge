import type { SessionUser } from '../../../shared/api/contracts/auth';

export type Session = { status: 'anonymous' } | { status: 'authenticated'; user: SessionUser };

export const ANONYMOUS: Session = { status: 'anonymous' };

export function authenticated(user: SessionUser): Session {
  return { status: 'authenticated', user };
}
