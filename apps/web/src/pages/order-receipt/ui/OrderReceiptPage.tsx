import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import { useDocumentMeta, useLocale, useMediaQuery } from '../../../shared/hooks';
import { PageContainer } from '../../../shared/ui';
import { OrderReceipt, OrderStatusPanel, toReceiptView, type ReceiptState } from '../../../widgets/order-receipt';

export type OrderReceiptPageProps = { state: ReceiptState; onRetry: () => void; onClose: () => void };

function Body({ state, onRetry }: Pick<OrderReceiptPageProps, 'state' | 'onRetry'>) {
  const locale = useLocale();
  return (
    <div className="flex flex-col gap-16">
      <OrderStatusPanel state={state} onRetry={onRetry} />
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
        <DialogContent>
          <DialogTitle>{t('heading')}</DialogTitle>
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
