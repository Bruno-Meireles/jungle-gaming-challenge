import type { QuoteDto, QuoteLineDto } from '../../shared/api/contracts/commerce';
import type { NetworkId } from '../../shared/api/contracts/ids';
import { asEthAmount } from '../../shared/lib/eth/eth';
import { addEth, mulEthInt, percentOfEth, subEth, sumEth } from '../../shared/lib/eth/eth-math';

export const NETWORK_FEES: Record<NetworkId, string> = { ethereum: '0.016', polygon: '0.002', solana: '0.0005' };
export const COUPONS: Record<string, { percent: number; expired: boolean }> = {
  LAUNCH10: { percent: 10, expired: false },
  EXPIRED2025: { percent: 20, expired: true },
};
export const QUOTE_TTL_MS = 60_000;

export type CouponCheck = { kind: 'valid'; code: string; percent: number } | { kind: 'expired' } | { kind: 'invalid' };

export function checkCoupon(raw: string): CouponCheck {
  const code = raw.trim().toUpperCase();
  const coupon = COUPONS[code];
  if (!coupon) return { kind: 'invalid' };
  return coupon.expired ? { kind: 'expired' } : { kind: 'valid', code, percent: coupon.percent };
}

export type QuoteInputLine = {
  lineId: string;
  nftId: string;
  title: string;
  quantity: number;
  unitPriceEth: string;
  maxQuantity: number;
};

function lineOf(line: QuoteInputLine): QuoteLineDto {
  const status = line.maxQuantity === 0 ? 'sold_out' : line.quantity > line.maxQuantity ? 'insufficient' : 'ok';
  return {
    lineId: line.lineId,
    nftId: line.nftId,
    title: line.title,
    quantity: line.quantity,
    unitPriceEth: line.unitPriceEth,
    lineTotalEth: mulEthInt(asEthAmount(line.unitPriceEth), line.quantity),
    status,
    available: line.maxQuantity,
  };
}

/** FNV-1a de 32 bits em hex: identifica o conteudo economico da cotacao. */
export function hashText(text: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    h = Math.imul(h ^ text.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export function buildQuote(input: {
  lines: QuoteInputLine[];
  couponCode: string | null;
  networkId: NetworkId;
  cartVersion: number;
  now: number;
}): QuoteDto {
  const lines = input.lines.map(lineOf);
  const subtotal = sumEth(lines.map((l) => asEthAmount(l.lineTotalEth)));
  const check = input.couponCode ? checkCoupon(input.couponCode) : null;
  const coupon =
    check?.kind === 'valid' ? { code: check.code, status: 'applied' as const, percent: check.percent } : null;
  const discount = coupon ? percentOfEth(subtotal, coupon.percent) : asEthAmount('0');
  const fee = lines.length === 0 ? asEthAmount('0') : asEthAmount(NETWORK_FEES[input.networkId]);
  const total = addEth(subEth(subtotal, discount), fee);
  const economics = JSON.stringify([input.networkId, lines, discount, fee, total, coupon]);
  return {
    quoteHash: hashText(economics),
    cartVersion: input.cartVersion,
    networkId: input.networkId,
    lines,
    subtotalEth: subtotal,
    discountEth: discount,
    networkFeeEth: fee,
    totalEth: total,
    coupon,
    canCheckout: lines.length > 0 && lines.every((l) => l.status === 'ok'),
    expiresAt: input.now + QUOTE_TTL_MS,
  };
}
