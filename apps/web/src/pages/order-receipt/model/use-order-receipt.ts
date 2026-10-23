import { useOrder } from '../../../entities/order';
import { useWallets } from '../../../entities/user';
import type { ReceiptState } from '../../../widgets/order-receipt';
import { toReceiptState } from './receipt-state';

/** Adaptador fino: pedido (REST + polling) + carteiras -> estado de recibo da UI. */
export function useOrderReceipt(orderId: string): { state: ReceiptState; retry: () => void } {
  const order = useOrder(orderId);
  const wallets = useWallets();
  const retry = () => void order.refetch();
  if (order.isError) {
    const kind = order.error.kind;
    return { state: toReceiptState({ status: 'error', failure: kind === 'not_found' ? 'not_found' : kind === 'network' ? 'network' : 'unexpected' }), retry };
  }
  if (!order.data) return { state: toReceiptState({ status: 'loading' }), retry };
  const o = order.data;
  const address = wallets.data?.wallets.find((w) => w.id === o.walletId)?.address ?? o.walletId;
  return {
    retry,
    state: toReceiptState({
      status: 'success',
      order: {
        id: o.id,
        status: o.status,
        createdAt: o.createdAt,
        networkId: o.networkId,
        walletAddress: address,
        transactionRef: o.transactionRef,
        items: o.items.map((i) => ({
          tokenId: i.tokenId,
          title: i.title,
          quantity: i.quantity,
          unitPriceEth: i.unitPrice,
          lineTotalEth: i.lineTotal,
          imageSrc: i.image.src,
        })),
        subtotalEth: o.subtotal,
        discountEth: o.discount,
        networkFeeEth: o.networkFee,
        totalEth: o.total,
      },
    }),
  };
}
