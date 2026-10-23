import type { Cart, CartQuote } from '../../../entities/cart';
import { toCartLineViewModel, type CartLineInput, type CartLineViewModel, type QuoteLineInput } from '../../../widgets/cart-lines';
import { toCartSummaryViewModel, type CartSummaryViewModel } from '../../../widgets/cart-summary';
import type { DisabledReason } from './cart-input';

type Translate = (key: string, options?: Record<string, string | number>) => string;

export type CartViews = {
  lines: CartLineViewModel[];
  summary: CartSummaryViewModel;
  disabledReason: DisabledReason | null;
};

/** Rotulos como '1-50' (1 de 50) viram numero/tiragem; 'open' (supply nulo) vira tiragem 0 (edicao aberta). */
function editionNumber(label: string): number {
  const first = /^(\d+)-/.exec(label);
  return first ? Number(first[1]) : 0;
}

export function toCartLineInput(line: Cart['lines'][number]): CartLineInput {
  return {
    lineId: line.lineId,
    nftId: line.nftId,
    title: line.title,
    image: line.image,
    tokenId: line.tokenId,
    edition: { id: line.edition.id, number: editionNumber(line.edition.label), supply: line.edition.supply ?? 0 },
    unitPrice: line.unitPrice,
    quantity: line.quantity,
    maxQuantity: line.maxQuantity,
  };
}

function toQuoteLineInput(line: CartQuote['lines'][number]): QuoteLineInput {
  return { lineId: line.lineId, unitPrice: line.unitPrice, quantity: line.quantity, lineTotal: line.lineTotal, notice: line.notice };
}

/** Totais e valores por linha vem sempre da cotacao: nada e calculado no cliente. */
export function toCartViews({
  cart,
  quote,
  quoteStatus,
  busy,
  locale,
  t,
}: {
  cart: Cart;
  quote: CartQuote | undefined;
  quoteStatus: 'pending' | 'error' | 'ready';
  busy: boolean;
  locale: 'pt-BR' | 'en';
  t: Translate;
}): CartViews {
  const quoteLines = new Map((quote?.lines ?? []).map((l) => [l.lineId, toQuoteLineInput(l)]));
  const lines = cart.lines.map((line) =>
    toCartLineViewModel({ line: toCartLineInput(line), quoteLine: quoteLines.get(line.lineId), locale, t }),
  );
  const summary = toCartSummaryViewModel({
    state: quote
      ? {
          status: 'ready',
          busy,
          quote: {
            subtotal: quote.subtotal,
            discount: quote.discount,
            networkFee: quote.networkFee,
            total: quote.total,
            coupon: quote.coupon ? { code: quote.coupon.code, status: 'applied' } : null,
          },
        }
      : { status: quoteStatus === 'error' ? 'error' : 'loading' },
    locale,
    t,
  });
  const disabledReason: DisabledReason | null = !quote
    ? quoteStatus === 'error'
      ? 'quote_error'
      : 'quote_pending'
    : lines.some((l) => l.blocking) || !quote.canCheckout
      ? 'line_blocking'
      : null;
  return { lines, summary, disabledReason };
}
