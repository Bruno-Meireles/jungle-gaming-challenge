import { Navigate, getRouteApi, useRouter } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { CheckoutPage, useCheckoutController } from '../../pages/checkout';
import { NftDetailPage, useNftDetailController, nftDetailSearchSchema, type NftDetailSearch } from '../../pages/nft-detail';
import { OrderReceiptPage, parseOrderId, useOrderReceipt } from '../../pages/order-receipt';
import { NotFoundPage } from '../../pages/not-found';

function OrderReceiptRoute({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { state, retry } = useOrderReceipt(orderId);
  return <OrderReceiptPage state={state} onRetry={retry} onClose={onClose} />;
}

export function NftDetailRoute({ nftId, search }: { nftId: string; search: NftDetailSearch }) {
  const controller = useNftDetailController(nftId, search);
  return (
    <NftDetailPage
      result={controller.result}
      search={search}
      onRetry={controller.onRetry}
      onEditionChange={controller.onEditionChange}
      onTabChange={controller.onTabChange}
      addToCart={controller.addToCart}
      favorite={controller.favorite}
    />
  );
}

export function CheckoutRoute() {
  const { t } = useTranslation('walletConnect');
  const labels = { ethereum: t('networks.ethereum'), polygon: t('networks.polygon'), solana: t('networks.solana') };
  const checkout = useCheckoutController(labels);
  if (checkout.cartEmpty) return <Navigate to="/cart" replace />;
  return (
    <CheckoutPage
      form={checkout.form}
      wallet={checkout.wallet}
      controller={checkout.controller}
      onPlaced={checkout.onPlaced}
      onSessionExpired={checkout.onSessionExpired}
    />
  );
}

export function OrderRoute({ rawOrderId }: { rawOrderId: string }) {
  const router = useRouter();
  const orderId = parseOrderId(rawOrderId);
  if (orderId === null) return <NotFoundPage />;
  return <OrderReceiptRoute orderId={orderId} onClose={() => void router.navigate({ to: '/' })} />;
}

const nftApi = getRouteApi('/nfts/$nftId');
const orderApi = getRouteApi('/orders/$orderId');

/** Componentes de rota carregados sob demanda (code splitting): leem params/search pela API da rota. */
export function NftDetailRouteComponent() {
  return <NftDetailRoute nftId={nftApi.useParams().nftId} search={nftDetailSearchSchema(nftApi.useSearch())} />;
}

export function OrderRouteComponent() {
  return <OrderRoute rawOrderId={orderApi.useParams().orderId} />;
}
