import { z } from 'zod';

const tabSchema = z.enum(['details', 'reviews']).catch('details');
const editionSchema = z.string().regex(/^[A-Za-z0-9_-]{1,64}$/);

export type NftDetailSearch = { tab: 'details' | 'reviews'; edition?: string };

export function nftDetailSearchSchema(raw: Record<string, unknown>): NftDetailSearch {
  const edition = editionSchema.safeParse(raw.edition);
  return { tab: tabSchema.parse(raw.tab), ...(edition.success ? { edition: edition.data } : {}) };
}
