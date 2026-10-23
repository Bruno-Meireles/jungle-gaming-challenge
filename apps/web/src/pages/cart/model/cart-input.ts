/*
 * Tipos de entrada da UI do carrinho. Os tipos de linha e resumo pertencem aos widgets (FSD: widgets nao importam
 * de pages); aqui so se re-exportam e se compoe a cotacao completa. Valores ETH sao strings decimais.
 */
import type { QuoteLineInput } from '../../../widgets/cart-lines';
import type { SummaryQuote } from '../../../widgets/cart-summary';

export type {
  CartLineInput,
  CartLineViewModel,
  LineNoticeInput,
  QuoteLineInput,
} from '../../../widgets/cart-lines';
export type { CartSummaryViewModel } from '../../../widgets/cart-summary';

export type CartQuoteInput = SummaryQuote & {
  quoteId: string;
  cartVersion: number;
  lines: QuoteLineInput[];
  expiresAt: number;
};

export type DisabledReason = 'quote_pending' | 'quote_error' | 'line_blocking';
export type CouponFailureKind = 'coupon_invalid' | 'coupon_expired' | 'required' | 'network' | 'unexpected';
