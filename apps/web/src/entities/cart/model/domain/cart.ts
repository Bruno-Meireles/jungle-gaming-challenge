import type { NetworkId } from '../../../../shared/api/contracts/ids';
import type { EthAmount } from '../../../../shared/lib/eth/eth';

export type CartLine = {
  lineId: string;
  nftId: string;
  title: string;
  image: { src: string; width: number; height: number };
  tokenId: string;
  edition: { id: string; label: string; supply: number | null };
  unitPrice: EthAmount;
  quantity: number;
  /** Maximo comprável agora; 0 = esgotado. */
  maxQuantity: number;
};

export type Cart = {
  lines: CartLine[];
  couponCode: string | null;
  itemCount: number;
  version: number;
};

export type LineNotice =
  | { kind: 'price_changed'; previousUnitPrice: EthAmount; unitPrice: EthAmount }
  | { kind: 'availability_reduced'; available: number }
  | { kind: 'sold_out' };

export type QuoteLine = {
  lineId: string;
  unitPrice: EthAmount;
  quantity: number;
  lineTotal: EthAmount;
  notice: LineNotice | null;
};

export type CartQuote = {
  /** Identifica a cotacao; o pedido referencia este hash. */
  quoteHash: string;
  cartVersion: number;
  networkId: NetworkId;
  lines: QuoteLine[];
  subtotal: EthAmount;
  discount: EthAmount;
  networkFee: EthAmount;
  total: EthAmount;
  coupon: { code: string; percent: number } | null;
  canCheckout: boolean;
  expiresAt: number;
};

export type CartFailure =
  | { kind: 'availability_conflict'; available: number }
  | { kind: 'not_found' }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' };

export type CouponFailure =
  | { kind: 'coupon_invalid' }
  | { kind: 'coupon_expired' }
  | { kind: 'required' }
  | { kind: 'network'; retryable: true }
  | { kind: 'unexpected' };
