import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { useDocumentMeta, useLocale, useMediaQuery } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { OrderReceipt, OrderStatusPanel, toReceiptView, type ReceiptState } from '../../../widgets/order-receipt';

export type OrderReceiptPageProps = { state: ReceiptState; onRetry: () => void; onClose: () => void };

function Body({ state, onRetry }: Pick<OrderReceiptPageProps, 'state' | 'onRetry'>) {
  const { t } = useTranslation('orderReceipt');
  const locale = useLocale();
  const confirmed = state.kind === 'confirmed';
  return (
    <div className="flex flex-col gap-24">
      {confirmed ? (
        <div className="flex flex-col items-center gap-16 text-center">
          {/* Ilustracao exportada do Figma (no "thank-you 1", 11:5150). */}
          <img src="/thank-you.svg" alt="" width={80} height={80} />
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
