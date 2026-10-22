import { describe, expect, it } from 'vitest';

import { apiErrorBodySchema } from './error';
import { catalogPageDtoSchema, ethDecimalSchema, highlightsDtoSchema, nftSummaryDtoSchema } from './nfts';

const validNft = {
  id: 'aurora-drift-01',
  title: 'Aurora Drift',
  collectionId: 'digital-art',
  networkId: 'ethereum',
  priceEth: '1.19',
  image: { src: '/images/aurora.webp', width: 640, height: 480 },
  rarity: 'rare',
  listedAt: '2026-01-15T10:30:00.000Z',
  popularity: 42,
  version: 0,
};

const validPage = {
  items: [validNft],
  page: 1,
  pageSize: 12,
  totalItems: 1,
  totalPages: 1,
  facets: {
    collections: [{ id: 'digital-art', count: 1 }],
    networks: [{ id: 'ethereum', count: 1 }],
    priceRange: { minEth: '0.01', maxEth: '12.3' },
  },
};

const withNft = (patch: Record<string, unknown>) => ({ ...validNft, ...patch });

describe('ethDecimalSchema', () => {
  it('aceita decimal com ate 18 casas', () => {
    expect(ethDecimalSchema.safeParse('0.000000000000000001').success).toBe(true);
  });

  it.each([1.5, '', '1e3', '-1', '.5', '1.', '1,5', '0.0000000000000000001'])('rejeita %j', (value) => {
    expect(ethDecimalSchema.safeParse(value).success).toBe(false);
  });
});

describe('nftSummaryDtoSchema', () => {
  it('aceita um DTO valido completo', () => {
    expect(nftSummaryDtoSchema.safeParse(validNft).success).toBe(true);
  });

  it.each([
    ['priceEth numerico', { priceEth: 1.5 }],
    ['priceEth em notacao cientifica', { priceEth: '1e3' }],
    ['priceEth com virgula', { priceEth: '1,5' }],
    ['slug com maiuscula', { id: 'Aurora' }],
    ['slug com espaco', { id: 'aurora drift' }],
    ['collectionId desconhecido', { collectionId: 'unknown' }],
    ['rarity desconhecida', { rarity: 'epic' }],
    ['width zero', { image: { src: '/a.webp', width: 0, height: 480 } }],
    ['listedAt invalido', { listedAt: 'ontem' }],
  ])('rejeita %s', (_name, patch) => {
    expect(nftSummaryDtoSchema.safeParse(withNft(patch)).success).toBe(false);
  });
});

describe('catalogPageDtoSchema', () => {
  it('aceita uma pagina valida', () => {
    expect(catalogPageDtoSchema.safeParse(validPage).success).toBe(true);
  });

  it('rejeita count de faceta negativo', () => {
    const page = { ...validPage, facets: { ...validPage.facets, collections: [{ id: 'digital-art', count: -1 }] } };
    expect(catalogPageDtoSchema.safeParse(page).success).toBe(false);
  });
});

describe('highlightsDtoSchema', () => {
  it('aceita hero com exatamente 3 itens', () => {
    expect(highlightsDtoSchema.safeParse({ hero: [validNft, validNft, validNft], featured: validNft }).success).toBe(true);
  });

  it.each([2, 4])('rejeita hero com %i itens', (size) => {
    const hero = Array.from({ length: size }, () => validNft);
    expect(highlightsDtoSchema.safeParse({ hero, featured: validNft }).success).toBe(false);
  });
});

describe('apiErrorBodySchema', () => {
  it('aceita code conhecido com fieldErrors', () => {
    expect(apiErrorBodySchema.safeParse({ code: 'validation_failed', fieldErrors: { priceMin: 'invalid' } }).success).toBe(true);
  });

  it('rejeita code desconhecido', () => {
    expect(apiErrorBodySchema.safeParse({ code: 'teapot' }).success).toBe(false);
  });
});
