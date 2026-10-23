import { delay, http, HttpResponse } from 'msw';

import type { NftDetailDto, NftSummaryDto } from '../../shared/api/contracts/nfts';
import { liveEditions, nftVersion } from '../commerce/market';
import { DEFAULT_EDITION_ID } from '../commerce/editions';
import { NFT_FIXTURES } from '../fixtures/nfts';
import { readScenario } from '../scenario';

const LATENCY_MS = 120;
const SLOW_MS = 1500;
const COLLECTION_LABEL: Record<string, { 'pt-BR': string; en: string }> = {
  'digital-art': { 'pt-BR': 'Arte digital', en: 'Digital art' },
  photography: { 'pt-BR': 'Fotografia', en: 'Photography' },
  music: { 'pt-BR': 'Música', en: 'Music' },
  '3d-art': { 'pt-BR': 'Arte 3D', en: '3D art' },
  collectibles: { 'pt-BR': 'Colecionáveis', en: 'Collectibles' },
  generative: { 'pt-BR': 'Arte generativa', en: 'Generative art' },
  gaming: { 'pt-BR': 'Games', en: 'Gaming' },
  memberships: { 'pt-BR': 'Assinaturas', en: 'Memberships' },
  utility: { 'pt-BR': 'Utilidade', en: 'Utility' },
};

function hash(text: string): number {
  let value = 7;
  for (const char of text) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return value;
}

function tokenId(title: string, id: string): string {
  const digits = /#(\d+)/.exec(title)?.[1] ?? String(hash(id) % 1000);
  return `#${digits.padStart(4, '0')}`;
}

function address(id: string): string {
  let hex = '';
  for (let i = 0; hex.length < 40; i += 1) hex += hash(`${id}:${i}`).toString(16).padStart(8, '0');
  return `0x${hex.slice(0, 40)}`;
}

// Conteudo de demonstracao do Figma (tela Detalhes) so para o NFT de destaque; os demais seguem gerados.
const EMERALD_APE_SHOWCASE: Editorial = {
  rating: { average: 4.8, count: 19 },
  description: {
    'pt-BR': 'Um colecionável digital 1/50 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.',
    en: 'A hand-finished 1/50 digital collectible from the Kurio Editions collection, verified on Ethereum.',
  },
  attributes: [
    { name: { 'pt-BR': 'Acessório', en: 'Accessory' }, value: { 'pt-BR': 'Óculos', en: 'Glasses' } },
    { name: { 'pt-BR': 'Cor', en: 'Color' }, value: { 'pt-BR': 'Esmeralda', en: 'Emerald' } },
    { name: { 'pt-BR': 'Raridade', en: 'Rarity' }, value: { 'pt-BR': 'Raro', en: 'Rare' } },
  ],
};

type Editorial = Pick<NftDetailDto, 'description' | 'rating' | 'attributes'>;

function generatedEditorial(nft: NftSummaryDto): Editorial {
  const collection = COLLECTION_LABEL[nft.collectionId] ?? { 'pt-BR': nft.collectionId, en: nft.collectionId };
  return {
    description: {
      'pt-BR': `${nft.title} é uma obra digital exclusiva da coleção ${collection['pt-BR']}, com autenticidade registrada na rede ${nft.networkId}.`,
      en: `${nft.title} is a one-of-a-kind digital piece from the ${collection.en} collection, with authenticity recorded on the ${nft.networkId} network.`,
    },
    rating: { average: 3.5 + (hash(nft.id) % 15) / 10, count: 20 + (hash(nft.id) % 400) },
    attributes: [
      { name: { 'pt-BR': 'Coleção', en: 'Collection' }, value: collection },
      { name: { 'pt-BR': 'Rede', en: 'Network' }, value: { 'pt-BR': nft.networkId, en: nft.networkId } },
      {
        name: { 'pt-BR': 'Raridade', en: 'Rarity' },
        value: nft.rarity === 'rare' ? { 'pt-BR': 'Rara', en: 'Rare' } : { 'pt-BR': 'Comum', en: 'Common' },
      },
    ],
  };
}

function toDetail(id: string): NftDetailDto | null {
  const nft = NFT_FIXTURES.find((n) => n.id === id);
  if (!nft) return null;
  const editions = liveEditions(id);
  const editorial = id === 'emerald-ape-042' ? EMERALD_APE_SHOWCASE : generatedEditorial(nft);
  return {
    id: nft.id,
    title: nft.title,
    ...editorial,
    tokenId: tokenId(nft.title, nft.id),
    gallery: [nft, ...NFT_FIXTURES.filter((n) => n.id !== nft.id && n.collectionId === nft.collectionId).slice(0, 3)].map((n) => ({ src: n.image.src.replace('-480.webp', '-960.webp'), width: 960, height: 960 })),
    contract: { address: address(nft.id), standard: nft.networkId === 'solana' ? 'Metaplex' : 'ERC-721' },
    royaltyPercent: 5,
    editions: editions.map((e) => ({
      id: e.id,
      kind: e.supply === null ? { type: 'open' as const } : { type: 'limited' as const, size: e.supply },
      priceEth: e.priceEth,
      remaining: e.remaining,
      maxPerOrder: e.maxPerOrder,
    })),
    defaultEditionId: editions.some((e) => e.id === DEFAULT_EDITION_ID) ? DEFAULT_EDITION_ID : (editions[0]?.id ?? 'open'),
    collectionId: nft.collectionId,
    version: nftVersion(id),
  };
}

export const nftDetailHandlers = [
  http.get('*/api/nfts/:nftId', async ({ params }) => {
    const scenario = readScenario(typeof localStorage === 'undefined' ? { getItem: () => null } : localStorage);
    await delay(scenario === 'nft-detail-slow' ? SLOW_MS : LATENCY_MS);
    if (scenario === 'nft-detail-error') return HttpResponse.json({ code: 'service_unavailable' }, { status: 503 });
    const detail = toDetail(String(params.nftId));
    return detail ? HttpResponse.json(detail) : HttpResponse.json({ code: 'not_found' }, { status: 404 });
  }),
];
