import { asEthAmount } from '../../../../shared/lib/eth/eth';
import type { CartQuote, LineNotice } from './cart';

/** Preco visto pelo usuario por linha (ultima cotacao reconhecida). */
export type SeenPrices = ReadonlyMap<string, string>;

export function clampQuantity(requested: number, maxQuantity: number): number {
  const whole = Math.trunc(requested);
  return Math.max(1, Math.min(whole, Math.max(maxQuantity, 1)));
}

/** Mudancas entre a cotacao vista e a atual: preco por linha, ou qualquer diferenca economica (hash). */
export function diffQuotes(seen: CartQuote, current: CartQuote): { priceChanged: string[]; changed: boolean } {
  const priceChanged = current.lines
    .filter((l) => {
      const before = seen.lines.find((x) => x.lineId === l.lineId);
      return before !== undefined && before.unitPrice !== l.unitPrice;
    })
    .map((l) => l.lineId);
  return { priceChanged, changed: seen.quoteHash !== current.quoteHash };
}

/** Avisos por linha: price_changed vem do diff com os precos vistos; disponibilidade vem da API. */
export function withNotices(
  quote: CartQuote,
  seenPrices: SeenPrices,
  apiNotices: ReadonlyMap<string, LineNotice>,
): CartQuote {
  return {
    ...quote,
    lines: quote.lines.map((line) => {
      const available = apiNotices.get(line.lineId);
      const seen = seenPrices.get(line.lineId);
      const notice =
        available ??
        (seen !== undefined && seen !== line.unitPrice
          ? ({ kind: 'price_changed', previousUnitPrice: asEthAmount(seen), unitPrice: line.unitPrice } as const)
          : null);
      return { ...line, notice };
    }),
  };
}

