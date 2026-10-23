import type { ptBR } from './pt-BR';

export const en = {
  toneLabel: 'Error',
  notice: {
    quote_changed: 'The quote changed. Review the amounts and confirm again.',
    unavailable: 'An item is no longer available. Review your cart.',
    revalidation_failed: 'We could not validate the quote. Please try again.',
    idempotency_conflict: 'This order conflicts with a previous submission. Review your details and try again.',
    wallet_disconnected: 'Your wallet was disconnected. Reconnect to continue.',
    validation: 'Some order details are invalid. Review the form.',
    recovery_exhausted: 'We could not confirm the order submission. Check your orders before trying again.',
    unexpected: 'Something went wrong while completing the purchase. Please try again.',
  },
  button: { idle: 'Confirm purchase', revalidating: 'Validating quote…', submitting: 'Submitting order…' },
} satisfies typeof ptBR;
