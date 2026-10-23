import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { fetchOrder, toOrderFailure } from '../api/checkout-api';
import type { Order, OrderFailure, PlaceOrderInput, PlaceOrderResult } from './domain/order';
import { isTerminalStatus } from './domain/order-status';
import { orderKeys } from './order-keys';
import { placeOrder } from './place-order';

const POLL_MS = 1000;

/** placeOrder(input, {onRecovering}): idempotencia dentro do hook; nao lanca, devolve Result. */
export function usePlaceOrder() {
  const [pending, setPending] = useState(false);
  const run = async (
    input: PlaceOrderInput,
    options?: { onRecovering?: () => void },
  ): Promise<PlaceOrderResult> => {
    setPending(true);
    try {
      return await placeOrder(input, options?.onRecovering);
    } finally {
      setPending(false);
    }
  };
  return { placeOrder: run, pending };
}

async function loadOrder(orderId: string, signal: AbortSignal): Promise<Order> {
  try {
    return await fetchOrder(orderId, signal);
  } catch (error) {
    throw toOrderFailure(error);
  }
}

/** Consulta o pedido; polling de 1s so enquanto pendente (fallback do order.updated). */
export function useOrder(orderId: string) {
  return useQuery<Order, OrderFailure>({
    queryKey: orderKeys.detail(orderId),
    queryFn: ({ signal }) => loadOrder(orderId, signal),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && !isTerminalStatus(status) ? POLL_MS : false;
    },
    retry: false,
  });
}
