import { SESSION_QUERY_ROOT } from '../../../shared/api/query-roots';

export const sessionKeys = {
  all: [SESSION_QUERY_ROOT] as const,
  current: () => [SESSION_QUERY_ROOT, 'current'] as const,
};
