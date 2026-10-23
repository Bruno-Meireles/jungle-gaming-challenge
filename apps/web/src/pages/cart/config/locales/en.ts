import type { ptBR } from './pt-BR';

export const en = {
  title: 'Cart — Kurio',
  description: 'Review your items, apply a coupon and check out.',
  back: 'Back',
  breadcrumb: 'Breadcrumb',
  crumbHome: 'Home',
  continueExploring: 'Keep exploring',
  heading: 'Cart',
  empty: { body: 'Your cart is empty.', cta: 'Keep exploring' },
  error: { body: 'Could not load the cart.', retry: 'Try again' },
  mutationError: {
    availability_conflict: 'The requested quantity is not available ({{available}} left).',
    not_found: 'This item is no longer in the cart.',
    network: 'Could not update the cart. Check your connection.',
    unexpected: 'Something went wrong updating the cart.',
  },
} satisfies typeof ptBR;
