export type Translate = (key: string, options?: Record<string, string | number>) => string;
export type CartLocale = 'pt-BR' | 'en';

export type CartLineInput = {
  lineId: string;
  nftId: string;
  title: string;
  image: { src: string; width: number; height: number };
  tokenId: string;
  edition: { id: string; number: number; supply: number };
  unitPrice: string;
  quantity: number;
  maxQuantity: number;
};

export type LineNoticeInput =
  | { kind: 'price_changed'; previousUnitPrice: string; unitPrice: string }
  | { kind: 'availability_reduced'; available: number }
  | { kind: 'sold_out' };

export type QuoteLineInput = {
  lineId: string;
  unitPrice: string;
  quantity: number;
  lineTotal: string;
  notice: LineNoticeInput | null;
};

export type CartLineViewModel = {
  lineId: string;
  title: string;
  href: string;
  image: { src: string; alt: string };
  tokenLabel: string;
  editionLabel: string;
  unitPriceLabel: string;
  lineTotalLabel: string | null;
  quantity: number;
  min: 1;
  max: number;
  canIncrement: boolean;
  notice: LineNoticeInput | null;
  blocking: boolean;
};
