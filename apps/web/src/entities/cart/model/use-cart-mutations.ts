import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { toCartFailure, toCouponFailure } from '../api/cart-api';
import * as api from '../api/cart-api';
import { cartKeys } from './cart-keys';
import type { Cart, CartFailure, CouponFailure } from './domain/cart';
import { forgetPrices } from './quote-seen';

function settle(client: QueryClient, cart?: Cart): Promise<void> {
  if (cart) client.setQueryData(cartKeys.current(), cart);
  return client.invalidateQueries({ queryKey: cartKeys.all });
}

async function wrap<T>(run: () => Promise<T>, map: (e: unknown) => unknown): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw map(error);
  }
}

export function useAddToCart() {
  const client = useQueryClient();
  return useMutation<Cart, CartFailure, { nftId: string; editionId: string; quantity: number }>({
    mutationFn: (input) => wrap(() => api.addCartItem(input), toCartFailure),
    onSuccess: (cart) => settle(client, cart),
  });
}

/** Otimista: aplica a quantidade no cache e reverte se a API falhar. */
export function useUpdateCartLine() {
  const client = useQueryClient();
  return useMutation<Cart, CartFailure, { lineId: string; quantity: number }, { previous?: Cart }>({
    mutationFn: (input) => wrap(() => api.updateCartLine(input), toCartFailure),
    onMutate: async ({ lineId, quantity }) => {
      await client.cancelQueries({ queryKey: cartKeys.current() });
      forgetPrices();
      const previous = client.getQueryData<Cart>(cartKeys.current());
      if (previous) {
        const lines = previous.lines.map((l) => (l.lineId === lineId ? { ...l, quantity } : l));
        client.setQueryData(cartKeys.current(), { ...previous, lines });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(cartKeys.current(), context.previous);
    },
    onSettled: () => settle(client),
  });
}

export function useRemoveCartLine() {
  const client = useQueryClient();
  return useMutation<Cart, CartFailure, { lineId: string }, { previous?: Cart }>({
    mutationFn: (input) => wrap(() => api.removeCartLine(input), toCartFailure),
    onMutate: async ({ lineId }) => {
      await client.cancelQueries({ queryKey: cartKeys.current() });
      forgetPrices();
      const previous = client.getQueryData<Cart>(cartKeys.current());
      if (previous) {
        client.setQueryData(cartKeys.current(), { ...previous, lines: previous.lines.filter((l) => l.lineId !== lineId) });
      }
      return { previous };
    },
    onError: (_error, _vars, context) => {
      if (context?.previous) client.setQueryData(cartKeys.current(), context.previous);
    },
    onSettled: () => settle(client),
  });
}

export function useApplyCoupon() {
  const client = useQueryClient();
  return useMutation<Cart, CouponFailure, { code: string }>({
    mutationFn: (input) => wrap(() => api.applyCoupon(input), toCouponFailure),
    onSuccess: (cart) => settle(client, cart),
  });
}

export function useRemoveCoupon() {
  const client = useQueryClient();
  return useMutation<Cart, CouponFailure, void>({
    mutationFn: () => wrap(() => api.removeCoupon(), toCouponFailure),
    onSuccess: (cart) => settle(client, cart),
  });
}
