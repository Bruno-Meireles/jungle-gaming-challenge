import { z } from 'zod';

import { NETWORK_IDS } from './ids';
import { ethDecimalSchema } from './nfts';

/** Contratos de comercio: carrinho, cotacao, pedidos e favoritos. Valores ETH sao sempre strings decimais. */

const nftIdSchema = z.string().regex(/^[a-z0-9-]+$/);
const quantitySchema = z.number().int().positive();
const nonNegativeIntSchema = z.number().int().min(0);
const networkIdSchema = z.enum(NETWORK_IDS);

// ---------- Carrinho ----------
export const cartLineDtoSchema = z.object({
  nftId: nftIdSchema,
  title: z.string().min(1),
  image: z.object({ src: z.string(), width: z.number().int().positive(), height: z.number().int().positive() }),
  quantity: quantitySchema,
  unitPriceEth: ethDecimalSchema,
  /** Edicoes ainda disponiveis para este NFT (limite superior da quantidade). */
  availableEditions: nonNegativeIntSchema,
});

export const cartDtoSchema = z.object({
  lines: z.array(cartLineDtoSchema),
  couponCode: z.string().nullable(),
  /** Incrementa a cada mutacao; base para ignorar respostas antigas. */
  version: nonNegativeIntSchema,
});

export const addCartLineRequestSchema = z.object({ nftId: nftIdSchema, quantity: quantitySchema });
export const updateCartLineRequestSchema = z.object({ quantity: quantitySchema });
export const applyCouponRequestSchema = z.object({ code: z.string().trim().min(1).max(32) });

// ---------- Cotacao ----------
export const COUPON_STATUSES = ['applied', 'invalid', 'expired'] as const;

export const quoteCouponSchema = z.object({
  code: z.string(),
  status: z.enum(COUPON_STATUSES),
  /** Percentual inteiro de desconto quando aplicado. */
  percent: z.number().int().min(0).max(100).nullable(),
});

export const QUOTE_ISSUE_KINDS = ['sold_out', 'insufficient_editions', 'price_changed'] as const;

export const quoteIssueSchema = z.object({
  nftId: nftIdSchema,
  kind: z.enum(QUOTE_ISSUE_KINDS),
  availableEditions: nonNegativeIntSchema,
});

export const quoteLineSchema = z.object({
  nftId: nftIdSchema,
  title: z.string(),
  quantity: quantitySchema,
  unitPriceEth: ethDecimalSchema,
  lineTotalEth: ethDecimalSchema,
});

export const quoteDtoSchema = z.object({
  /** Hash do conteudo da cotacao; o pedido referencia esta cotacao. Muda se preco, estoque, cupom ou taxa mudarem. */
  quoteHash: z.string().min(1),
  networkId: networkIdSchema,
  lines: z.array(quoteLineSchema),
  subtotalEth: ethDecimalSchema,
  discountEth: ethDecimalSchema,
  networkFeeEth: ethDecimalSchema,
  totalEth: ethDecimalSchema,
  coupon: quoteCouponSchema.nullable(),
  issues: z.array(quoteIssueSchema),
  /** false quando ha issues que impedem confirmar. */
  canCheckout: z.boolean(),
});

// ---------- Pedidos ----------
export const ORDER_STATUSES = ['pending', 'confirmed', 'refused'] as const;
export const orderStatusSchema = z.enum(ORDER_STATUSES);

export const orderItemDtoSchema = z.object({
  nftId: nftIdSchema,
  title: z.string(),
  image: z.object({ src: z.string(), width: z.number().int().positive(), height: z.number().int().positive() }),
  quantity: quantitySchema,
  unitPriceEth: ethDecimalSchema,
  lineTotalEth: ethDecimalSchema,
});

export const createOrderRequestSchema = z.object({
  quoteHash: z.string().min(1),
  networkId: networkIdSchema,
  walletId: z.string().min(1),
  collector: z.object({ fullName: z.string().trim().min(1), email: z.string().trim().min(1) }),
  lines: z.array(z.object({ nftId: nftIdSchema, quantity: quantitySchema })).min(1),
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
  collector: z.object({ fullName: z.string(), email: z.string() }),
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
export type AddCartLineRequest = z.infer<typeof addCartLineRequestSchema>;
export type UpdateCartLineRequest = z.infer<typeof updateCartLineRequestSchema>;
export type ApplyCouponRequest = z.infer<typeof applyCouponRequestSchema>;
export type CouponStatus = (typeof COUPON_STATUSES)[number];
export type QuoteCouponDto = z.infer<typeof quoteCouponSchema>;
export type QuoteIssueDto = z.infer<typeof quoteIssueSchema>;
export type QuoteDto = z.infer<typeof quoteDtoSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type OrderItemDto = z.infer<typeof orderItemDtoSchema>;
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;
export type OrderDto = z.infer<typeof orderDtoSchema>;
export type FavoritesDto = z.infer<typeof favoritesDtoSchema>;

/** Cabecalhos do contrato. */
export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
export const GUEST_CART_HEADER = 'X-Guest-Cart-Id';
