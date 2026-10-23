import type { ptBR } from './pt-BR';

export const en = {
  checkout: 'Checkout',
  connectAndCheckout: 'Connect and checkout',
  disabled: {
    quote_pending: 'Wait for the summary to be calculated to continue.',
    quote_error: 'Could not calculate the summary. Try again to continue.',
    line_blocking: 'Resolve the item warnings (sold out or above availability) to continue.',
  },
} satisfies typeof ptBR;
