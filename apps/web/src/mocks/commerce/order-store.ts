import { orderDtoSchema, type CreateOrderRequest, type OrderDto } from '../../shared/api/contracts/commerce';
import { asEthAmount } from '../../shared/lib/eth/eth';
import { addEth } from '../../shared/lib/eth/eth-math';
import { NFT_FIXTURES } from '../fixtures/nfts';
import { getCart, quoteFor, removePurchased, type Owner } from './cart-store';
import { readCommerce, updateCommerce, type StoredOrder } from './commerce-state';
import { emitCommerceChange } from './events';
import { hashText } from './quote-engine';
import { liveEdition, setEdition } from './market';
import { activeScenario } from './scenario';

const SEED_ORDER_ID = 'ord-ana-0001';
const SETTLE_AFTER_READS = 2;

export type CreateOutcome =
  | { kind: 'created' | 'replayed'; order: OrderDto }
  | { kind: 'error'; code: 'idempotency_conflict' | 'quote_changed' | 'availability_conflict' };

function txRef(orderId: string): string {
  const seed = hashText(orderId);
  return `0x${seed.repeat(8)}`;
}

function snapshotOf(
  owner: Owner,
  body: CreateOrderRequest,
  meta: { id: string; status: OrderDto['status'] },
): OrderDto {
  const quote = quoteFor(owner, body.networkId);
  const cart = getCart(owner);
  const items = cart.lines.flatMap((l) => {
    const q = quote.lines.find((x) => x.lineId === l.lineId);
    const nft = NFT_FIXTURES.find((n) => n.id === l.nftId);
    if (!q || !nft) return [];
    const digits = /(\d+)\s*$/.exec(nft.title)?.[1] ?? '0';
    return [{
      nftId: l.nftId,
      editionId: l.editionId,
      editionLabel: l.editionId,
      tokenId: `#${digits.padStart(4, '0')}`,
      title: nft.title,
      image: nft.image,
      quantity: q.quantity,
      unitPriceEth: q.unitPriceEth,
      lineTotalEth: q.lineTotalEth,
    }];
  });
  const now = new Date().toISOString();
  return {
    id: meta.id,
    status: meta.status,
    version: 1,
    createdAt: now,
    updatedAt: now,
    networkId: body.networkId,
    walletId: body.walletId,
    collector: body.collector,
    couponCode: quote.coupon?.code ?? null,
    items,
    subtotalEth: quote.subtotalEth,
    discountEth: quote.discountEth,
    networkFeeEth: quote.networkFeeEth,
    totalEth: quote.totalEth,
    transactionRef: null,
    explorerUrl: null,
    refusalReason: null,
  };
}

function plannedSettle(): StoredOrder['settle'] {
  const scenario = activeScenario();
  if (scenario === 'order-refused') return 'refused';
  return scenario === 'order-pending' ? 'never' : 'confirmed';
}

function linesMatch(owner: Owner, body: CreateOrderRequest): boolean {
  const cart = getCart(owner).lines;
  return cart.length === body.lines.length && cart.every((l) => body.lines.some((b) => b.lineId === l.lineId && b.quantity === l.quantity));
}

function bumpOnce(flag: string): void {
  const done = readCommerce().counters[flag] ?? 0;
  if (done > 0) return;
  updateCommerce((s) => void (s.counters[flag] = 1));
  const edition = liveEdition('emerald-ape-042', '1-50');
  if (edition) setEdition('emerald-ape-042', '1-50', { priceEth: addEth(asEthAmount(edition.priceEth), asEthAmount('0.1')) });
  emitCommerceChange({ type: 'nft', nftId: 'emerald-ape-042' });
}

function reprice(purchased: OrderDto['items']): void {
  for (const item of purchased) {
    const edition = liveEdition(item.nftId, item.editionId);
    if (edition) setEdition(item.nftId, item.editionId, { priceEth: addEth(asEthAmount(edition.priceEth), asEthAmount('0.5')) });
    emitCommerceChange({ type: 'nft', nftId: item.nftId });
  }
}

