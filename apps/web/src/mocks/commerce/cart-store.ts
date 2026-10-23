import type { CartDto, CartLineDto, QuoteDto } from '../../shared/api/contracts/commerce';
import type { NetworkId } from '../../shared/api/contracts/ids';
import { NFT_FIXTURES } from '../fixtures/nfts';
import { readCommerce, updateCommerce, type StoredCart, type StoredLine } from './commerce-state';
import { liveEdition } from './market';
import { buildQuote, checkCoupon, type QuoteInputLine } from './quote-engine';
import { activeScenario } from './scenario';

export type Owner = { kind: 'user'; id: string } | { kind: 'guest'; id: string };

export const ownerKey = (owner: Owner): string => `${owner.kind}:${owner.id}`;
export const lineIdOf = (nftId: string, editionId: string): string => `${nftId}~${editionId}`;

const SEEDED_GUEST: [string, string, number][] = [
  ['emerald-ape-042', '1-50', 1],
  ['violet-nomad-314', '1-50', 1],
  ['ivory-baron-088', '1-50', 2],
];
const SEEDED_ANA: [string, string, number][] = [
  ['emerald-ape-042', '1-50', 2],
  ['violet-nomad-314', '1-50', 6],
  ['ivory-baron-088', '1-50', 9],
];

function seedLines(rows: [string, string, number][]): StoredLine[] {
  return rows.map(([nftId, editionId, quantity]) => ({
    lineId: lineIdOf(nftId, editionId),
    nftId,
    editionId,
    quantity,
  }));
}

function initialCart(owner: Owner): StoredCart {
  const seeded = activeScenario() === 'cart-seeded';
  if (owner.kind === 'user' && owner.id === 'user-ana') return { lines: seedLines(SEEDED_ANA), couponCode: null, version: 1 };
  return { lines: seeded ? seedLines(SEEDED_GUEST) : [], couponCode: null, version: seeded ? 1 : 0 };
}

export function getCart(owner: Owner): StoredCart {
  const key = ownerKey(owner);
  const existing = readCommerce().carts[key];
  if (existing) return existing;
  const created = initialCart(owner);
  updateCommerce((s) => void (s.carts[key] = created));
  return created;
}

function save(owner: Owner, mutate: (cart: StoredCart) => void): StoredCart {
  getCart(owner);
  return updateCommerce((s) => {
    const cart = s.carts[ownerKey(owner)];
    if (!cart) throw new Error('cart_missing');
    mutate(cart);
    cart.version += 1;
    return cart;
  });
}

function tokenIdOf(title: string): string {
  const digits = /(\d+)\s*$/.exec(title)?.[1] ?? '0';
  return `#${digits.padStart(4, '0')}`;
}

export function maxQuantityOf(line: StoredLine): number {
  const edition = liveEdition(line.nftId, line.editionId);
  return edition ? Math.min(edition.remaining, edition.maxPerOrder) : 0;
}

function toLineDto(line: StoredLine): CartLineDto | null {
  const nft = NFT_FIXTURES.find((n) => n.id === line.nftId);
  const edition = liveEdition(line.nftId, line.editionId);
  if (!nft || !edition) return null;
  return {
    lineId: line.lineId,
    nftId: line.nftId,
    editionId: line.editionId,
    editionLabel: edition.label,
    supply: edition.supply,
    tokenId: tokenIdOf(nft.title),
    title: nft.title,
    image: nft.image,
    quantity: line.quantity,
    unitPriceEth: edition.priceEth,
    maxQuantity: maxQuantityOf(line),
  };
}

export function toCartDto(cart: StoredCart): CartDto {
  const lines = cart.lines.flatMap((l) => toLineDto(l) ?? []);
  return {
    lines,
    couponCode: cart.couponCode,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    version: cart.version,
  };
}

export type CartMutation = { ok: true; cart: StoredCart } | { ok: false; error: 'not_found' | 'availability_conflict'; available?: number };

