import type { EditionKind } from './domain/nft-detail';

export type EditionLabel =
  | { key: 'edition.limited'; params: { size: number } }
  | { key: 'edition.open'; params: Record<string, never> };

export function editionLabel(kind: EditionKind): EditionLabel {
  return kind.type === 'limited'
    ? { key: 'edition.limited', params: { size: kind.size } }
    : { key: 'edition.open', params: {} };
}
