import type { ptBR } from './pt-BR';

export const en = {
  tabsLabel: 'NFT information',
  details: 'NFT details',
  reviews: 'Collector reviews ({{count}})',
  attributes: 'Attributes',
  ownership:
    'Ownership includes the high-resolution artwork, exclusive drops for collectors and a permanent provenance record registered on the network.',
  network: 'Network:',
  networkText: 'Minted on Ethereum with immutable provenance and metadata stored on IPFS.',
  contract: 'Contract:',
  contractText: '{{address}} • Verified {{standard}} smart contract.',
  royalties: 'Copyright:',
  royaltiesText: 'Creator royalty: {{percent}}% on secondary sales, paid automatically by compatible marketplaces.',
  ratingLabel: 'Rated {{average}} out of 5',
  reviewCount_one: '{{count}} review',
  reviewCount_other: '{{count}} reviews',
} satisfies typeof ptBR;
