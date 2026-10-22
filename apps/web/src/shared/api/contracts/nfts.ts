import { z } from 'zod';

import { COLLECTION_IDS, NETWORK_IDS } from './ids';

export const ethDecimalSchema = z.string().regex(/^\d+(\.\d{1,18})?$/);

const collectionIdSchema = z.enum(COLLECTION_IDS);
const networkIdSchema = z.enum(NETWORK_IDS);
const nonNegativeIntSchema = z.number().int().min(0);
const positiveIntSchema = z.number().int().positive();

export const nftSummaryDtoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  collectionId: collectionIdSchema,
  networkId: networkIdSchema,
  priceEth: ethDecimalSchema,
  image: z.object({
    src: z.string(),
    width: positiveIntSchema,
    height: positiveIntSchema,
  }),
  rarity: z.enum(['common', 'rare']),
  listedAt: z.iso.datetime(),
  popularity: nonNegativeIntSchema,
  version: nonNegativeIntSchema,
});

export const catalogPageDtoSchema = z.object({
  items: z.array(nftSummaryDtoSchema),
  page: positiveIntSchema,
  pageSize: positiveIntSchema,
  totalItems: nonNegativeIntSchema,
  totalPages: nonNegativeIntSchema,
  facets: z.object({
    collections: z.array(z.object({ id: collectionIdSchema, count: nonNegativeIntSchema })),
    networks: z.array(z.object({ id: networkIdSchema, count: nonNegativeIntSchema })),
    priceRange: z.object({ minEth: ethDecimalSchema, maxEth: ethDecimalSchema }),
  }),
});

export const highlightsDtoSchema = z.object({
  hero: z.array(nftSummaryDtoSchema).length(3),
  featured: nftSummaryDtoSchema,
});

export type NftSummaryDto = z.infer<typeof nftSummaryDtoSchema>;
export type CatalogPageDto = z.infer<typeof catalogPageDtoSchema>;
export type HighlightsDto = z.infer<typeof highlightsDtoSchema>;
