import { Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { MOBILE_PILL_CTA } from '../../../shared/ui';
import { resolveCheckoutTarget } from '../model/resolve-checkout-target';

const CTA = MOBILE_PILL_CTA + ' text-body-large-16-bold-lh-20 tablet:text-body-15-bold-lh-16';

export type CheckoutDisabledReason = 'quote_pending' | 'quote_error' | 'line_blocking';

export function CheckoutCta({
  isAuthenticated,
  disabledReason,
}: {
  isAuthenticated: boolean;
  disabledReason: CheckoutDisabledReason | null;
}) {
  const { t } = useTranslation('checkoutCta');
  const hintId = useId();
  const label = isAuthenticated ? t('checkout') : t('connectAndCheckout');
  if (disabledReason) {
    return (
      <div className="flex flex-col gap-8">
        <Button size="block" disabled aria-describedby={hintId} className={CTA}>
          {label}
        </Button>
        <p id={hintId} className="text-body-14-regular-lh-16 text-secondary">
          {t(`disabled.${disabledReason}`)}
        </p>
      </div>
    );
  }
  const target = resolveCheckoutTarget(isAuthenticated);
  return (
    <Button size="block" asChild className={CTA}>
      {target.to === '/checkout' ? (
        <Link to="/checkout">{label}</Link>
      ) : (
        <Link to="/login" search={target.search}>
          {label}
        </Link>
      )}
    </Button>
  );
}
