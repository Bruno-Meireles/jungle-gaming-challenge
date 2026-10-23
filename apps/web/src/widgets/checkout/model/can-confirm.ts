import type { ConnectionView, QuoteState } from './ports';

export function canConfirm(input: { formValid: boolean; connection: ConnectionView; network: string; quote: QuoteState }): boolean {
  const { formValid, connection, network, quote } = input;
  return (
    formValid &&
    connection.status === 'connected' &&
    connection.networkId === network &&
    quote.status === 'ready' &&
    quote.quote.canCheckout
  );
}
