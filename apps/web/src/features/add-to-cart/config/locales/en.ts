import type { ptBR } from './pt-BR';

export const en = {
  buy: 'Buy now',
  retry: 'Try again',
  failure: {
    conflict: 'This edition changed or sold out. Refresh and try again.',
    network: 'Could not connect. Check your connection.',
  },
} satisfies typeof ptBR;
