import { type UseMutationResult } from '@tanstack/react-query';

import type { ApiError } from '../../../shared/api/api-error';
import type { Cart } from './domain/cart';

type CartMutation<TVars> = UseMutationResult<Cart, ApiError, TVars>;

export function useAddToCart(): CartMutation<{ nftId: string; quantity: number }> {
  throw new Error('not_implemented');
}
export function useUpdateLine(): CartMutation<{ nftId: string; quantity: number }> {
  throw new Error('not_implemented');
}
export function useRemoveLine(): CartMutation<{ nftId: string }> {
  throw new Error('not_implemented');
}
export function useApplyCoupon(): CartMutation<{ code: string }> {
  throw new Error('not_implemented');
}
export function useRemoveCoupon(): CartMutation<void> {
  throw new Error('not_implemented');
}
