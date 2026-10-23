import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { COLLECTION_IDS, NETWORK_IDS } from '../../shared/api/contracts/ids';
import { nftSummaryDtoSchema } from '../../shared/api/contracts/nfts';
import { compareEth, parseEth } from '../../shared/lib/eth/eth';
import { NFT_FIXTURES } from './nfts';

/*
 * Contrato sob teste: `NFT_FIXTURES: readonly NftSummaryDto[]` exportado de ./nfts.
 * Imagens: `image.src === '/nfts/<id>-480.webp'` (variante gerada por tools/resize-nft-images.mjs; o original <id>.webp segue em public/ e o detalhe usa <id>-960.webp).
 */

const PUBLIC_DIR = resolve(import.meta.dirname, '../../../public');

function countBy<T extends string>(values: readonly T[]): Map<T, number> {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

describe('NFT_FIXTURES', () => {
  it('tem os 45 itens do plano (5 paginas de 9)', () => {
    expect(NFT_FIXTURES).toHaveLength(45);
  });

  it('todo item valida no schema do contrato', () => {
    for (const item of NFT_FIXTURES) {
      expect(nftSummaryDtoSchema.safeParse(item).success, item.id).toBe(true);
    }
  });

  it('slugs sao unicos', () => {
    const ids = NFT_FIXTURES.map((item) => item.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('toda colecao e toda rede aparecem em pelo menos 2 itens', () => {
    const collections = countBy(NFT_FIXTURES.map((item) => item.collectionId));
    const networks = countBy(NFT_FIXTURES.map((item) => item.networkId));
    for (const id of COLLECTION_IDS) expect(collections.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
    for (const id of NETWORK_IDS) expect(networks.get(id) ?? 0, id).toBeGreaterThanOrEqual(2);
  });

  it('tem exatamente 6 itens raros', () => {
    expect(NFT_FIXTURES.filter((item) => item.rarity === 'rare')).toHaveLength(6);
  });

  it('precos sao decimais validos e cobrem de 0.000000000000000001 a 12.30', () => {
    const prices = NFT_FIXTURES.map((item) => parseEth(item.priceEth));
    const sorted = [...prices].sort(compareEth);
    expect(sorted[0]).toBe(parseEth('0.000000000000000001'));
    expect(sorted.at(-1)).toBe(parseEth('12.30'));
    for (const wanted of ['1.19', '1.10', '0.02']) {
      expect(prices, wanted).toContain(parseEth(wanted));
    }
  });

  it.each([
    ['emerald-ape-042', 'Emerald Ape #042', '1.19'],
    ['sage-nomad-009', 'Sage Nomad #009', '1.69'],
    ['neon-vessel-552', 'Neon Vessel #552', '1.99'],
    ['cosmic-bloom-118', 'Cosmic Bloom #118', undefined],
    ['violet-nomad-314', 'Violet Nomad #314', undefined],
    ['ivory-baron-088', 'Ivory Baron #088', undefined],
    ['golden-beat-207', 'Golden Beat #207', undefined],
    ['golden-signal-160', 'Golden Signal #160', undefined],
  ])('inclui o item do Figma %s', (id, title, price) => {
    const item = NFT_FIXTURES.find((candidate) => candidate.id === id);
    expect(item?.title).toBe(title);
    if (price !== undefined) expect(item?.priceEth).toBe(price);
  });

  it('cada imagem aponta para /nfts/<slug>-480.webp e as variantes 480/960 existem em public/', () => {
    for (const item of NFT_FIXTURES) {
      expect(item.image.src).toBe(`/nfts/${item.id}-480.webp`);
      for (const size of [480, 960]) expect(existsSync(resolve(PUBLIC_DIR, `nfts/${item.id}-${size}.webp`)), item.image.src).toBe(true);
    }
  });
});
