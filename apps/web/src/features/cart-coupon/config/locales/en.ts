import type { ptBR } from './pt-BR';

export const en = {
  label: 'Discount coupon',
  apply: 'Apply coupon',
  remove: 'Remove coupon',
  applied: 'Coupon {{code}} applied',
  failure: {
    required: 'Enter the coupon code.',
    coupon_invalid: 'Invalid coupon.',
    coupon_expired: 'Expired coupon.',
    network: 'Could not validate the coupon. Check your connection.',
    unexpected: 'Something went wrong applying the coupon.',
  },
} satisfies typeof ptBR;
