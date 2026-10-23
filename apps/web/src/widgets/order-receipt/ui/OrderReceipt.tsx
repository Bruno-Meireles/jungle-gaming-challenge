import { Separator } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import type { ReceiptView } from '../model/ports';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-16 text-body-14-regular-lh-16">
      <span>{label}</span>
      <span className="min-w-0 break-all text-right">{value}</span>
    </div>
  );
}

export function OrderReceipt({ view }: { view: ReceiptView }) {
  const { t } = useTranslation('orderReceipt');
  return (
    <div className="flex flex-col gap-16">
      {view.transactionRef ? <Row label={t('transactionId')} value={view.transactionRef} /> : null}
      <Row label={t('date')} value={view.date} />
      <Row label={t('wallet')} value={view.wallet} />
      <Separator />
      <ul className="flex flex-col gap-12">
        {view.items.map((item) => (
          <li key={item.key} className="flex justify-between gap-16">
            <div className="flex flex-col gap-4">
              <span className="text-body-14-bold-lh-16">{item.title}</span>
              <span className="text-body-14-regular-lh-16 text-secondary">{t('editions', { editions: item.editions })}</span>
            </div>
            <span>{item.totalLabel}</span>
          </li>
        ))}
      </ul>
      <Separator />
      <Row label={t('networkFee')} value={view.networkFee} />
      {view.discount ? <Row label={t('discount')} value={view.discount} /> : null}
      <Row label={t('total')} value={view.total} />
      {view.explorerUrl ? (
        <a href={view.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-text-accent underline">
          {t('explorer')}
        </a>
      ) : null}
    </div>
  );
}
