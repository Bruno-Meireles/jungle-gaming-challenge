import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useCartItemCount } from '../../../entities/cart';
import { CartIcon } from '../../../shared/ui';

export function CartLink() {
  const { t } = useTranslation('header');
  const count = useCartItemCount();
  return (
    <Link
      to="/cart"
      aria-label={count > 0 ? t('cartWithCount', { count }) : t('cart')}
      className="relative flex size-35 items-center justify-center text-foreground focus-visible:outline-2 focus-visible:outline-focus"
    >
      <CartIcon />
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="absolute -top-2 -right-2 min-w-16 rounded-full bg-primary px-4 text-center text-body-14-bold-lh-16 text-ink"
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}
