import { z } from 'zod';

import type { CollectionId, NetworkId } from './ids';

// Esqueletos RED: permissivos de proposito, o GREEN os restringe.
export const ethDecimalSchema = z.unknown();
export const nftSummaryDtoSchema = z.unknown();
export const catalogPageDtoSchema = z.unknown();
export const highlightsDtoSchema = z.unknown();

export type NftSummaryDto = {
  id: string;
  title: string;
  collectionId: CollectionId;
  networkId: NetworkId;
  priceEth: string;
  image: { src: string; width: number; height: number };
  rarity: 'common' | 'rare';
  listedAt: string;
  popularity: number;
  version: number;
};

export type CatalogPageDto = {
  items: NftSummaryDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  facets: {
    collections: { id: CollectionId; count: number }[];
    networks: { id: NetworkId; count: number }[];
    priceRange: { minEth: string; maxEth: string };
  };
};

export type HighlightsDto = {
  hero: [NftSummaryDto, NftSummaryDto, NftSummaryDto];
  featured: NftSummaryDto;
};
