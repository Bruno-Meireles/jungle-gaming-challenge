import { QueryClient } from '@tanstack/react-query';

const STALE_TIME_MS = 30_000;
const RETRY_DELAY_MS = 300;
const MAX_RETRIES = 1;

function isTransient(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'transient' in error && error.transient === true;
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_MS,
        retry: (failureCount, error) => failureCount < MAX_RETRIES && isTransient(error),
        retryDelay: RETRY_DELAY_MS,
      },
    },
  });
}
