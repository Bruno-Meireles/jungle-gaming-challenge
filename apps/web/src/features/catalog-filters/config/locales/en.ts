import type { ptBR } from './pt-BR';

export const en = {
  label: 'Filters',
  apply: 'Apply',
  close: 'Close',
  optionWithCount: '{{name}} ({{count}})',
  collections: {
    title: 'Collections',
    options: {
      'digital-art': 'Digital art',
      photography: 'Photography',
      music: 'Music',
      '3d-art': '3D art',
      collectibles: 'Collectibles',
      generative: 'Generative',
      gaming: 'Gaming',
      memberships: 'Memberships',
      utility: 'Utility',
    },
  },
  networks: {
    title: 'Network',
    options: { ethereum: 'Ethereum', polygon: 'Polygon', solana: 'Solana' },
  },
  price: {
    title: 'Price range',
    min: 'Minimum price',
    max: 'Maximum price',
    range: 'Price: {{min}} - {{max}} ETH',
  },
} satisfies typeof ptBR;
