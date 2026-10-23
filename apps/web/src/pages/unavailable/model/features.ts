export const FEATURES = [
  'creators',
  'learn',
  'auth',
  'nft-detail',
  'cart',
  'checkout',
  'favorites',
  'journal',
  'newsletter',
  'footer',
  'social',
  'scan',
  'activity',
  'watchlist',
  'offers',
  'downloads',
  'support',
] as const;

export type Feature = (typeof FEATURES)[number];

export function isFeature(value: unknown): value is Feature {
  return FEATURES.some((feature) => feature === value);
}

export type UnavailableSearch = { feature?: string };

export function unavailableSearchSchema(search: Record<string, unknown>): UnavailableSearch {
  const { feature } = search;
  return typeof feature === 'string' && feature !== '' ? { feature } : {};
}
