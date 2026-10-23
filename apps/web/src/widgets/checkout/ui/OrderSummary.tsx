import { Separator } from '@jg/design-system';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocale } from '../../../shared/hooks';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthAmount } from '../../../shared/lib/eth/format-eth';
import type { QuoteView } from '../model/ports';

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-16">
      <span className={strong ? 'text-body-large-16-bold-lh-16' : 'text-body-15-regular-lh-16'}>{label}</span>
      <span className={strong ? 'text-body-large-18-bold-lh-16' : 'text-body-large-16-regular-lh-16 tablet:text-body-large-18-regular'}>{value}</span>
    </div>
  );
}

export function OrderSummary({ quote }: { quote: QuoteView }) {
  const { t } = useTranslation(['checkout', 'shared']);
  const locale = useLocale();
  const headingId = useId();
  const eth = (value: string) => t('shared:eth.amount', { amount: formatEthAmount(asEthAmount(value), locale) });
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-16">
      <h2 id={headingId} className="text-body-large-17-bold text-foreground">
        {t('summary')}
      </h2>
      <ul className="flex flex-col gap-16">
        {quote.lines.map((line) => (
          <li key={line.tokenId} className="flex justify-between gap-16">
            <div className="flex flex-col gap-4">
              <p className="flex gap-8">
                <span className="text-body-large-16-bold-lh-16">{line.title}</span>
                <span className="text-body-14-regular-lh-16">{t('quantity', { quantity: line.quantity })}</span>
              </p>
              <p className="flex gap-4 text-body-14-regular-lh-16 text-secondary">
                <span>{t('tokenId')}</span>
                <span>{line.tokenId}</span>
              </p>
            </div>
            <span className="text-body-large-16-regular-lh-16 tablet:text-body-large-18-regular">{eth(line.lineTotalEth)}</span>
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
