import { type UseQueryResult } from '@tanstack/react-query';

import type { ApiError } from '../../../shared/api/api-error';
import type { Cart } from './domain/cart';

export function useCart(): UseQueryResult<Cart, ApiError> {
  throw new Error('not_implemented');
}
