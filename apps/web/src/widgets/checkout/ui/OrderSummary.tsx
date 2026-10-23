import { Separator } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useLocale } from '../../../shared/hooks';
import { asEthAmount } from '../../../shared/lib/eth/eth';
import { formatEthAmount } from '../../../shared/lib/eth/format-eth';
import type { QuoteLineView, QuoteView } from '../model/ports';

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-16">
      <span className={strong ? 'text-body-large-16-bold-lh-16' : 'text-body-15-regular-lh-16'}>{label}</span>
      <span className={strong ? 'text-body-large-18-bold-lh-16 text-text-accent' : 'text-body-large-16-regular-lh-16 tablet:text-body-large-18-regular'}>{value}</span>
    </div>
  );
}

/* Card do item (Figma Frame 321: 405x70, fundo surface-card, miniatura 66-70 com raio 8, titulo 16/700, ID do token 14, valor 18). */
function LineCard({ line, price }: { line: QuoteLineView; price: string }) {
  const { t } = useTranslation('checkout');
  return (
    <li className="flex items-center gap-12 rounded-8 bg-surface-card p-4 pr-12">
      {line.imageSrc ? <img src={line.imageSrc} alt="" width={66} height={66} className="size-66 shrink-0 rounded-8 object-cover" /> : null}
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="flex flex-wrap items-baseline gap-8">
          <span className="text-body-large-16-bold-lh-16">{line.title}</span>
          <span className="text-body-14-regular-lh-16">{t('quantity', { quantity: line.quantity })}</span>
        </p>
        <p className="flex gap-4 text-body-14-regular-lh-16 text-secondary">
          <span>{t('tokenId')}</span>
          <span>{line.tokenId}</span>
        </p>
      </div>
      <span className="text-body-large-16-bold-lh-16 text-text-accent tablet:text-body-large-18-bold-lh-16">{price}</span>
    </li>
  );
}

export function OrderSummary({ quote }: { quote: QuoteView }) {
  const { t } = useTranslation(['checkout', 'shared']);
  const locale = useLocale();
  const eth = (value: string) => t('shared:eth.amount', { amount: formatEthAmount(asEthAmount(value), locale) });
  return (
    <section aria-label={t('summary')} className="flex flex-col gap-16">
      <h2 className="text-body-large-17-bold text-foreground">{t('yourNfts')}</h2>
      <div className="flex flex-col gap-8">
        <div className="flex justify-between text-body-large-16-bold-lh-16" aria-hidden="true">
          <span>{t('columnNfts')}</span>
          {/* Texto por pseudo-elemento: so decorativo (a linha Subtotal do resumo continua unica no DOM). */}
          <span className="font-medium after:content-[attr(data-label)]" data-label={t('subtotal')} />
        </div>
        <Separator />
      </div>
      <ul className="flex flex-col gap-12">
        {quote.lines.map((line) => (
          <LineCard key={line.tokenId} line={line} price={eth(line.lineTotalEth)} />
        ))}
      </ul>
      <p className="text-center text-body-14-regular-lh-16 text-foreground">
        {t('promoHint')}{' '}
        <Link to="/cart" className="text-text-accent underline">
          {t('promoLink')}
        </Link>
      </p>
      <Row label={t('subtotal')} value={eth(quote.subtotalEth)} />
      <Row label={t('discount')} value={eth(quote.discountEth)} />
      <div className="flex flex-col gap-4">
        <Row label={t('networkFee')} value={eth(quote.networkFeeEth)} />
        <p className="text-center text-caption-12-regular-lh-16 text-text-accent">{t('estimatedFee')}</p>
      </div>
      <Separator />
      <Row label={t('total')} value={eth(quote.totalEth)} strong />
    </section>
  );
}
