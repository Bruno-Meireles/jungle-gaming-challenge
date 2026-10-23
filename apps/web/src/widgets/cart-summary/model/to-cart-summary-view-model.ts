import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthFixed } from '../../../shared/lib/eth/format-eth';
import type { CartSummaryViewModel, SummaryLocale, SummaryState, Translate } from './types';

export function toCartSummaryViewModel({
  state,
  locale,
  t,
}: {
  state: SummaryState;
  locale: SummaryLocale;
  t: Translate;
}): CartSummaryViewModel {
  if (state.status !== 'ready') return { status: state.status };
  const { quote, busy } = state;
  const fixed = (value: string) => formatEthFixed(asEthAmount(value), locale, 2);
  const eth = (value: string) => t('shared:eth.amount', { amount: fixed(value) });
  return {
    status: 'ready',
    subtotal: eth(quote.subtotal),
    discount: t('cartSummary:discountValue', { amount: fixed(quote.discount) }),
    networkFee: eth(quote.networkFee),
    total: eth(quote.total),
    couponCode: quote.coupon?.status === 'applied' ? quote.coupon.code : null,
    busy,
  };
}
