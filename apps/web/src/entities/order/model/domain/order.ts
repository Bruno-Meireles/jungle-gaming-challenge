import type { NetworkId } from '../../../../shared/api/contracts/ids';
import type { EthAmount } from '../../../../shared/lib/eth/eth';

export type OrderStatus = 'pending' | 'confirmed' | 'refused';

export type OrderItem = {
  nftId: string;
  title: string;
  image: { src: string; width: number; height: number };
  quantity: number;
  unitPrice: EthAmount;
  lineTotal: EthAmount;
};

export type Order = {
  id: string;
  status: OrderStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  networkId: NetworkId;
  walletId: string;
  collector: { fullName: string; email: string };
  couponCode: string | null;
  items: OrderItem[];
  subtotal: EthAmount;
  discount: EthAmount;
  networkFee: EthAmount;
  total: EthAmount;
  transactionRef: string | null;
  explorerUrl: string | null;
  refusalReason: 'payment_declined' | null;
};

export type PlaceOrderInput = {
  quoteHash: string;
  networkId: NetworkId;
  walletId: string;
  collector: { fullName: string; email: string };
  lines: { nftId: string; quantity: number }[];
};

/** Estados do fluxo de checkout (docs/flows.md secao 4). */
export type CheckoutPhase = 'review' | 'revalidating' | 'sending' | 'pending' | 'confirmed' | 'refused';
