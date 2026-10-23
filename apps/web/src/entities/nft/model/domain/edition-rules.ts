import type { Edition } from './nft-detail';

export type EditionResolution = { status: 'ok' | 'fallback' | 'sold-out'; edition: Edition };

export function isSoldOut(edition: Edition): boolean {
  return edition.remaining <= 0;
}

export function resolveEdition(
  editions: readonly Edition[],
  defaultId: string,
  param: string | undefined,
): EditionResolution {
  const fallback = editions.find((edition) => edition.id === defaultId) ?? editions[0];
  if (!fallback) throw new Error('no_editions');
  const requested = param === undefined ? undefined : editions.find((edition) => edition.id === param);
  if (param !== undefined && !requested) return { status: 'fallback', edition: fallback };
  const edition = requested ?? fallback;
  return { status: isSoldOut(edition) ? 'sold-out' : 'ok', edition };
}

export function maxSelectableQuantity(edition: Edition): number {
  return Math.max(0, Math.min(edition.remaining, edition.maxPerOrder));
}

export function clampQuantity(quantity: number, max: number): number {
  if (max <= 0) return 0;
  const whole = Number.isNaN(quantity) ? 1 : Math.floor(quantity);
  return Math.min(max, Math.max(1, whole));
}
