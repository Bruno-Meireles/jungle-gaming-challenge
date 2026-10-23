import { Alert, Button } from '@jg/design-system';
import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useCart, useCartQuote, type Cart } from '../../../entities/cart';
import { useSession } from '../../../entities/session';
import { CouponForm } from '../../../features/cart-coupon';
import { CheckoutCta } from '../../../features/checkout-cta';
import { useDocumentMeta, useLocale, useLooseTranslate } from '../../../shared/hooks';
import { CartLines, CartLinesSkeleton } from '../../../widgets/cart-lines';
import { CartSummary } from '../../../widgets/cart-summary';
import { RelatedNfts } from '../../../widgets/related-nfts';
import { toCartPageState } from '../model/cart-page-state';
import { useCartActions } from '../model/use-cart-actions';
import { toCartViews } from '../model/to-cart-views';
import { CartEmpty } from './CartEmpty';
import { CartError } from './CartError';
import { CartPageView } from './CartPageView';

function CartContent({ cart }: { cart: Cart }) {
  const { t } = useTranslation('pageCart');
  const loose = useLooseTranslate();
  const locale = useLocale();
  const session = useSession();
  const quote = useCartQuote();
  const actions = useCartActions();
  const quoteStatus = quote.isError ? 'error' : quote.isPending ? 'pending' : 'ready';
  const views = toCartViews({
    cart,
    quote: quote.data,
    quoteStatus,
    busy: quote.isFetching || actions.mutating,
    locale,
    t: loose,
  });
  const failure = actions.lineFailure;

  return (
    <CartPageView
      heading={t('heading')}
      main={
        <div className="flex flex-col gap-16">
          {failure ? (
            <Alert tone="error" toneLabel="">
              {t(`mutationError.${failure.kind}`, { available: failure.kind === 'availability_conflict' ? failure.available : 0 })}
            </Alert>
          ) : null}
          <CartLines
            lines={views.lines}
            pendingLineIds={actions.pendingLineIds}
            onQuantityChange={actions.updateLine}
            onRemove={actions.removeLine}
          />
        </div>
      }
      footer={<RelatedNfts variant="viewed" excludeNftIds={cart.lines.map((line) => line.nftId)} />}
      aside={
        <>
          <CartSummary summary={views.summary} onRetry={() => void quote.refetch()} />
          <CouponForm
            appliedCode={cart.couponCode}
            pending={actions.couponPending}
            failure={actions.couponFailure}
            onApply={actions.applyCoupon}
            onRemove={actions.removeCoupon}
          />
          <CheckoutCta isAuthenticated={session.data?.status === 'authenticated'} disabledReason={views.disabledReason} />
          <Button asChild variant="outline">
            <Link to="/">{t('continueExploring')}</Link>
          </Button>
        </>
      }
    />
  );
}

export function CartPage() {
  const { t } = useTranslation('pageCart');
  useDocumentMeta({ title: t('title'), description: t('description') });
  const cart = useCart();
  const state = toCartPageState(
    cart.isPending
      ? { status: 'pending' }
      : cart.isError
        ? { status: 'error' }
        : { status: 'success', lineCount: cart.data.lines.length },
  );
  const heading = t('heading');
  if (state === 'loading') return <CartPageView heading={heading} main={<CartLinesSkeleton />} />;
  if (state === 'error' || !cart.data) {
    return <CartPageView heading={heading} main={<CartError onRetry={() => void cart.refetch()} />} />;
  }
  if (state === 'empty') return <CartPageView heading={heading} main={<CartEmpty />} />;
  return <CartContent cart={cart.data} />;
}
