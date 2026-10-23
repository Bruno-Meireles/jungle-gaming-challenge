import type { NetworkId } from '../../../../shared/api/contracts/ids';
import type { EthAmount } from '../../../../shared/lib/eth/eth';

export type OrderStatus = 'pending' | 'confirmed' | 'refused';

export type OrderItem = {
  nftId: string;
  editionId: string;
  editionLabel: string;
  tokenId: string;
  title: string;
  image: { src: string; width: number; height: number };
  quantity: number;
  unitPrice: EthAmount;
  lineTotal: EthAmount;
};

export type Collector = {
  displayName: string;
  email: string;
  username: string;
  profileName: string;
  referralCode: string;
  ensName: string;
  secondaryWalletOrEns?: string;
  note?: string;
};

/** Recibo = snapshot do pedido; nunca recalculado a partir do catalogo. */
export type Order = {
  id: string;
  status: OrderStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  networkId: NetworkId;
  walletId: string;
  collector: Collector;
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
  connectionId?: string;
  walletProvider?: string;
  collector: Collector;
  lines: { lineId: string; quantity: number }[];
};

export type PlaceOrderFailure =
  | { kind: 'quote_changed' }
  | { kind: 'availability_conflict' }
  | { kind: 'idempotency_conflict' }
  | { kind: 'session_expired' }
  | { kind: 'validation' }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' };

export type OrderFailure =
  | { kind: 'not_found' }
  | { kind: 'session_expired' }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' };

export type PlaceOrderResult =
  | { ok: true; value: { orderId: string; status: OrderStatus } }
  | { ok: false; failure: PlaceOrderFailure };
