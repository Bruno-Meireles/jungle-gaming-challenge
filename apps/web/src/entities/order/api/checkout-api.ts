import { isApiError } from '../../../shared/api/api-error';
import {
  IDEMPOTENCY_KEY_HEADER,
  orderDtoSchema,
  type OrderDto,
} from '../../../shared/api/contracts/commerce';
import { getJson, httpClient } from '../../../shared/api/http-client';
import { sendJson } from '../../../shared/api/send-json';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import type { Order, OrderFailure, PlaceOrderFailure, PlaceOrderInput } from '../model/domain/order';

const ORDER_TIMEOUT_MS = 8000;

export function toOrder(dto: OrderDto): Order {
  return {
    id: dto.id,
    status: dto.status,
    version: dto.version,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    networkId: dto.networkId,
    walletId: dto.walletId,
    collector: dto.collector,
    couponCode: dto.couponCode,
    items: dto.items.map((i) => ({
      nftId: i.nftId,
      editionId: i.editionId,
      editionLabel: i.editionLabel,
      tokenId: i.tokenId,
      title: i.title,
      image: i.image,
      quantity: i.quantity,
      unitPrice: asEthAmount(i.unitPriceEth),
      lineTotal: asEthAmount(i.lineTotalEth),
    })),
    subtotal: asEthAmount(dto.subtotalEth),
    discount: asEthAmount(dto.discountEth),
    networkFee: asEthAmount(dto.networkFeeEth),
    total: asEthAmount(dto.totalEth),
    transactionRef: dto.transactionRef,
    explorerUrl: dto.explorerUrl,
    refusalReason: dto.refusalReason,
  };
}

export async function createOrder(input: PlaceOrderInput, idempotencyKey: string): Promise<Order> {
  const dto = await sendJson(httpClient, {
    method: 'post',
    path: '/orders',
    body: input,
    schema: orderDtoSchema,
    headers: { [IDEMPOTENCY_KEY_HEADER]: idempotencyKey },
    timeoutMs: ORDER_TIMEOUT_MS,
  });
  return toOrder(dto);
}

export async function fetchOrder(orderId: string, signal?: AbortSignal): Promise<Order> {
  const dto = await getJson(httpClient, {
    path: `/orders/${encodeURIComponent(orderId)}`,
    schema: orderDtoSchema,
    signal,
  });
  return toOrder(dto);
}

const isNetwork = (error: { transient: boolean; code: string }): boolean =>
  error.transient || error.code === 'network_error';

export function toPlaceOrderFailure(error: unknown): PlaceOrderFailure {
  if (!isApiError(error)) return { kind: 'unexpected' };
  switch (error.code) {
    case 'quote_changed':
    case 'availability_conflict':
    case 'idempotency_conflict':
      return { kind: error.code };
    case 'session_invalid':
      return { kind: 'session_expired' };
    case 'validation_failed':
      return { kind: 'validation' };
    default:
      return isNetwork(error) ? { kind: 'network', retryable: true } : { kind: 'unexpected' };
  }
}

export function toOrderFailure(error: unknown): OrderFailure {
  if (!isApiError(error)) return { kind: 'unexpected' };
  if (error.code === 'not_found' || error.code === 'forbidden') return { kind: 'not_found' };
  if (error.code === 'session_invalid') return { kind: 'session_expired' };
  return isNetwork(error) ? { kind: 'network', retryable: true } : { kind: 'unexpected' };
}
