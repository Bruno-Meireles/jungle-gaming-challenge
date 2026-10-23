export type LocalizedText = { 'pt-BR': string; en: string };

export type EditionKind = { type: 'limited'; size: number } | { type: 'open' };

export type Edition = {
  id: string;
  kind: EditionKind;
  /** Decimal em string (nunca float). */
  priceEth: string;
  remaining: number;
  maxPerOrder: number;
};

export type NftDetail = {
  id: string;
  title: string;
  description: LocalizedText;
  tokenId: string;
  rating: { average: number; count: number };
  gallery: { src: string; width: number; height: number }[];
  contract: { address: string; standard: string };
  royaltyPercent: number;
  attributes: { name: LocalizedText; value: LocalizedText }[];
  editions: Edition[];
  defaultEditionId: string;
};
