import type { NetworkId } from '../../../shared/api/contracts/ids';
import type { Cart, Quote } from '../model/domain/cart';

const NOT_IMPLEMENTED = 'not_implemented';

export function fetchCart(signal?: AbortSignal): Promise<Cart> {
  void signal;
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
export function addCartLine(input: { nftId: string; quantity: number }): Promise<Cart> {
  void input;
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
export function updateCartLine(input: { nftId: string; quantity: number }): Promise<Cart> {
  void input;
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
export function removeCartLine(input: { nftId: string }): Promise<Cart> {
  void input;
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
export function applyCoupon(input: { code: string }): Promise<Cart> {
  void input;
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
export function removeCoupon(): Promise<Cart> {
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
export function fetchQuote(networkId: NetworkId, signal?: AbortSignal): Promise<Quote> {
  void networkId;
  void signal;
  return Promise.reject(new Error(NOT_IMPLEMENTED));
}
