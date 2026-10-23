import type { ptBR } from './pt-BR';

export const en = {
  title: 'Order summary',
  loading: 'Calculating the summary',
  subtotal: 'Subtotal',
  discount: 'Discount',
  discountValue: '(-) {{amount}} ETH',
  networkFee: 'Network fee',
  estimatedFee: 'Estimated fee',
  total: 'Total',
  couponApplied: 'Coupon {{code}} applied',
  error: 'Could not calculate the summary. Try again.',
  retry: 'Try again',
} satisfies typeof ptBR;
