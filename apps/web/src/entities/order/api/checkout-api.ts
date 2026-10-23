import type { Order, PlaceOrderInput } from '../model/domain/order';

export function createOrder(input: PlaceOrderInput, idempotencyKey: string): Promise<Order> {
  void input;
  void idempotencyKey;
  return Promise.reject(new Error('not_implemented'));
}
export function fetchOrder(orderId: string, signal?: AbortSignal): Promise<Order> {
  void orderId;
  void signal;
  return Promise.reject(new Error('not_implemented'));
}
