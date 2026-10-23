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

const localizedTextSchema = z.object({ 'pt-BR': z.string(), en: z.string() });

export const editionDtoSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9_-]{1,64}$/),
  kind: z.discriminatedUnion('type', [
    z.object({ type: z.literal('limited'), size: positiveIntSchema }),
    z.object({ type: z.literal('open') }),
  ]),
  priceEth: ethDecimalSchema,
  remaining: nonNegativeIntSchema,
  maxPerOrder: positiveIntSchema,
});

export const nftDetailDtoSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: localizedTextSchema,
  tokenId: z.string().regex(/^#\d{4,}$/),
  rating: z.object({ average: z.number().min(0).max(5), count: nonNegativeIntSchema }),
  gallery: z
    .array(z.object({ src: z.string(), width: positiveIntSchema, height: positiveIntSchema }))
    .min(1)
    .max(4),
  contract: z.object({ address: z.string(), standard: z.string() }),
  royaltyPercent: z.number().min(0).max(100),
  attributes: z.array(z.object({ name: localizedTextSchema, value: localizedTextSchema })),
  editions: z.array(editionDtoSchema).min(1),
  defaultEditionId: z.string(),
  version: nonNegativeIntSchema,
});
export type NftDetailDto = z.infer<typeof nftDetailDtoSchema>;
