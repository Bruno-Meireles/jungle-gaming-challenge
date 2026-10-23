import { Button } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import type { ReceiptView } from '../model/ports';

/* Resumo do modal (Figma "Order Confirmation Modal"): 4 celulas separadas por divisores, entre duas linhas primarias. */
function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-4 px-16 first:pl-0 last:pr-0 [&:not(:first-child)]:border-l [&:not(:first-child)]:border-solid [&:not(:first-child)]:border-primary">
      <span className="text-body-14-bold-lh-16 text-text-secondary">{label}</span>
      <span className="min-w-0 break-all text-body-14-regular-lh-16 text-text-secondary">{value}</span>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-end gap-48 text-right">
      <span className={strong ? 'text-body-large-16-bold-lh-16' : 'text-body-15-regular-lh-16'}>{label}</span>
      <span className={(strong ? 'text-body-large-18-bold-lh-16 text-text-accent' : 'text-body-large-18-regular') + ' min-w-110'}>{value}</span>
    </div>
  );
}

export function OrderReceipt({ view }: { view: ReceiptView }) {
  const { t } = useTranslation(['orderReceipt', 'walletConnect']);
  return (
    <div className="flex flex-col gap-24">
      <div className="grid grid-cols-2 gap-y-16 border-y border-solid border-primary py-12 tablet:grid-cols-4 tablet:gap-y-0">
        {view.transactionRef ? <SummaryCell label={t('transactionId')} value={view.transactionRef} /> : null}
        <SummaryCell label={t('date')} value={view.dateShort} />
        <SummaryCell label={t('total')} value={view.total} />
        <SummaryCell label={t('wallet')} value={view.wallet} />
      </div>
      <div className="flex flex-col gap-16 tablet:px-4">
        <h3 className="text-body-15-bold-lh-16 text-text-secondary">{t('itemsHeading')}</h3>
        <div className="flex flex-col gap-8">
          <div className="grid grid-cols-[1fr_auto_auto] gap-24 text-body-15-bold-lh-16 text-text-secondary tablet:grid-cols-[1fr_96px_120px]" aria-hidden="true">
            <span>{t('columnNfts')}</span>
            <span className="text-center font-medium">{t('columnEditions')}</span>
            <span className="text-right font-medium">{t('columnSubtotal')}</span>
          </div>
          <div className="border-b border-solid border-primary" />
        </div>
        <ul className="flex flex-col gap-12">
          {view.items.map((item) => (
            <li key={item.key} className="grid grid-cols-[1fr_auto_auto] items-center gap-24 tablet:grid-cols-[1fr_96px_120px]">
              <div className="flex min-w-0 items-center gap-12">
                {item.imageSrc ? <img src={item.imageSrc} alt="" width={70} height={70} className="size-70 shrink-0 rounded-8 object-cover" /> : null}
                <div className="flex min-w-0 flex-col gap-4">
                  <span className="text-body-large-16-bold-lh-16">{item.title}</span>
                  <span className="text-body-14-regular-lh-16 text-secondary">{t('tokenId', { tokenId: item.tokenId })}</span>
                </div>
              </div>
              <span className="text-center text-body-14-regular-lh-16 text-text-secondary">{t('editions', { editions: item.editions })}</span>
              <span className="text-right text-body-large-18-bold-lh-16 text-text-accent">{item.totalLabel}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-8">
          <Row label={t('networkFee')} value={view.networkFee} />
          {view.discount ? <Row label={t('discount')} value={view.discount} /> : null}
          <div className="border-t border-solid border-primary pt-8">
            <Row label={t('total')} value={view.total} strong />
          </div>
        </div>
      </div>
      <p className="text-center text-body-14-regular-lh-24 text-text-secondary">
        {t('confirmedNote', { network: t(`walletConnect:networks.${view.networkId}`) })}
      </p>
      {view.explorerUrl ? (
        <Button asChild className="self-center rounded-6 px-24">
          <a href={view.explorerUrl} target="_blank" rel="noopener noreferrer">
            {t('explorer')}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
