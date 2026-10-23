import type { ptBR } from './pt-BR';

export const en = {
  label: 'Cart items',
  loading: 'Loading the cart',
  image: { alt: '{{title}} artwork' },
  edition: 'Edition {{number}}/{{supply}}',
  editionOpen: 'Open edition',
  token: 'Token',
  unitPrice: 'Unit price',
  lineTotal: 'Line total',
  lineTotalPending: 'Calculating…',
  noticeTone: { info: 'Notice', error: 'Attention' },
  notice: {
    price_changed: 'The price changed from {{previous}} to {{current}}.',
    availability_reduced: 'Availability dropped: {{available}} left.',
    sold_out: 'This edition sold out. Remove the item to continue.',
  },
} satisfies typeof ptBR;
