import { isApiError } from '../../../shared/api/api-error';
import {
  GUEST_CART_HEADER,
  cartDtoSchema,
  quoteDtoSchema,
  type CartDto,
  type QuoteDto,
} from '../../../shared/api/contracts/commerce';
import type { NetworkId } from '../../../shared/api/contracts/ids';
import { getJson, httpClient } from '../../../shared/api/http-client';
import { sendJson } from '../../../shared/api/send-json';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { getGuestId } from '../../../shared/lib/viewer/guest-id';
import type { Cart, CartFailure, CartQuote, CouponFailure, LineNotice } from '../model/domain/cart';

const guestHeaders = () => ({ [GUEST_CART_HEADER]: getGuestId() });

export function toCart(dto: CartDto): Cart {
  return {
    couponCode: dto.couponCode,
    itemCount: dto.itemCount,
    version: dto.version,
    lines: dto.lines.map((l) => ({
      lineId: l.lineId,
      nftId: l.nftId,
      title: l.title,
      image: l.image,
      tokenId: l.tokenId,
      edition: { id: l.editionId, label: l.editionLabel, supply: l.supply },
      unitPrice: asEthAmount(l.unitPriceEth),
      quantity: l.quantity,
      maxQuantity: l.maxQuantity,
    })),
  };
}

function noticeOf(status: QuoteDto['lines'][number]['status'], available: number): LineNotice | null {
  if (status === 'sold_out') return { kind: 'sold_out' };
  return status === 'insufficient' ? { kind: 'availability_reduced', available } : null;
}

export function toQuote(dto: QuoteDto): CartQuote {
  return {
    quoteHash: dto.quoteHash,
    cartVersion: dto.cartVersion,
    networkId: dto.networkId,
    lines: dto.lines.map((l) => ({
      lineId: l.lineId,
      unitPrice: asEthAmount(l.unitPriceEth),
      quantity: l.quantity,
      lineTotal: asEthAmount(l.lineTotalEth),
      notice: noticeOf(l.status, l.available),
    })),
    subtotal: asEthAmount(dto.subtotalEth),
    discount: asEthAmount(dto.discountEth),
    networkFee: asEthAmount(dto.networkFeeEth),
    total: asEthAmount(dto.totalEth),
    coupon: dto.coupon ? { code: dto.coupon.code, percent: dto.coupon.percent } : null,
    canCheckout: dto.canCheckout,
    expiresAt: dto.expiresAt,
  };
}

export async function fetchCart(signal?: AbortSignal): Promise<Cart> {
  return toCart(await getJson(httpClient, { path: '/cart', schema: cartDtoSchema, signal, headers: guestHeaders() }));
}

export async function fetchQuote(networkId: NetworkId, signal?: AbortSignal): Promise<CartQuote> {
  const dto = await getJson(httpClient, {
    path: '/cart/quote',
    schema: quoteDtoSchema,
    params: { networkId },
    signal,
    headers: guestHeaders(),
  });
  return toQuote(dto);
}

async function mutate(method: 'post' | 'put' | 'patch' | 'delete', path: string, body?: unknown): Promise<Cart> {
  const dto = await sendJson(httpClient, { method, path, body, schema: cartDtoSchema, headers: guestHeaders() });
  return toCart(dto);
}

export const addCartItem = (input: { nftId: string; editionId: string; quantity: number }) =>
  mutate('post', '/cart/items', input);
export const updateCartLine = (input: { lineId: string; quantity: number }) =>
  mutate('patch', `/cart/items/${encodeURIComponent(input.lineId)}`, { quantity: input.quantity });
export const removeCartLine = (input: { lineId: string }) =>
  mutate('delete', `/cart/items/${encodeURIComponent(input.lineId)}`);
export const applyCoupon = (input: { code: string }) => mutate('put', '/cart/coupon', input);
export const removeCoupon = () => mutate('delete', '/cart/coupon');

export function toCartFailure(error: unknown): CartFailure {
  if (!isApiError(error)) return { kind: 'unexpected' };
  if (error.code === 'availability_conflict') return { kind: 'availability_conflict', available: error.available ?? 0 };
  if (error.code === 'not_found') return { kind: 'not_found' };
  return error.transient || error.code === 'network_error' ? { kind: 'network', retryable: true } : { kind: 'unexpected' };
}

export function toCouponFailure(error: unknown): CouponFailure {
  if (isApiError(error) && (error.code === 'coupon_invalid' || error.code === 'coupon_expired')) {
    return { kind: error.code };
  }
  const base = toCartFailure(error);
  return base.kind === 'network' ? base : { kind: 'unexpected' };
}