export function createOrder(user: { id: string; username: string }, key: string, body: CreateOrderRequest): CreateOutcome {
  const owner: Owner = { kind: 'user', id: user.id };
  const username = user.username;
  const fingerprint = hashText(JSON.stringify(body));
  const known = Object.values(readCommerce().orders).find((o) => o.ownerId === owner.id && o.key === key);
  if (known) {
    if (known.fingerprint !== fingerprint) return { kind: 'error', code: 'idempotency_conflict' };
    return { kind: 'replayed', order: orderDtoSchema.parse(known.dto) };
  }
  if (activeScenario() === 'quote-changed-on-confirm') bumpOnce('quote-changed-on-confirm');
  const quote = quoteFor(owner, body.networkId);
  if (!quote.canCheckout) return { kind: 'error', code: 'availability_conflict' };
  if (quote.quoteHash !== body.quoteHash || !linesMatch(owner, body)) return { kind: 'error', code: 'quote_changed' };
  const seq = updateCommerce((s) => (s.orderSeq += 1));
  const id = `ord-${username}-${String(seq + 1).padStart(4, '0')}`;
  const order = snapshotOf(owner, body, { id, status: 'pending' });
  const stored: StoredOrder = { dto: order, ownerId: owner.id, fingerprint, key, reads: 0, settle: plannedSettle(), cartLines: body.lines };
  updateCommerce((s) => void (s.orders[id] = stored));
  if (activeScenario() === 'catalog-repriced') reprice(order.items);
  return { kind: 'created', order };
}

export function settleOrder(orderId: string, status: 'confirmed' | 'refused'): OrderDto | null {
  const stored = readCommerce().orders[orderId];
  if (!stored) return null;
  const current = orderDtoSchema.parse(stored.dto);
  if (current.status !== 'pending') return current;
  const next: OrderDto = {
    ...current,
    status,
    version: current.version + 1,
    updatedAt: new Date().toISOString(),
    transactionRef: status === 'confirmed' ? txRef(orderId) : null,
    explorerUrl: status === 'confirmed' ? `https://explorer.example.test/tx/${txRef(orderId)}` : null,
    refusalReason: status === 'refused' ? 'payment_declined' : null,
  };
  updateCommerce((s) => {
    const o = s.orders[orderId];
    if (o) o.dto = next;
  });
  if (status === 'confirmed') applyConfirmed(stored, next);
  emitCommerceChange({ type: 'order', orderId, userId: stored.ownerId });
  return next;
}

function applyConfirmed(stored: StoredOrder, order: OrderDto): void {
  removePurchased({ kind: 'user', id: stored.ownerId }, stored.cartLines);
  for (const item of order.items) {
    const edition = liveEdition(item.nftId, item.editionId);
    if (edition) setEdition(item.nftId, item.editionId, { remaining: Math.max(0, edition.remaining - item.quantity) });
    emitCommerceChange({ type: 'nft', nftId: item.nftId });
  }
}

/** Le o pedido do dono; pendentes liquidam na 2a leitura (cenario default/refused). */
export function readOrder(userId: string, orderId: string): OrderDto | null {
  ensureSeedOrder();
  const stored = readCommerce().orders[orderId];
  if (!stored || stored.ownerId !== userId) return null;
  const reads = updateCommerce((s) => {
    const o = s.orders[orderId];
    return o ? (o.reads += 1) : 0;
  });
  if (stored.settle !== 'never' && reads >= SETTLE_AFTER_READS) {
    const settled = settleOrder(orderId, stored.settle);
    if (settled) return settled;
  }
  return orderDtoSchema.parse(readCommerce().orders[orderId]?.dto);
}

export function listOrders(userId: string): OrderDto[] {
  ensureSeedOrder();
  return Object.values(readCommerce().orders)
    .filter((o) => o.ownerId === userId)
    .map((o) => orderDtoSchema.parse(o.dto));
}

function ensureSeedOrder(): void {
  if (readCommerce().orders[SEED_ORDER_ID]) return;
  const nft = NFT_FIXTURES[0];
  if (!nft) return;
  const dto: OrderDto = {
    id: SEED_ORDER_ID,
    status: 'confirmed',
    version: 2,
    createdAt: '2026-09-20T12:00:00.000Z',
    updatedAt: '2026-09-20T12:01:00.000Z',
    networkId: 'ethereum',
    walletId: 'wallet-ana-primary',
    collector: { displayName: 'Ana Souza', email: 'ana@example.test', username: 'ana', profileName: 'Ana', referralCode: 'JUNGLE', ensName: 'ana.eth' },
    couponCode: null,
    items: [{ nftId: nft.id, editionId: '1-50', editionLabel: '1-50', tokenId: '#0042', title: nft.title, image: nft.image, quantity: 1, unitPriceEth: '1.19', lineTotalEth: '1.19' }],
    subtotalEth: '1.19',
    discountEth: '0',
    networkFeeEth: '0.016',
    totalEth: '1.206',
    transactionRef: txRef(SEED_ORDER_ID),
    explorerUrl: `https://explorer.example.test/tx/${txRef(SEED_ORDER_ID)}`,
    refusalReason: null,
  };
  updateCommerce((s) => void (s.orders[SEED_ORDER_ID] = { dto, ownerId: 'user-ana', fingerprint: 'seed', key: 'seed', reads: 0, settle: 'never', cartLines: [] }));
}