export function addItem(owner: Owner, item: { nftId: string; editionId: string; quantity: number }): CartMutation {
  const edition = liveEdition(item.nftId, item.editionId);
  if (!edition) return { ok: false, error: 'not_found' };
  const lineId = lineIdOf(item.nftId, item.editionId);
  const current = getCart(owner).lines.find((l) => l.lineId === lineId)?.quantity ?? 0;
  const max = Math.min(edition.remaining, edition.maxPerOrder);
  if (current + item.quantity > max) return { ok: false, error: 'availability_conflict', available: max };
  const cart = save(owner, (c) => {
    const found = c.lines.find((l) => l.lineId === lineId);
    if (found) found.quantity += item.quantity;
    else c.lines.push({ lineId, nftId: item.nftId, editionId: item.editionId, quantity: item.quantity });
  });
  return { ok: true, cart };
}

export function updateItem(owner: Owner, lineId: string, quantity: number): CartMutation {
  const line = getCart(owner).lines.find((l) => l.lineId === lineId);
  if (!line) return { ok: false, error: 'not_found' };
  const max = maxQuantityOf(line);
  if (quantity > max) return { ok: false, error: 'availability_conflict', available: max };
  return { ok: true, cart: save(owner, () => void (line.quantity = quantity)) };
}

export function removeItem(owner: Owner, lineId: string): CartMutation {
  if (!getCart(owner).lines.some((l) => l.lineId === lineId)) return { ok: false, error: 'not_found' };
  return { ok: true, cart: save(owner, (c) => void (c.lines = c.lines.filter((l) => l.lineId !== lineId))) };
}

export function applyCoupon(owner: Owner, raw: string): { ok: true; cart: StoredCart } | { ok: false; error: 'coupon_invalid' | 'coupon_expired' } {
  const check = checkCoupon(raw);
  if (check.kind === 'invalid') return { ok: false, error: 'coupon_invalid' };
  if (check.kind === 'expired') return { ok: false, error: 'coupon_expired' };
  return { ok: true, cart: save(owner, (c) => void (c.couponCode = check.code)) };
}

export function removeCoupon(owner: Owner): StoredCart {
  return save(owner, (c) => void (c.couponCode = null));
}

/** Soma quantidades limitadas ao maximo, mantem o cupom do usuario e apaga o carrinho do visitante (idempotente). */
export function mergeGuestCart(guestId: string, userId: string): void {
  const guestKey = ownerKey({ kind: 'guest', id: guestId });
  const guest = readCommerce().carts[guestKey];
  if (!guest) return;
  const user: Owner = { kind: 'user', id: userId };
  getCart(user);
  updateCommerce((s) => {
    const target = s.carts[ownerKey(user)];
    if (!target) return;
    for (const line of guest.lines) {
      const found = target.lines.find((l) => l.lineId === line.lineId);
      const max = maxQuantityOf(line);
      if (found) found.quantity = Math.min(found.quantity + line.quantity, Math.max(max, found.quantity));
      else target.lines.push({ ...line, quantity: Math.min(line.quantity, Math.max(max, 1)) });
    }
    target.version += 1;
    delete s.carts[guestKey];
  });
}

export function quoteFor(owner: Owner, networkId: NetworkId, cart = getCart(owner)): QuoteDto {
  const lines: QuoteInputLine[] = cart.lines.flatMap((l) => {
    const dto = toLineDto(l);
    return dto
      ? [{ lineId: l.lineId, nftId: l.nftId, title: dto.title, quantity: l.quantity, unitPriceEth: dto.unitPriceEth, maxQuantity: dto.maxQuantity }]
      : [];
  });
  return buildQuote({ lines, couponCode: cart.couponCode, networkId, cartVersion: cart.version, now: Date.now() });
}

/** Apos pedido confirmado: remove do carrinho so as quantidades compradas. */
export function removePurchased(owner: Owner, purchased: { lineId: string; quantity: number }[]): void {
  save(owner, (c) => {
    for (const p of purchased) {
      const line = c.lines.find((l) => l.lineId === p.lineId);
      if (line) line.quantity -= p.quantity;
    }
    c.lines = c.lines.filter((l) => l.quantity > 0);
  });
}
