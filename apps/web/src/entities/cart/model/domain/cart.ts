import type { NetworkId } from '../../../../shared/api/contracts/ids';
import type { EthAmount } from '../../../../shared/lib/eth/eth';

export type CartLine = {
  nftId: string;
  title: string;
  image: { src: string; width: number; height: number };
  quantity: number;
  unitPrice: EthAmount;
  availableEditions: number;
};

export type Cart = {
  lines: CartLine[];
  couponCode: string | null;
  version: number;
};

export type CouponStatus = 'applied' | 'invalid' | 'expired';

export type QuoteIssue = {
  nftId: string;
  kind: 'sold_out' | 'insufficient_editions' | 'price_changed';
  availableEditions: number;
};

export type QuoteLine = {
  nftId: string;
  title: string;
  quantity: number;
  unitPrice: EthAmount;
  lineTotal: EthAmount;
};

export type Quote = {
  quoteHash: string;
  networkId: NetworkId;
  lines: QuoteLine[];
  subtotal: EthAmount;
  discount: EthAmount;
  networkFee: EthAmount;
  total: EthAmount;
  coupon: { code: string; status: CouponStatus; percent: number | null } | null;
  issues: QuoteIssue[];
  canCheckout: boolean;
};
