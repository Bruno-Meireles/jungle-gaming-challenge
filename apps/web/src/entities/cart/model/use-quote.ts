import { type UseQueryResult } from '@tanstack/react-query';

import type { ApiError } from '../../../shared/api/api-error';
import type { NetworkId } from '../../../shared/api/contracts/ids';
import type { Quote } from './domain/cart';

export function useQuote(networkId: NetworkId): UseQueryResult<Quote, ApiError> {
  void networkId;
  throw new Error('not_implemented');
}
