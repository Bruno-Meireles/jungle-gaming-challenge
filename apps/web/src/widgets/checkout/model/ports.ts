/** Portas do widget de checkout (ADR-25): a UI nao conhece entities/cart|order|user. Somente tipos. */

export type QuoteLineView = {
  tokenId: string;
  title: string;
  imageSrc?: string;
  quantity: number;
  unitPriceEth: string;
  lineTotalEth: string;
};

export type QuoteView = {
  hash: string;
  lines: QuoteLineView[];
  subtotalEth: string;
  discountEth: string;
  networkFeeEth: string;
  totalEth: string;
  canCheckout: boolean;
};

export type QuoteState = { status: 'loading' } | { status: 'error' } | { status: 'ready'; quote: QuoteView };

export type ConnectionView = {
  status: 'disconnected' | 'connecting' | 'connected' | 'rejected';
  networkId: string | null;
};

export type SubmitFailureReason =
  | 'quote_changed'
  | 'unavailable'
  | 'idempotency_conflict'
  | 'wallet_disconnected'
  | 'validation'
  | 'recovery_exhausted'
  | 'unexpected';

export type PlaceOrderResult =
  | { ok: true; orderId: string }
  | { ok: false; reason: SubmitFailureReason | 'session_expired' };

export type CheckoutController = {
  formValid: boolean;
  connection: ConnectionView;
  /** Rede selecionada no seletor. */
  network: string;
  quote: QuoteState;
  /** Revalida a cotacao; rejeita em falha de rede. */
  revalidate: () => Promise<{ hash: string; canCheckout: boolean }>;
  /** Envia o pedido; chama `onRecovering` quando entra em recuperacao por timeout. */
  placeOrder: (input: { quoteHash: string; onRecovering: () => void }) => Promise<PlaceOrderResult>;
};
