import { Alert, Button, LiveRegion, Skeleton } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import type { CartSummaryViewModel } from '../model/types';

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={strong ? 'flex justify-between gap-16 text-body-15-bold-lh-16' : 'flex justify-between gap-16 text-body-14-regular-lh-16'}>
      <dt>{label}</dt>
      <dd className="m-0">{value}</dd>
    </div>
  );
}

export function CartSummary({ summary, onRetry }: { summary: CartSummaryViewModel; onRetry?: () => void }) {
  const { t } = useTranslation('cartSummary');
  return (
    <section aria-label={t('title')} className="flex flex-col gap-16">
      <h2 className="text-heading-20-bold text-foreground">{t('title')}</h2>
      {summary.status === 'loading' ? (
        <div role="status" aria-label={t('loading')} className="flex flex-col gap-12">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : null}
      {summary.status === 'error' ? (
        <div className="flex flex-col gap-12">
          <Alert tone="error" toneLabel="">
            {t('error')}
          </Alert>
          {onRetry ? (
            <Button variant="outline" onClick={onRetry} className="self-start">
              {t('retry')}
            </Button>
          ) : null}
        </div>
      ) : null}
      {summary.status === 'ready' ? (
        <>
          <dl aria-busy={summary.busy} className="m-0 flex flex-col gap-12">
            <Row label={t('subtotal')} value={summary.subtotal} />
            <Row label={t('discount')} value={summary.discount} />
            <Row label={t('networkFee')} value={summary.networkFee} />
            <Row label={t('total')} value={summary.total} strong />
          </dl>
          <LiveRegion>
            <span className="sr-only">{t('total')}: {summary.total}</span>
          </LiveRegion>
          {summary.couponCode ? (
            <p className="text-body-14-regular-lh-16 text-secondary">{t('couponApplied', { code: summary.couponCode })}</p>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
