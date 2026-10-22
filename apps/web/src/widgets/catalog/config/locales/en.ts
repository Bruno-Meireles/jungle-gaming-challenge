import type { ptBR } from './pt-BR';

export const en = {
  title: 'Results',
  listLabel: 'NFTs',
  pagination: { label: 'Pagination', next: 'Next page' },
  count_one: '{{count}} NFT',
  count_other: '{{count}} NFTs',
  loading: 'Loading NFTs',
  empty: { title: 'No NFTs found', text: 'Try adjusting the search or the filters.' },
  error: {
    toneLabel: 'Error',
    title: 'Could not load the NFTs',
    text: 'The service is unavailable right now. Please try again.',
    retry: 'Try again',
  },
} satisfies typeof ptBR;
