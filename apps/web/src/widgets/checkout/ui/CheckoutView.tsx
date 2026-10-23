import { Alert } from '@jg/design-system';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { CheckoutNotice, ConfirmPurchaseButton, type ConfirmPhase } from '../../../features/place-order';
import { useCheckoutFlow } from '../model/use-checkout-flow';
import type { CheckoutController } from '../model/ports';
import { OrderSummary } from './OrderSummary';

export type CheckoutViewProps = {
  controller: CheckoutController;
  onPlaced: (orderId: string) => void;
  onSessionExpired: () => void;
  /** Bloco exibido entre o resumo e o botao de confirmar (Figma: "Carteira e rede" na coluna do resumo). */
  beforeConfirm?: ReactNode;
};

function phaseOf(kind: string): ConfirmPhase {
  if (kind === 'revalidating' || kind === 'submitting') return kind;
  return 'idle';
}

export function CheckoutView({ controller, onPlaced, onSessionExpired, beforeConfirm }: CheckoutViewProps) {
  const { t } = useTranslation('checkout');
  const flow = useCheckoutFlow(controller, { onPlaced, onSessionExpired });
  const { state, quote } = { state: flow.state, quote: controller.quote };
  return (
    <div className="flex flex-col gap-24">
      {quote.status === 'ready' ? <OrderSummary quote={quote.quote} /> : null}
      {quote.status === 'loading' ? (
        <Alert tone="info" toneLabel={t('toneInfo')}>
          {t('quoteLoading')}
        </Alert>
      ) : null}
      {quote.status === 'error' ? (
        <Alert tone="error" toneLabel={t('toneError')}>
          {t('quoteError')}
        </Alert>
      ) : null}
      {beforeConfirm}
      <CheckoutNotice notice={state.kind === 'review' ? state.notice : null} />
      {state.kind === 'submitting' && state.recovering ? (
        <Alert tone="info" toneLabel={t('toneInfo')}>
          {t('recovering')}
        </Alert>
      ) : null}
      <ConfirmPurchaseButton phase={phaseOf(state.kind)} canConfirm={flow.canConfirm} onConfirm={flow.confirm} />
    </div>
  );
}
