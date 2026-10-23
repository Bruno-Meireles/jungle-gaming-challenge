import type { Quote } from './cart';

export type QuoteChange = 'price' | 'availability' | 'coupon' | 'fee' | 'total';

/** Compara a cotacao revisada pelo usuario com a atual (esqueleto; implementacao no GREEN). */
export function diffQuotes(reviewed: Quote, current: Quote): QuoteChange[] {
  void reviewed;
  void current;
  throw new Error('not_implemented');
}

export function clampQuantity(requested: number, availableEditions: number): number {
  void requested;
  void availableEditions;
  throw new Error('not_implemented');
}
