import { NFT_FIXTURES } from '../fixtures/nfts';

export type EditionSeed = {
  id: string;
  label: string;
  supply: number | null;
  priceEth: string;
  remaining: number;
  maxPerOrder: number;
};

const EMERALD: EditionSeed[] = [
  { id: '1-1', label: '1-1', supply: 1, priceEth: '3.5', remaining: 0, maxPerOrder: 1 },
  { id: '1-10', label: '1-10', supply: 10, priceEth: '1.69', remaining: 3, maxPerOrder: 3 },
  { id: '1-50', label: '1-50', supply: 50, priceEth: '1.19', remaining: 20, maxPerOrder: 5 },
  { id: 'open', label: 'open', supply: null, priceEth: '0.25', remaining: 999, maxPerOrder: 10 },
];

// Precos de edicao dos itens do carrinho no Figma.
const PRICE_OVERRIDE: Record<string, string> = { 'violet-nomad-314': '1.39', 'ivory-baron-088': '1.79' };

export const DEFAULT_EDITION_ID = '1-50';

/** Edicoes iniciais (deterministicas) de um NFT; vazio se o NFT nao existe. */
export function seedEditions(nftId: string): EditionSeed[] {
  if (nftId === 'emerald-ape-042') return EMERALD.map((e) => ({ ...e }));
  const nft = NFT_FIXTURES.find((n) => n.id === nftId);
  if (!nft) return [];
  const price = PRICE_OVERRIDE[nftId] ?? nft.priceEth;
  return [
    { id: '1-50', label: '1-50', supply: 50, priceEth: price, remaining: 20, maxPerOrder: 9 },
    { id: 'open', label: 'open', supply: null, priceEth: price, remaining: 999, maxPerOrder: 10 },
  ];
}
