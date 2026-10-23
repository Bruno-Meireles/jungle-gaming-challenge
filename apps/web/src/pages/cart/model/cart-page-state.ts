export type CartPageState = 'loading' | 'error' | 'empty' | 'ready';

export function toCartPageState(
  query: { status: 'pending' } | { status: 'error' } | { status: 'success'; lineCount: number },
): CartPageState {
  if (query.status === 'pending') return 'loading';
  if (query.status === 'error') return 'error';
  return query.lineCount === 0 ? 'empty' : 'ready';
}
