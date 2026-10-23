import { Separator } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { useLocale } from '../../../shared/hooks';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthAmount } from '../../../shared/lib/eth/format-eth';
import type { QuoteView } from '../model/ports';

const NORMAL = "flex justify-between gap-16 text-body-14-regular-lh-16";
const STRONG = "flex justify-between gap-16 text-body-15-bold-lh-16";

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? STRONG : NORMAL}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function OrderSummary({ quote }: { quote: QuoteView }) {
  const { t } = useTranslation(['checkout', 'shared']);
  const locale = useLocale();
  const eth = (value: string) => t('shared:eth.amount', { amount: formatEthAmount(asEthAmount(value), locale) });
  return (
    <section aria-label={t('summary')} className="flex flex-col gap-16">
      <ul className="flex flex-col gap-16">
        {quote.lines.map((line) => (
          <li key={line.tokenId} className="flex justify-between gap-16">
            <div className="flex flex-col gap-4">
              <p className="flex gap-8 text-body-14-bold-lh-16">
                <span>{line.title}</span>
                <span>{t('quantity', { quantity: line.quantity })}</span>
              </p>
              <p className="flex gap-4 text-body-14-regular-lh-16 text-secondary">
                <span>{t('tokenId')}</span>
                <span>{line.tokenId}</span>
              </p>
            </div>
            <span>{eth(line.lineTotalEth)}</span>
          </li>
        ))}
      </ul>
      <Separator />
      <Row label={t('subtotal')} value={eth(quote.subtotalEth)} />
      <Row label={t('discount')} value={eth(quote.discountEth)} />
      <Row label={t('networkFee')} value={eth(quote.networkFeeEth)} />
      <Row label={t('total')} value={eth(quote.totalEth)} strong />
    </section>
  );
}
