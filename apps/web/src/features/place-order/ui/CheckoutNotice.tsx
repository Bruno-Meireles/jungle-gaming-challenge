import { Alert } from '@jg/design-system';
import { useTranslation } from 'react-i18next';

import type { CheckoutNotice as NoticeKind } from '../model/domain/checkout-machine';

export function CheckoutNotice({ notice }: { notice: NoticeKind | null }) {
  const { t } = useTranslation('placeOrder');
  if (notice === null) return null;
  return (
    <Alert tone="error" toneLabel={t('toneLabel')}>
      {t(`notice.${notice}`)}
    </Alert>
  );
}
