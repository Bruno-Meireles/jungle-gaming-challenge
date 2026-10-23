import { Alert, Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import type { ReceiptState } from '../model/ports';

export type OrderStatusPanelProps = { state: { kind: ReceiptState['kind'] }; onRetry: () => void };

const TONES = {
  loading: 'info',
  pending: 'info',
  confirmed: 'success',
  refused: 'error',
  not_found: 'error',
  error: 'error',
} as const;

const TONE_LABELS = { info: 'toneInfo', success: 'toneSuccess', error: 'toneError' } as const;

export function OrderStatusPanel({ state, onRetry }: OrderStatusPanelProps) {
  const { t } = useTranslation('orderReceipt');
  const tone = TONES[state.kind];
  let action: ReactNode = null;
  if (state.kind === 'error') {
    action = (
      <Button variant="outline" onClick={onRetry}>
        {t('retry')}
      </Button>
    );
  } else if (state.kind === 'refused') {
    action = (
      <Link to="/checkout" className="text-text-accent underline">
        {t('backToPayment')}
      </Link>
    );
  }
  return (
    <Alert tone={tone} toneLabel={t(TONE_LABELS[tone])} action={action}>
      {t(`status.${state.kind}`)}
    </Alert>
  );
}
