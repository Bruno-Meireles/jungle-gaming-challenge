import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthFixed } from '../../../shared/lib/eth/format-eth';
import type { CartLineInput, CartLineViewModel, CartLocale, QuoteLineInput, Translate } from './types';

export function toCartLineViewModel({
  line,
  quoteLine,
  locale,
  t,
}: {
  line: CartLineInput;
  quoteLine: QuoteLineInput | undefined;
  locale: CartLocale;
  t: Translate;
}): CartLineViewModel {
  const eth = (value: string) => t('shared:eth.amount', { amount: formatEthFixed(asEthAmount(value), locale, 2) });
  const notice = quoteLine?.notice ?? null;
  return {
    lineId: line.lineId,
    title: line.title,
    href: `/nfts/${line.nftId}`,
    image: { src: line.image.src, alt: t('cartLines:image.alt', { title: line.title }) },
    tokenLabel: line.tokenId,
    editionLabel:
      line.edition.supply > 0
        ? t('cartLines:edition', { number: line.edition.number, supply: line.edition.supply })
        : t('cartLines:editionOpen'),
    unitPriceLabel: eth(quoteLine?.unitPrice ?? line.unitPrice),
    lineTotalLabel: quoteLine ? eth(quoteLine.lineTotal) : null,
    quantity: line.quantity,
    min: 1,
    max: line.maxQuantity,
    canIncrement: line.quantity < line.maxQuantity,
    notice,
    blocking: notice?.kind === 'sold_out' || line.quantity > line.maxQuantity,
  };
}
