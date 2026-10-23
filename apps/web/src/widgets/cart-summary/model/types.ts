export type Translate = (key: string, options?: Record<string, string | number>) => string;
export type SummaryLocale = 'pt-BR' | 'en';

export type SummaryQuote = {
  subtotal: string;
  discount: string;
  networkFee: string;
  total: string;
  coupon: { code: string; status: 'applied' | 'invalid' | 'expired' } | null;
};

export type SummaryState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; quote: SummaryQuote; busy: boolean };

export type CartSummaryViewModel =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready';
      subtotal: string;
      discount: string;
      networkFee: string;
      total: string;
      couponCode: string | null;
      busy: boolean;
    };
