import { useQuery } from '@tanstack/react-query';

import { fetchCart } from '../api/cart-api';
import { cartKeys } from './cart-keys';

export function useCart() {
  return useQuery({ queryKey: cartKeys.current(), queryFn: ({ signal }) => fetchCart(signal) });
}

/** Soma das quantidades (badge do header); 0 enquanto carrega. */
export function useCartItemCount(): number {
  return useQuery({
    queryKey: cartKeys.current(),
    queryFn: ({ signal }) => fetchCart(signal),
    select: (cart) => cart.itemCount,
  }).data ?? 0;
}

export function cartQueryOptions() {
  return { queryKey: cartKeys.current(), queryFn: ({ signal }: { signal: AbortSignal }) => fetchCart(signal) };
}
