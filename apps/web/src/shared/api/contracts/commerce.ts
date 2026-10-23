import { z } from 'zod';

import { NETWORK_IDS } from './ids';
import { ethDecimalSchema } from './nfts';

/*
 * Contratos de comercio: carrinho, cotacao, pedidos e favoritos.
 * Valores ETH sao sempre strings decimais; quantidades sao inteiras.
 * A linha do carrinho e identificada por (nftId, editionId) e tem lineId estavel.
 */

const nftIdSchema = z.string().regex(/^[a-z0-9-]+$/);
const editionIdSchema = z.string().regex(/^[a-z0-9-]+$/);
const lineIdSchema = z.string().min(1);
const quantitySchema = z.number().int().positive();
const nonNegativeIntSchema = z.number().int().min(0);
const networkIdSchema = z.enum(NETWORK_IDS);
const imageSchema = z.object({
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

// ---------- Carrinho ----------
export const cartLineDtoSchema = z.object({
  lineId: lineIdSchema,
  nftId: nftIdSchema,
  editionId: editionIdSchema,
  /** Rotulo neutro da edicao (ex.: '1-50', 'open'); o texto traduzido e da UI. */
  editionLabel: z.string().min(1),
  /** Tiragem da edicao limitada; null para edicao aberta. */
  supply: z.number().int().positive().nullable(),
  tokenId: z.string().regex(/^#\d{4,}$/),
  title: z.string().min(1),
  image: imageSchema,
  quantity: quantitySchema,
  unitPriceEth: ethDecimalSchema,
  /** Maximo comprável agora: min(restante da edicao, maximo por pedido). 0 = esgotado. */
  maxQuantity: nonNegativeIntSchema,
});

export const cartDtoSchema = z.object({
  lines: z.array(cartLineDtoSchema),
  couponCode: z.string().nullable(),
  /** Soma das quantidades. */
  itemCount: nonNegativeIntSchema,
  /** Incrementa a cada mutacao; base para descartar respostas antigas. */
  version: nonNegativeIntSchema,
});

export const addCartItemRequestSchema = z.object({
  nftId: nftIdSchema,
  editionId: editionIdSchema,
  quantity: quantitySchema,
});
export const updateCartItemRequestSchema = z.object({ quantity: quantitySchema });
export const applyCouponRequestSchema = z.object({ code: z.string().trim().min(1).max(32) });

// ---------- Cotacao ----------
export const COUPON_STATUSES = ['applied'] as const;

export const quoteCouponSchema = z.object({
  code: z.string(),
  status: z.enum(COUPON_STATUSES),
  percent: z.number().int().min(0).max(100),
});

export const QUOTE_LINE_STATUSES = ['ok', 'insufficient', 'sold_out'] as const;

export const quoteLineDtoSchema = z.object({
  lineId: lineIdSchema,
  nftId: nftIdSchema,
  title: z.string(),
  quantity: quantitySchema,
  unitPriceEth: ethDecimalSchema,
  lineTotalEth: ethDecimalSchema,
  status: z.enum(QUOTE_LINE_STATUSES),
  /** Quantidade disponivel agora para esta linha. */
  available: nonNegativeIntSchema,
});

export const quoteDtoSchema = z.object({
  /** Hash do conteudo economico (linhas, precos, cupom, taxa, rede); o pedido referencia esta cotacao. */
  quoteHash: z.string().min(1),
  cartVersion: nonNegativeIntSchema,
  networkId: networkIdSchema,
  lines: z.array(quoteLineDtoSchema),
  subtotalEth: ethDecimalSchema,
  discountEth: ethDecimalSchema,
  networkFeeEth: ethDecimalSchema,
  totalEth: ethDecimalSchema,
  coupon: quoteCouponSchema.nullable(),
  /** false quando alguma linha esta esgotada ou acima do disponivel. */
  canCheckout: z.boolean(),
  expiresAt: z.number().int(),
});

// ---------- Pedidos ----------
export const ORDER_STATUSES = ['pending', 'confirmed', 'refused'] as const;
export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const orderItemDtoSchema = z.object({
  nftId: nftIdSchema,
  editionId: editionIdSchema,
  editionLabel: z.string(),
  tokenId: z.string(),
  title: z.string(),
  image: imageSchema,
  quantity: quantitySchema,
  unitPriceEth: ethDecimalSchema,
  lineTotalEth: ethDecimalSchema,
});

export const collectorSchema = z.object({
  displayName: z.string().trim().min(1),
  email: z.string().trim().min(1),
  username: z.string().trim().min(1),
  profileName: z.string().trim().min(1),
  referralCode: z.string().trim().min(1),
  ensName: z.string().trim().min(1),
  secondaryWalletOrEns: z.string().trim().optional(),
  note: z.string().trim().optional(),
});

export const createOrderRequestSchema = z.object({
  quoteHash: z.string().min(1),
  networkId: networkIdSchema,
  walletId: z.string().min(1),
  connectionId: z.string().optional(),
  walletProvider: z.string().optional(),
  collector: collectorSchema,
  lines: z.array(z.object({ lineId: lineIdSchema, quantity: quantitySchema })).min(1),
});

export const orderDtoSchema = z.object({
  id: z.string().min(1),
  status: orderStatusSchema,
  /** Incrementa a cada transicao; eventos com versao <= conhecida sao ignorados. */
  version: nonNegativeIntSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
  networkId: networkIdSchema,
  walletId: z.string(),
  collector: collectorSchema,
  couponCode: z.string().nullable(),
  /** Snapshot: nunca muda depois da criacao, mesmo se o catalogo mudar. */
  items: z.array(orderItemDtoSchema),
  subtotalEth: ethDecimalSchema,
  discountEth: ethDecimalSchema,
  networkFeeEth: ethDecimalSchema,
  totalEth: ethDecimalSchema,
  /** Referencia simulada; so existe para pedido confirmado. */
  transactionRef: z.string().nullable(),
  explorerUrl: z.string().nullable(),
  refusalReason: z.enum(['payment_declined']).nullable(),
});

export const orderListDtoSchema = z.object({ orders: z.array(orderDtoSchema) });

// ---------- Favoritos ----------
export const favoritesDtoSchema = z.object({
  nftIds: z.array(nftIdSchema),
  version: nonNegativeIntSchema,
});

export type CartLineDto = z.infer<typeof cartLineDtoSchema>;
export type CartDto = z.infer<typeof cartDtoSchema>;
export type AddCartItemRequest = z.infer<typeof addCartItemRequestSchema>;
export type UpdateCartItemRequest = z.infer<typeof updateCartItemRequestSchema>;
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>;
export type QuoteLineStatus = (typeof QUOTE_LINE_STATUSES)[number];
export type QuoteLineDto = z.infer<typeof quoteLineDtoSchema>;
export type QuoteDto = z.infer<typeof quoteDtoSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItemDto = z.infer<typeof orderItemDtoSchema>;
export type CollectorDto = z.infer<typeof collectorSchema>;
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type OrderDto = z.infer<typeof orderDtoSchema>;
export type FavoritesDto = z.infer<typeof favoritesDtoSchema>;

/** Cabecalhos do contrato. */
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
export const GUEST_CART_HEADER = 'X-Guest-Cart-Id';
