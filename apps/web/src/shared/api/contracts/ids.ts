export const COLLECTION_IDS = [
  'digital-art',
  'photography',
  'music',
  '3d-art',
  'collectibles',
  'generative',
  'gaming',
  'memberships',
  'utility',
] as const;
export const NETWORK_IDS = ['ethereum', 'polygon', 'solana'] as const;
export const VIEW_IDS = ['all', 'new', 'trending'] as const;
export const SORT_IDS = ['recent', 'price-asc', 'price-desc', 'popular'] as const;

export type CollectionId = (typeof COLLECTION_IDS)[number];
export type NetworkId = (typeof NETWORK_IDS)[number];
export type ViewId = (typeof VIEW_IDS)[number];
export type SortId = (typeof SORT_IDS)[number];
