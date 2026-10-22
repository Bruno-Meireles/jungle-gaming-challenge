import { describe, expect, it } from 'vitest';

import { parseEth } from '../../../shared/lib/eth/eth';
import type { NftSummary } from './domain/nft';
import { toCardViewModel } from './to-card-view-model';

/*
 * Assinatura sob teste (dominio puro; i18n entra por porta):
 *   type Translate = (key: string, options?: Record<string, string>) => string
 *   toCardViewModel(nft: NftSummary, ctx: { locale: 'pt-BR' | 'en'; t: Translate }): NftCardViewModel
 *   NftCardViewModel = { id; title; priceLabel; image: { src; alt }; href; isRare }
 * Chaves usadas: 'shared:eth.amount' ({ amount }) e 'nft:image.alt' ({ title }).
 */

const MESSAGES: Record<string, (o: Record<string, string>) => string> = {
  'shared:eth.amount': (o) => `${o.amount} ETH`,
  'nft:image.alt': (o) => `Arte de ${o.title}`,
};

function t(key: string, options: Record<string, string> = {}): string {
  const message = MESSAGES[key];
  if (message === undefined) throw new Error(`chave inesperada: ${key}`);
  return message(options);
}

function nft(overrides: Partial<NftSummary> = {}): NftSummary {
  return {
    id: 'emerald-ape-042',
    title: 'Emerald Ape #042',
    collectionId: 'digital-art',
    networkId: 'ethereum',
    price: parseEth('1.19'),
    image: { src: '/nfts/emerald-ape-042.webp', width: 640, height: 480 },
    rarity: 'common',
    listedAt: '2026-06-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('toCardViewModel', () => {
  it('monta id, titulo, href e imagem com alt traduzido', () => {
    expect(toCardViewModel(nft(), { locale: 'pt-BR', t })).toMatchObject({
      id: 'emerald-ape-042',
      title: 'Emerald Ape #042',
      href: '/nfts/emerald-ape-042',
      image: { src: '/nfts/emerald-ape-042.webp', alt: 'Arte de Emerald Ape #042' },
    });
  });

  it('priceLabel segue o idioma: 1,19 em pt-BR e 1.19 em en', () => {
    expect(toCardViewModel(nft(), { locale: 'pt-BR', t }).priceLabel).toBe('1,19 ETH');
    expect(toCardViewModel(nft(), { locale: 'en', t }).priceLabel).toBe('1.19 ETH');
  });

  it('preserva 18 casas e milhar sem passar por Number', () => {
    const tiny = nft({ price: parseEth('0.000000000000000001') });
    expect(toCardViewModel(tiny, { locale: 'pt-BR', t }).priceLabel).toBe(
      '0,000000000000000001 ETH',
    );
    const big = nft({ price: parseEth('12345.5') });
    expect(toCardViewModel(big, { locale: 'en', t }).priceLabel).toBe('12,345.5 ETH');
  });

  it('isRare reflete rarity', () => {
    expect(toCardViewModel(nft({ rarity: 'rare' }), { locale: 'en', t }).isRare).toBe(true);
    expect(toCardViewModel(nft({ rarity: 'common' }), { locale: 'en', t }).isRare).toBe(false);
  });

  it('nao expoe width, height nem dados de dominio internos', () => {
    const vm = toCardViewModel(nft(), { locale: 'en', t });
    expect(Object.keys(vm).sort()).toEqual([
      'href',
      'id',
      'image',
      'isRare',
      'priceLabel',
      'title',
    ]);
    expect(Object.keys(vm.image).sort()).toEqual(['alt', 'src']);
  });
});
