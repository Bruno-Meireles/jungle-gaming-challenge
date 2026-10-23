import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { useDocumentMeta, useLocale, useMediaQuery } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { OrderReceipt, OrderStatusPanel, toReceiptView, type ReceiptState } from '../../../widgets/order-receipt';

export type OrderReceiptPageProps = { state: ReceiptState; onRetry: () => void; onClose: () => void };

/* Envelope de agradecimento (Figma "Thank you"): decorativo. */
function ThankYouIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true" className="text-primary">
      <path d="M8 26 32 8l24 18v30H8z" />
      <path d="M8 26l24 18 24-18" />
      <rect x="18" y="14" width="28" height="22" rx="2" />
      <path d="M32 30c-4-3-6-5-6-8a3.5 3.5 0 0 1 6-2 3.5 3.5 0 0 1 6 2c0 3-2 5-6 8z" fill="currentColor" />
    </svg>
  );
}

function Body({ state, onRetry }: Pick<OrderReceiptPageProps, 'state' | 'onRetry'>) {
  const { t } = useTranslation('orderReceipt');
  const locale = useLocale();
  const confirmed = state.kind === 'confirmed';
  return (
    <div className="flex flex-col gap-24">
      {confirmed ? (
        <div className="flex flex-col items-center gap-16 text-center">
          <ThankYouIcon />
          <p className="text-body-large-16-bold-lh-20 text-text-accent">{t('confirmedMessage')}</p>
        </div>
      ) : null}
      <div className={confirmed ? 'sr-only' : undefined}>
        <OrderStatusPanel state={state} onRetry={onRetry} />
      </div>
      {'order' in state ? <OrderReceipt view={toReceiptView(state.order, locale)} /> : null}
    </div>
  );
}

export function OrderReceiptPage({ state, onRetry, onClose }: OrderReceiptPageProps) {
  const { t } = useTranslation('pageOrderReceipt');
  useDocumentMeta({ title: t('title'), description: t('description') });
  const isDialog = useMediaQuery('(min-width: 768px)');
  if (isDialog) {
    return (
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-578 p-32">
          <DialogClose closeLabel={t('close')} />
          <DialogTitle className="sr-only">{t('heading')}</DialogTitle>
          <DialogDescription className="sr-only">{t('description')}</DialogDescription>
          <Body state={state} onRetry={onRetry} />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <PageContainer className="flex flex-col gap-16 py-24">
      <h1 className="text-heading-28-bold text-foreground">{t('heading')}</h1>
      <Body state={state} onRetry={onRetry} />
    </PageContainer>
  );
}
