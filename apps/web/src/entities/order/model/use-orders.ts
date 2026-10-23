import { type UseMutationResult, type UseQueryResult } from '@tanstack/react-query';

import type { ApiError } from '../../../shared/api/api-error';
import type { Order, PlaceOrderInput } from './domain/order';

/** Cria o pedido com chave de idempotencia estavel por tentativa; cliques repetidos reutilizam a chave. */
export function usePlaceOrder(): UseMutationResult<Order, ApiError, PlaceOrderInput> {
  throw new Error('not_implemented');
}

/** Consulta o pedido; recupera pendente apos refresh/reconexao. */
export function useOrder(orderId: string): UseQueryResult<Order, ApiError> {
  void orderId;
  throw new Error('not_implemented');
}
