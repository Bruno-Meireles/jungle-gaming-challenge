import { Alert } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { LineQuantityControl, RemoveLineButton } from '../../../features/cart-line-controls';
import { useLocale } from '../../../shared/hooks';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthFixed } from '../../../shared/lib/eth/format-eth';
import type { CartLineViewModel, LineNoticeInput } from '../model/types';

export type CartLineItemProps = {
  line: CartLineViewModel;
  pending?: boolean;
  onQuantityChange: (lineId: string, quantity: number) => void;
  onRemove: (lineId: string) => void;
};

function LineNotice({ notice }: { notice: LineNoticeInput }) {
  const { t } = useTranslation(['cartLines', 'shared']);
  const locale = useLocale();
  const eth = (value: string) => t('shared:eth.amount', { amount: formatEthFixed(asEthAmount(value), locale, 2) });
  const isInfo = notice.kind === 'price_changed';
  const text =
    notice.kind === 'price_changed'
      ? t('cartLines:notice.price_changed', { previous: eth(notice.previousUnitPrice), current: eth(notice.unitPrice) })
      : notice.kind === 'availability_reduced'
        ? t('cartLines:notice.availability_reduced', { available: notice.available })
        : t('cartLines:notice.sold_out');
  return (
    <Alert tone={isInfo ? 'info' : 'error'} toneLabel={isInfo ? t('cartLines:noticeTone.info') : t('cartLines:noticeTone.error')}>
      {text}
    </Alert>
  );
}

export function CartLineItem({ line, pending = false, onQuantityChange, onRemove }: CartLineItemProps) {
  const { t } = useTranslation('cartLines');
  const nftId = line.href.slice('/nfts/'.length);
  return (
    <li className="flex flex-col overflow-hidden rounded-14 bg-surface-card tablet:gap-12 tablet:overflow-visible tablet:rounded-0 tablet:border-b tablet:border-solid tablet:border-primary tablet:bg-transparent tablet:py-16" aria-busy={pending}>
      <div className="flex gap-9 tablet:gap-16">
        <Link to="/nfts/$nftId" params={{ nftId }} className="shrink-0 focus-visible:outline-2 focus-visible:outline-focus">
          <img src={line.image.src} alt={line.image.alt} width={96} height={96} className="size-100 rounded-14 object-cover tablet:size-96 tablet:rounded-8" />
        </Link>
        <div className="flex min-w-0 flex-1 flex-col gap-4 py-12 tablet:p-0">
          <Link to="/nfts/$nftId" params={{ nftId }} className="text-body-15-bold-lh-16 text-foreground focus-visible:outline-2 focus-visible:outline-focus">
            {line.title}
          </Link>
          <p className="text-body-14-regular-lh-16 text-secondary">
            {t('token')} {line.tokenLabel} · {line.editionLabel}
          </p>
          <p className="text-body-large-18-bold-lh-24 text-text-accent tablet:text-body-14-regular-lh-16 tablet:text-foreground">
            <span className="sr-only">{t('unitPrice')}: </span>
            {line.unitPriceLabel}
          </p>
        </div>
        <RemoveLineButton title={line.title} disabled={pending} onRemove={() => onRemove(line.lineId)} />
      </div>
      <div className="flex items-center justify-between gap-16 px-12 pb-12 tablet:p-0">
        <LineQuantityControl
          title={line.title}
          value={line.quantity}
          max={line.max}
          disabled={pending || line.blocking}
          onChange={(quantity) => onQuantityChange(line.lineId, quantity)}
        />
        <p className="text-body-15-bold-lh-16 text-foreground">
          <span className="sr-only">{t('lineTotal')}: </span>
          {line.lineTotalLabel ?? t('lineTotalPending')}
        </p>
      </div>
      {line.notice ? <LineNotice notice={line.notice} /> : null}
    </li>
  );
}
